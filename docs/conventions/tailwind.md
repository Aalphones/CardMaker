# Tailwind Conventions — CardMaker

> **Source-of-truth references:**
> - [Tailwind v4 docs](https://tailwindcss.com/docs), [v4 release notes](https://tailwindcss.com/blog/tailwindcss-v4)
>
> Styling-Doktrin: BEM + scoped SCSS, Tailwind nur als `@theme`-Token-Pipeline — **keine**
> Utility-Klassen im Template. Bewusste Entscheidung für CardMaker, siehe Begründung unten.

## Stack

| Layer | Choice |
|---|---|
| Tailwind | v4.3, `@tailwindcss/postcss` |
| Config | CSS-first — `@theme`-Block in `styles.scss`, kein `tailwind.config.js` nötig |
| Component-Styling | Scoped SCSS pro Component, BEM-Klassennamen |

## Warum BEM + Tokens statt Utility-First

Ein Canvas-lastiger Editor (Template-/Karteneditor) hat wenige, aber komplexe UI-Bereiche
(Layerliste, Eigenschaften-Panel, Canvas-Toolbar) statt vieler ähnlicher Listen-/Card-Layouts.
BEM-Klassen mit semantischen Namen halten diese Komponenten lesbar; Tailwind liefert nur die
`@theme`-Token-Pipeline (Farben, Spacing, Radius als CSS-Custom-Properties), keine
Utility-Klassen im Template. Bricht mit der Entscheidung, wenn sich das Team/der Umfang
ändert — dann als ADR dokumentieren, nicht stillschweigend mischen.

## Token-Architektur: Raw + Semantic

Zwei Schichten im `@theme`-Block: **Raw** (Design-Vokabular, z.B. `--color-brand-500`,
`--space-md`) und **Semantic** (Zweck-benannt, referenziert Raw, z.B.
`--color-bg-elevated: white`). **Components konsumieren ausschließlich Semantic-Tokens.**

```scss
@theme {
  /* RAW */
  --color-brand-500: #__TBD__;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  /* weitere Skalen bei Bedarf: --radius-*, --shadow-*, --z-*, --duration-*, --ease-*,
     --font-*, --font-size-*, --touch-target-min: 2.75rem */

  /* SEMANTIC */
  --color-bg-base: white;
  --color-bg-elevated: var(--color-gray-50);
  --color-fg-primary: var(--color-gray-900);
  --color-border-focus: var(--color-brand-500);
  --color-canvas-checkerboard: #__TBD__;  /* Transparenz-Hintergrund hinter dem Konva-Stage */
}
```

Markenfarben/Palette sind noch nicht final (`#__TBD__`) — im ersten Plan festlegen, sobald
UI-Design ansteht.

## Templates: BEM, keine Utilities

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

Verboten in Templates: `px-4`, `flex`, `bg-brand-500` usw. — Klassennamen beschreiben das
*Ding*, nicht sein Aussehen.

## Canvas-Spezifisch

Der Konva-`<ko-stage>`-Container selbst bekommt ein festes Seitenverhältnis (63:88) über
SCSS (`aspect-ratio: 63 / 88`), nicht über Tailwind-Utilities — die Canvas-interne Skalierung
(630×880 Einheiten → Zielauflösung) ist Konva-/Rendering-Logik, keine CSS-Aufgabe.

## `@apply` — nicht verwenden

Baut Utility-First durch die Hintertür wieder auf. Tokens direkt via `var(--…)` konsumieren.

## Critical Rules

1. **Keine Utility-Klassen im Template** — auch nicht „nur schnell für einen Einzelfall".
2. **Components konsumieren nur Semantic-Tokens**, nie Raw-Tokens direkt.
3. **Kein `@apply`, kein Inline-`style="…"`** — Styling lebt in der `.scss`-Datei der
   Component.
