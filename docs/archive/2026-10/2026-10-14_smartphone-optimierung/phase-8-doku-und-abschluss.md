# Phase 8 — Doku & Abschluss

**Tier:** mechanisch

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans (finale AK, Smoke-Checkliste)
- `docs/conventions/css.md`, `docs/code-map.md`, `docs/PROJECT.md`, `docs/glossary.md`
- `docs/decisions/028-smartphone-bedienung.md`
- `FINDINGS.md` dieses Plans

## AK der Phase

1. `docs/conventions/css.md` hat einen Abschnitt „Breakpoints und Touch" (Mixins, Werte, Einbindung per `@use 'breakpoints' as bp;`, Regel „keine nackten Media-Zahlen in Komponenten", Tippfläche 44 px, Eingabeschrift 16 px, `.table--stack`, `.menu`) mit Verweis auf ADR-028.
2. `docs/code-map.md` nennt unter „Globale Styles" `_breakpoints.scss` und unter `shared/services/` `pointer.ts`; die Feature-Zeilen aus den Phasen 2–7 sind drin.
3. `docs/glossary.md` kennt die Begriffe „Smartphone-Breite", „Touch-Gerät", „Blatt", „Tab-Leiste" (je ein Satz) — falls das Glossar UI-Begriffe führt; führt es nur Domänenbegriffe, entfällt der Punkt (im Report-Back sagen, welcher Fall).
4. `npm run lint` grün, `npm run build` (Produktion) ohne Budget-Fehler — Ausgabe der Budget-Zeilen im Report-Back.
5. Alle offenen Einträge in `FINDINGS.md` sind erledigt oder als Follow-up in die README übernommen.
6. Plan-README: Summary, Files touched, Commits, Deviations, Follow-ups gefüllt; Smoke-Checkliste an Sascha übergeben (Abnahme durch ihn, nicht durch den Umsetzer).

## Checkliste

- [x] `css.md`-Abschnitt schreiben (AK 1).
- [x] `code-map.md` nachziehen (AK 2), grob halten — keine Zeilennummern.
- [x] Glossar prüfen und ggf. ergänzen (AK 3).
- [x] `PROJECT.md`: steht dort eine Aussage wie „nur Desktop" o. ä. (Grep `Desktop|mobil|Smartphone`)? Dann auf den neuen Stand bringen.
- [x] `npm run lint`, `npm run build` im Ordner `frontend/` (AK 4).
- [x] `FINDINGS.md` abarbeiten (AK 5).
- [x] Bottom-Sektionen der README füllen (AK 6).

## Report-Back

- AK 3: Das Glossar führt neben Domänenbegriffen auch UI-Begriffe („Anfasser", „Ebenenreihenfolge") — die vier Begriffe sind deshalb ergänzt.
- AK 4: Lint „All files pass linting". Build: Initial total 438,10 kB (Warnung 500 kB, Fehler 1 MB); einzige Budget-Meldung ist eine **Warnung** für `template-editor.scss` (4,85 kB, Warnung 4 kB, Fehler 8 kB) → Follow-up in der README.
- AK 5: `FINDINGS.md` hatte keine Einträge.
- `PROJECT.md`: zwei Stellen nachgezogen (Nicht-Ziel „native Mobile-App", Begründung „Desktop-Tool").
