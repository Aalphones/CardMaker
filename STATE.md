# STATE

**Aktiver Plan:** `docs/planning/2026-08-13_rendering-engine/` — Meilenstein 4,
Rendering-Engine. Freigegeben am 2026-08-13.

**Phase:** 3/5 — Eine gespeicherte Karte ohne Editor rendern (complete). `buildRenderInput()`
übersetzt Karte + Template in einen `CardRenderInput`, `CardRenderSource.inputForCard(cardId)`
besorgt beides über die Facades — ohne dass ein Editor offen sein muss.

**Nächster Schritt:** Phase 4 — `phase-4-herunterladen.md`: der Knopf „Als Bild herunterladen"
im Karteneditor und in der Kartenliste. Phase 4 ist als **standard** eingestuft — `sonnet`
reicht.

**Offen beim Nutzer (aus Meilenstein 3):** Der vollständige Bildschirm-Rundlauf gegen die
acht Abnahmekriterien des Karteneditor-Plans ist nie gefahren worden. Prüfliste in
`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md` → Report-Back.

**Offene Frage aus der Planung:** Beim Export könnte geprüft werden, ob ein hochgeladenes
Motiv genug Bildpunkte für 300 DPI hat (zu kleine Bilder werden im Druck unscharf, am
Bildschirm sieht man das nie). Bewusst nicht eingeplant — Entscheidung steht aus.
