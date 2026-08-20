# STATE

**Aktiver Plan:** `docs/planning/2026-08-19_bildvorrat-erweiterung/`
**Phase:** 5/6 — Frontend: Icon-Vorschau im Karteneditor (pending)
**Nächster Schritt:** `phase-5-icon-vorschau-karteneditor.md` lesen und Umsetzung starten.

Phase 4 (Bildvorrat-Seite) ist im Code fertig, Build + Lint grün. Manuelle Abnahme steht noch
aus (Checkliste in `phase-4-bildvorrat-seite.md`), insbesondere die sequenzielle
Upload-Warteschlange.

Die Migration `M012ExtendAssetKind` ist weiterhin **nicht angewandt** (nächster Deploy über
`POST /api/migrate`). Bis dahin schlägt jedes `kind=artwork` auf dem echten Server fehl.
