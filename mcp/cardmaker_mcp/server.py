"""Aufbau des MCP-Servers für CardMaker.

Stellt die CardMaker-REST-API über stdio als typisierte Werkzeuge bereit. Hier leben
die Server-Instanz, die gemeinsame Fehlerabbildung und die Werkzeuge dieser Phase
(`get_meta`, `get_state`); die weiteren kommen in den Folgephasen dazu.
"""
from __future__ import annotations

import functools
import sys
from collections.abc import Callable
from typing import Any, TypeVar

from mcp.server.mcpserver import MCPServer

from cardmaker_mcp import card_fields, search, state_cache
from cardmaker_mcp.client import ApiError, Client, MissingTokenError

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
