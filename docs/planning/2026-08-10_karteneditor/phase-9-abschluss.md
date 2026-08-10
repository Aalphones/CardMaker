# Phase 9 — Verknüpfungen, Doku, Abnahme

**Rating:** mechanisch

Der Design-Plan hat mehrere Stellen bewusst offen gelassen, weil es noch keine Karten
gab. Hier werden sie scharf geschaltet.

## Kontext — vorher lesen

- `docs/planning/2026-08-10_design-organic/` bzw. dessen Archivordner — die Phasen 3, 4
  und 5, jeweils die 🟡-Hinweise
- `README.md` dieses Plans → finale Abnahmekriterien

## Abnahmekriterien

- In der Seitenspalte ist **„Alle Karten" entsperrt** und führt auf die Kartenliste.
  („Druckprojekte" bleibt gesperrt bis Meilenstein 5.)
- Auf der **Kartengruppen-Liste** zeigt jede Kachel „N Karten anzeigen →" mit der
  richtigen Zahl und springt in die Kartenliste mit vorgewähltem Gruppen-Chip.
- Auf der **Template-Liste** zeigt die Überzeile „N Layer · M Karten" mit der richtigen
  Kartenzahl.
- Im **Template-Editor** ist der Kopfzeilen-Button „Karte erstellen" entsperrt und öffnet
  den Karteneditor mit diesem Template vorgewählt.
- Alle acht finalen Abnahmekriterien der README sind einzeln geprüft und abgehakt.

## Checkliste

- [ ] Seitenspalte: „Alle Karten" entsperren.
- [ ] Kartenzahlen: das Backend liefert sie mit — `GET /api/card-groups` und
      `GET /api/templates` je um ein `cardCount` erweitern (JOIN mit Zählung, kein
      Nachladen je Zeile). Kontrakt in `docs/routes.md` nachziehen.
- [ ] Sprung von der Gruppe in die vorgefilterte Kartenliste über einen Abfrageparameter
      (`cards?group=<id>`), den die Liste beim Öffnen liest.
- [ ] „Karte erstellen" im Template-Editor verdrahten (`cards/new?template=<id>`).
      🟡 Vorher prüfen, ob ungespeicherte Änderungen vorliegen — wenn ja, erst die
      bestehende Rückfrage.
- [ ] Vollständiger Durchgang gegen die finalen Abnahmekriterien.
- [ ] `docs/PROJECT.md`: Meilenstein 3 als erledigt markieren, mit Datum und Verweis auf
      den Archivordner; die offene Frage zum Bildzuschnitt ist bereits in Phase 1
      entfernt worden — gegenprüfen.
- [ ] `docs/code-map.md`, `docs/models.md`, `docs/routes.md`, `docs/clients.md`,
      `docs/glossary.md` auf Endstand gegenlesen.
- [ ] `AGENTS.md`: die Kurzbeschreibung um den Karteneditor ergänzen, falls sie ihn noch
      als geplant führt.
- [ ] `STATE.md` auf den nächsten Plan zeigen lassen (Meilenstein 4 — Rendering-Engine)
      oder auf „kein aktiver Plan".
- [ ] Plan nach `docs/archive/2026-08/` verschieben.

## Report-Back
