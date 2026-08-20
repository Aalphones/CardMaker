# STATE

**Aktiver Plan:** `docs/planning/2026-08-19_bildvorrat-erweiterung/`
**Phase:** 4/6 — Frontend: Bildvorrat-Seite (Umbenennen, Multiupload, Artwork) (pending)
**Nächster Schritt:** `phase-4-bildvorrat-seite.md` lesen und Umsetzung starten.
Phase 3 ist im Code fertig (`rename_asset` im MCP-Server), aber die manuelle Live-Abnahme
gegen das laufende Backend steht noch aus. Die Migration `M012ExtendAssetKind` ist weiterhin
**nicht angewandt** — das passiert beim nächsten Deploy über `POST /api/migrate`. Bis dahin
schlägt jedes `kind=artwork` auf dem Server fehl (betrifft auch `rename_asset` auf ein
Artwork-Asset).
