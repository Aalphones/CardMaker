# STATE

**Aktiver Plan:** `docs/planning/2026-08-13_rendering-engine/` — Meilenstein 4,
Rendering-Engine. Freigegeben am 2026-08-13.

**Phase:** 4/5 — Als Bild herunterladen (complete). Knopf „Als Bild herunterladen" im
Karteneditor (Fußzeile, links neben „Karte speichern") und in der Kartenliste (Raster: Icon,
Tabelle: Text) — rendert über `CardRenderer`/`CardRenderSource` in Druckauflösung, lädt als
PNG herunter, Ladezustand pro Knopf/Karte.

**Nächster Schritt:** Phase 5 — `phase-5-vorschaubilder.md`: die Kachel-Vorschaubilder auf
denselben Render-Motor legen statt auf die sichtbare Bühne des offenen Editors. Phase 5 ist
als **standard** eingestuft — `sonnet` reicht.

**Offen beim Nutzer (aus Meilenstein 3):** Der vollständige Bildschirm-Rundlauf gegen die
acht Abnahmekriterien des Karteneditor-Plans ist nie gefahren worden. Prüfliste in
`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md` → Report-Back.

**Offene Frage aus der Planung:** Beim Export könnte geprüft werden, ob ein hochgeladenes
Motiv genug Bildpunkte für 300 DPI hat (zu kleine Bilder werden im Druck unscharf, am
Bildschirm sieht man das nie). Bewusst nicht eingeplant — Entscheidung steht aus.
