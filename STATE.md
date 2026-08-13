# STATE

**Aktiver Plan:** `docs/planning/2026-08-13_rendering-engine/` — Meilenstein 4,
Rendering-Engine. Freigegeben am 2026-08-13.

**Phase:** 1/5 — Der Render-Motor (complete). Der Motor zeichnet eine Karte in Druckauflösung
ohne offenen Editor; gemessen 744 × 1039.

**Nächster Schritt:** Phase 2 — `phase-2-bilder-und-schriften-abwarten.md`: `renderPng` lädt
Bilder und Schriften selbst und wartet auf sie, bevor gezeichnet wird. Die Nahtstelle sind die
drei leeren Vorräte in `exportContext()` in
`frontend/src/app/shared/canvas/card-renderer.service.ts`. Phase 2 ist als **heikel**
eingestuft — `opusplan` oder `opus`.

**Offen beim Nutzer (aus Meilenstein 3):** Der vollständige Bildschirm-Rundlauf gegen die
acht Abnahmekriterien des Karteneditor-Plans ist nie gefahren worden. Prüfliste in
`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md` → Report-Back.

**Offene Frage aus der Planung:** Beim Export könnte geprüft werden, ob ein hochgeladenes
Motiv genug Bildpunkte für 300 DPI hat (zu kleine Bilder werden im Druck unscharf, am
Bildschirm sieht man das nie). Bewusst nicht eingeplant — Entscheidung steht aus.
