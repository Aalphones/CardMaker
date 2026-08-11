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
| `templates` | Template-Editor: Layer-System, Konva-Canvas, Live-Vorschau. Backend, Speicher, Übersichtsliste, Kartenvorschau, Ebenenliste, Eigenschaftenspalte und direkte Bearbeitung im Bild (Anfasser zum Verschieben/Skalieren/Drehen) stehen — das Layout liegt als ein JSON-Datenblock in `templates.layers` (ADR-014), geprüft von `LayerValidator`, nicht von der Datenbank. Meilenstein 2 ist abgeschlossen |
| `cards` | Karteneditor: Karteninstanz erstellen/bearbeiten — Textfelder per Formular/MCP befüllen, Bild direkt an der Karte hochladen/zuschneiden |
| `print-projects` | Druckprojekt-Verwaltung, Druckbogen-Export (PDF/PNG) |

## Globale Styles

`frontend/src/styles.scss` — Token-Schicht (`:root`) und Basis-Resets, siehe
`docs/conventions/css.md`. `frontend/src/styles/_bausteine.scss` — die gemeinsamen
Bausteinklassen (Buttons, Felder, Karten, Tags, Dialog, Tabelle, Segment-Umschalter),
per `@use` eingebunden; Komponenten bauen keine eigenen Button-/Feld-Grundregeln mehr.

## Frontend-Layout (Kartengruppen seit Meilenstein 1, Template-Editor vollständig seit Meilenstein 2)

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
      template-editor/       ← Route .../:id — Vollbild-Ebene über der App (fest positioniert,
                               Ebene 50): Kopfzeile (Zurück, Name direkt bearbeitbar,
                               Rückgängig/Wiederherstellen, Speichern), linke Ebenenspalte,
                               dunkle Bühne mit der Karte, rechte Eigenschaftenspalte. Unter
                               1000 px werden beide Spalten zu einklappbaren Schubladen.
                               Bedien-Zustand im Signal Store `signal-stores/template-editor.ts`
        layer-list/          ← linke Spalte: Ebenen anlegen/umbenennen, Sichtbarkeit,
                               Drag-Reihenfolge (CDK, Index gedreht zum Array) und die
                               Fußzeile mit nach vorn/nach hinten/Kopie/Löschen
        layer-properties/    ← rechte Spalte: verzweigt nach Ebenentyp auf
                               `image-properties`, `shape-properties`, `icon-properties`,
                               `frame-properties`, `text-properties`; `geometry-fields`
                               (Geometrie + Deckkraft) und `color-field` (Farbe + Hex) sind
                               von mehreren Typen wiederverwendete Unterkomponenten
        asset-picker/         ← CDK-Dialog: vorhandene Rahmen/Icons wählen (einzeln oder
                               mehrfach für die Icon-Auswahlliste) oder ein neues PNG hochladen
  shared/
    components/       ← wiederverwendbare Komponenten (u.a. confirm-dialog — CDK Dialog,
                         Rückfrage vor Löschungen; field-hint — Fragezeichen-Knopf mit
                         aufklappbarem Klartext-Hinweis; not-found; notification-list)
    guards/            ← wiederverwendbare Route-Guards (u.a. pending-changes-guard —
                          canDeactivate bei ungespeicherten Formularen)
    canvas/            ← alles, was mit Konva zeichnet — Feature-Komponenten binden nur Daten
      card-canvas/      ← die Kartenvorschau: `card-canvas.*` (Bühne, Maßstab, Schachbrett,
                           Auswahl-Umriss, ab Phase 7 der Konva-Transformer als Anfasser) und
                           `draw-items.ts` (Ebene → Konva-Konfiguration, inkl. Platzhalter für
                           fehlende Bilder und der Ziehbarkeits-/Namens-Zuordnung der
                           ausgewählten Ebene)
      asset-image-loader.ts ← lädt hochgeladene Bilder als Blob hinter der Anmeldung und hält
                           sie als fertige Bildelemente im Speicher
      rendering/        ← reine Zeichenregeln ohne Konva-Abhängigkeit: `layer.ts` (die fünf
                           Ebenentypen + Fabrikfunktionen), `fonts.ts` (feste Schriftenliste),
                           `units.ts` (Canvas-Einheiten → Pixel), `auto-shrink.ts`
                           (automatisches Verkleinern von Text), `apply-transform.ts`
                           (Konva-Transform-Ergebnis → Geometrie-Patch in Canvas-Einheiten,
                           Linien-Punkte verschieben) — ADR-005, damit Meilenstein 4 (Drucken)
                           sie wiederverwendet. Einzige Ausnahme: `measure-text.ts`, die
                           Messbrücke zu `Konva.Text`
    services/
  store/               ← NgRx Classic Store Slices (auth, card-groups, templates, assets,
                          tokens — Facade Pflicht pro Domain-Slice, `auth` bislang ohne, da
                          es keine eigene Domain-UI mit Zwischen-Zustand hat)
  signal-stores/        ← NgRx Signal Stores für UI-Zustand. `template-editor.ts`: Arbeitskopie
                          der Ebenenliste, Auswahl, `dirty` — component-scoped (pro Editor-
                          Aufruf neu, `providers: [TemplateEditorStore]`), nicht `root`
  layout/
    shell/               ← App-Shell: Kopfzeile (Wortmarke, Konto-E-Mail, Zugriffstoken-Link,
                           Abmelden) + Seitenspalte mit vier Einträgen (Alle Karten,
                           Kartengruppen, Templates, Druckprojekte) — die ersten und letzten
                           beiden davon bis Meilenstein 3 bzw. 5 gesperrt (aria-disabled,
                           kein Link)
```

`cards/`, `print-projects/`, `admin/` aus der Tabelle oben existieren noch nicht — sie
entstehen erst mit den jeweiligen Folgeplänen. `templates/` hat jetzt den vollständigen
Editor (Liste, Anlegen, Vorschau, Ebenenliste, Eigenschaften, direkte Bearbeitung im Bild).

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
