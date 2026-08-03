# CardMaker — Kontext

## Ziel & Vision

CardMaker ist ein reines Werkzeug zum Erstellen von Sammelkarten: Templates (Layout)
definieren Kartenrahmen, Layer und Datenquellen; Karteninstanzen (Inhalt) füllen ein
Template mit einem Bild und direkt eingegebenen Texten — per Formular oder über den
lokalen MCP-Server durch Claude; Kartengruppen organisieren gespeicherte Karten thematisch
(z. B. eine „Spiderman-Serie"); Druckprojekte sammeln Karten und exportieren sie als
Druckbögen. Die Trennung Template/Instanz/Druckprojekt ist das tragende Prinzip —
Templates bleiben unverändert, Karten sind jederzeit neu renderbar.

Es gibt **keine Charakterverwaltung**: CardMaker zieht beim Erstellen einer Karte nie
automatisch Daten aus einer Datenbank (ADR-011). Gespeichert werden ausschließlich die
fertig erstellten Karten selbst — damit sich Schreibfehler nachträglich korrigieren lassen,
nicht damit Inhalte wiederverwendet werden.

Zielgruppe: du selbst — ein Solo-Tool, um beliebige Sammelkartensysteme (Charakterkarten,
Trading Cards) zu bauen, ohne für jeden Kartentyp neue Software zu schreiben.

## Scope

- Kartengruppen-Verwaltung: gespeicherte Karten thematisch organisieren (z. B. eine
  „Spiderman-Serie" — alle mit demselben Template, aber unterschiedlichen Bildern/Texten)
- Template-Editor: Layer erstellen/anordnen (Image, Shape, Icon, Frame, Text), Live-Vorschau
- Karteneditor: Template-Textfelder per Formular oder über MCP befüllen, Bild hochladen,
  verschieben/zoomen/zuschneiden, Schriftgröße/-farbe pro Karte überschreiben
- Internes Canvas fest auf 630×880 Einheiten (10 Einheiten = 1 mm bei 63×88 mm Kartengröße),
  DPI-unabhängig
- Rendering-Engine: Rendern einer Karte in Zielauflösung (Standard 300 DPI) im Browser über
  Konva (ADR-005)
- Druckprojekte: Sammlung beliebig vieler Karten (unabhängig von deren Kartengruppe), Export
  als Druckbogen (DIN A4, 3×3 Karten), optional Schnittmarken/Beschnitt, Export als PDF/PNG
- Login/Auth (JWT-Sessions + Personal Access Tokens für skripteten Zugriff)
- Lokaler MCP-Server (`mcp/`) für Assistant-Tool-Zugriff auf die API — läuft nur lokal, nie
  deployed. Darüber befüllt Claude Template-Textfelder mit Text, genau wie über das Formular.

## Nicht-Ziele

- **Keine Charakterverwaltung** — keine Datenbank mit wiederverwendbaren Charakteren/Figuren,
  keine automatische Datenübernahme beim Kartenerstellen. Jede Karte wird einzeln befüllt
  (ADR-011, löst ADR-007 ab).
- Kein Multi-User-Betrieb / keine gleichzeitige Bearbeitung, kein Sharing zwischen Accounts
- Kein i18n — Oberfläche fix in einer Sprache
- Keine native Mobile-App (kein Capacitor/Cordova-Wrapper)
- Keine automatische KI-Bildgenerierung im Tool selbst — Rahmen-/Motiv-Erzeugung bleibt ein
  manueller externer Schritt (Prompt-Vorlagen dafür:
  [`docs/design/master-prompt-sammelkarten-design.md`](design/master-prompt-sammelkarten-design.md))
- Kein Offline-Modus / keine PWA — CardMaker ist ein Online-Tool, kein Sync-Layer nötig
- Keine geteilte Datenbank oder API mit Promptigofant — eigenständige App, eigene Datenhaltung
  von Grund auf (ADR-002)

## Stack

| Layer | Choice |
|---|---|
| Backend | PHP 8.5, MySQL 8.x, kein Composer (ADR-006) |
| Backend libs | keine — Wegweiser, Konfigurationsleser, Prüfhelfer selbst geschrieben in `backend/src/Support/` (ADR-006) |
| Frontend framework | Angular 21 (standalone, signals) — NgRx/ng2-konva hatten zu Beginn von Phase 5 noch keine Angular-22-Version |
| Frontend state | NgRx Store (server state) + NgRx Signals (UI state) — never mix, Facade-Pflicht pro Slice |
| Styling | Semantic CSS — SCSS + BEM, CSS Custom Properties als Design-Tokens, kein Utility-Framework (ADR-010) |
| Canvas-Rendering | Konva.js + `ng2-konva` — Scene-Graph passt direkt auf das Layer-Modell (Image/Shape/Icon/Frame/Text als Konva-Nodes), offizielles Angular-Binding, eingebautes Drag/Transform |
| A11y / Overlays | Angular Aria (headless Primitives) + `@angular/cdk` (Drag-and-Drop für Layerliste, Overlays) |
| Auth | Zufallstoken in der Datenbank, Sitzungen und Zugriffstoken (ADR-008) |
| Tooling | Husky + lint-staged (Formatierung), ESLint + `@ngrx/eslint-plugin`, Prettier |
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
- **Eigenständige App statt Promptigofant-Integration**: bewusste Entscheidung trotz
  konzeptioneller Nähe (siehe ADR-002) — getrennte Repos, getrennte Datenbanken, kein
  Kopplungsrisiko zwischen den Projekten. Eine Charakterverwaltung wie bei Promptigofant
  gibt es in CardMaker gar nicht erst (ADR-011).

Rendering und Export sind client-seitig entschieden (ADR-005) — kein serverseitiges
Kompositing, kein Imagick-Verfügbarkeitscheck auf Strato nötig.

## Constraints

- Solo-Entwicklung, kein Team — lean Workflow (direkt auf `main`, kein Plan-Zwang für
  Kleinkram, STATE.md-Loop für aktive Pläne)
- Strato Shared Hosting: kein SSH, kein Server-CLI, Migrationen laufen web-getriggert
  (wie bei Promptigofant, siehe deren ADR-005 als Referenzmuster)
- Kartengröße und Canvas-Einheiten sind fixe Domänenkonstanten (63×88 mm, 630×880 Einheiten,
  300 DPI Standardauflösung) — nicht konfigurierbar, ziehen sich durch das ganze System
- Serverwerte Strato (ermittelt Phase 2, Fundament-Plan): PHP 8.5.7, Erweiterungen
  `pdo_mysql`, `gd`, `imagick`, `fileinfo`, `mbstring` vorhanden; Upload-Grenze 128 MB,
  Speicherlimit 512 MB, Laufzeit-Limit 240 s — relevant für den Bild-Upload im
  Karteneditor-Plan (Meilenstein 3)

## Meilensteine

1. **Grundgerüst** — Auth (JWT + PAT), Kartengruppen-Verwaltung als erster kompletter
   Durchstich DB→Backend→Store→UI (Backend-CRUD + Frontend) — **erledigt** (2026-08-03),
   siehe `docs/archive/2026-08/2026-08-01_fundament-und-grundgeruest/`
2. **Template-Editor** — Layer-System (Image/Shape/Icon/Frame/Text), Konva-Canvas mit
   Live-Vorschau, Layerliste (erstellen/löschen/duplizieren/umbenennen/Reihenfolge). Das
   Layout liegt als ein Datenblock in einer Spalte, nicht als eigene Ebenentabelle (ADR-014).
3. **Karteneditor** — Karteninstanz erstellen/bearbeiten: Template-Textfelder per Formular
   befüllen, Bild hochladen/verschieben/zoomen/zuschneiden, Schriftgröße/-farbe überschreiben,
   Auto-Shrink, Zuordnung zu einer Kartengruppe
4. **Rendering-Engine** — Rendern einer Karte in Zielauflösung (300 DPI) im Browser (ADR-005),
   Render-Reihenfolge Image→Shape→Icon→Frame→Text
5. **Druckprojekt & Export** — Druckbögen (A4, 3×3), Schnittmarken/Beschnitt, PDF/PNG-Export
6. **MCP-Server** — lokaler Assistant-Tool-Zugriff auf die CardMaker-API, darüber befüllt
   Claude Template-Textfelder einer Karte mit Text (zweiter Weg neben dem Formular)

Detail-Phasen entstehen im ersten Plan (`/plan`), nicht hier.

## Offene Fragen

- Bild-Crop/Zoom-Interaktion im Karteneditor: direkt über Konva-Image-Transform lösen oder
  zusätzliche Crop-UI nötig? — vor Meilenstein 3 klären.
