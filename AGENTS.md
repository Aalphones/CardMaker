# AGENTS.md — CardMaker

> Wird jede Session automatisch geladen. Kurz halten — Detail lebt in `docs/`.

🚧 Aktive Arbeit → STATE.md

---

## Was ist CardMaker

Ein reines Werkzeug zum Erstellen von Sammelkarten — **keine Charakterverwaltung**
(ADR-011): **Template** (Layout) + **Karteninstanz** (Inhalt, referenziert ein Template,
Textfelder per Formular oder MCP befüllt) + **Kartengruppe** (Organisation gespeicherter
Karten) + **Druckprojekt** (sammelt Karten, exportiert Druckbögen). Templates bleiben
unverändert, Karten sind jederzeit neu renderbar. Eigenständige App, kein geteiltes Backend
mit anderen Projekten (ADR-002).

- Internes Canvas fest auf 630×880 Einheiten (10 Einheiten = 1 mm, Kartengröße 63×88 mm),
  DPI-unabhängig
- Layer-System: ImageLayer, ShapeLayer, IconLayer, FrameLayer, TextLayer
- Login/Auth erforderlich (JWT + Personal Access Tokens)
- Kein Offline-Modus, keine PWA — Online-Tool

Vollständiger Kontext: [`docs/PROJECT.md`](docs/PROJECT.md). Domänenbegriffe:
[`docs/glossary.md`](docs/glossary.md).

---

## Tech Stack (Kurzfassung)

Angular 22 + NgRx + Konva.js/ng2-konva + Semantic CSS (Frontend) · PHP 8.5 + MySQL auf Strato
Shared Hosting, kein Composer (Backend) · Python + MCP SDK (`mcp/`, lokaler
Assistant-Tool-Server, kein Deploy).

Vollständige Tabelle + Begründungen: [`docs/PROJECT.md`](docs/PROJECT.md) → Stack.
Projekt-Layout: [`docs/code-map.md`](docs/code-map.md).

---

## Conventions Index

| Topic | File |
|---|---|
| Tech-Stack & Layout | [`docs/conventions/stack.md`](docs/conventions/stack.md) |
| PHP | [`docs/conventions/php.md`](docs/conventions/php.md) |
| Angular / TypeScript | [`docs/conventions/angular.md`](docs/conventions/angular.md) |
| State Management (NgRx) | [`docs/conventions/state-management.md`](docs/conventions/state-management.md) |
| CSS / Styling | [`docs/conventions/css.md`](docs/conventions/css.md) |
| Linting | [`docs/conventions/linting.md`](docs/conventions/linting.md) |
| Commits | [`docs/conventions/commits.md`](docs/conventions/commits.md) |
| Git-Workflow | [`docs/conventions/git-workflow.md`](docs/conventions/git-workflow.md) |
| Definition-of-Done | [`docs/conventions/dod.md`](docs/conventions/dod.md) |
| MCP-Server | [`docs/conventions/mcp.md`](docs/conventions/mcp.md) |

---

## Critical Rules

1. **Template/Karteninstanz/Druckprojekt bleiben getrennt** — eine Karteninstanz speichert nie
   das fertige Bild, nur Referenzen + Abweichungen. Sonst ist nichts mehr neu renderbar.
2. **Internes Canvas ist immer 630×880 Einheiten** — jede Layer-Position bezieht sich darauf,
   nie auf Zielauflösung oder DPI direkt.
3. **Kein geteiltes Backend/DB mit anderen Projekten** — eigenständige App (siehe
   [ADR-002](docs/decisions/002-standalone-app-no-promptigofant-integration.md)).

Weitere Regeln entstehen, sobald sie sich als nötig erweisen — nicht vorab erfinden.

---

## Wo du mehr findest

- **Projekt-Kontext, Scope, Nicht-Ziele, Meilensteine, offene Fragen:**
  [`docs/PROJECT.md`](docs/PROJECT.md)
- **Architektur-Entscheidungen:** [`docs/decisions/`](docs/decisions/) — ADRs
- **Aktive Planung:** [`docs/planning/`](docs/planning/)
- **Archiv:** [`docs/archive/YYYY-MM/`](docs/archive/)
- **Design-Quellen** (Konzept-Dokument, KI-Bildprompt-Vorlagen): [`docs/design/`](docs/design/)
- **Aussehen der Oberfläche** — verbindlicher Design-Handoff „Organic" (Screens, Werte,
  Verhalten, Prototyp zum Öffnen im Browser):
  [`docs/design/handoff-organic/`](docs/design/handoff-organic/). Farben, Schriften,
  Abstände und Formen kommen aus dessen `design-system/styles.css` — nichts davon im
  Komponenten-Stylesheet neu erfinden.
