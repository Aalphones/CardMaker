# Tech Stack — CardMaker

> **Source-of-truth references:**
> - Schwesterprojekt auf gleichem Stack: Promptigofant (`docs/conventions/*.md` dort als
>   Ausgangspunkt, hier auf CardMakers Bedarf angepasst)
> - Offizielle Docs: [angular.dev](https://angular.dev), [ngrx.io](https://ngrx.io),
>   [tailwindcss.com](https://tailwindcss.com), [konvajs.org](https://konvajs.org),
>   [php.net](https://php.net)
>
> Versionen zum Bootstrap-Zeitpunkt (2026-08-01) — bei Zweifeln `npm view <pkg> version`
> gegen die Registry prüfen, nicht diese Tabelle blind fortschreiben.

| Layer | Choice |
|---|---|
| Backend | PHP 8.5, MySQL 8.x, Composer |
| Backend libs | `firebase/php-jwt`, `vlucas/phpdotenv`, `nikic/fast-route`, `monolog/monolog`, `respect/validation` |
| Frontend framework | Angular 22 (standalone, signals) |
| Frontend state | NgRx Store (Server-State) + NgRx Signals (UI-State) — nie mischen |
| Styling | Tailwind CSS v4.3 — utility-first, `@theme`-Tokens in `styles.scss` |
| Canvas-Rendering | Konva.js 10.x + `ng2-konva` 12.x |
| A11y / Overlays | Angular Aria (headless Primitives) + `@angular/cdk` (Drag-and-Drop, Overlays) |
| Auth | JWT (`firebase/php-jwt`) + Personal Access Tokens |
| Tooling | Husky + lint-staged, ESLint + `@ngrx/eslint-plugin`, Prettier, PHP CS Fixer |
| Hosting | Strato shared — kein SSH, kein CLI auf dem Server, phpMyAdmin only |
| Assistant-Tool-Zugriff | `mcp/` — Python 3.12+, offizielles `mcp`-SDK (FastMCP), läuft nur lokal |

## Warum Konva.js

Recherche (08/2026, siehe `docs/decisions/001-canvas-rendering-konva.md`) bestätigt Konva
als Standardwahl für Layer-basierte Design-Editoren: Scene-Graph mit eingebautem
Hit-Testing, Drag/Resize/Rotate-Handles, offizielles Angular-Binding. Passt direkt auf das
Layer-Modell aus dem Konzept (ImageLayer/ShapeLayer/IconLayer/FrameLayer/TextLayer als
Konva-Nodes, Konva-Layer als Rendering-Gruppen).

## Was bewusst fehlt (ggü. Promptigofant)

- **Kein `@angular/pwa`, kein `idb`, kein Service Worker** — kein Offline-Modus
  (siehe `docs/decisions/003-no-offline-mode.md`)
- **Kein `ngx-image-cropper`** — Bildausschnitt/Zoom läuft über Konva-Image-Transform direkt,
  kein separates Crop-Widget nötig
- **Kein PrimeNG** — Angular Aria + CDK von Anfang an, kein Migrations-Zwischenschritt

## Project Layout

Siehe [`docs/code-map.md`](../code-map.md) für das vollständige geplante Layout
(Frontend-Feature-Ordner, Backend-Schichten).

```
/
├── AGENTS.md
├── README.md
├── .claude/settings.local.json     # lokale Workflow-Einstellungen, gitignored
├── docs/                            # Dokumentation (siehe AGENTS.md → Conventions Index)
├── backend/                         # PHP REST API (noch zu scaffolden)
├── frontend/                        # Angular 22 Anwendung (noch zu scaffolden)
├── mcp/                              # lokaler MCP-Server, kein Deploy (noch zu scaffolden)
└── .mcp.json                        # Claude Code MCP-Registrierung (kein Token-Literal)
```

## Critical Rules

1. **Versionstabelle oben ist ein Snapshot, keine Garantie** — vor einem größeren Upgrade
   immer gegen die aktuelle Registry prüfen, nicht blind pinnen.
2. **Konva-Node-Struktur folgt dem Layer-Modell 1:1** — kein Parallel-Modell im Frontend-State
   aufbauen, das mit den Konva-Nodes synchron gehalten werden muss. Der NgRx-Store hält die
   Template-/Karteninstanz-Daten, Konva rendert daraus.
3. **Kein Offline-Layer nachrüsten, ohne `docs/decisions/003-no-offline-mode.md` zu revidieren**
   — die Entscheidung war bewusst, ein stillschweigender Sync-Layer widerspricht ihr.
