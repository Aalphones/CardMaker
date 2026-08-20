# STATE

**Aktiver Plan:** `docs/planning/2026-08-19_bildvorrat-erweiterung/`
**Phase:** 6/6 — Doku & Abschluss (pending)
**Nächster Schritt:** `phase-6-doku-und-abschluss.md` lesen und abarbeiten.

Phase 5 (Icon-Vorschau im Karteneditor) ist im Code fertig, Lint + Build grün. Manuelle
Abnahme steht noch aus (Checklisten in `phase-4-bildvorrat-seite.md` und
`phase-5-icon-vorschau-karteneditor.md`).

Die Migration `M012ExtendAssetKind` ist weiterhin **nicht angewandt** (nächster Deploy über
`POST /api/migrate`). Bis dahin schlägt jedes `kind=artwork` auf dem echten Server fehl.
