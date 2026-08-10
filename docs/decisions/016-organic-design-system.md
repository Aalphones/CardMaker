# 016 — Organic-Gestaltung als verbindliches Erscheinungsbild

**Status:** Akzeptiert (2026-08-10)

## Kontext

Für CardMaker liegt seit dem 10.08.2026 ein vollständiger Gestaltungs-Handoff vor
(`docs/design/handoff-organic/`): warmes, helles Erscheinungsbild („Organic"), Caprasimo
für Überschriften über Figtree für Fließtext, runde Formen, Pillen-Buttons, dazu die
Bedienung des Template-Editors als Vollbild mit Zoom, Rückgängig und Tastenkürzeln.

Die bisherige violett-dunkle Palette (`--color-brand-500: #6d5ef8`, dunkler Grund) war eine
Platzhalter-Entscheidung aus Phase 5 des Fundament-Plans — festgelegt, weil das Gerüst eine
Palette brauchte, nicht weil sie gestalterisch gewollt war. Sie steckt heute in 23
Komponenten-Stylesheets, allerdings ausschließlich über Zweck-Token.

## Optionen

- (a) Den Handoff eins zu eins übernehmen: Farben, Schriften, Formen und die gezeigte
  Editor-Bedienung.
- (b) Nur die Farben tauschen, die heutigen Formen und Schriften behalten.
- (c) Den Handoff ablehnen und bei der Platzhalter-Palette bleiben.

## Entscheidung

**(a).** Der Handoff ist verbindlich. Die helle Organic-Palette ersetzt die violett-dunkle
Palette vollständig; es bleibt kein Rest, auch nicht in Dialogen, Toasts, Fehlermeldungen
oder auf der 404-Seite.

Umgesetzt wird das über die **Zweck-Token-Namen, die bestehen bleiben** und lediglich neu
belegt werden (`--color-bg-base`, `--color-text-primary`, `--space-md`, `--radius-md` …).
Dadurch ändert sich das Aussehen aller Komponenten, ohne dass jedes Stylesheet angefasst
werden muss. Neu hinzu kommen die Namen, die der Entwurf braucht und die es bisher nicht
gab (`--color-surface`, `--color-divider`, `--color-bg-canvas`, `--font-family-heading`,
`--shadow-lg`, `--radius-pill`, die Farbleitern `--color-neutral-*`, `--color-accent-*`,
`--color-accent-2-*`).

(b) hätte ein halbes Erscheinungsbild ergeben — die Rundungen und die Schrift tragen den
Charakter der Gestaltung mindestens so stark wie die Farbe. (c) verwirft eine fertige
Gestaltung zugunsten eines Provisoriums.

## Konsequenzen

- ADR-010 bleibt unberührt: weiterhin kein Utility-Framework, weiterhin BEM plus
  Custom-Properties-Tokens. Die wiederkehrenden Bausteinklassen aus Phase 2 des
  Umsetzungsplans (Buttons, Felder, Tags, Karten) sind Komponentenklassen im Sinne von BEM,
  **keine** Utilities — sie benennen die Sache, nicht ihr Aussehen.
- Die Schriften Caprasimo und Figtree werden zur Laufzeit von Google Fonts geladen. Für ein
  reines Online-Werkzeug ist das vertretbar (ADR-003: kein Offline-Modus). Ohne Netz fällt
  die Anzeige auf `system-ui` zurück.
- Die Grundfläche ist ab jetzt hell (`color-scheme: light`). Der Template-Editor behält
  bewusst eine dunkle Bühne (`--color-bg-canvas`), damit die Karte darauf steht statt
  darin zu verschwinden.
- `docs/conventions/css.md` beschreibt ab jetzt die Organic-Werte; der Absatz zur
  violett-dunklen Palette entfällt.
