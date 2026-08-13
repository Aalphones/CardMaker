# Phase 2 — Store, Route, Seitenspalte

Rating: **standard**

## Kontext (vorher lesen)

- `docs/conventions/state-management.md` — Store-Regeln, Facade-Pflicht
- `frontend/src/app/store/card-groups/*` — das vollständige Muster einer Slice
  (`.actions.ts`, `.effects.ts`, `.feature.ts`, `.facade.ts`)
- `frontend/src/app/core/services/api.ts` — der HTTP-Zugang
- `frontend/src/app/layout/shell/shell.*` — Seitenspalte, dort ist „Druckprojekte" gesperrt
- `frontend/src/app/app.routes.ts`
- README dieses Plans → Kontrakt-Sektion

## Abnahmekriterien

- Die Slice `print-project` lädt beim Betreten der Route ihren Stand und hält Positionen und
  Optionen; jede Änderung geht über die Facade, keine Komponente kennt den Store direkt.
- Der Seitenspalten-Eintrag „Druckprojekte" ist ein echter Link auf `/print-project` und
  nicht mehr `aria-disabled`.
- Er trägt eine Plakette mit der **Summe der Anzahlen** (nicht der Zeilen); ist sie 0, wird
  keine Plakette gezeigt.
- Die Plakette stimmt auch dann, wenn die Karte auf der Kartenliste hinzugefügt wurde, ohne
  den Druckprojekt-Bildschirm zu öffnen.

## Checkliste

- [ ] `frontend/src/app/store/print-project/print-project.actions.ts` — laden, Optionen setzen,
      Position hinzufügen/ändern/entfernen, leeren, je mit Erfolg/Fehlschlag.
- [ ] `.../print-project.feature.ts` — Zustand `{ options, items, loaded, saving, error }`,
      Selektoren inkl. `selectTotalQuantity` (Summe der Anzahlen).
- [ ] `.../print-project.effects.ts` — Aufrufe gegen die sechs Endpunkte, Fehler als Meldung
      über `shared/services/notification.ts` (Muster: `cards.effects.ts`).
- [ ] `.../print-project.facade.ts` — Signale + Kommandos, das einzige öffentliche Gesicht.
- [ ] Die Slice in der App-Konfiguration registrieren (wie `cards`).
- [ ] Route `print-project` in `app.routes.ts` (lazy `loadComponent`, Platzhalter-Komponente
      aus Phase 3 — in dieser Phase reicht das Gerüst mit Überschrift).
- [ ] `shell.html`/`shell.ts`: Eintrag entsperren, Plakette anbinden, Stand beim Start der
      Shell einmal laden (damit die Zahl vor dem ersten Öffnen des Bildschirms stimmt).
- [ ] Plaketten-Optik nach `docs/design/handoff-organic/README.md` → Sidebar (min-width 20 px,
      Höhe 20 px, Radius 999 px).
- [ ] `docs/code-map.md`: Zeile `print-projects` in der Feature-Tabelle auf den Ist-Stand
      bringen, Frontend-Layout-Block um `features/print-project/` und
      `store/print-project/` ergänzen, den Satz „nur ‚Druckprojekte' ist noch gesperrt"
      in der Shell-Beschreibung streichen.

## Report-Back

_(beim Abschluss der Phase füllen)_
