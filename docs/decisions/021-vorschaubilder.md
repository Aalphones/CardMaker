# 021 — Vorschaubilder werden beim Speichern erzeugt, nicht live gerendert

**Status:** Akzeptiert (2026-08-12)

## Kontext

Die Template-Übersicht zeigt bisher nur Name, Ebenenzahl und Änderungsdatum —
`TemplateRepository::allSummaries()` liefert die Ebenenliste gar nicht mit, das Layout selbst
bleibt unsichtbar. Dieselbe Lücke hätte die geplante Kartenliste (Karteneditor-Plan, Phase 5):
ohne Vorschau zeigt jede Kachel nur einen Namen.

## Optionen

- (a) **Live rendern.** Jede Kachel bekommt eine eigene Konva-Bühne, die das Layout beim
  Anzeigen zeichnet — wie der Editor selbst, nur klein und ohne Bedienung.
- (b) **Bild beim Speichern erzeugen.** Der Editor exportiert beim Speichern ein PNG des
  aktuellen Standes, das Backend legt es ab; die Liste zeigt nur noch dieses Bild.

## Entscheidung

**(b).** Für Templates bliebe (a) noch tragbar — wenige Einträge, eine Bühne pro sichtbarer
Kachel. Für Karten nicht: eine Kartenliste kann leicht hundert Einträge haben, und hundert
gleichzeitige Konva-Bühnen sind ein Leistungsproblem, das mit jeder neuen Karte wächst. Templates
und Karten benutzen dasselbe Kartenformat und denselben Editor-Unterbau — dieselbe Lösung für
beide zu bauen ist billiger als zwei Wege zu pflegen, von denen einer (die Live-Bühne) nur für
Templates gebraucht würde.

## Konsequenzen

- Das Bild kann veralten, wenn jemand die Datenbank direkt ändert (z. B. beim Debuggen) — die
  Anzeige hängt am zuletzt gespeicherten Export, nicht an `layers` selbst.
- Zusätzlicher Speicherplatz: ein PNG pro Template und pro Karte, zusätzlich zur Datenbankzeile.
- Jeder Editor (Template- und künftig Karteneditor) braucht einen Export-Weg, der das aktuelle
  Layout ohne Auswahl-Anfasser als PNG rendert.
- Wer ein Template oder eine Karte nie speichert, hat kein Vorschaubild — die Übersicht zeigt
  dafür einen Platzhalter statt einer kaputten Bild-Ikone.
- Bild und Ablage liegen getrennt von Bildvorrat (ADR-015) und Kartenbildern (ADR-017), analog
  begründet: eigener Zweck, eigenes Aufräumen beim Löschen.
- Seit Meilenstein 4 kommt das Bild aus dem kopflosen Renderer (`CardRenderer`, ADR-022) statt
  aus der sichtbaren Editor-Bühne — derselbe Export-Weg wie beim „Als Bild herunterladen".
