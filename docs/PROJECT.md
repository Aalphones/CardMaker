# CardMaker — Kontext

## Ziel & Vision

CardMaker ist ein generischer Sammelkarten-Generator: Templates (Layout) definieren
Kartenrahmen, Layer und Datenquellen; Karteninstanzen (Inhalt) füllen ein Template mit
konkretem Charakter, Bild und Texten; Druckprojekte sammeln Karten und exportieren sie
als Druckbögen. Die Trennung Template/Instanz/Druckprojekt ist das tragende Prinzip —
Templates bleiben unverändert, Karten sind jederzeit neu renderbar.

Zielgruppe: du selbst — ein Solo-Tool, um beliebige Sammelkartensysteme (Charakterkarten,
Trading Cards) zu bauen, ohne für jeden Kartentyp neue Software zu schreiben.

## Scope

- Charakter- und Bildverwaltung (eigenständig, nicht geteilt mit anderen Projekten)
- Template-Editor: Layer erstellen/anordnen (Image, Shape, Icon, Frame, Text), Live-Vorschau
- Karteneditor: Bild verschieben/zoomen/zuschneiden, Texte + Schriftgröße/-farbe pro Karte
  überschreiben
- Internes Canvas fest auf 630×880 Einheiten (10 Einheiten = 1 mm bei 63×88 mm Kartengröße),
  DPI-unabhängig
- Rendering-Engine: serverseitiges Rendern einer Karte in Zielauflösung (Standard 300 DPI)
- Druckprojekte: Sammlung beliebig vieler Karten, Export als Druckbogen (DIN A4, 3×3 Karten),
  optional Schnittmarken/Beschnitt, Export als PDF/PNG
- Login/Auth (JWT-Sessions + Personal Access Tokens für skripteten Zugriff)
- Lokaler MCP-Server (`mcp/`) für Assistant-Tool-Zugriff auf die API — läuft nur lokal, nie
  deployed

## Nicht-Ziele

- Kein Multi-User-Betrieb / keine gleichzeitige Bearbeitung, kein Sharing zwischen Accounts
- Kein i18n — Oberfläche fix in einer Sprache
- Keine native Mobile-App (kein Capacitor/Cordova-Wrapper)
- Keine automatische KI-Bildgenerierung im Tool selbst — Rahmen-/Motiv-Erzeugung bleibt ein
  manueller externer Schritt (Prompt-Vorlagen dafür:
  [`docs/design/master-prompt-sammelkarten-design.md`](design/master-prompt-sammelkarten-design.md))
- Kein Offline-Modus / keine PWA — CardMaker ist ein Online-Tool, kein Sync-Layer nötig
- Keine geteilte Datenbank oder API mit Promptigofant — eigenständige App, eigene
  Charakter-/Bildverwaltung von Grund auf (spätere Import-Option nicht ausgeschlossen, aber
  nicht Teil des Starts)

## Stack

| Layer | Choice |
|---|---|
| Backend | PHP 8.5, MySQL 8.x, Composer |
| Backend libs | `firebase/php-jwt`, `vlucas/phpdotenv`, `nikic/fast-route`, `monolog/monolog`, `respect/validation` |
| Frontend framework | Angular 22 (standalone, signals) |
| Frontend state | NgRx Store (server state) + NgRx Signals (UI state) — never mix, Facade-Pflicht pro Slice |
| Styling | Tailwind CSS v4.3 — utility-first, `@theme`-Tokens in `styles.scss` |
| Canvas-Rendering | Konva.js + `ng2-konva` — Scene-Graph passt direkt auf das Layer-Modell (Image/Shape/Icon/Frame/Text als Konva-Nodes), offizielles Angular-Binding, eingebautes Drag/Transform |
| A11y / Overlays | Angular Aria (headless Primitives) + `@angular/cdk` (Drag-and-Drop für Layerliste, Overlays) |
| Auth | JWT-Sessions (`firebase/php-jwt`) + Personal Access Tokens, wie Promptigofant |
| Tooling | Husky + lint-staged (Formatierung), ESLint + `@ngrx/eslint-plugin`, Prettier, PHP CS Fixer |
| Hosting | Strato shared — kein SSH, kein CLI auf dem Server, phpMyAdmin only |
| Assistant-Tool-Zugriff | `mcp/` — Python 3.12+, offizielles `mcp`-SDK (FastMCP), läuft nur lokal |

