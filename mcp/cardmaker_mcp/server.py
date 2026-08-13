"""Aufbau des MCP-Servers für CardMaker.

Stellt die CardMaker-REST-API über stdio als typisierte Werkzeuge bereit. Hier leben
die Server-Instanz, die gemeinsame Fehlerabbildung und die Werkzeuge selbst.

**Regel für jedes schreibende Werkzeug** (Drift-Regel aus `docs/conventions/mcp.md`):
es trägt `@invalidates_state`, prüft seine Nutzlast vorher mit `meta.validate_*` und
hängt den Vorschaubild-Hinweis an die Antwort. Fehlt eins davon, antwortet der Server
später aus veralteten Daten oder verschweigt eine Grenze — beides still.
"""
from __future__ import annotations

import functools
import sys
from collections.abc import Callable
from typing import Any, TypeVar

from mcp.server.mcpserver import MCPServer

from cardmaker_mcp import card_fields, meta, search, state_cache
from cardmaker_mcp.client import ApiError, Client, MissingTokenError

PREVIEW_HINT = (
    "Hinweis: Karten, die über MCP entstehen oder geändert werden, bekommen ihr "
    "Vorschaubild erst, wenn sie einmal im Editor gespeichert wurden — das Bild entsteht "
    "im Browser, nicht im Backend. Bis dahin bleibt die Kachel in der Kartenliste leer."
)

# Ab SDK 2.0 heißt die ergonomische Server-Klasse MCPServer; in 1.x war es FastMCP
# (so noch in der Referenz-Umsetzung von Promptigofant). Gleiche Bedienung, neuer Name.
mcp = MCPServer("cardmaker")

# Bewusst erst bei Bedarf gebaut — sonst scheitert schon der Import, wenn kein Token gesetzt ist.
_client: Client | None = None


def get_client() -> Client:
    global _client

    if _client is None:
        _client = Client()

    return _client


ToolFunction = TypeVar("ToolFunction", bound=Callable[..., Any])


def api_tool(func: ToolFunction) -> ToolFunction:
    """Fängt :class:`ApiError` und reicht ihn als lesbaren `ValueError` weiter.

    Der Server zeigt die Nachricht eines `ValueError` als Fehlerinhalt des Werkzeugs — das
    Modell sieht damit Status und Feldmeldungen statt eines rohen Tracebacks.
    """

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return func(*args, **kwargs)
        except ApiError as error:
            raise ValueError(error.format_for_tool()) from error

    return wrapper  # type: ignore[return-value]


def invalidates_state(func: ToolFunction) -> ToolFunction:
    """Verwirft das zwischengespeicherte Zustandsbild nach einem Schreibvorgang.

    Jedes Schreib-Werkzeug muss diesen Dekorator tragen (ab Phase 4). Ein überlebendes
    Zustandsbild lässt jede spätere Suche aus veralteten Daten antworten.

    Auch ein **gescheiterter** Schreibvorgang verwirft: ein Fehler kann eintreten,
    nachdem das Backend bereits geschrieben hat. Ein neuer Abruf kostet eine Anfrage,
    eine veraltete Antwort kostet Vertrauen.
    """

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return func(*args, **kwargs)
        finally:
            state_cache.invalidate()

    return wrapper  # type: ignore[return-value]


@mcp.tool()
@api_tool
def get_meta() -> dict:
    """Die Regeln der laufenden API: Canvas-Maße, Ebenen-Enums, Schriften, Grenzwerte.

    Quelle für alles, was ein Schreib-Werkzeug vorher prüfen will — nicht aus einer
    Abschrift im Server, sondern zur Laufzeit aus dem Backend.
    """
    return state_cache.load_meta(get_client())


@mcp.tool()
@api_tool
def get_state(refresh: bool = False) -> dict:
    """Übersicht über Kartengruppen, Templates und Karten (Kurzfassungen).

    Args:
        refresh: Zwischenspeicher übergehen und frisch laden.
    """
    return state_cache.load_state(get_client(), refresh=refresh)


@mcp.tool()
@api_tool
def find_template(query: str) -> list[dict] | str:
    """Templates nach Namensteil suchen (Kurzfassungen), Groß-/Kleinschreibung egal."""
    templates = state_cache.load_state(get_client())["templates"]
    matches = search.search_by_name(templates, query)
    return matches if matches else search.no_match_message("Templates", query)


@mcp.tool()
@api_tool
def find_card(
    query: str, template_id: int | None = None, card_group_id: int | None = None
) -> list[dict] | str:
    """Karten nach Namensteil suchen, optional nach Template oder Kartengruppe gefiltert.

    Args:
        query: Teilzeichenkette im Kartennamen.
        template_id: Nur Karten dieses Templates.
        card_group_id: Nur Karten dieser Kartengruppe.
    """
    cards = state_cache.load_state(get_client())["cards"]
    matches = search.search_by_name(cards, query)

    if template_id is not None:
        matches = [card for card in matches if card.get("templateId") == template_id]
    if card_group_id is not None:
        matches = [card for card in matches if card.get("cardGroupId") == card_group_id]

    return matches if matches else search.no_match_message("Karten", query)


