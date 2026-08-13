"""Teilzeichenketten-Suche über die zwischengespeicherten Kurzfassungen.

Das Backend hat keine Suchroute, und Kartengruppen/Templates/Karten sind kleine Listen
(ADR-025) — die Suche läuft deshalb hier, nicht als Anfrage.
"""
from __future__ import annotations


def search_by_name(items: list[dict], query: str) -> list[dict]:
    """Teilzeichenkette in `name`, Groß-/Kleinschreibung egal."""
    needle = query.lower()
    return [item for item in items if needle in item.get("name", "").lower()]


def no_match_message(kind: str, query: str) -> str:
    """Erklärender Satz statt einer leeren, unkommentierten Liste."""
    return f'Keine {kind} gefunden für „{query}“.'
