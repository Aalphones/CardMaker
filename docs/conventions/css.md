# CSS / Styling Conventions — CardMaker

> Styling-Doktrin: BEM + scoped SCSS, CSS Custom Properties als Design-Tokens — **kein**
> Utility-Framework, kein Tailwind. Bewusste Entscheidung für CardMaker, siehe
> [ADR-010](../decisions/010-semantic-css-statt-tailwind.md).

## Stack

| Layer | Choice |
|---|---|
| Token-Definition | Reines CSS — `:root`-Block in `styles.scss`, kein Build-Plugin |
| Component-Styling | Scoped SCSS pro Component, BEM-Klassennamen |

## Warum BEM + Tokens statt Utility-First

Ein Canvas-lastiger Editor (Template-/Karteneditor) hat wenige, aber komplexe UI-Bereiche
(Layerliste, Eigenschaften-Panel, Canvas-Toolbar) statt vieler ähnlicher Listen-/Card-Layouts.
BEM-Klassen mit semantischen Namen halten diese Komponenten lesbar. Ein Utility-Framework wie
Tailwind hätte hier nur noch als Token-Pipeline gedient — das leistet ein `:root`-Block in
purem SCSS genauso, ohne PostCSS-Pipeline und ohne zusätzliche Abhängigkeit (ADR-010). Bricht
mit der Entscheidung, wenn sich Team/Umfang ändern — dann als neues ADR dokumentieren, nicht
stillschweigend mischen.

## Token-Architektur: Raw + Semantic

Zwei Schichten im `:root`-Block: **Raw** (Design-Vokabular, z.B. `--color-brand-500`,
`--space-md`) und **Semantic** (Zweck-benannt, referenziert Raw, z.B.
`--color-bg-elevated: var(--color-gray-50)`). **Components konsumieren ausschließlich
Semantic-Tokens.**

```scss
:root {
  /* RAW */
  --color-brand-500: #6d5ef8;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  /* weitere Skalen bei Bedarf: --radius-*, --shadow-*, --z-*, --duration-*, --ease-*,
     --font-*, --font-size-*, --touch-target-min: 2.75rem */

  /* SEMANTIC */
  --color-bg-base: var(--color-gray-950);
  --color-bg-elevated: var(--color-gray-900);
  --color-fg-primary: var(--color-gray-50);
  --color-border-focus: var(--color-brand-500);
}
```

Palette in Phase 5 festgelegt: Violett-Blau als Markenfarbe (`--color-brand-500: #6d5ef8`),
dunkel als Grundeinstellung (kein Umschalter, siehe `styles.scss`). `--color-canvas-checkerboard`
kommt erst mit dem Template-Editor-Plan, sobald der Konva-Stage tatsächlich existiert — ein
Token ohne Verbraucher wird nicht vorab angelegt.

## Templates: BEM, kein Utility-Framework

```html
<article class="layer-list-item" [class.layer-list-item--selected]="isSelected()">
  <span class="layer-list-item__name">{{ layer().name }}</span>
</article>
```

```scss
.layer-list-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);

  &--selected {
    background: color-mix(in srgb, var(--color-brand-500) 10%, transparent);
  }
}
```

Verboten in Templates: Klassennamen beschreiben das *Ding*, nicht sein Aussehen — keine
`px-4`, `flex`, `bg-brand-500`-artigen Utility-Klassen, egal woher sie kämen.

## Canvas-Spezifisch

Der Konva-`<ko-stage>`-Container bekommt ein festes Seitenverhältnis (63:88) über SCSS
(`aspect-ratio: 63 / 88`) — die Canvas-interne Skalierung (630×880 Einheiten →
Zielauflösung) ist Konva-/Rendering-Logik, keine CSS-Aufgabe.

## Critical Rules

1. **Kein Utility-Framework** — auch nicht „nur schnell für einen Einzelfall", auch nicht
   nur als Token-Pipeline im Hintergrund (ADR-010).
2. **Components konsumieren nur Semantic-Tokens**, nie Raw-Tokens direkt.
3. **Kein Inline-`style="…"`** — Styling lebt in der `.scss`-Datei der Component.
