# Phase 1 — Token-Fundament und Grundschrift

**Rating:** heikel (die Design-Entscheidung fällt hier und bindet alle Folgephasen)

## Kontext — vorher lesen

- `frontend/src/styles.scss` — der heutige Token-Block, wird komplett ersetzt
- `docs/conventions/css.md` — Zwei-Ebenen-Tokens, BEM, kein Utility-Framework
- `docs/decisions/010-semantic-css-statt-tailwind.md` — bleibt gültig, wird nicht abgelöst
- [`docs/design/handoff-organic/design-system/styles.css`](../../design/handoff-organic/design-system/styles.css)
  — Zeilen 1–71: die verbindlichen Werte
- [`docs/design/handoff-organic/design-system/readme.md`](../../design/handoff-organic/design-system/readme.md)
  — Abschnitte „Color", „Type", „Interaction states"

## Abnahmekriterien

- `frontend/src/styles.scss` trägt exakt die unten stehende Token-Schicht.
- Die Anwendung startet hell: cremiger Grund, dunkler Text, Terrakotta-Akzent.
- Überschriften erscheinen in Caprasimo, Fließtext in Figtree — auf einem frisch geladenen
  Browser ohne Cache.
- Kein Komponenten-Stylesheet wurde in dieser Phase inhaltlich geändert; sie sehen
  allein durch die neuen Token-Werte anders aus.
- `--color-canvas-checker-light/-dark` funktionieren weiter (Schachbrett hinter der Karte
  bleibt sichtbar).

## Checkliste

- [ ] `frontend/src/styles.scss` neu schreiben. Ziel-`:root` (Werte verbindlich, Reihenfolge
      und Kommentare übernehmen):

  ```scss
  @import url('https://fonts.googleapis.com/css2?family=Caprasimo:wght@400&family=Figtree:wght@400;600;700&display=swap');

  :root {
    color-scheme: light;

    /* RAW — Grundfarben (Organic) */
    --color-organic-bg: #f5ead8;
    --color-organic-surface: #ebddc5;
    --color-organic-ink: #201e1d;

    /* RAW — Farbleitern, gemeinsame Helligkeitsskala */
    --color-neutral-100: #f9f4ed;
    --color-neutral-200: #eee7db;
    --color-neutral-300: #dcd3c4;
    --color-neutral-400: #c0b6a5;
    --color-neutral-500: #a19786;
    --color-neutral-600: #82796a;
    --color-neutral-700: #645c50;
    --color-neutral-800: #474238;
    --color-neutral-900: #2e2b25;

    --color-accent-100: #fff2eb;
    --color-accent-200: #ffe1d0;
    --color-accent-300: #ffc6a5;
    --color-accent-400: #f6a06b;
    --color-accent-500: #d67f48;
    --color-accent-600: #b2622d;
    --color-accent-700: #8c491a;
    --color-accent-800: #643312;
    --color-accent-900: #402310;

    --color-accent-2-100: #f0fae1;
    --color-accent-2-200: #e1eecc;
    --color-accent-2-300: #ccdbb2;
    --color-accent-2-400: #aebf92;
    --color-accent-2-500: #8fa073;
    --color-accent-2-600: #728157;
    --color-accent-2-700: #56633f;
    --color-accent-2-800: #3d472b;
    --color-accent-2-900: #272e1b;

    /* RAW — Status (aus den Leitern abgeleitet, damit die Warmtönung erhalten bleibt) */
    --color-success: #56633f;
    --color-warning: #b2622d;
    --color-error: #a33a22;

    /* RAW — Abstände (Dichte 1,10 aus dem Design-System, in rem bei 16px Grundgröße) */
    --space-1: 0.275rem;
    --space-2: 0.55rem;
    --space-3: 0.825rem;
    --space-4: 1.1rem;
    --space-6: 1.65rem;
    --space-8: 2.2rem;

    /* RAW — Radien, Schatten, Schrift */
    --radius-organic-sm: 0.5rem;
    --radius-organic-md: 1rem;
    --radius-organic-lg: 1.75rem;

    --shadow-organic-sm: 0 1px 2px color-mix(in srgb, #2e2b25 14%, transparent);
    --shadow-organic-md: 0 3px 10px color-mix(in srgb, #2e2b25 16%, transparent);
    --shadow-organic-lg: 0 12px 32px color-mix(in srgb, #2e2b25 22%, transparent);

    --font-organic-heading: 'Caprasimo', system-ui, sans-serif;
    --font-organic-body: 'Figtree', system-ui, sans-serif;

    /* SEMANTIC — Komponenten greifen ausschließlich hierauf zu */
    --color-bg-base: var(--color-organic-bg);
    --color-bg-elevated: var(--color-organic-surface);
    --color-bg-sunken: var(--color-neutral-200);
    --color-bg-canvas: var(--color-neutral-800);
    --color-surface: var(--color-organic-surface);
    --color-text-primary: var(--color-organic-ink);
    --color-text-muted: color-mix(in srgb, var(--color-organic-ink) 55%, transparent);
    --color-text-on-accent: var(--color-organic-bg);
    --color-border: var(--color-divider);
    --color-divider: color-mix(in srgb, var(--color-organic-ink) 16%, transparent);
    --color-accent: #c67139;
    --color-accent-hover: var(--color-accent-600);
    --color-accent-pressed: var(--color-accent-700);
    --color-accent-tint: var(--color-accent-200);
    --color-accent-text: var(--color-accent-700);
    --color-danger: var(--color-error);

    --space-xs: var(--space-1);
    --space-sm: var(--space-2);
    --space-md: var(--space-3);
    --space-lg: var(--space-4);
    --space-xl: var(--space-6);

    --radius-sm: var(--radius-organic-sm);
    --radius-md: var(--radius-organic-md);
    --radius-lg: var(--radius-organic-lg);
    --radius-pill: 999px;

    --shadow-sm: var(--shadow-organic-sm);
    --shadow-md: var(--shadow-organic-md);
    --shadow-lg: var(--shadow-organic-lg);

    --font-family-base: var(--font-organic-body);
    --font-family-heading: var(--font-organic-heading);
    --font-size-sm: 0.8125rem;
    --font-size-md: 0.9375rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.625rem;

    --touch-target-min: 2.75rem;

    /* SEMANTIC — Kartenvorschau */
    --color-canvas-checker-light: var(--color-neutral-200);
    --color-canvas-checker-dark: var(--color-neutral-400);
    --size-canvas-checker: 1rem;
  }
  ```

