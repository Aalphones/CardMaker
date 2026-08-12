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

- [x] Seitenspalte: „Alle Karten" entsperren.
- [x] Kartenzahlen: das Backend liefert sie mit — `GET /api/card-groups` und
      `GET /api/templates` je um ein `cardCount` erweitert (JOIN mit Zählung, kein
      Nachladen je Zeile). Kontrakt in `docs/routes.md` nachgezogen.
- [x] Sprung von der Gruppe in die vorgefilterte Kartenliste über einen Abfrageparameter
      (`cards?group=<id>`), den die Liste beim Öffnen liest.
- [x] „Karte erstellen" im Template-Editor verdrahtet (`cards/new?template=<id>`) — Navigation
      läuft über den Router, damit der vorhandene `pendingChangesGuard` der Route greift.
- [ ] Vollständiger Durchgang gegen die finalen Abnahmekriterien — **steht aus**, siehe
      Report-Back: das ist derselbe offene Bildschirm-Rundlauf, der schon seit Phase 2 auf den
      Nutzer wartet (private Profil: Smoke-Test macht der Nutzer, nicht die Session).
- [x] `docs/PROJECT.md`: Meilenstein 3 als erledigt markiert, mit Datum und Verweis auf
      den Archivordner; die offene Frage zum Bildzuschnitt war bereits in Phase 1
      entfernt.
- [x] `docs/code-map.md` auf Endstand gebracht (Sidebar, `cards`-Feature, Frontend-Layout-Kopf).
      `docs/models.md`, `docs/routes.md`, `docs/clients.md`, `docs/glossary.md` gegengelesen —
      nur `docs/routes.md` brauchte eine Ergänzung (`cardCount`), Rest war bereits aktuell.
- [x] `AGENTS.md` gegengelesen — führte den Karteneditor nirgends als „geplant", keine Änderung
      nötig.
- [x] `STATE.md` auf „kein aktiver Plan" gesetzt (Meilenstein 4 hat noch keinen Plan).
- [x] Plan nach `docs/archive/2026-08/` verschoben.

## Report-Back

**Umgesetzt:** Sidebar-Sperre weg, Kartenzahlen auf Gruppen- und Template-Kacheln (Backend
JOIN + COUNT, kein N+1), Sprung Gruppe → vorgefilterte Kartenliste, „Karte erstellen" aus dem
Template-Editor mit Template-Vorauswahl und funktionierendem Verlassen-Dialog bei
ungespeicherten Änderungen. `npm run lint`/`npm run build` grün, `php -l` auf allen
geänderten Backend-Dateien grün.

**Offen:** Der komplette Bildschirm-Rundlauf gegen die acht finalen Abnahmekriterien der
README ist nie gefahren worden — das zieht sich als offener Punkt durch praktisch jede Phase
seit Phase 2 (siehe STATE.md-Historie) und ist im `private`-Profil ausdrücklich Aufgabe des
Nutzers, nicht der Session. Checkliste dafür unten im Abschluss-Bericht an Sascha.