Begründung nicht-offensichtlicher Wahlen:

- **Konva.js statt Fabric.js/PixiJS**: Recherche (08/2026) bestätigt Konva als Standard für
  Design-Editoren mit Layer-Modell — offizielles Angular-Binding, Scene-Graph mit
  eingebautem Hit-Testing/Transform-Handles. Fabric.js zielt stärker auf SVG-Export/Filter,
  PixiJS auf GPU-Performance/Games — beides am Bedarf hier vorbei.
- **Kein Offline-Modus**: anders als Promptigofant ist CardMaker ein kreatives Desktop-Tool,
  kein Nachschlagewerk für unterwegs — Online-only hält die Architektur ohne Sync-Layer
  einfach.
- **Eigenständige Charakter-/Bildverwaltung statt Promptigofant-Integration**: bewusste
  Entscheidung trotz konzeptioneller Nähe (siehe ADR-002) — getrennte Repos, getrennte
  Datenbanken, kein Kopplungsrisiko zwischen den Projekten.

Offene Stack-Frage (kein Blocker für den Start, aber vor der Export-Phase zu klären):
Export-Mechanismus für Druckbögen — client-seitig (jsPDF/pdf-lib, Kompositing im Browser)
vs. server-seitig (PHP GD/Imagick + TCPDF/mPDF, DPI-genaues Kompositing serverseitig).
Hängt an der Imagick-Verfügbarkeit auf Strato Shared Hosting — vor der Rendering-Phase
prüfen, siehe „Offene Fragen".

## Constraints

- Solo-Entwicklung, kein Team — lean Workflow (direkt auf `main`, kein Plan-Zwang für
  Kleinkram, STATE.md-Loop für aktive Pläne)
- Strato Shared Hosting: kein SSH, kein Server-CLI, Migrationen laufen web-getriggert
  (wie bei Promptigofant, siehe deren ADR-005 als Referenzmuster)
- Kartengröße und Canvas-Einheiten sind fixe Domänenkonstanten (63×88 mm, 630×880 Einheiten,
  300 DPI Standardauflösung) — nicht konfigurierbar, ziehen sich durch das ganze System

## Meilensteine

1. **Grundgerüst** — Auth (JWT + PAT), Charakter- und Bildverwaltung (Backend-CRUD + Frontend)
2. **Template-Editor** — Layer-System (Image/Shape/Icon/Frame/Text), Konva-Canvas mit
   Live-Vorschau, Layerliste (erstellen/löschen/duplizieren/umbenennen/Reihenfolge)
3. **Karteneditor** — Karteninstanz erstellen/bearbeiten: Bild verschieben/zoomen/zuschneiden,
   Benutzertexte, Schriftgröße/-farbe überschreiben, Auto-Shrink
4. **Rendering-Engine** — serverseitiges Rendern einer Karte in Zielauflösung (300 DPI),
   Render-Reihenfolge Image→Shape→Icon→Frame→Text
5. **Druckprojekt & Export** — Druckbögen (A4, 3×3), Schnittmarken/Beschnitt, PDF/PNG-Export
6. **MCP-Server** — lokaler Assistant-Tool-Zugriff auf die CardMaker-API

Detail-Phasen entstehen im ersten Plan (`/plan`), nicht hier.

## Offene Fragen

- Export-Mechanismus für Druckbögen: client- vs. server-seitig (siehe Stack-Abschnitt) —
  vor Meilenstein 5 klären, inkl. Imagick-Verfügbarkeitscheck auf Strato.
- Bild-Crop/Zoom-Interaktion im Karteneditor: direkt über Konva-Image-Transform lösen oder
  zusätzliche Crop-UI nötig? — vor Meilenstein 3 klären.
- Genaues DB-Schema (Charakter-Felder, Template-JSON-Struktur, Datenquellen-Mapping) —
  Teil des ersten Plans, nicht des Bootstraps.
