# Phase 6 — Template-Editor: Anordnung

**Tier:** standard

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Begriffe", „Kontrakt"
- `docs/decisions/028-smartphone-bedienung.md`
- `frontend/src/app/features/templates/template-editor/template-editor.html`, `.scss`, `.ts` (Methoden `toggleLayersPanel`, `togglePropertiesPanel`, `createCard`, `save`; Signale `layersPanelOpen`, `propertiesPanelOpen`)
- `frontend/src/app/signal-stores/template-editor.ts` (`zoom`, `fitView`, `undo`, `redo`, `canUndo`, `canRedo`)
- `.../template-editor/stage-controls/stage-controls.html`, `.scss`
- `.../template-editor/layer-list/layer-list.scss`, `.../add-layer-menu/add-layer-menu.scss` (`&__item`)
- `.../template-editor/asset-picker/asset-picker.scss`, `.../font-manager/font-manager.scss`
- `frontend/src/styles/_bausteine.scss` → `.menu`, `.menu__item`

## AK der Phase

1. **Kopfzeile, Smartphone-Breite:** von links „←" (nur Icon, `aria-label="Zurück zu den Templates"`), Namensfeld (füllt den Rest), „Speichern", „⋯" (Menü mit dem einen Eintrag „Karte erstellen"). Rückgängig, Wiederherstellen, „Nicht gespeichert" und „Karte erstellen" stehen dort nicht. Eine Fehlermeldung erscheint als Streifen direkt unter der Kopfzeile in voller Breite.
2. **Werkzeugleiste unten, Smartphone-Breite:** fünf gleich breite Knöpfe — **Ebenen**, **Rückgängig**, **Wiederherstellen**, **Einpassen** (Beschriftung = aktueller Maßstab in Prozent), **Eigenschaften**; je Icon über Beschriftung, Höhe `--editor-toolbar-height` plus sicherer Bereich. Rückgängig/Wiederherstellen gesperrt wie in der Kopfzeile. Ebenen/Eigenschaften tragen `aria-expanded` und sind im geöffneten Zustand akzentgefärbt.
3. **Spalten als Blätter, Smartphone-Breite:** Ebenen und Eigenschaften fahren von unten herein (55 % der Fensterhöhe, volle Breite, obere Ecken gerundet), enden oberhalb der Werkzeugleiste und lassen die obere Hälfte der Bühne frei.
4. Es ist immer höchstens eine Spalte offen: Öffnen der einen schließt die andere (gilt auf allen Breiten ≤ 999 px; oberhalb stehen beide ohnehin fest).
5. Auf Smartphone-Breite sind die beiden Griffe auf der Bühne („Ebenen"/„Eigenschaften") und die Maßstab-Pille ausgeblendet (die Werkzeugleiste ersetzt sie).
6. Auf Touch-Geräten (jede Breite) sind der „?"-Knopf (Tastenkürzel) und die Zeigerpositions-Pille ausgeblendet.
7. Auf Touch-Geräten sind Ebenenzeilen, der Sichtbarkeits-Knopf je Ebene und die Einträge des „Element hinzufügen"-Menüs mindestens 44 px hoch.
8. Bildauswahl- und Schriften-Dialog ragen bei 360 px nicht über den Rand.
9. Zwischen 601 und 999 px bleibt das bisherige Schubladen-Verhalten (seitliche Spalten, Griffe auf der Bühne); oberhalb 999 px unverändert.

## Checkliste

### `template-editor.ts`

- [x] `CdkMenuTrigger, CdkMenu, CdkMenuItem` aus `@angular/cdk/menu` in `imports`.
- [x] `protected readonly zoomPercent = computed(() => Math.round(this.editor.zoom() * 100));` — vorher in `stage-controls.ts` nachsehen, wie dort `zoomPercent` gerechnet wird, und **dieselbe** Rechnung verwenden (gleiche Zahl in Pille und Leiste).
- [x] `toggleLayersPanel()`: nach dem Umschalten `if (this.layersPanelOpen()) { this.propertiesPanelOpen.set(false); }`; `togglePropertiesPanel()` spiegelbildlich.

### `template-editor.html`

- [x] Zurück-Link: Text „Templates" in `<span class="template-editor__back-label">Templates</span>` einschließen; am `<a>` `aria-label="Zurück zu den Templates"` ergänzen.
- [x] Rückgängig- und Wiederherstellen-Knopf der Kopfzeile sowie „Karte erstellen" zusätzlich mit Klasse `template-editor__topbar-wide` versehen; `<span class="template-editor__dirty">` ebenso.
- [x] Nach dem Speichern-Knopf einfügen:

```html
<button
  type="button"
  class="btn btn--secondary btn--icon template-editor__more"
  aria-label="Weitere Aktionen"
  [cdkMenuTriggerFor]="editorMenu"
>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" />
  </svg>
</button>
<ng-template #editorMenu>
  <div class="menu" cdkMenu>
    <button type="button" class="menu__item" cdkMenuItem
      [disabled]="!templates.current()" (cdkMenuItemTriggered)="createCard()">
      Karte erstellen
    </button>
  </div>
</ng-template>
```

