# STATE

**Aktiver Plan:** `docs/planning/2026-08-03_template-editor/`
**Phase:** 3/8 — Templates im Backend (umgesetzt, Serverprobe offen) → weiter mit Phase 4
**Nächster Schritt:** Phase 3 (Templates-Backend: Migration, `LayerValidator`,
`TemplateValidator`, `TemplateRepository`, `TemplateService`, `TemplateController`,
Löschsperre für Bilder, Routing) ist gebaut und lokal geprüft (`php -l` + gezielte
Validator-/Repository-Läufe ohne Datenbank), aber noch **nicht committet und nicht
deployed**. Vor dem Weitermachen: Diff reviewen, committen (`mode-committing`), dann
`deploy.cmd` + `POST /api/migrate` + der Hand-Test aus dem letzten Checklistenpunkt in
`phase-3-templates-backend.md` (offen, wie schon die Phase-2-Hochladung — beide brauchen
ein Zugriffstoken). Details im Report-Back dort, inkl. eines beim Bauen gefundenen und
gefixten PHP-Bugs (Text-Interpolation `$min–$max`). Danach Phase 4
(`phase-4-templates-frontend.md`) — Rating standard → `/model sonnet` reicht.
