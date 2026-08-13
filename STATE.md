# STATE

**Kein aktiver Plan.** Meilenstein 4 (Rendering-Engine) ist archiviert:
`docs/archive/2026-08/2026-08-13_rendering-engine/`.

**Offen beim Nutzer:** Der Bildschirm-Rundlauf gegen die Smoke-Checkliste in der archivierten
README ist noch nicht gefahren. Reihenfolge der Checkliste ist Absicht — oben stehen die
unsichersten Stellen.

**Offen beim Nutzer (aus Meilenstein 3):** Der vollständige Bildschirm-Rundlauf gegen die
acht Abnahmekriterien des Karteneditor-Plans ist nie gefahren worden. Prüfliste in
`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md` → Report-Back.

**Offene Frage aus der Planung (Meilenstein 4):** Beim Export könnte geprüft werden, ob ein
hochgeladenes Motiv genug Bildpunkte für 300 DPI hat (zu kleine Bilder werden im Druck
unscharf, am Bildschirm sieht man das nie). Bewusst nicht eingeplant — Entscheidung steht aus.

**Nächster Schritt:** Der Plan für Meilenstein 5 (Druckprojekt & Export) liegt fertig im
Backlog: `docs/planning/2026-08-13_druckprojekt-und-export/` — sechs Phasen, freigegeben am
13.08.2026, noch nicht angefangen. Umsetzung startet mit `/implement`.

Entschieden bei der Planung: genau **ein** Druckprojekt (Warenkorb im Backend, ADR-024),
PDF über jsPDF (ADR-023, nur dynamisch nachladen — sonst verdoppelt sich das Start-Bundle),
Karten als JPEG auf weißem Grund, damit Druckbögen für Netzwerkdrucker klein genug bleiben.
Die offene Frage zur Druckauflösung aus Meilenstein 4 ist damit beantwortet: Ein Hinweis vor
dem Export nennt zu grobe Motive, blockiert aber nichts.
