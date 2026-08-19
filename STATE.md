# STATE

**Aktiver Plan:** `docs/planning/2026-08-19_bildvorrat-erweiterung/`
**Phase:** 2/6 — Datenmodell: Artwork als dritte Art + Umbenennen-Endpoint (pending)
**Nächster Schritt:** Migration `M012ExtendAssetKind.php` anlegen, dann `AssetValidator`
(KINDS + NAME_MAX_LENGTH + validateRename), `AssetRepository::updateName`,
`AssetService::rename`, `AssetController::update`, Route in `index.php`, `MetaService`.
Phase 1 ist deployt und live bestätigt (siehe phase-1-Report-Back).
