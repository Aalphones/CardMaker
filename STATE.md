# STATE

**Aktiver Plan:** `docs/planning/2026-08-13_rendering-engine/` — Meilenstein 4,
Rendering-Engine. Freigegeben am 2026-08-13.

**Phase:** 2/5 — Bilder und Schriften abwarten (complete). Der Renderer holt Bilder und
Schriften selbst und zeichnet erst, wenn sie da sind — spätestens nach 10 Sekunden.

**Nächster Schritt:** Phase 3 — `phase-3-karte-ohne-editor.md`: eine gespeicherte Karte aus
dem Store in einen `CardRenderInput` übersetzen, damit der Motor sie ohne offenen Editor
zeichnen kann. Phase 3 ist als **standard** eingestuft — `sonnet` reicht.

**Offen beim Nutzer (aus Meilenstein 3):** Der vollständige Bildschirm-Rundlauf gegen die
acht Abnahmekriterien des Karteneditor-Plans ist nie gefahren worden. Prüfliste in
`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md` → Report-Back.

**Offene Frage aus der Planung:** Beim Export könnte geprüft werden, ob ein hochgeladenes
Motiv genug Bildpunkte für 300 DPI hat (zu kleine Bilder werden im Druck unscharf, am
Bildschirm sieht man das nie). Bewusst nicht eingeplant — Entscheidung steht aus.
