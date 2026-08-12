# STATE

**Aktiver Plan:** `docs/planning/2026-08-10_karteneditor/`
**Phase:** 8/9 — Bild ziehen und zoomen (pending, Rating: heikel)
**Nächster Schritt:** Phase 8 umsetzen (`phase-8-bild-platzieren.md`) — Modellwahl `opusplan`,
die Phase ist als heikel eingestuft.

Phase 7 (Live-Vorschau) ist fertig, committet, `npm run lint`/`npm run build` grün. Der
Live-Test im Browser steht aus — er hängt am selben offenen Rundlauf wie die Phasen 2-6.
Zwei Fragen, die nur der Bildschirm beantwortet, stehen im Report-Back der Phase 7:
Tippt es sich flüssig, und ist das Vorschaubild scharf genug?

**Offen aus dem Karteneditor-Plan, Phase 1-6:** Die Migrationen sind seit 2026-08-12 live
gelaufen (`M008CreateCards`, `M009CreateCardImages`) — die Tabellen existieren. Ein echter
Rundlauf gegen den Server (Karte anlegen, Bild hochladen, Kartenliste mit echten Daten,
Suche/Filter/Sortierung/Duplizieren/Löschen) ist bisher nie gefahren worden, jetzt aber
erstmals vollständig über die Oberfläche möglich.

Karten haben erst nach Phase 7 eigene Vorschaubilder; bis dahin zeigt die Kartenliste
Platzhalter. Das ist so gewollt und kein Fehler.

Der Vorschaubilder-Plan ist am 2026-08-12 fertig, deployt, per Smoke-Test bestätigt und
archiviert: `docs/archive/2026-08/2026-08-12_template-vorschaubilder/`.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
