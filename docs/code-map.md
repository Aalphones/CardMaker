# Code Map — CardMaker

Feature → Dateien, ordner-grob. Wird mit dem ersten Plan befüllt, sobald `backend/` und
`frontend/` existieren — hier vorab das geplante Namensschema, damit neue Features von
Anfang an konsistent einsortiert werden.

## Namensschema (Layer-übergreifend)

Ein Feature (z.B. `templates`) heißt in jeder Schicht gleich:

```
frontend/src/app/features/<feature>/           ← Komponenten, Editor-UI
frontend/src/app/store/<feature>/               ← NgRx Store Slice (actions/reducer/effects/selectors)
frontend/src/app/store/<feature>/<feature>.facade.ts  ← Facade (Pflicht pro Domain-Slice)
backend/src/Controllers/<Feature>Controller.php
backend/src/Services/<Feature>Service.php
backend/src/Repositories/<Feature>Repository.php
backend/src/Validators/<Feature>Validator.php
```

## Geplante Feature-Ordner (aus `docs/PROJECT.md` → Meilensteine)

| Feature | Kurzbeschreibung |
|---|---|
| `auth` | Login, JWT-Sessions, Personal Access Tokens |
| `card-groups` | Kartengruppen — Organisationseinheit für gespeicherte Karten (z. B. „Spiderman-Serie"), keine Charakterverwaltung (ADR-011) |
| `templates` | Template-Editor: Layer-System, Konva-Canvas, Live-Vorschau |
| `cards` | Karteneditor: Karteninstanz erstellen/bearbeiten — Textfelder per Formular/MCP befüllen, Bild direkt an der Karte hochladen/zuschneiden |
| `print-projects` | Druckprojekt-Verwaltung, Druckbogen-Export (PDF/PNG) |

## Geplantes Frontend-Layout

```
frontend/src/app/
  core/
    auth/           ← Guards, Interceptors, Token-Logik (ADR-008)
    services/        ← App-weite Services (api, http)
  features/
    auth/            ← Login-Seite
    card-groups/
    templates/
      editor/         ← Template-Editor (Layerliste, Konva-Canvas, Eigenschaften-Panel)
    cards/
      editor/         ← Karteneditor (inkl. Bild-Upload pro Karte)
    print-projects/
    admin/
  shared/
    components/       ← wiederverwendbare Komponenten
    canvas/            ← Konva-Wrapper-Komponenten/Direktiven (Layer-Renderer)
      rendering/        ← reine Zeichenregeln ohne Konva-Abhängigkeit (Einheiten-Umrechnung,
                           Auto-Shrink, Layer-Reihenfolge) — ADR-005
    services/
  store/               ← NgRx Classic Store Slices
  signal-stores/        ← NgRx Signal Stores (Editor-UI-State, Canvas-Selektion)
  layout/               ← App-Shell, Topbar, Navigation
```

## Geplantes Backend-Layout

```
backend/src/
  Controllers/    ← dünn: validieren → Service aufrufen → JSON zurückgeben
  Services/       ← Business-Logik, kein HTTP-Wissen
  Repositories/   ← rohe DB-Queries, typisierte Arrays/Objekte
  Validators/     ← eigene Prüfhelfer, eine Klasse pro Endpoint (ADR-006)
  Support/        ← Wegweiser, Konfigurationsleser, Prüfhelfer — Composer-Ersatz (ADR-006)
  Database/       ← Connection-Singleton, MigrationRunner
  Migrations/     ← nummerierte Migrationsdateien
  Middleware/     ← CORS, Auth, RateLimit
```

Sync-Pflicht: diese Datei bei jedem neuen Feature-Ordner nachziehen — grob halten
(Ordner-Ebene, keine Zeilennummern), damit sie Refactorings übersteht.
