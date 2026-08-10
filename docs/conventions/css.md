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
  --color-organic-bg: #f5ead8;
  --color-accent-700: #8c491a;
  --space-2: 0.55rem;
  --space-3: 0.825rem;
  --space-4: 1.1rem;
  /* weitere Skalen bei Bedarf: --radius-*, --shadow-*, --z-*, --duration-*, --ease-*,
     --font-*, --font-size-*, --touch-target-min: 2.75rem */

  /* SEMANTIC */
  --color-bg-base: var(--color-organic-bg);
  --color-bg-elevated: var(--color-organic-surface);
  --color-text-primary: var(--color-organic-ink);
  --color-accent-text: var(--color-accent-700);
}
```

Palette: die helle, warme **Organic**-Gestaltung aus dem Handoff
(`docs/design/handoff-organic/`) — cremiger Grund `#f5ead8`, Flächen `#ebddc5`, Terrakotta
als Akzent `#c67139`, Caprasimo über Figtree, `color-scheme: light`, kein Umschalter
(siehe `styles.scss` und [ADR-016](../decisions/016-organic-design-system.md)). Die
Zweck-Token-Namen sind dabei stabil geblieben und nur neu belegt worden — Komponenten
mussten dafür nicht angefasst werden.

Wiederkehrende Bausteine (Buttons, Eingabefelder, Tags, Karten, Segment-Umschalter) leben
als **globale Komponentenklassen** neben dem Token-Block. Sie benennen die Sache, nicht ihr
Aussehen, und sind damit BEM-Komponenten, keine Utilities — ADR-010 bleibt unberührt.

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
    background: var(--color-accent-tint);
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
