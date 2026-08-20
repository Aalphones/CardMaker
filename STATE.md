# STATE

**Aktiver Plan:** `docs/planning/2026-08-19_bildvorrat-erweiterung/`
**Phase:** 3/6 — MCP-Werkzeug `rename_asset` (pending)
**Nächster Schritt:** `rename_asset(asset_id, name)` in `mcp/` nach dem Muster von
`update_card_group` anlegen (ruft `PATCH /api/assets/{id}`), `kind`-Parameter von
`list_assets` um `"artwork"` erweitern.
Phase 2 ist im Code fertig; die Migration `M012ExtendAssetKind` ist noch **nicht angewandt** —
das passiert beim nächsten Deploy über `POST /api/migrate`. Bis dahin schlägt jedes
`kind=artwork` auf dem Server fehl.
