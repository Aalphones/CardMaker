# 020 — Karteninhalt als Datenblock statt eigener Tabellen

**Status:** Akzeptiert (2026-08-12)

Der Plan sah für diese Entscheidung die Nummer 019 vor; die war beim Umsetzen bereits durch
„Eigene Schriften" belegt.

## Kontext

Eine Karte trägt drei Sammlungen variabler Größe: die eingegebenen Texte (Feldschlüssel →
Text), die Icon-Wahl (Ebenen-Id → Bildvorrat-Eintrag) und die Abweichungen bei Schriftgröße,
Farbe, Fett und Kursiv (Feldschlüssel → Abweichung). Wie viele Einträge das jeweils sind,
bestimmt allein das Template.

## Optionen

- (a) Drei Nebentabellen (`card_values`, `card_icon_choices`, `card_text_overrides`), je eine
  Zeile pro Eintrag, Fremdschlüssel auf die Karte.
- (b) Drei JSON-Spalten an der Karte selbst.

## Entscheidung

**(b)** — dieselbe Begründung wie bei ADR-014 für das Template-Layout. Eine Karte wird immer
als Ganzes gelesen und als Ganzes gespeichert; einzelne Werte werden nie separat gesucht,
gefiltert oder sortiert. Drei Nebentabellen bedeuteten drei Löschungen und drei
Einfügungen pro Speichervorgang für Daten, die nie einzeln angefasst werden.

Geprüft wird im PHP-Prüfer, nach dem Muster von `LayerValidator`: Schlüssel gegen die Ebenen
des zugehörigen Templates, Werte gegen ihre Grenzen (Schriftgröße 4–200, Farbe `#rrggbb`).

## Konsequenzen

- Die Datenbank prüft an diesen drei Blöcken nichts. Die vollständige Prüfung im Backend
  (Phase 2) ist Pflicht, nicht Kür — sie ist die einzige Instanz, die den Inhalt gegen das
  Template abgleicht.
- Ein Bildvorrat-Eintrag lässt sich nicht per Fremdschlüssel davor schützen, gelöscht zu
  werden, während ihn noch eine Icon-Wahl benutzt. Dieselbe Lücke besteht laut ADR-014
  bereits bei Templates; sie wird an derselben Stelle im Anwendungscode geschlossen.
- Verwaiste Werte — ein Feldschlüssel, den es im Template nicht mehr gibt — bleiben im Block
  stehen. Das ist gewollt: die Karte bleibt ladbar, der Text geht nicht verloren, gezeichnet
  wird er nicht. Wird das Feld im Template wieder angelegt, ist der Text zurück.
- Ändert sich später der Bedarf (Suche über Kartentexte, Statistiken über Feldwerte), ist das
  eine neue Entscheidung, keine stillschweigende Erweiterung dieser hier.