- [x] Nach `</div>` von `.template-editor__body` (noch innerhalb des `@else if`-Zweigs) die Werkzeugleiste einfügen: `<nav class="template-editor__toolbar" aria-label="Werkzeuge">` mit fünf `<button type="button" class="template-editor__tool">`:
  1. Ebenen — `aria-controls="template-editor-layers"`, `[attr.aria-expanded]="layersPanelOpen()"`, `[class.template-editor__tool--active]="layersPanelOpen()"`, `(click)="toggleLayersPanel()"`; Icon: die drei Ebenen-Pfade aus der Shell-Navigation (Templates-Icon).
  2. Rückgängig — `[disabled]="!editor.canUndo()"`, `(click)="editor.undo()"`; Icon wie in der Kopfzeile.
  3. Wiederherstellen — `[disabled]="!editor.canRedo()"`, `(click)="editor.redo()"`; Icon wie in der Kopfzeile.
  4. Einpassen — `aria-label="Karte einpassen"`, `(click)="editor.fitView()"`; Icon `<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>`; Beschriftung `{{ zoomPercent() }} %`.
  5. Eigenschaften — wie Ebenen mit `template-editor-properties` / `propertiesPanelOpen()` / `togglePropertiesPanel()`; Icon `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`.
  Jeder Knopf: SVG 20 × 20 (`stroke="currentColor"`, `stroke-width="2.25"`, `fill="none"`, `aria-hidden="true"`) und `<span class="template-editor__tool-label">…</span>`.

### `template-editor.scss`

- [x] Standard: `.template-editor__toolbar { display: none; }` · `.template-editor__more { display: none; }`
- [x] Neuer Block `@include bp.phone { … }` **nach** den bestehenden `bp.editor-narrow`-Blöcken:

```scss
@include bp.phone {
  .template-editor__topbar {
    gap: var(--space-sm);
    padding-inline: var(--space-sm);
  }

  .template-editor__back-label,
  .template-editor__topbar-wide {
    display: none;
  }

  .template-editor__more {
    display: inline-flex;
  }

  .template-editor__name {
    flex: 1;
    min-inline-size: 0;
    inline-size: auto;
  }

  .template-editor__error {
    position: absolute;
    inset-block-start: 56px;
    inset-inline: 0;
    z-index: 4;
    padding: var(--space-xs) var(--space-md);
    background: var(--color-surface);
    border-block-end: 1px solid var(--color-divider);
  }

  .template-editor__handle,
  .template-editor__stage app-stage-controls {
    display: none;
  }

  .template-editor__toolbar {
    display: grid;
    flex: none;
    grid-template-columns: repeat(5, 1fr);
    block-size: calc(var(--editor-toolbar-height) + env(safe-area-inset-bottom));
    padding-block-end: env(safe-area-inset-bottom);
    border-block-start: 1px solid var(--color-divider);
    background: var(--color-surface);
  }

  .template-editor__tool {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 0;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    font-size: 11px;
    cursor: pointer;

    &:disabled {
      opacity: 0.35;
    }

    &--active {
      color: var(--color-accent-text);
    }
  }

  // Blätter statt Schubladen: von unten, über der Werkzeugleiste, obere Bühnenhälfte frei.
  .template-editor__panel {
    inset-block: auto calc(var(--editor-toolbar-height) + env(safe-area-inset-bottom));
    block-size: 55dvh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;

    &--layers,
    &--properties {
      inset-inline: 0;
      inline-size: auto;
      border-inline: 0;
      transform: translateY(100%);
    }

    &--open {
      transform: none;
    }
  }
}
```

- [x] Die Zahl `56px` beim Fehlerstreifen ist die Kopfzeilenhöhe aus dem Entwurf (steht schon zweimal in dieser Datei) — Kommentar am Dateikopf gilt.
- [x] Prüfen, dass `.template-editor` (fest positioniert, Ebene 50) der Bezugskasten der Blätter ist: die Blätter enden sichtbar über der Werkzeugleiste, nicht am Fensterrand.

### Bühnen-Steuerung

- [x] `stage-controls.html`: den „?"-Knopf zusätzlich mit Klasse `stage-controls__button--shortcuts` versehen.
- [x] `stage-controls.scss`: `@use 'breakpoints' as bp;` und `@include bp.touch { .stage-controls__button--shortcuts, .stage-controls__status { display: none; } }`.

### Ebenenliste und Hinzufügen-Menü

- [x] `layer-list.scss`: `@use 'breakpoints' as bp;` und

```scss
@include bp.touch {
  .layer-list__item {
    min-block-size: var(--touch-target-min);
  }

  .layer-list__visibility {
    align-items: center;
    justify-content: center;
    min-inline-size: var(--touch-target-min);
    min-block-size: var(--touch-target-min);
  }
}
```

- [x] `add-layer-menu.scss`: `@include bp.touch { .add-layer-menu__item { min-block-size: var(--touch-target-min); } }`.

### Dialoge

- [x] `asset-picker.scss` und `font-manager.scss`: `max-width: 90vw` → `max-width: 100%` und `max-height: 80vh` → `max-height: 80dvh`. Im Gerätemodus bei 360 px öffnen (Rahmen-Eigenschaft → Bild wählen; Text-Eigenschaft → Schriften verwalten) und prüfen: kein waagrechter Bildlauf.

### Doc

- [x] `docs/code-map.md` → `template-editor/`: den Satz „Unter 1000 px werden beide Spalten zu einklappbaren Schubladen." ergänzen um „; auf Smartphone-Breite fahren sie als Blätter von unten herein, gesteuert über eine Werkzeugleiste am unteren Rand (Ebenen, Rückgängig, Wiederherstellen, Einpassen, Eigenschaften)".

## Report-Back

Alle Punkte umgesetzt; `npm run build` und `npm run lint` grün. Nicht im Browser geprüft: die Blätter über der Werkzeugleiste und die Dialoge bei 360 px (Gerätemodus) — Sichtprüfung steht im Smoke am Plan-Ende. Keine Abweichungen, keine Findings für spätere Phasen.