@mcp.tool()
@api_tool
def find_card_group(query: str) -> list[dict] | str:
    """Kartengruppen nach Namensteil suchen, Groß-/Kleinschreibung egal."""
    card_groups = state_cache.load_state(get_client())["cardGroups"]
    matches = search.search_by_name(card_groups, query)
    return matches if matches else search.no_match_message("Kartengruppen", query)


@mcp.tool()
@api_tool
def get_template(template_id: int) -> dict:
    """Template vollständig, inklusive Ebenen. Nur lesend — das Layout entsteht im Editor."""
    return get_client().get_template(template_id)


@mcp.tool()
@api_tool
def get_card(card_id: int) -> dict:
    """Karte vollständig: Werte, Icon-Auswahl, Text-Abweichungen vom Template, Bilder."""
    return get_client().get_card(card_id)


@mcp.tool()
@api_tool
def describe_card_fields(template_id: int) -> dict:
    """Was an diesem Template pro Karte befüllt wird: Text-, Bild- und Icon-Felder.

    Textfelder tragen die Vorgaben aus dem Template (Schriftgröße, Farbe, Fett/Kursiv) —
    das sind Startwerte, keine Zwänge; `textOverrides` auf der Karte kann sie überschreiben.
    """
    template = get_client().get_template(template_id)
    return card_fields.describe_card_fields(template.get("layers", []))


@mcp.tool()
@api_tool
def list_assets(kind: str | None = None) -> list[dict]:
    """Bildvorrat (Rahmen/Icons) — Kennungen für die Icon-Auswahl an einer Karte.

    Args:
        kind: `"frame"` oder `"icon"`, weglassen für beide.
    """
    return get_client().get_assets(kind)


@mcp.tool()
@api_tool
@invalidates_state
def create_card_group(name: str, description: str | None = None) -> dict:
    """Kartengruppe anlegen.

    Args:
        name: Anzeigename der Gruppe.
        description: Freitext, optional.
    """
    payload = _payload(name=name, description=description)
    meta.validate_card_group_payload(state_cache.load_meta(get_client()), payload)

    return _with_hints(get_client().post_card_group(payload), "cardGroup")


@mcp.tool()
@api_tool
@invalidates_state
def update_card_group(
    card_group_id: int, name: str | None = None, description: str | None = None
) -> dict:
    """Kartengruppe umbenennen oder ihre Beschreibung ändern.

    Nur übergebene Felder ändern sich. Eine Beschreibung wieder zu leeren, geht hier
    bewusst nicht — das bleibt der Oberfläche vorbehalten.

    Args:
        card_group_id: Kennung der Gruppe (`find_card_group`).
        name: Neuer Name, weglassen heißt unverändert.
        description: Neue Beschreibung, weglassen heißt unverändert.
    """
    payload = _payload(name=name, description=description)

    if not payload:
        raise ValueError("Nichts zu ändern: weder Name noch Beschreibung übergeben.")

    meta.validate_card_group_payload(state_cache.load_meta(get_client()), payload)

    return _with_hints(get_client().patch_card_group(card_group_id, payload), "cardGroup")


@mcp.tool()
@api_tool
@invalidates_state
def create_card(
    name: str,
    template_id: int,
    values: dict[str, str] | None = None,
    card_group_id: int | None = None,
    icon_choices: dict[str, int] | None = None,
    text_overrides: dict[str, dict] | None = None,
) -> dict:
    """Karte zu einem Template anlegen und ihre Felder befüllen.

    Welche Felder das Template kennt, sagt `describe_card_fields(template_id)`.

    Args:
        name: Name der Karte.
        template_id: Template, auf dem die Karte beruht.
        values: Textfelder als `{"feldschluessel": "Text"}`.
        card_group_id: Kartengruppe, weglassen heißt „keine".
        icon_choices: Icon-Wahl als `{"ebenenkennung": bildKennung}` (`list_assets`).
        text_overrides: Abweichungen vom Template je Feld, z.B.
            `{"titel": {"fontSize": 42, "color": "#1a2b3c", "bold": true}}`.
    """
    payload = _payload(
        name=name,
        templateId=template_id,
        values=values,
        cardGroupId=card_group_id,
        iconChoices=icon_choices,
        textOverrides=text_overrides,
    )
    meta.validate_card_payload(state_cache.load_meta(get_client()), payload)
    warnings = _unknown_field_warnings(template_id, values, icon_choices, text_overrides)

    return _with_hints(get_client().post_card(payload), "card", warnings)


