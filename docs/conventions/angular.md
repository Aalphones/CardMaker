# Angular / TypeScript Conventions — CardMaker

> **Source-of-truth references:**
> - Promptigofant `docs/conventions/coding-style.md` (gleicher Stack, adaptiert — Angular 22
>   statt 21, kein PrimeNG)
> - [angular.dev](https://angular.dev), [konvajs.org/docs/angular](https://konvajs.org)
>
> Projekt-Overrides unten haben Vorrang vor allgemeinen Coding-Style-Regeln.

## Stack

| Layer | Choice |
|---|---|
| Framework | Angular 22, standalone, Signals |
| TypeScript | strict mode, `noUncheckedIndexedAccess: true` |
| State | NgRx Store (Server-State) + NgRx Signals (UI-State) |
| Canvas | Konva.js + `ng2-konva` |
| Styling | Semantic CSS (BEM + Custom Properties) |
| A11y | Angular Aria + `@angular/cdk` |

## TypeScript

- Strict mode, `noUncheckedIndexedAccess: true`
- Typinferenz bevorzugen, wo der Typ offensichtlich ist — sonst explizit annotieren (auch
  bei Lambda-/Callback-Parametern, siehe User-Baseline)
- Kein `any`; `unknown` bei unsicherem Typ
- Event-Handler nach der Aktion benennen, nicht nach dem auslösenden Event

## Angular

- Immer standalone Components — `standalone: true` **nicht** setzen, ist Default ab v20+
- **Signals statt Observables** für Component-State — `computed()`/`effect()`
- Kein `.subscribe()` in Components — `toSignal()` oder `async`-Pipe als letztes Mittel
- Lazy Loading für Feature-Routes
- Kein `@HostBinding`/`@HostListener` — Host-Bindings ins `host`-Objekt des Decorators
- `NgOptimizedImage` für statische Bilder (nicht für inline Base64)
- `ng generate` für alles — nie Component-/Service-Dateien von Hand anlegen

### Reactivity-Falle: Route-Snapshots

`route.snapshot.*` ist ein einmaliger Snapshot, kein Signal. In `computed()` oder
Feldinitialisierung stattdessen `toSignal(route.paramMap)` nutzen:

```ts
// schlecht — computed liest einmaligen Snapshot, aktualisiert nie
readonly currentPage = computed(() => parseInt(this.route.snapshot.paramMap.get('page') ?? '1', 10));

// gut — reaktives Signal
readonly currentPage = toSignal(
  this.route.paramMap.pipe(map((pm: ParamMap) => parseInt(pm.get('page') ?? '1', 10))),
  { initialValue: 1 },
);
```

## Accessibility

- Muss alle AXE-Checks bestehen
- WCAG-AA-Minimum: Fokus-Management, Farbkontrast, ARIA-Attribute

## Components

- `input()`/`output()`-Funktionen statt Decorators
- `changeDetection: ChangeDetectionStrategy.OnPush` immer
- Reactive Forms statt Template-driven
- `class`/`style`-Bindings statt `ngClass`/`ngStyle`
- Externe Template/Style-Pfade relativ zur Component-TS-Datei

### CLI-first, drei Dateien pro Component

`ng generate component … --skip-tests` für alle drei Sibling-Dateien (`*.ts`, `*.html`,
`*.scss`). Inline `template:`/`styles:` nur für winzige geteilte Primitives.

### Kein Wrapper-Div auf Component-Root

Layout-Klassen (Padding, max-width, Zentrierung) gehören auf den Host, nicht in ein
umschließendes `<div>`:

```ts
@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.html',
  host: { class: 'block px-4 lg:px-8 py-8 max-w-[1400px] mx-auto' },
})
```

Faustregel: Root-Element mit echten Geschwister-Inhalten (`<header>`, `<nav>`, `<main>`) →
behalten, ist Layout-Container. Root mit nur einem Kind oder reiner Klassen-Host-Funktion →
weg damit, Klassen auf `host: { class: '…' }`.

## Navigation & interaktive Elemente

Navigierbare Elemente sind echte `<a [routerLink]="...">`, nie `(click)="router.navigate(...)"`
auf einem `<div>`/`<article>` mit `role="button"` — sonst funktionieren Mittelklick/Strg-Klick/
„In neuem Tab öffnen" nicht. `router.navigate()` bleibt reserviert für rein programmatische
Flows (Redirects nach Save, Guards, 401-Interceptor).

## Services

- Eine Verantwortung pro Service
- `providedIn: 'root'` für Singletons
- `inject()` statt Constructor Injection

**Naming:**
- Dateien: `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.store.ts`
- Klassen: `PascalCase`
- Signals: Substantivform (`cardGroups()`, `isLoading()`)
- Mutierende Methoden: Verbform (`setSearchTerm()`, `clearAll()`)

## NgRx

Siehe [`state-management.md`](state-management.md) für Facade-Pattern und Pitfalls im Detail.

- Classic Store für Server-State, SignalStore für UI-State — nie mischen
- Effects handhaben alle HTTP-Calls — nie `HttpClient` direkt aus Component/Service
- `createActionGroup`, `createFeature`, `createReducer` mit `on()`
- Selektoren sind pure Funktionen — komplexe Ableitungen in `createSelector`, nicht in
  Components

## Konva-Integration

- Konva-Nodes rendern **aus** dem Store, sind nie selbst Source of Truth — Layer-Position,
  -Rotation, -Zoom leben im NgRx-State (Template- bzw. Karteninstanz-Slice), Konva zeichnet
  nur
- Transform-Events (Drag/Resize/Rotate) dispatchen eine Action mit den neuen Werten, statt
  den Konva-Node direkt zu mutieren und den Store hinterherzuziehen
- `ng2-konva`-Komponenten (`ko-stage`, `ko-layer`, `ko-*-shape`) leben unter
  `shared/canvas/` — Editor-Feature-Components binden nur Config-Objekte, keine
  Konva-API-Aufrufe direkt in Feature-Components

## CSS / Styling

Siehe [`css.md`](css.md).

## Comments

Default: **keine Kommentare**. Nur bei nicht-offensichtlichem WARUM (Workaround, Invariante,
Reihenfolge-Abhängigkeit).

## Critical Rules

1. **Konva-State-Sync nur in eine Richtung** — Store → Konva-Config. Nie Konva-Node-Property
   direkt lesen, um Store-State zu rekonstruieren (siehe *Konva-Integration* oben).
2. **`ng generate` für alles** — von Hand angelegte Component-/Service-Dateien fehlt
   garantiert eine der drei Sibling-Dateien oder das `--skip-tests`-Flag divergiert.
3. **Kein `.subscribe()` in Components** — Observable-Leaks in einem Canvas-Editor mit vielen
   kurzlebigen Editor-Sessions sind der teuerste Ort dafür, das zu übersehen.