- [ ] Grundschicht unterhalb von `:root` ersetzen:
  - `body`: `font-family: var(--font-family-base)`, `font-size: var(--font-size-md)`,
    `line-height: 1.55`, Grundfläche und Textfarbe aus den Zweck-Token.
  - `h1`–`h6`: `font-family: var(--font-family-heading)`, `font-weight: 400`,
    `line-height: 1.12`, `letter-spacing: -0.015em`, `margin: 0 0 var(--space-sm)`.
    Größen: h1 2.625rem, h2 2rem, h3 1.5625rem, h4 1.25rem, h5 1rem, h6 0.8125rem;
    h6 zusätzlich `text-transform: uppercase; letter-spacing: 0.08em`.
  - `a { color: var(--color-accent-text); text-underline-offset: 3px; }`
  - `::selection { background: color-mix(in srgb, var(--color-accent) 30%, transparent); }`
  - `:focus { outline: none; }` und `:focus-visible { outline: 2px solid var(--color-accent);
    outline-offset: 2px; }` (der bestehende Fokusring bleibt, nur ergänzt um `:focus`).
- [ ] Sichtprüfung im Browser (`npm start`): Anmeldeseite, Kartengruppen-Liste,
      Template-Editor einmal öffnen. Stellen, die durch die neuen Werte kaputt aussehen
      (zu enge Abstände, unlesbarer Text auf hellem Grund), **nicht hier reparieren**,
      sondern in `FINDINGS.md` der betroffenen Phase zuordnen.
- [ ] ADR schreiben: `docs/decisions/016-organic-design-system.md` — Kontext (Design-Handoff
      liegt vor, bisherige Palette war eine Platzhalter-Entscheidung aus Phase 5 des
      Fundament-Plans), betrachtete Optionen (Handoff eins zu eins übernehmen /
      nur Farben tauschen und Formen behalten / Handoff ablehnen), Entscheidung
      (Handoff ist verbindlich, helle Organic-Palette ersetzt die dunkle Palette
      vollständig, Zweck-Token-Namen bleiben und werden neu belegt), Konsequenzen
      (ADR-010 bleibt unberührt — weiterhin kein Utility-Framework; die Bausteinklassen
      aus Phase 2 sind Komponentenklassen im Sinne von BEM, keine Utilities;
      Schriften kommen zur Laufzeit von Google Fonts, was für ein reines Online-Werkzeug
      vertretbar ist — siehe ADR-003).
- [ ] `docs/conventions/css.md` nachziehen: Beispielwerte im Token-Abschnitt auf die neue
      Palette umstellen, Satz zur violett-dunklen Palette entfernen, Verweis auf ADR-016
      und auf die Bausteinklassen (Phase 2) ergänzen.

## Report-Back
