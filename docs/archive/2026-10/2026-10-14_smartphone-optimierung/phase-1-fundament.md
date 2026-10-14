# Phase 1 — Fundament

**Tier:** standard
**Status:** complete

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Begriffe" und „Kontrakt"
- `docs/conventions/css.md` (BEM, nur Zweck-Token, Bausteine in `_bausteine.scss`, kein Utility-CSS)
- `frontend/src/styles.scss` (`:root`-Token, `--touch-target-min`)
- `frontend/src/styles/_bausteine.scss` (alle Bausteinklassen)
- `frontend/angular.json` → `projects.*.architect.build.options`
- `frontend/src/index.html` (Viewport-Meta)
- `frontend/src/app/app.config.ts` (Provider-Liste)
- Die drei bestehenden Media-Queries: `layout/shell/shell.scss` (`max-width: 900px`), `features/cards/card-editor/card-editor.scss` (`max-width: 900px`), `features/templates/template-editor/template-editor.scss` (zweimal `max-width: 999px`, einmal kombiniert mit `prefers-reduced-motion`)

## AK der Phase

1. `frontend/src/styles/_breakpoints.scss` existiert mit den vier Mixins `phone`, `narrow`, `editor-narrow`, `touch`; eine Komponente kann sie per `@use 'breakpoints' as bp;` einbinden und `ng build` findet die Datei.
2. Die drei bestehenden Media-Queries benutzen die Mixins; ihre Grenzwerte sind unverändert (900 px bzw. 999 px). Desktop und Tablet sehen exakt aus wie vorher.
3. Auf einem Touch-Gerät (Chrome-Gerätemodus mit Touch) sind `.btn`, `.input`, `select.input`, `.seg__option`, `.radio` und `button.tag` mindestens 44 px hoch, `.btn--icon` 44 × 44 px; Eingabefelder haben 16 px Schrift.
4. `.icon-button` hat auf Touch-Geräten eine unsichtbar vergrößerte Tippfläche von 44 × 44 px, ohne dass sich das Aussehen ändert.
5. Eine `<table class="table table--stack">` mit `data-label` an den Zellen erscheint auf Smartphone-Breite als Stapel: Kopfzeile unsichtbar (aber vorlesbar), jede Zeile ein Block, jede Zelle „Beschriftung links, Wert rechts".
6. `.menu`/`.menu__item` sind als Baustein vorhanden (Phase 3 und 6 benutzen sie).
7. Alle CDK-Dialoge sind auf Smartphone-Breite höchstens `100vw - 1rem` breit statt CDK-üblich `80vw`; alle übrigen CDK-Vorgaben (Hintergrund, Fokus) verhalten sich wie vorher.
8. `.dialog__actions` stapelt die Knöpfe auf Smartphone-Breite in voller Breite, Hauptaktion oben.
9. ADR-028 ist angelegt.

## Checkliste

### Breakpoints

- [x] `frontend/src/styles/_breakpoints.scss` anlegen:

```scss
// Die einzige Stelle mit Breakpoint-Zahlen (ADR-028). Komponenten binden ein mit
// `@use 'breakpoints' as bp;` und schreiben `@include bp.phone { … }`.
// TypeScript fragt nur den Zeiger ab: shared/services/pointer.ts.

$phone-max: 600px;
$narrow-max: 900px;
$editor-narrow-max: 999px;

@mixin phone {
  @media (max-width: $phone-max) {
    @content;
  }
}

@mixin narrow {
  @media (max-width: $narrow-max) {
    @content;
  }
}

@mixin editor-narrow {
  @media (max-width: $editor-narrow-max) {
    @content;
  }
}

@mixin touch {
  @media (pointer: coarse) {
    @content;
  }
}
```

- [x] `frontend/angular.json`: unter `projects.<app>.architect.build.options` ergänzen: `"stylePreprocessorOptions": { "includePaths": ["src/styles"] }`. `styles.scss` bindet weiterhin `@use 'styles/bausteine'` ein — **nicht** umschreiben, der relative Pfad bleibt gültig.
- [x] `shell.scss`: `@use 'breakpoints' as bp;` als erste Zeile; `@media (max-width: 900px) {` → `@include bp.narrow {`.
- [x] `card-editor.scss`: ebenso, `@media (max-width: 900px)` → `@include bp.narrow`.
- [x] `template-editor.scss`: ebenso, `@media (max-width: 999px)` → `@include bp.editor-narrow`. Die kombinierte Abfrage wird zu verschachtelten Blöcken:

```scss
@include bp.editor-narrow {
  @media (prefers-reduced-motion: no-preference) {
    .template-editor__panel {
      transition: transform 160ms ease;
    }
  }
}
```

### Token und Viewport

- [x] `styles.scss` im SEMANTIC-Block direkt unter `--touch-target-min` ergänzen:

```scss
  /* SEMANTIC — Smartphone: feste Leisten am unteren Rand (ADR-028) */
  --shell-tabbar-height: 3.75rem;
  --editor-toolbar-height: 3.5rem;
```

- [x] `index.html`: Viewport-Meta wird `width=device-width, initial-scale=1, viewport-fit=cover` — erst damit liefert `env(safe-area-inset-bottom)` auf iPhones einen Wert (Phase 2 und 6 brauchen ihn).

### Touch-Größen in `_bausteine.scss`

- [x] Oben `@use 'breakpoints' as bp;` ergänzen.
- [x] Am Dateiende einen Block anfügen (Kommentar übernehmen — die 16 px sind ein Grenzwert, keine Geschmacksfrage):

