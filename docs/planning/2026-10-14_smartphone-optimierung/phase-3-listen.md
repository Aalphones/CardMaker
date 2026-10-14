# Phase 3 — Alle Karten, Templates, Kartengruppen

**Tier:** standard

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Begriffe", „Kontrakt"
- `docs/decisions/028-smartphone-bedienung.md`
- `frontend/src/styles/_bausteine.scss` → `.table--stack`, `.menu`, `.menu__item`, Touch-Block (aus Phase 1)
- `frontend/src/app/features/cards/cards-list/` (`.html`, `.scss`, `.ts`)
- `frontend/src/app/features/templates/templates-list/` (`.html`, `.scss`)
- `frontend/src/app/features/card-groups/card-groups-list/` und `card-groups-detail/` (`.html`, `.scss`)
- `@angular/cdk/menu`: `CdkMenuTrigger` (`[cdkMenuTriggerFor]`), `CdkMenu` (`cdkMenu`), `CdkMenuItem` (`cdkMenuItem`, Ausgabe `(cdkMenuItemTriggered)`)

## AK der Phase

1. **Alle Karten, Smartphone-Breite:** Überschrift und Knöpfe („Als Tabelle"/„Als Raster", „Neue Karte") umbrechen untereinander; die Knöpfe stehen nebeneinander und teilen sich die Breite.
2. Die drei Filter (Suchen, Template, Sortierung) stehen untereinander in voller Breite; die Gruppen-Chips scrollen waagrecht in einer Zeile statt mehrzeilig umzubrechen, und jeder Chip ist auf Touch-Geräten ≥ 44 px hoch.
3. Das Raster zeigt zwei Spalten (Abstand `--space-sm`).
4. Statt der vier Icon-Knöpfe trägt jede Kachel auf Smartphone-Breite **einen** Knopf „⋯" (Tippfläche 44 px, `aria-label="Aktionen für <Kartenname>"`), der ein Menü öffnet: „Zum Druckprojekt hinzufügen" bzw. der Text aus `printLabel(item)` (gesperrt wie bisher bei Höchstmenge), „Duplizieren", „Als Bild herunterladen" (gesperrt während des Herunterladens, Text dann „Wird erzeugt …"), „Löschen" (Variante `--danger`). Jeder Eintrag ruft dieselbe Methode wie der bisherige Icon-Knopf.
5. Oberhalb 600 px bleiben die vier Icon-Knöpfe, das Menü ist dort nicht sichtbar.
6. Die Tabellenansicht wird auf Smartphone-Breite gestapelt (`.table--stack`); Beschriftungen „Kartengruppe", „Template", „Geändert"; der Kartenname steht ohne Beschriftung als erste Zeile; die vier Aktionsknöpfe umbrechen.
7. **Templates, Smartphone-Breite:** zwei Spalten; Suchfeld in voller Breite; Kopfzeile umbricht wie bei Alle Karten.
8. **Kartengruppen-Liste, Smartphone-Breite:** eine Spalte; Suchfeld in voller Breite; Kopfzeile umbricht.
9. **Kartengruppen-Formular, Smartphone-Breite:** Aktionsknöpfe untereinander in voller Breite, Hauptaktion (Speichern) oben.
10. Oberhalb 600 px sehen alle drei Bildschirme aus wie vorher.

## Checkliste

### Alle Karten

- [ ] `cards-list.ts`: `CdkMenuTrigger, CdkMenu, CdkMenuItem` aus `@angular/cdk/menu` in `imports` aufnehmen.
- [ ] `cards-list.html`, in `.cards-list__card-footer`: die vier bestehenden Knöpfe in `<div class="cards-list__card-actions">…</div>` einschließen (unverändert). Daneben einfügen:

```html
<button
  type="button"
  class="icon-button cards-list__icon-btn cards-list__menu-trigger"
  [cdkMenuTriggerFor]="cardMenu"
  [attr.aria-label]="'Aktionen für ' + item.name"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" />
  </svg>
</button>
<ng-template #cardMenu>
  <div class="menu" cdkMenu>
    <button type="button" class="menu__item" cdkMenuItem
      [disabled]="printQuantity(item) >= printMaxQuantity" (cdkMenuItemTriggered)="addToPrint(item)">
      {{ printLabel(item) }}
    </button>
    <button type="button" class="menu__item" cdkMenuItem (cdkMenuItemTriggered)="duplicate(item)">
      Duplizieren
    </button>
    <button type="button" class="menu__item" cdkMenuItem
      [disabled]="isDownloading(item)" (cdkMenuItemTriggered)="download(item)">
      {{ isDownloading(item) ? 'Wird erzeugt …' : 'Als Bild herunterladen' }}
    </button>
    <button type="button" class="menu__item menu__item--danger" cdkMenuItem (cdkMenuItemTriggered)="remove(item)">
      Löschen
    </button>
  </div>
</ng-template>
```

  (Prettier formatiert die Attribute danach auf eigene Zeilen — `npm run lint` bzw. das Pre-Commit-Format laufen lassen.)
- [ ] Tabelle: `<table class="table">` → `<table class="table table--stack">`; `data-label` an die `<td>`: Kartengruppe → `data-label="Kartengruppe"`, Template → `data-label="Template"`, Geändert → `data-label="Geändert"`. Name- und Aktionen-Zelle **ohne** `data-label`.
- [ ] `cards-list.scss`: `@use 'breakpoints' as bp;` und:
  - `&__menu-trigger { display: none; }`, `&__card-actions { display: flex; gap: var(--space-xs); }`
  - `@include bp.phone { … }` innerhalb `.cards-list`:
    - `&__heading { flex-wrap: wrap; }` · `&__heading-actions { inline-size: 100%; } &__heading-actions > * { flex: 1; }`
    - `&__filters { flex-direction: column; align-items: stretch; }` · `&__filter-search, &__filter-template, &__filter-sort { width: 100%; }`
    - `&__chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding-block-end: 2px; }` · `&__chip { flex: none; }`
    - `&__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-sm); }`
    - `&__card-actions { display: none; }` · `&__menu-trigger { display: inline-flex; }`
    - `&__table-actions { justify-content: flex-start; flex-wrap: wrap; }`
  - `@include bp.touch { &__chip { min-block-size: var(--touch-target-min); } }`

### Templates

- [ ] `templates-list.scss`: `@use 'breakpoints' as bp;` und in `.templates-list`:

```scss
  @include bp.phone {
    &__heading {
      flex-wrap: wrap;
    }

    &__search {
      max-width: none;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-sm);
    }
  }
```

### Kartengruppen

- [ ] `card-groups-list.scss`: analog — `&__heading { flex-wrap: wrap; }`, `&__search { max-width: none; }`, `&__grid { grid-template-columns: 1fr; gap: var(--space-md); }`.
- [ ] `card-groups-detail.scss`: `@include bp.phone { &__actions { flex-direction: column-reverse; } &__actions > * { inline-size: 100%; } }`. Vorher in `card-groups-detail.html` nachsehen, dass „Speichern" der **letzte** Knopf in `__actions` ist (dann landet er per `column-reverse` oben). Ist es anders → Reihenfolge so wählen, dass Speichern oben steht, und im Report-Back notieren.

### Doc

- [ ] `docs/code-map.md` → `cards-list/`: Satz ergänzen „Auf Smartphone-Breite zwei Spalten, die Kachel-Aktionen in einem Menü (`@angular/cdk/menu`), die Tabelle gestapelt".

## Report-Back
