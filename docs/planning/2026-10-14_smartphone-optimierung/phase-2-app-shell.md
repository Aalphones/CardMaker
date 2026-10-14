# Phase 2 — App-Shell

**Tier:** standard

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Begriffe", „Kontrakt"
- `docs/decisions/028-smartphone-bedienung.md` (aus Phase 1)
- `frontend/src/app/layout/shell/shell.html`, `shell.scss`, `shell.ts`
- `frontend/src/app/shared/components/notification-list/notification-list.scss`
- `frontend/src/styles/_breakpoints.scss`, `_bausteine.scss` (`.icon-button`, `.btn`)

## AK der Phase

1. Auf Smartphone-Breite (≤ 600 px): Die Seitenspalte und der Kontobereich der Kopfzeile (E-Mail, Zugriffstoken-Link, Abmelden) sind ausgeblendet. Die Kopfzeile zeigt nur die Wortmarke.
2. Auf Smartphone-Breite steht unten eine feste Tab-Leiste mit fünf gleich breiten Einträgen: **Karten** (`/cards`), **Gruppen** (`/card-groups`), **Templates** (`/templates`), **Druck** (`/print-project`, mit derselben Plakette wie heute), **Mehr**. Jeder Eintrag = Icon (22 px) über Beschriftung, Höhe `--shell-tabbar-height`, darunter der sichere Bereich des iPhones (`env(safe-area-inset-bottom)`).
3. Der aktive Eintrag ist in `--color-accent-text` gefärbt; „Mehr" gilt als aktiv, solange `/assets`, `/prompts` oder `/tokens` offen ist.
4. „Mehr" öffnet ein Blatt direkt über der Tab-Leiste mit: Bildvorrat, Bild-Prompts, Zugriffstoken (je Icon + Text, Tippfläche ≥ 44 px), darunter die Konto-E-Mail (gedämpft) und „Abmelden" als `.btn.btn--secondary.btn--block`. Hinter dem Blatt liegt ein abgedunkelter Hintergrund.
5. Das Blatt schließt bei: Tippen auf den Hintergrund, erneutem Tippen auf „Mehr", Escape, jeder abgeschlossenen Navigation.
6. Der Seiteninhalt endet nicht hinter der Tab-Leiste (unterer Innenabstand = Leistenhöhe + sicherer Bereich + `--space-lg`), seitlicher Innenabstand `--space-lg`.
7. `.shell__content` hat auf Smartphone-Breite `overflow: visible` — damit kleben `position: sticky`-Elemente der Seiten (Phase 5) am Fenster statt an diesem Kasten.
8. Meldungen (`notification-list`) liegen auf Smartphone-Breite oben über die volle Breite (links und rechts `--space-sm` Abstand).
9. Zwischen 601 und 900 px bleibt das bisherige Verhalten (Seitenspalte als umbrechende Leiste oben, Kontobereich sichtbar). Über 900 px unverändert.
10. Der Template-Editor (Ebene 50) liegt über der Tab-Leiste (Ebene 40) — sie ist im Editor nicht sichtbar.

## Checkliste

### `shell.ts`

- [ ] Imports: `signal`, `computed`, `DestroyRef` bei Bedarf, `HostListener` aus `@angular/core`; `Router`, `NavigationEnd` aus `@angular/router`; `toSignal` aus `@angular/core/rxjs-interop`; `filter`, `map` aus `rxjs`.
- [ ] Felder ergänzen:

```ts
  private readonly router = inject(Router);

  /** Das „Mehr"-Blatt der Tab-Leiste (nur Smartphone-Breite sichtbar). */
  protected readonly moreOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** „Mehr" sammelt die Bereiche, die keinen eigenen Tab haben. */
  protected readonly moreActive = computed(() =>
    ['/assets', '/prompts', '/tokens'].some((path: string) => this.currentUrl().startsWith(path)),
  );
```

- [ ] Im Konstruktor: bei jeder `NavigationEnd` `this.moreOpen.set(false)` (über `this.router.events.pipe(filter(...), takeUntilDestroyed())`).
- [ ] Methoden: `toggleMore(): void` (umschalten), `closeMore(): void`, und

```ts
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMore();
  }
```

### `shell.html`

- [ ] Den bestehenden `<nav class="shell__sidebar">` unverändert lassen (bekommt nur per CSS `display: none` auf Smartphone-Breite).
- [ ] Nach `</main>` (noch innerhalb `.shell__body` ist egal, da fest positioniert — Vorgabe: direkt vor `<app-notification-list />`) einfügen:
  - `<nav class="shell__tabbar" aria-label="Hauptnavigation">` mit vier `<a class="shell__tab" routerLink=… routerLinkActive="shell__tab--active">` (Icons: dieselben SVG-Pfade wie in der Seitenspalte, `width`/`height` 22) mit `<span class="shell__tab-label">Karten|Gruppen|Templates|Druck</span>`; am Druck-Tab die Plakette `<span class="shell__nav-badge shell__tab-badge">` mit derselben `@if (printProject.totalQuantity() > 0)`-Bedingung.
  - als fünften Eintrag `<button type="button" class="shell__tab" [class.shell__tab--active]="moreActive() || moreOpen()" aria-controls="shell-more" [attr.aria-expanded]="moreOpen()" (click)="toggleMore()">` mit Icon „drei Punkte waagrecht" (`<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>`, `fill="currentColor"`) und Beschriftung „Mehr".
  - `@if (moreOpen())`: `<div class="shell__more-backdrop" (click)="closeMore()"></div>` und `<div id="shell-more" class="shell__more" role="dialog" aria-label="Weitere Bereiche">` mit drei `<a class="shell__more-link" routerLink=…>` (Bildvorrat `/assets`, Bild-Prompts `/prompts`, Zugriffstoken `/tokens`; Icons von Bildvorrat und Bild-Prompts aus der Seitenspalte, für Zugriffstoken ein Schlüssel: `<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>`), dann `<p class="shell__more-email">{{ auth.user()?.email }}</p>` und der Abmelden-Knopf (`btn btn--secondary btn--block`, `(click)="logout()"`).

