# 007 — Charaktere haben feste Kernfelder plus frei benannte Attribute

**Status:** Abgelöst durch ADR-011 (2026-08-01) — CardMaker verwaltet keine Charaktere mehr;
Karten speichern ausgefüllte Templatefelder direkt, ohne Datenbank-Zwischenschritt.
Ursprünglich: Akzeptiert (2026-08-01)

## Kontext

Templates greifen auf Werte wie `character.element` oder `character.faction` zu. Ein
generischer Kartengenerator kann diese Felder nicht fest verdrahten — jedes Kartensystem hat
andere Attribute, und CardMaker soll beliebige Sammelkartensysteme abbilden, ohne für jedes
neue System eine Schema-Migration zu brauchen.

## Optionen

- (a) Feste Spaltenliste (`element`, `faction`, `rarity`, …) im `characters`-Schema.
- (b) Frei benannte Attribute als JSON-Feld — eine flache Zuordnung Name → Text.
- (c) Eigene Attribut-Tabelle mit Definition (Name, Typ) und Werten pro Charakter.

## Entscheidung

**(b).** Kernfelder fest (`name`, `description`), alles Weitere in einer JSON-Spalte
`attributes` als flache Zuordnung Name → Text. Verfügbare Attributnamen werden zur
Eingabezeit aus dem vorhandenen Bestand abgeleitet (`GET /api/characters/attribute-keys`)
und als Vorschlagsliste angeboten — kein Vorab-Schema, aber auch keine Tippfehler-Wildwuchs
ohne Gegenmittel.

## Konsequenzen

- Keine Schema-Änderung, wenn ein neues Kartensystem andere Attribute braucht.
- Attributwerte sind immer Text; Formatierung/Interpretation (z.B. „Feuer" als Icon) ist
  Sache des Templates, nicht der Datenhaltung.
- Tippfehler in Attributnamen sind technisch möglich (`Element` vs. `element`) — die
  Vorschlagsliste aus dem Bestand ist das einzige Gegenmittel, keine harte Validierung.
- Zeigt sich später Bedarf an typisierten oder Pflichtfeldern pro Kartensystem, ist Variante
  (c) der Nachfolger — dann als eigenes ADR, kein stillschweigender Umbau.
