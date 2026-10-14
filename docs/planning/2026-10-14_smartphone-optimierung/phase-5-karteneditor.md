# Phase 5 — Karteneditor

**Tier:** standard

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Begriffe", „Kontrakt", „Konfidenz-Ausweis" (feste Aktionsleiste)
- `docs/decisions/028-smartphone-bedienung.md`
- `frontend/src/app/features/cards/card-editor/card-editor.html`, `.scss`, `.ts`
- `frontend/src/app/features/cards/card-editor/image-drop/image-drop.html`, `.scss`
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` (Abschnitt `ResizeObserver` im Konstruktor)
- `frontend/src/styles/_bausteine.scss` → `.seg`, `.seg__option[aria-selected]` (Reiterreihe)
- Phase 2: `.shell__content` hat auf Smartphone-Breite `overflow: visible`, Token `--shell-tabbar-height`

## AK der Phase

1. Auf Smartphone-Breite steht unter der Überschrift eine Reiterreihe „Formular | Vorschau" (`.seg`, volle Breite, Reiter je halbe Breite). Beim Öffnen ist „Formular" aktiv. Oberhalb 600 px ist die Reiterreihe unsichtbar und beides steht wie bisher.
2. Reiter „Formular": alle Formularfelder, keine Vorschau. Reiter „Vorschau": die Karte in voller Breite, darunter (falls eine Bildfläche aktiv ist) die Bild-Steuerung mit Zoom-Regler, darunter „Als Bild herunterladen" mit Hinweis-Fragezeichen.
3. In beiden Reitern klebt die Aktionsleiste mit **Abbrechen** und **Karte speichern** (je halbe Breite) am unteren Rand direkt über der Tab-Leiste, mit Fläche in Grundfarbe und Trennlinie oben; beim Scrollen bleibt sie sichtbar und verdeckt kein Eingabefeld dauerhaft (der Inhalt läuft darunter durch und lässt sich bis über sie scrollen).
4. „Als Bild herunterladen" steht auf Smartphone-Breite **nicht** in der Aktionsleiste, sondern nur im Vorschau-Reiter; oberhalb 600 px genau wie bisher in der Aktionsleiste (und nicht doppelt).
5. Nach Vorschau → Formular → Vorschau erscheint die Karte wieder vollständig gezeichnet (nicht leer).
6. Ist eine Bildfläche aktiv, verschiebt ein Finger auf der Karte das Motiv, ohne dass die Seite mitscrollt. Ist keine aktiv, scrollt ein Wisch über die Karte die Seite.
7. Auf Touch-Geräten: Farbfeld-Knöpfe (`__swatch`) 44 × 44 px; das Bild-Ablagefeld zeigt „Bild wählen" statt „Bild ablegen".
8. Oberhalb 600 px sieht der Karteneditor aus wie vorher.

## Checkliste

### Zustand

- [x] `card-editor.ts`: `protected readonly mobilePane = signal<'form' | 'preview'>('form');` — rein darstellerisch, keine Auswirkung auf Speichern/Formular.

### Vorlage `card-editor.html`

- [x] Direkt vor `<div class="card-editor__layout">` einfügen:

```html
<div class="seg card-editor__panes" role="tablist" aria-label="Ansicht">
  <button
    type="button"
    role="tab"
    class="seg__option"
    [attr.aria-selected]="mobilePane() === 'form'"
    (click)="mobilePane.set('form')"
  >
    Formular
  </button>
  <button
    type="button"
    role="tab"
    class="seg__option"
    [attr.aria-selected]="mobilePane() === 'preview'"
    (click)="mobilePane.set('preview')"
  >
    Vorschau
  </button>
</div>
```

- [x] `<div class="card-editor__layout">` bekommt `[class.card-editor__layout--preview]="mobilePane() === 'preview'"`.
- [x] In `.card-editor__actions` den bestehenden `<div class="card-editor__label-row">` mit dem Herunterladen-Knopf zusätzlich mit der Klasse `card-editor__download--in-actions` versehen.
- [x] Am Ende von `<aside class="card-editor__preview">` (nach dem `@if (activePlacement(); …)`-Block) eine Kopie einfügen, nur für Smartphone-Breite:

```html
<div class="card-editor__label-row card-editor__download--in-preview">
  <button
    type="button"
    class="btn btn--secondary"
    [disabled]="downloadingImage()"
    (click)="downloadImage()"
  >
    {{ downloadingImage() ? 'Wird erzeugt …' : 'Als Bild herunterladen' }}
  </button>
  <app-field-hint [text]="downloadHint" />
