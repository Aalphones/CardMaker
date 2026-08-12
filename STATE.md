# STATE

**Aktiver Plan:** `docs/planning/2026-08-10_karteneditor/`
**Phase:** 9/9 — Verknüpfungen, Doku, Abnahme (pending, Rating: mechanisch)
**Nächster Schritt:** Phase 9 umsetzen (`phase-9-abschluss.md`) — Modellwahl `sonnet`,
die Phase ist als mechanisch eingestuft.

Phase 8 (Bild ziehen und zoomen) ist fertig, committet, `npm run lint`/`npm run build` grün.
Das Motiv lässt sich in seiner Fläche ziehen, mit Mausrad/Regler/Tastatur zoomen und
zurücksetzen; gespeichert wird gesammelt nach 400 ms Ruhe und beim Verlassen des Editors.
Der Bildschirm-Test steht aus — er hängt am selben offenen Rundlauf wie die Phasen 2-7.
Die Handprüfliste dazu (Hoch-/Querformat, sehr kleines/großes Bild, Zoom bis Anschlag, alle
vier Zieh-Grenzen, Zurücksetzen, Neuladen) steht in `phase-8-bild-platzieren.md` und ist als
Finding für die Abnahme in Phase 9 vermerkt.

**Offen aus dem Karteneditor-Plan, Phase 1-7:** Die Migrationen sind seit 2026-08-12 live
gelaufen (`M008CreateCards`, `M009CreateCardImages`) — die Tabellen existieren. Ein echter
Rundlauf gegen den Server (Karte anlegen, Bild hochladen, zurechtschieben, Kartenliste mit
echten Daten, Suche/Filter/Sortierung/Duplizieren/Löschen) ist bisher nie gefahren worden,
jetzt aber erstmals vollständig über die Oberfläche möglich.

Der Vorschaubilder-Plan ist am 2026-08-12 fertig, deployt, per Smoke-Test bestätigt und
archiviert: `docs/archive/2026-08/2026-08-12_template-vorschaubilder/`.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
