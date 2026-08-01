# 005 — Karten werden im Browser gerendert, nicht auf dem Server

**Status:** Akzeptiert (2026-08-01)

## Kontext

Das ursprüngliche Konzeptdokument sah serverseitiges Rendern einer Karte in Zielauflösung
vor (PHP GD/Imagick). Konva.js zeichnet die Karte für die Live-Vorschau im Template-/
Karteneditor aber ohnehin schon (siehe ADR-001) — eine zweite, unabhängige Zeichenlogik in
PHP müsste pixelgleiche Ergebnisse liefern, inklusive Schriftmetrik und automatischer
Textverkleinerung. Zwei Rendering-Engines für dasselbe Layer-Modell sind ein doppelter
Pflegeaufwand mit garantiertem Drift-Risiko.

## Optionen

- (a) Nur Browser: Konva exportiert die fertige Karte direkt als Bild.
- (b) Nur Server: PHP baut eine eigene Kompositing-Pipeline (GD/Imagick).
- (c) Beides: Vorschau im Browser, finales Rendering für den Druckbogen-Export auf dem
  Server.

## Entscheidung

**(a) — nur Browser.** Die Konva-Bühne wird mit erhöhtem Pixelverhältnis exportiert, um die
Zielauflösung zu erreichen. Eine Karte bei 300 DPI sind 744×1039 Pixel, ein A4-Druckbogen
2480×3508 Pixel — für Konvas Canvas-Export unkritisch.

## Konsequenzen

- `backend/src/Rendering/` entfällt vollständig. Das Backend speichert und liefert nur
  Daten (Charaktere, Bilder, Templates, Karteninstanzen), es rendert nichts.
- Die Zeichenregeln (Einheiten-Umrechnung 630×880 → Zielauflösung, automatische
  Textverkleinerung, Layer-Reihenfolge Image→Shape→Icon→Frame→Text) liegen als reine
  TypeScript-Funktionen **ohne Konva-Abhängigkeit** unter
  `frontend/src/app/shared/canvas/rendering/` — damit sie lesbar, unit-testbar und später
  portierbar bleiben, falls doch einmal ein serverseitiger Export nötig wird.
- Der später geplante Assistenten-Zugriff (`mcp/`) kann Daten pflegen, aber nicht selbst
  rendern — Vorschaubilder entstehen ausschließlich im Browser.
- Die „Offene Stack-Frage" zum Export-Mechanismus für Druckbögen (client- vs. server-seitig,
  siehe `docs/PROJECT.md`) ist damit für die Vorschau/das Einzelbild entschieden; der
  Druckbogen-Export (Meilenstein 5) bleibt client-seitig konsequent — kein Imagick-Check auf
  Strato mehr nötig.