</div>
```

- [x] `.card-editor__preview-frame` bekommt `[class.card-editor__preview-frame--editing]="activeImageLayerId() !== null"`.

### Stylesheet `card-editor.scss`

- [x] `@use 'breakpoints' as bp;` steht seit Phase 1. Ergänzen:
  - Standard (außerhalb Media): `.card-editor__panes { display: none; }` · `.card-editor__download--in-preview { display: none; }`
  - `@include bp.touch { .card-editor__swatch { inline-size: var(--touch-target-min); block-size: var(--touch-target-min); } .card-editor__preview-frame--editing { touch-action: none; } }`
  - `@include bp.phone { … }` (nach dem bestehenden `bp.narrow`-Block):

```scss
@include bp.phone {
  .card-editor__panes {
    display: flex;
    margin-block-end: var(--space-lg);

    .seg__option {
      flex: 1;
      justify-content: center;
    }
  }

  // Formular-Reiter: Vorschau weg. Vorschau-Reiter: vom Formular bleibt nur die Aktionsleiste.
  .card-editor__layout:not(.card-editor__layout--preview) .card-editor__preview {
    display: none;
  }

  .card-editor__layout--preview .card-editor__form > :not(.card-editor__actions) {
    display: none;
  }

  .card-editor__download--in-actions {
    display: none;
  }

  .card-editor__download--in-preview {
    display: flex;
  }

  // Klebt über der Tab-Leiste der Shell (Phase 2); `sticky` wirkt nur, weil
  // .shell__content auf Smartphone-Breite kein eigener Bildlaufkasten mehr ist.
  .card-editor__actions {
    position: sticky;
    inset-block-end: calc(var(--shell-tabbar-height) + env(safe-area-inset-bottom));
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-inline: calc(-1 * var(--space-lg));
    padding: var(--space-sm) var(--space-lg);
    border-top: 1px solid var(--color-divider);
    background: var(--color-bg-base);
  }
}
```

- [x] Prüfen im Gerätemodus: der negative Außenrand der Aktionsleiste gleicht genau den seitlichen Innenabstand von `.shell__content` aus (Phase 2: `--space-lg`) — die Leiste geht von Rand zu Rand, ohne waagrechten Bildlauf.

### Kartenfläche nach dem Wiedereinblenden

- [x] `card-canvas.ts`, im `ResizeObserver`: eine Breite von 0 nicht übernehmen.

```ts
    const sizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);

      // Ausgeblendet (z. B. Reiter „Formular" im Karteneditor) meldet der Kasten 0 —
      // eine Bühne mit Breite 0 bringt Konva beim Zeichnen ins Stolpern. Die letzte echte
      // Breite bleibt stehen, beim Wiedereinblenden kommt sofort die neue.
      if (width > 0) {
        this.stageWidth.set(width);
      }
    });
```

  Chesterton: der Beobachter existiert, damit die Bühne der Breite ihres Kastens folgt (Editor-Bühne, Kartenvorschau). Die Änderung lässt das unberührt; nur der Sonderfall 0 fällt weg. Startwert von `stageWidth` vorher nachlesen — ist er 0, bleibt die Bühne bis zur ersten echten Messung leer wie bisher.

### Bild-Ablagefeld

- [x] `image-drop.html`: `<span class="image-drop__placeholder">Bild ablegen</span>` → zwei Spannen `<span class="image-drop__placeholder image-drop__placeholder--pointer">Bild ablegen</span><span class="image-drop__placeholder image-drop__placeholder--touch">Bild wählen</span>`.
- [x] `image-drop.scss`: `@use 'breakpoints' as bp;`; `.image-drop__placeholder--touch { display: none; }`; `@include bp.touch { .image-drop__placeholder--pointer { display: none; } .image-drop__placeholder--touch { display: inline; } }`. Bestehende Regeln für `.image-drop__placeholder` gelten für beide weiter.

### Doc

- [x] `docs/code-map.md` → `card-editor/`: Satz ergänzen „Auf Smartphone-Breite Reiter Formular/Vorschau und eine am unteren Rand klebende Aktionsleiste".

## Report-Back

Umgesetzt wie geplant. Lint und Produktions-Build grün. Smoke (Gerätemodus, echtes Telefon) steht am Plan-Ende aus.
