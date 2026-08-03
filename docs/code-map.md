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
| `auth` | Login, Sitzungen und Zugriffstoken — beide als Zufallswerte in der Datenbank, kein JWT (ADR-008) |
| `card-groups` | Kartengruppen — Organisationseinheit für gespeicherte Karten (z. B. „Spiderman-Serie"), keine Charakterverwaltung (ADR-011) |
| `assets` | Bildvorrat — hochgeladene Rahmen- und Icon-Dateien, hinter der Anmeldung ausgeliefert (ADR-015). Backend und Speicher stehen, noch kein eigener UI-Screen (kommt mit dem Editor) |
| `templates` | Template-Editor: Layer-System, Konva-Canvas, Live-Vorschau. Backend, Speicher, Übersichtsliste und Anlegen stehen — das Layout liegt als ein JSON-Datenblock in `templates.layers` (ADR-014), geprüft von `LayerValidator`, nicht von der Datenbank. Der eigentliche Editor (Canvas, Ebenenliste) entsteht in Phase 6 |
| `cards` | Karteneditor: Karteninstanz erstellen/bearbeiten — Textfelder per Formular/MCP befüllen, Bild direkt an der Karte hochladen/zuschneiden |
| `print-projects` | Druckprojekt-Verwaltung, Druckbogen-Export (PDF/PNG) |

## Frontend-Layout (steht seit Phase 5, Kartengruppen seit Phase 7)

```
frontend/src/app/
  core/
    auth/           ← Guards, Interceptors, Token-Logik (ADR-008)
    services/        ← App-weite Services (api, http)
  features/
    auth/
      login/               ← Anmeldeseite
      tokens/tokens-page/  ← Zugriffstoken-Verwaltung (anlegen, auflisten, löschen)
    card-groups/
      card-groups-list/    ← Raster, Suchfeld, Leerzustand
      card-groups-detail/  ← Formular Anlegen/Bearbeiten (Routen .../new, .../:id)
    templates/
      templates-list/       ← Raster, Suchfeld, Leerzustand, „Neues Template"
      template-editor/       ← Platzhalter (Route .../:id) — der echte Editor entsteht in
                               Phase 6 des Template-Editor-Plans
  shared/
    components/       ← wiederverwendbare Komponenten (u.a. confirm-dialog — CDK Dialog,
                         Rückfrage vor Löschungen; not-found; notification-list)
    guards/            ← wiederverwendbare Route-Guards (u.a. pending-changes-guard —
                          canDeactivate bei ungespeicherten Formularen)
    canvas/            ← Konva-Wrapper-Komponenten/Direktiven (Layer-Renderer, noch leer —
                          entsteht erst mit dem Template-Editor-Plan)
      rendering/        ← reine Zeichenregeln ohne Konva-Abhängigkeit: `layer.ts` (die fünf
                           Ebenentypen + Fabrikfunktionen), `fonts.ts` (feste Schriftenliste)
                           — ADR-005, ohne Konva-Abhängigkeit, damit Meilenstein 4 (Drucken)
                           sie wiederverwendet
    services/
  store/               ← NgRx Classic Store Slices (auth, card-groups, templates, assets,
                          tokens — Facade Pflicht pro Domain-Slice, `auth` bislang ohne, da
                          es keine eigene Domain-UI mit Zwischen-Zustand hat)
  signal-stores/        ← NgRx Signal Stores (noch leer — Editor-UI-State, Canvas-Selektion
                          entstehen erst mit Template-/Karteneditor)
  layout/
    shell/               ← App-Shell, Topbar, Navigation
```

`cards/`, `print-projects/`, `admin/` aus der Tabelle oben existieren noch nicht — sie
entstehen erst mit den jeweiligen Folgeplänen. `templates/` existiert bereits (Liste,
Anlegen, Editor-Platzhalter), der Konva-Editor selbst folgt in Phase 6.

## Backend-Layout (steht)

```
backend/
  public/         ← Eintrittsstelle: index.php, diag.php
  vendor/         ← Composer, nicht im Git (ADR-012)
  storage/logs/   ← app.log (nicht im Git)
  uploads/        ← hochgeladene Rahmen und Icons, außerhalb des ausgelieferten Bereichs
                     (ADR-015); Inhalt nicht im Git, vom Hochlade-Skript ausgenommen
  .env            ← von deploy.cmd geschrieben, nicht im Git
  src/
    Controllers/    ← dünn: validieren → Service aufrufen → JSON zurückgeben
    Services/       ← Business-Logik, kein HTTP-Wissen
    Repositories/   ← rohe DB-Queries, typisierte Arrays/Objekte
    Validators/     ← Prüfregeln pro Endpoint (respect/validation)
    Database/       ← Connection-Singleton, MigrationRunner
    Migrations/     ← nummerierte Migrationsdateien
    Middleware/     ← CORS, Auth, RateLimit
    Http/           ← Request (Wire-Format-Grenze), Response
    Support/        ← schichtfreie Helfer (Timestamps, WireFormat für die snake_case/camelCase-Grenze)
api-bridge/       ← drei Dateien, die im ausgelieferten Bereich landen und das
                     Backend von nebenan einbinden (ADR-013)
```

## Hochladen

| Datei | Zweck |
|---|---|
| `deploy.cmd` | Doppelklick: Composer, Frontend-Build, `backend/.env` schreiben, drei Abgleiche per WinSCP |
| `deploy.env` | Zugangsdaten und Zielpfade, nicht im Git — Vorlage: `deploy.env.example` |

Zielaufbau auf dem Server (ADR-013): `backend/` neben dem ausgelieferten Bereich,
`api-bridge/` landet darin unter `public/api/`, das Frontend direkt in `public/`.

Sync-Pflicht: diese Datei bei jedem neuen Feature-Ordner nachziehen — grob halten
(Ordner-Ebene, keine Zeilennummern), damit sie Refactorings übersteht.
