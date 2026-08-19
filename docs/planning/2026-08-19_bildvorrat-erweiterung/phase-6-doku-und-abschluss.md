# Phase 6 — Doku & Abschluss

**Tier:** mechanisch.

**Voraussetzung:** Phasen 1–5 abgeschlossen und abgenommen.

## AK

Alle finalen Abnahmekriterien aus der README (Abschnitt „Finale Abnahmekriterien") sind
einzeln durchgegangen und bestätigt.

## Implementation / Doc-Updates

- [ ] `docs/models.md`: `assets`-Tabelle — Kommentarzeile zu `kind` bestätigen, dass
      `artwork` drinsteht (falls in Phase 2 schon erledigt, hier nur gegenlesen).
- [ ] `docs/routes.md`: Bildvorrat-Tabelle — `PATCH /api/assets/{id}` bestätigen (Phase 2).
- [ ] `docs/conventions/mcp.md` + `mcp/README.md`: `rename_asset` bestätigen (Phase 3), dazu
      den Werkzeug-Zähler/Meilenstein-Bezug in der Kopfzeile aktualisieren, falls dort eine
      Zahl genannt ist (z. B. „18 Werkzeuge" o. ä. — kurzer Blick, ob so eine Zahl existiert).
- [ ] `docs/code-map.md`: beide Einträge aus Phase 4/5 bestätigen (Bildvorrat-Screen,
      Icon-Vorschau-Vermerk).
- [ ] `docs/decisions/027-artwork-als-dritte-asset-art.md`: existiert und ist vollständig
      (Phase 2 legt sie an — hier nur gegenlesen, nicht neu schreiben).
- [ ] `STATE.md`: „Aktiver Plan" auf „(kein aktiver Plan)" zurücksetzen, alle in dieser
      Session gefundenen offenen Punkte (falls aus den Report-Backs neue auftauchen) dort
      vermerken.

## Abschluss-Checkliste (Gesamt-Regressionscheck, private — manuell)

- [ ] Alle sechs „Finale Abnahmekriterien" aus der README einzeln nachvollzogen.
- [ ] `git status` — nur erwartete Dateien geändert, keine Debug-Reste (`console.log`,
      auskommentierter Code).
- [ ] Plan-Ordner nach Abnahme verschieben: `docs/planning/2026-08-19_bildvorrat-erweiterung/`
      → `docs/archive/2026-08/2026-08-19_bildvorrat-erweiterung/` (kompletter Ordner, wie bei
      den bisherigen Archiv-Einträgen).

## Report-Back

(wird beim Umsetzen ausgefüllt — Summary, Files touched, Commits, Deviations, Follow-ups für
den gesamten Plan)
