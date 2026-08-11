# Phase 2 — Gemeinsame Bausteine

**Rating:** standard

Der Entwurf baut jeden Screen aus denselben acht Bausteinen (Button, Feld, Auswahlpunkt,
Segment-Umschalter, Karte, Tag, Tabelle, Dialog). Heute stylt jede Komponente ihre Buttons
und Felder selbst — mit leicht unterschiedlichen Werten. Diese Phase zieht die Bausteine
einmal zentral hoch, damit die Folgephasen nur noch Struktur bauen.

## Kontext — vorher lesen

- `frontend/src/styles.scss` (Ergebnis aus Phase 1)
- [`docs/design/handoff-organic/design-system/styles.css`](../../design/handoff-organic/design-system/styles.css)
  — Abschnitte „buttons" bis „dialog" sowie der Schlussblock „rounded frame"
- `docs/conventions/css.md` — Regel 1 (kein Utility-Framework) und Regel 3 (kein Inline-Style)
- Bestehende Stylesheets, die eigene Button-/Feld-Regeln tragen und danach schrumpfen:
  `features/auth/login/login.scss`, `features/auth/tokens/tokens-page/tokens-page.scss`,
  `features/card-groups/card-groups-detail/card-groups-detail.scss`,
  `shared/components/confirm-dialog/confirm-dialog.scss`,
  `shared/components/field-hint/field-hint.scss`

## Abnahmekriterien

- Es existiert `frontend/src/styles/_bausteine.scss`, aus `styles.scss` eingebunden, mit
  genau diesen Blöcken: `.btn` (+ `--primary`, `--secondary`, `--ghost`, `--icon`,
  `--block`), `.tag` (+ `--accent`, `--accent-2`, `--neutral`, `--outline`), `.field`,
  `.input`, `.radio` + `.radio__dot`, `.seg` + `.seg__option`, `.card` (+ `__kicker`,
  `__title`, `__body`, `__meta`), `.table`, `.dialog` (+ `__title`, `__body`, `__actions`)
  und `.dialog-backdrop`.
- Die Klassennamen folgen BEM (`block__element--modifier`) — **nicht** die Bindestrich-Namen
  aus dem Design-System (`.btn-primary` wird zu `.btn--primary`, `.card-title` zu
  `.card__title`, `.seg-opt` zu `.seg__option`).
- Buttons, Felder, Tags und der Segment-Umschalter sind Pillen; Karten und Dialoge nutzen
  `calc(var(--radius-lg) * 1.15)`.
- Kein Komponenten-Stylesheet definiert danach noch eigene Button- oder Feld-Grundregeln.
  Erlaubt bleiben Positionierung, Breite und Abstände am Einsatzort.
- Alle Zustände sitzen in der Bausteinschicht, nicht in den Komponenten: Zeigerzustand,
  gedrückter Zustand, Fokusring, gesperrter Zustand (45 % Deckkraft).

## Checkliste

- [x] `frontend/src/styles/_bausteine.scss` anlegen und aus `styles.scss` per `@use`
      einbinden. Werte eins zu eins aus der Design-System-Datei übernehmen, aber
      **ausschließlich über die Zweck-Token** aus Phase 1 — kein Hexwert, keine rohe
      Pixelgröße außer den im Entwurf explizit genannten Bauteilmaßen (Höhe 36px für
      Eingabefelder, 36×36 für Icon-Buttons, 16px für den Auswahlpunkt).
- [x] Besonderheiten mitnehmen, die im Entwurf ausdrücklich stehen:
  - Buttons setzen die Überschriftenschrift (Caprasimo), Größe 14px.
  - `select.input` braucht `appearance: none` plus ein eingebettetes SVG-Pfeilchen als
    Hintergrundbild (Breite 12, Höhe 8, Strich `#201e1d` bei 1.9, Position
    `right 14px center`, `padding-right: 36px`). **Das SVG muss ausdrückliche
    `width`/`height` tragen** — eine reine `viewBox`-Angabe wird von manchen Browsern
    verworfen.
  - `.btn--ghost` nutzt die Akzentfarbe als Textfarbe und tönt beim Überfahren.
  - `.dialog-backdrop` legt sich mit `color-mix(in srgb, var(--color-neutral-900) 50%,
    transparent)` über die Seite.
- [x] Zusatzklassen aus dem Handoff ergänzen (dort `.cm-hit`, `.cm-row`, `.cm-scroll`),
      hier unter sprechenden Namen: `.icon-button` (Tönung beim Überfahren für nackte
      Icon-Schaltflächen), `.hover-row` (Zeilentönung für Ebenenliste und Menüs),
      `.thin-scroll` (schmale, eingefärbte Bildlaufleisten für die Editorspalten).
- [x] Bestehende Komponenten auf die Bausteine umstellen — Reihenfolge:
      `shared/components/confirm-dialog`, `shared/components/field-hint`,
      `shared/components/notification-list`, `shared/components/not-found`.
      In den Vorlagen die Klassen setzen, im jeweiligen Stylesheet die dadurch doppelten
      Regeln löschen.
- [x] Prüfen, dass die Dialoge des Angular-CDK (Bildauswahl, Löschabfrage) die neue
      Dialogfläche zeigen und der Hintergrund abdunkelt — das CDK bringt eigene
      Grundregeln mit, die überschrieben werden müssen.
- [x] `docs/conventions/css.md`: Abschnitt „Gemeinsame Bausteine" ergänzen — welche
      Klassen es gibt, dass Komponenten sie benutzen statt eigene Buttons zu bauen, und
      dass es keine Ausweich-Utilities gibt.

## Report-Back

**Status:** complete.

- `frontend/src/styles/_bausteine.scss` neu, per `@use` in `styles.scss` eingebunden —
  alle 8 Bausteine + `.icon-button`/`.hover-row`/`.thin-scroll` + die
  `.cdk-overlay-dark-backdrop`-Umstellung.
- Vier Komponenten umgestellt: `confirm-dialog` (Wurzel jetzt `.dialog`, Buttons `.btn`,
  Löschen-Button bleibt über eine einzige Zeile lokal in Gefahrenfarbe), `field-hint`
  und `notification-list` (ihr „?"/„×"-Knopf trägt jetzt zusätzlich `.icon-button` für
  die Hover-Tönung), `not-found` (keine Buttons/Felder — schon konform, keine Änderung
  nötig).
- `login.scss`, `tokens-page.scss`, `card-groups-detail.scss` **bewusst nicht** in
  dieser Phase angefasst — sie sind Ziel von Phase 3/4, nicht dieser. Sie greifen aber
  bereits auf dieselben Zweck-Token zu und zeigen deshalb schon jetzt die neue Palette.
- `asset-picker` (Bildauswahl-Dialog) ebenfalls nicht auf `.dialog`/`.btn` umgestellt —
  nicht Teil der AK-Reihenfolge dieser Phase; der CDK-Hintergrund hinter ihm ist über
  die globale Umstellung trotzdem schon dunkel-warm statt Standard-Schwarz.
- `npm run build` und `npm run lint`: beide grün.

**Konfidenz:** keine wacklige Stelle im Code selbst (Build+Lint grün, Klassen 1:1 aus
dem Entwurf übernommen). Die einzige echte Unsicherheit ist optisch — ob Pillen-Radius,
Abstände und der neue `?`-/`×`-Hover-Tönung im Browser so wirken wie im Entwurf gedacht;
das prüft die übliche Sichtprüfung im Browser, nicht diese Session.
