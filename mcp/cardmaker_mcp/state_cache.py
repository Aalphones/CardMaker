"""Prozessweiter Zwischenspeicher für Auskunft (`/api/meta`) und Zustandsbild.

Das Zustandsbild ist keine Backend-Route, sondern hier zusammengesetzt aus
Kartengruppen, Templates und Karten (ADR-025) — drei Anfragen, die sonst bei jeder
Namenssuche erneut liefen.

Deshalb muss **jedes Schreib-Werkzeug** :func:`invalidate` auslösen (ab Phase 4 über
einen Dekorator im Server). Ohne das antwortet jede Suche nach einem Schreibvorgang
aus einem veralteten Bild — still, und das ist die schlimmste Sorte Fehler.
"""
from __future__ import annotations

from cardmaker_mcp.client import Client

_meta_cache: dict | None = None
_state_cache: dict | None = None


def load_meta(client: Client, *, refresh: bool = False) -> dict:
    """Die Auskunft `/api/meta`, beim ersten Zugriff geholt."""
    global _meta_cache

    if refresh or _meta_cache is None:
        _meta_cache = client.get_meta()

    return _meta_cache


def load_state(client: Client, *, refresh: bool = False) -> dict:
    """Zustandsbild aus Kartengruppen, Templates und Karten, beim ersten Zugriff geholt."""
    global _state_cache

    if refresh or _state_cache is None:
        _state_cache = {
            "cardGroups": client.get_card_groups(),
            "templates": client.get_templates(),
            "cards": client.get_cards(),
        }

    return _state_cache


def invalidate() -> None:
    """Zustandsbild verwerfen, damit der nächste Zugriff frisch lädt.

    Die Auskunft bleibt bewusst stehen: sie ändert sich nur, wenn im Backend Prüfregeln
    oder Schriften wechseln — nicht durch das Anlegen einer Karte. Ausnahme sind
    Schrift-Uploads; die rufen zusätzlich :func:`invalidate_meta`.
    """
    global _state_cache
    _state_cache = None


def invalidate_meta() -> None:
    """Auskunft verwerfen (nach Änderungen am Schriftvorrat)."""
    global _meta_cache
    _meta_cache = None