```scss
// — Touch-Geräte (ADR-028) —
// Tippflächen nach --touch-target-min (44px). Eingabefelder mit 16px Schrift: darunter
// zoomt iOS Safari beim Antippen die ganze Seite heran und zoomt nicht zurück.
@include bp.touch {
  .btn,
  .seg__option,
  .radio,
  button.tag {
    min-block-size: var(--touch-target-min);
  }

  .btn--icon {
    inline-size: var(--touch-target-min);
    block-size: var(--touch-target-min);
  }

  .input {
    min-block-size: var(--touch-target-min);
    font-size: 16px;
  }

  // Nackte Icon-Schaltflächen behalten ihr Aussehen; nur die Tippfläche wächst unsichtbar.
  .icon-button {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      inline-size: var(--touch-target-min);
      block-size: var(--touch-target-min);
      translate: -50% -50%;
    }
  }
}
```

- [x] Vorher prüfen (Grep über `frontend/src/app`, Muster `icon-button`): keine der Verwendungsstellen setzt im eigenen Stylesheet ein `::before` auf dasselbe Element. Stand beim Planen: 7 Vorlagen (`asset-library`, `print-project-page`, `cards-list`, `font-manager`, `layer-list`, `notification-list`, `field-hint`). Hat eine davon `::before` → Fund in `FINDINGS.md`, dort `::after` statt `::before` verwenden.

### Gestapelte Tabelle

- [x] In `_bausteine.scss` nach dem `.table`-Block:

```scss
// Tabelle als Stapel auf Smartphone-Breite: jede Zeile ein Block, jede Zelle zeigt ihre
// Spaltenbeschriftung aus data-label davor. Die Kopfzeile bleibt für Screenreader da.
.table--stack {
  @include bp.phone {
    thead {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    tr {
      display: block;
      padding-block: var(--space-sm);
      border-bottom: 1px solid var(--color-divider);
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-sm);
      padding: var(--space-xs) 0;
      border-bottom: 0;
    }

    td[data-label]::before {
      content: attr(data-label);
      color: var(--color-text-muted);
    }

    tbody tr:hover {
      background: transparent;
    }
  }
}
```

### Menü-Baustein

- [x] In `_bausteine.scss` nach dem Dialog-Block:

```scss
// — Aufklappmenü (@angular/cdk/menu: cdkMenu / cdkMenuItem) —
.menu {
  display: flex;
  flex-direction: column;
  min-inline-size: 12rem;
  padding: var(--space-xs);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.menu__item {
  appearance: none;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-block-size: var(--touch-target-min);
  padding-inline: var(--space-md);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--font-size-md);
  text-align: start;
  cursor: pointer;

  &:hover:not(:disabled),
  &:focus-visible {
    background: color-mix(in srgb, var(--color-text-primary) 7%, transparent);
    outline: none;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &--danger {
    color: var(--color-accent-text);
  }
}
```

- [x] `styles.scss`: `@import '@angular/cdk/overlay-prebuilt.css';` ist für CDK-Menüs nötig — prüfen (Grep `overlay-prebuilt` in `frontend/src` und `angular.json`), ob er schon eingebunden ist (die CDK-Dialoge brauchen ihn auch). Ist er da → nichts tun.

### Dialoge

- [x] `app.config.ts`: Provider ergänzen (Imports aus `@angular/cdk/dialog`):

```ts
// Die CDK-Vorgabe 80vw ließe auf dem Smartphone links und rechts je 36px ungenutzt.
// Ausbreiten statt nur maxWidth übergeben: ein eigener DEFAULT_DIALOG_CONFIG ersetzt die
// Vorgaben komplett (dialog.mjs: `this._defaultOptions || new DialogConfig()`).
{ provide: DEFAULT_DIALOG_CONFIG, useValue: { ...new DialogConfig(), maxWidth: 'calc(100vw - 1rem)' } },
```

- [x] `_bausteine.scss`, im Dialog-Abschnitt:

```scss
@include bp.phone {
  .dialog-backdrop {
    padding: var(--space-sm);
  }

  .dialog {
    padding: var(--space-md);
    max-block-size: calc(100dvh - 2 * var(--space-sm));
    overflow-y: auto;
  }

  .dialog__actions {
    flex-direction: column-reverse;

    .btn {
      inline-size: 100%;
    }
  }
}
```

### Hilfsfunktion für TypeScript

- [x] `frontend/src/app/shared/services/pointer.ts` anlegen:

```ts
/**
 * Ob das Gerät mit grobem Zeiger (Finger) bedient wird — dieselbe Abfrage wie das
 * Mixin `bp.touch` in `styles/_breakpoints.scss` (ADR-028). Einmal je Aufruf gelesen, kein
 * Signal: ein Gerät wechselt seinen Zeiger nicht während der Bearbeitung.
 */
export function isCoarsePointer(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
}
```

### ADR

- [x] `docs/decisions/028-smartphone-bedienung.md` (10–15 Zeilen): Kontext (kein Smartphone-Entwurf im Handoff, bisher drei verstreute Media-Queries), Optionen (a) nur Touch-Abfrage, (b) nur Breite, (c) Breite für die Anordnung + `pointer: coarse` für Tippflächen; Entscheidung (c) mit den Werten 600/900/999 px und 44 px Tippfläche, 16 px Eingabeschrift; Muster: Tab-Leiste unten, Aktionsmenü statt Icon-Reihe, Reiter statt Nebeneinander, Blätter statt Seitenspalten, zwei Finger für die Bühne; Konsequenz: neue Breakpoints nur in `_breakpoints.scss`.

## Report-Back