@mcp.tool()
@api_tool
@invalidates_state
def update_card(
    card_id: int,
    name: str | None = None,
    values: dict[str, str] | None = None,
    card_group_id: int | None = None,
    icon_choices: dict[str, int] | None = None,
    text_overrides: dict[str, dict] | None = None,
) -> dict:
    """Karte ändern — nur die übergebenen Felder.

    Weggelassenes bleibt unangetastet. `values`, `icon_choices` und `text_overrides`
    ersetzen jeweils den **ganzen** Satz: wer ein einzelnes Feld ändern will, holt sich
    mit `get_card` den aktuellen Stand und schickt ihn samt Änderung zurück. Eine Karte
    aus ihrer Gruppe zu lösen, geht hier bewusst nicht — das bleibt der Oberfläche.

    Args:
        card_id: Kennung der Karte (`find_card`).
        name: Neuer Name, weglassen heißt unverändert.
        values: Vollständiger Satz Textfelder.
        card_group_id: Andere Kartengruppe.
        icon_choices: Vollständige Icon-Wahl.
        text_overrides: Vollständiger Satz Abweichungen vom Template.
    """
    payload = _payload(
        name=name,
        values=values,
        cardGroupId=card_group_id,
        iconChoices=icon_choices,
        textOverrides=text_overrides,
    )

    if not payload:
        raise ValueError("Nichts zu ändern: kein einziges Feld übergeben.")

    meta.validate_card_payload(state_cache.load_meta(get_client()), payload)

    warnings: list[str] = []
    if values is not None or icon_choices is not None or text_overrides is not None:
        # Das Template steht nicht in der Nutzlast — es hängt an der Karte.
        template_id = get_client().get_card(card_id).get("templateId")
        if isinstance(template_id, int):
            warnings = _unknown_field_warnings(
                template_id, values, icon_choices, text_overrides
            )

    return _with_hints(get_client().patch_card(card_id, payload), "card", warnings)


@mcp.tool()
@api_tool
@invalidates_state
def duplicate_card(card_id: int) -> dict:
    """Karte kopieren — Name mit „ (Kopie)", Werte und Abweichungen übernommen.

    Args:
        card_id: Kennung der Vorlage (`find_card`).
    """
    return _with_hints(get_client().post_card_duplicate(card_id), "card")


def _payload(**candidates: Any) -> dict:
    """Nutzlast aus dem bauen, was wirklich übergeben wurde.

    Weggelassene Werkzeug-Argumente sind `None` und dürfen **nicht** als Nullwert ans
    Backend gehen: die PATCH-Routen ändern genau die Schlüssel, die im Rumpf stehen.
    """
    return {key: value for key, value in candidates.items() if value is not None}


def _with_hints(saved: dict, kind: str, warnings: list[str] | None = None) -> dict:
    """Gespeicherten Stand mit Warnungen und dem Vorschaubild-Hinweis ausliefern."""
    return {kind: saved, "hinweise": [*(warnings or []), PREVIEW_HINT]}


def _unknown_field_warnings(
    template_id: int,
    values: dict | None,
    icon_choices: dict | None,
    text_overrides: dict | None,
) -> list[str]:
    """Meldet Schlüssel, die das Template nicht kennt — als Warnung, nicht als Ablehnung.

    Das Backend gleicht Kartenwerte bewusst nie gegen das Template ab (Grundsatz in
    `docs/routes.md`), sonst würde jede Template-Änderung bestehende Karten
    unspeicherbar machen. Strenger als die App zu sein, wäre hier ein Fehler — schweigen
    bei einem Tippfehler im Feldschlüssel allerdings auch.
    """
    if values is None and icon_choices is None and text_overrides is None:
        return []

    layers = get_client().get_template(template_id).get("layers", [])
    fields = card_fields.describe_card_fields(layers)
    known_text_keys = {field["key"] for field in fields["texts"]}
    known_icon_layers = {field["layerId"] for field in fields["icons"]}

    warnings = []
    for given, known, subject in (
        (values, known_text_keys, "Textfelder"),
        (text_overrides, known_text_keys, "Abweichungen"),
        (icon_choices, known_icon_layers, "Icon-Wahl"),
    ):
        if given is None:
            continue

        unknown = sorted(set(given) - known)
        if unknown:
            warnings.append(
                f"{subject}: {unknown} kennt das Template nicht — gespeichert wird es "
                f"trotzdem (die App prüft das auch nicht). Bekannt sind: {sorted(known)}."
            )

    return warnings


def main() -> None:
    """Startet den Server auf stdio.

    Das Token wird vorher aufgelöst: fehlt es, ist eine Zeile auf der Fehlerausgabe
    hilfreicher als ein Traceback beim ersten Werkzeugaufruf. Die Meldung geht bewusst
    nach stderr — stdout gehört dem MCP-Protokoll.
    """
    try:
        get_client()
    except MissingTokenError as error:
        print(f"cardmaker-mcp: {error}", file=sys.stderr)
        raise SystemExit(1) from error

    mcp.run()
