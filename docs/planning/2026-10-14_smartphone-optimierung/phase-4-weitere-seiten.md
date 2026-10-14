# Phase 4 — Bildvorrat, Zugriffstoken, Bild-Prompts, Anmeldung, Druckprojekt

**Tier:** standard

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Begriffe", „Kontrakt"
- `docs/decisions/028-smartphone-bedienung.md`
- `frontend/src/styles/_breakpoints.scss`, `_bausteine.scss` (Touch-Block, `.table--stack`)
- `frontend/src/app/features/assets/asset-library/` (`.html`, `.scss`)
- `frontend/src/app/features/auth/tokens/tokens-page/` (`.html`, `.scss`)
- `frontend/src/app/features/prompts/prompts-page/prompts-page.scss`
- `frontend/src/app/features/auth/login/login.scss`
- `frontend/src/app/features/print-project/print-project-page/` (`.html`, `.scss`), `print-sheet/print-sheet.scss`
- `frontend/src/app/shared/services/print-blob.ts`, `shared/services/pointer.ts` (aus Phase 1)

## AK der Phase

1. **Bildvorrat:** Die Liste hat auf Smartphone-Breite keine eigene Bildlaufleiste mehr (kein Kasten im Kasten), die Seite scrollt als Ganzes. Auf Touch-Geräten lautet der Text im Ablagefeld „PNG-Dateien auswählen (mehrere möglich)" und sieht aus wie ein Knopf (Pille mit Rahmen, ≥ 44 px hoch); auf Geräten mit Maus bleibt der bisherige Text. Während des Hochladens steht in beiden Fällen der Fortschrittstext.
2. **Zugriffstoken:** Namensfeld und „Anlegen" stehen auf Smartphone-Breite untereinander, „Anlegen" in voller Breite. Die Tabelle ist gestapelt (Beschriftungen „Angelegt", „Zuletzt verwendet"). Der angezeigte neue Token bricht um statt die Seite zu verbreitern (ist schon `word-break: break-all` — prüfen).
3. **Bild-Prompts:** Die drei Reiter passen in eine Zeile bei 360 px; der Prompt-Block ist auf Smartphone-Breite höchstens 60 % der Fensterhöhe hoch (`60dvh`) statt `24rem`.
4. **Anmeldung:** Auf Smartphone-Breite Außenabstand `--space-md`, Karte mit Innenabstand `--space-6` / `--space-lg`; nichts ragt über den Rand.
5. **Druckprojekt, schmal (≤ 900 px):** Positionsliste/Optionen und Bogen-Vorschau stehen untereinander statt nebeneinander. Smartphone-Breite: die beiden Export-Knöpfe stehen nebeneinander und teilen sich die Breite; die Plus/Minus-Knöpfe des Anzahl-Steppers sind auf Touch-Geräten 44 × 44 px.
6. **PDF auf Touch-Geräten:** „PDF" lädt die Datei direkt herunter, statt den Druckdialog über einen unsichtbaren Rahmen zu versuchen (mobile Browser zeigen PDFs in Rahmen nicht an — der Dialog bliebe leer).
7. Oberhalb 900 px sehen alle fünf Bildschirme aus wie vorher.

## Checkliste

### Bildvorrat

- [ ] `asset-library.html`, im `@else`-Zweig des Ablage-Labels den einen Text durch zwei Spannen ersetzen:

```html
<span class="asset-library__dropzone-text asset-library__dropzone-text--pointer">
  PNG-Dateien hierher ziehen oder auswählen (mehrere möglich)
</span>
<span class="asset-library__dropzone-text asset-library__dropzone-text--touch">
  PNG-Dateien auswählen (mehrere möglich)
</span>
```

- [ ] `asset-library.scss`: `@use 'breakpoints' as bp;`; `&__dropzone-text--touch { display: none; }`;

```scss
  @include bp.touch {
    &__dropzone-text--pointer {
      display: none;
    }

    &__dropzone-text--touch {
      display: inline;
    }

    &__dropzone-label {
      display: inline-flex;
      align-items: center;
      min-block-size: var(--touch-target-min);
      padding-inline: var(--space-md);
      border: 1px solid var(--color-divider);
      border-radius: var(--radius-pill);
      color: var(--color-text-primary);
    }
  }

  @include bp.phone {
    &__list {
      max-height: none;
      overflow-y: visible;
    }

    &__name-input {
      max-width: none;
    }
  }
```

### Zugriffstoken

- [ ] `tokens-page.html`: `<table class="table">` → `class="table table--stack"`; `data-label="Angelegt"` und `data-label="Zuletzt verwendet"` an die zweite und dritte `<td>`; Name- und Löschen-Zelle ohne.
- [ ] `tokens-page.scss`: `@use 'breakpoints' as bp;` und `@include bp.phone { &__form { flex-direction: column; align-items: stretch; } &__reveal-actions { flex-wrap: wrap; } }` innerhalb `.tokens`.

### Bild-Prompts

- [ ] `prompts-page.scss`: `@include bp.phone { &__code { max-height: 60dvh; } &__tabs { align-self: stretch; } }` innerhalb `.prompts`. Bei 360 px im Gerätemodus prüfen, dass die Reiter „Rahmen / Icons / Artwork" in eine Zeile passen; tun sie es nicht → `.seg__option` dort `flex: 1; justify-content: center;` und Fund im Report-Back.

### Anmeldung

- [ ] `login.scss`: `@use 'breakpoints' as bp;` und

```scss
@include bp.phone {
  .login {
    padding: var(--space-md);
  }

  .login__card {
    padding: var(--space-6) var(--space-lg);
  }
}
```

### Druckprojekt

- [ ] `print-project-page.scss`: `@use 'breakpoints' as bp;` und innerhalb `.print-project`:

```scss
  @include bp.narrow {
    &__layout {
      grid-template-columns: 1fr;
    }
  }

  @include bp.phone {
    &__heading-actions {
      inline-size: 100%;

      > .btn {
        flex: 1;
      }
    }
  }

  @include bp.touch {
    &__stepper-btn {
      width: var(--touch-target-min);
      height: var(--touch-target-min);
    }
  }
```

- [ ] `print-blob.ts`: in `printsPdfInFrame()` vor dem Browser-Check `if (isCoarsePointer()) { return false; }` (Import aus `./pointer`). Kommentar über der Funktion um einen Satz ergänzen: „Auf Touch-Geräten ebenso: mobile Browser zeigen ein PDF im Rahmen gar nicht an, der Druckdialog bliebe leer."

## Report-Back