### `shell.scss`

- [ ] `.shell__tabbar`, `.shell__more`, `.shell__more-backdrop` sind standardmäßig `display: none`.
- [ ] Im Block `@include bp.phone { … }` (neu, nach dem bestehenden `bp.narrow`-Block, damit er gewinnt):
  - `&__header`: `padding-inline: var(--space-lg); padding-block: var(--space-sm);`
  - `&__account`, `&__sidebar`: `display: none;`
  - `&__content`: `padding: var(--space-lg); padding-block-end: calc(var(--shell-tabbar-height) + env(safe-area-inset-bottom) + var(--space-lg)); overflow: visible;`
  - `&__tabbar`: `display: grid; grid-template-columns: repeat(5, 1fr); position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 40; block-size: calc(var(--shell-tabbar-height) + env(safe-area-inset-bottom)); padding-block-end: env(safe-area-inset-bottom); background: var(--color-surface); border-top: 1px solid var(--color-divider);`
  - `&__tab`: `position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border: 0; background: transparent; color: var(--color-text-muted); font: inherit; font-size: var(--font-size-sm); text-decoration: none; cursor: pointer;` — `&--active { color: var(--color-accent-text); }`
  - `&__tab-badge`: `position: absolute; inset-block-start: var(--space-xs); inset-inline-start: calc(50% + 6px);`
  - `&__more-backdrop`: `display: block; position: fixed; inset: 0; z-index: 39; background: color-mix(in srgb, var(--color-neutral-900) 30%, transparent);`
  - `&__more`: `display: flex; flex-direction: column; gap: var(--space-xs); position: fixed; inset-inline: 0; inset-block-end: calc(var(--shell-tabbar-height) + env(safe-area-inset-bottom)); z-index: 41; padding: var(--space-md) var(--space-lg) var(--space-lg); border-radius: var(--radius-lg) var(--radius-lg) 0 0; background: var(--color-surface); box-shadow: var(--shadow-lg);`
  - `&__more-link`: wie `&__nav-link`, zusätzlich `min-block-size: var(--touch-target-min); font-size: var(--font-size-md);`
  - `&__more-email`: `margin: var(--space-sm) 0 0; font-size: var(--font-size-sm); color: var(--color-text-muted); overflow-wrap: anywhere;`
- [ ] Chesterton: `.shell__content { overflow-y: auto }` bleibt oberhalb 600 px wie es ist. Zweck beim Planen: der Kasten hat keine feste Höhe (`.shell` nur `min-height: 100vh`), scrollt also im Normalfall nicht selbst — die Regel ist dort wirkungslos, aber harmlos. Auf Smartphone-Breite wird sie überschrieben, weil sie sonst `sticky` bricht.

### Meldungen

- [ ] `notification-list.scss`: `@use 'breakpoints' as bp;` und

```scss
  @include bp.phone {
    top: var(--space-sm);
    right: var(--space-sm);
    left: var(--space-sm);
  }
```

  (innerhalb `.notification-list`).

### Doc

- [ ] `docs/code-map.md` → `layout/shell/`: Satz ergänzen „Auf Smartphone-Breite: Tab-Leiste unten (Karten, Gruppen, Templates, Druck, Mehr) und „Mehr"-Blatt mit Bildvorrat, Bild-Prompts, Zugriffstoken, Abmelden".

## Status

complete — alle Checklistenpunkte umgesetzt, `npm run lint` und `npm run build` grün (kein Budget-Hinweis).

## Report-Back

- Abweichung (Projekt-Konvention schlägt Plan-Text): kein `@HostListener` und kein `.subscribe()` in Components. Escape läuft über `host: { '(document:keydown.escape)': 'closeMore()' }`, das Schließen bei Navigation über einen `effect()` auf dem `currentUrl`-Signal.
- Hintergrund des Blatts ist ein `<button>` (Lint verlangt Tastatur-/Fokus-Verhalten für klickbare Elemente), `tabindex="-1"`, `aria-label`.
- `.shell__more-link` teilt sich die Grundregel mit `.shell__nav-link` (Budget 4 kB war sonst um 54 Byte überschritten).
- Unsicherste Stelle: `effect()` in `shell.ts` schreibt `moreOpen` bei jeder Navigation — nicht im Browser geprüft (Gerätemodus 360 px, „Mehr" öffnen → Eintrag antippen → Blatt muss zugehen).
