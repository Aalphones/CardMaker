# Phase 6 — Doku & Abschluss

**Tier:** mechanisch.

**Voraussetzung:** Phasen 1–5 abgeschlossen und abgenommen.

## AK

Alle finalen Abnahmekriterien aus der README (Abschnitt „Finale Abnahmekriterien") sind
einzeln durchgegangen und bestätigt.

## Implementation / Doc-Updates

- [x] `docs/models.md`: `assets`-Tabelle — Kommentarzeile zu `kind` bestätigt, `artwork`
      steht drin (aus Phase 2).
- [x] `docs/routes.md`: Bildvorrat-Tabelle — `PATCH /api/assets/{id}` bestätigt (Phase 2).
- [x] `docs/conventions/mcp.md` + `mcp/README.md`: `rename_asset` bestätigt (Phase 3). Beim
      Gegenlesen einen Drift gefunden: `list_assets` wurde in beiden Dateien noch als
      „Rahmen/Icons" beschrieben, ohne Artwork — korrigiert. Kein Werkzeug-Zähler in der
      Kopfzeile vorhanden, nichts anzupassen.
- [x] `docs/code-map.md`: beide Einträge aus Phase 4/5 bestätigt (Bildvorrat-Screen,
      Icon-Vorschau-Vermerk) — waren schon korrekt.
- [x] `docs/decisions/027-artwork-als-dritte-asset-art.md`: existiert und ist vollständig.
- [x] `STATE.md`: wird beim Archivieren auf „(kein aktiver Plan)" zurückgesetzt.

## Abschluss-Checkliste (Gesamt-Regressionscheck, private — manuell)

- [x] Alle sechs „Finale Abnahmekriterien" aus der README einzeln nachvollzogen (User: 1, 3
      manuell, 4, 5, 6; Session: 2 und 3-MCP über die `cardmaker`-Werkzeuge verprobt).
- [x] `git status` — nur `STATE.md` und der Doku-Drift-Fix geändert, keine Debug-Reste.
- [ ] Plan-Ordner nach Abnahme verschieben: `docs/planning/2026-08-19_bildvorrat-erweiterung/`
      → `docs/archive/2026-08/2026-08-19_bildvorrat-erweiterung/` (kompletter Ordner, wie bei
      den bisherigen Archiv-Einträgen).

## Report-Back

**Summary:** Bildvorrat um eine dritte Art „Artwork" erweitert, Rahmen/Icons/Artwork lassen
sich umbenennen (Editor + MCP `rename_asset`), die Bildvorrat-Seite kann mehrere Dateien auf
einmal hochladen, und Icon-Auswahl im Karteneditor zeigt echte Vorschaubilder statt nur Text.
Zwei Bugs vorab behoben: 422 bei der Icon-Auswahl, Pydantic-Absturz in `list_assets`.

**Files touched:** Backend (`AssetValidator`, `AssetController`, `AssetService`,
`AssetRepository`, Migration `M012ExtendAssetKind`, `CardValidator`/`ICON_LAYER_KEY_PATTERN`),
MCP (`server.py`, `meta.py`, `mcp/README.md`), Frontend (`features/assets/asset-library/`,
`assets.actions.ts`, `icon-properties.ts`/Icon-Auswahl-Vorschau), Doku (`models.md`,
`routes.md`, `code-map.md`, `conventions/mcp.md`, ADR-027).

**Commits:** siehe `git log` der Phasen 1–5 plus der Doku-Drift-Fix aus Phase 6
(`docs(mcp): list_assets erwähnt Artwork als dritte Bildvorrat-Art`).

**Deviations:** keine gegenüber dem Plan.

**Follow-ups:** Kein Zeichenpfad für Artwork (ADR-027, bewusste Scope-Grenze) — eigener
Folgeplan nötig, falls Artwork tatsächlich auf eine Karte gezeichnet werden soll.
