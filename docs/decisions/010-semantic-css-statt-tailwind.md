# 010 — Semantic CSS statt Tailwind

**Status:** Akzeptiert (2026-08-01)

## Kontext

`docs/conventions/tailwind.md` verbot Utility-Klassen im Template bereits vollständig —
Tailwinds einzige verbliebene Aufgabe war, den `@theme`-Block zu CSS-Custom-Properties zu
kompilieren. Das ist genau das, was ein `:root`-Block in purem SCSS ohne Build-Plugin auch
liefert, ohne eine zusätzliche PostCSS-Pipeline zu brauchen. Bewusste Präferenz für
CardMaker: Styling ausschließlich als semantisches CSS (BEM-Klassen, CSS Custom Properties
als Tokens), kein Utility-Framework — auch nicht nur als Token-Pipeline im Hintergrund.

## Optionen

- (a) Tailwind nur als `@theme`-Token-Quelle behalten (bisheriger Stand).
- (b) Tailwind restlos entfernen, Tokens als reine CSS Custom Properties in `styles.scss`.
- (c) Ein dediziertes Token-Werkzeug wie Style Dictionary einführen.

## Entscheidung

**(b).** Kein `tailwindcss`, kein `@tailwindcss/postcss`, keine PostCSS-Pipeline im
Frontend. Zwei Schichten Custom Properties (Raw → Semantic) direkt in `:root`, Komponenten
konsumieren ausschließlich die semantische Schicht. Die Token-Regeln aus dem bisherigen
`tailwind.md` bleiben inhaltlich gültig (Raw+Semantic-Trennung, BEM-Templates,
Component-Styling nur über Semantic-Tokens) — nur ohne Tailwind darunter.

## Konsequenzen

- `docs/conventions/tailwind.md` wird zu `docs/conventions/css.md` (Inhalt neu geschrieben:
  BEM + scoped SCSS + Custom-Properties-Tokens, kein Tailwind-Bezug mehr).
- `package.json` verliert `tailwindcss` und `@tailwindcss/postcss` aus `devDependencies`.
- Phase 5 (Frontend-Gerüst) installiert kein Tailwind, legt keine `postcss.config.json` an;
  der Gestaltungs-Token-Schritt schreibt direkt einen `:root`-Block statt eines
  `@theme`-Blocks.
- Eine Abhängigkeit weniger zu pflegen, eine Build-Stufe weniger — passt zur Linie aus
  ADR-006 (Ersatz durch Eigenbau, wo der Ersatz trivial ist und keine Kryptografie/Sicherheit
  betrifft).
