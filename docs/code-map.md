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
| `fonts` | Schriftvorrat — hochgeladene Schriftdateien (WOFF2/TTF/OTF, max. 2 MB), hinter der Anmeldung ausgeliefert. Der Name für CSS ist immer `cmfont-<Kennung>` und wird berechnet, nie gespeichert; der Wunschname des Nutzers ist reine Beschriftung. Backend und Speicher stehen, noch keine Oberfläche |
| `templates` | Template-Editor: Layer-System, Konva-Canvas, Live-Vorschau. Backend, Speicher, Übersichtsliste, Kartenvorschau, Ebenenliste, Eigenschaftenspalte und direkte Bearbeitung im Bild (Anfasser zum Verschieben/Skalieren/Drehen) stehen — das Layout liegt als ein JSON-Datenblock in `templates.layers` (ADR-014), geprüft von `LayerValidator`, nicht von der Datenbank. Die Schrift einer Textebene (`font_family`) ist dabei entweder eine eingebaute Schrift oder `cmfont-<Kennung>` einer hochgeladenen — welche hochgeladenen es gibt, holt `TemplateService` einmal pro Speichervorgang und reicht es dem Prüfer durch. Eine Textebene kennt zusätzlich `font_bold`/`font_italic` (Wahrheitswerte, künstlich vom Browser gerechnet statt aus einer zweiten Schriftdatei geladen). Vorschaubild-Ablage steht (`TemplatePreviewController`/`TemplatePreviewService`, gemeinsamer Baustein `PreviewImageStorage`, Endpunkte `/api/templates/{id}/preview*`, ADR-021). Der Editor erzeugt das Bild nach jedem erfolgreichen Speichern selbst: `CardCanvas.exportPng()` zeichnet die Bühne ohne Anfasser in ein PNG fester Breite, `features/templates/template-preview.ts` lädt es hoch — schlägt das fehl, bleibt es bei einer Hinweismeldung. Die Anzeige in der Übersicht folgt in Phase 3 des Vorschaubilder-Plans. Meilenstein 2 ist abgeschlossen |
| `cards` | Karteneditor: Karteninstanz erstellen/bearbeiten — Textfelder per Formular/MCP befüllen, Bild direkt an der Karte hochladen/zuschneiden. Backend komplett: Kartendaten (`CardController`/`CardService`/`CardRepository`/`CardValidator`), Kartenbilder (`CardImageController`/`CardImageService`/`CardImageRepository`/`CardImageValidator`, eigener Ordner `backend/uploads/cards/`, ADR-017) und Vorschaubild-Ablage (`CardPreviewController`/`CardPreviewService`, derselbe `PreviewImageStorage`-Baustein wie bei Templates, Endpunkte `/api/cards/{id}/preview*`, ADR-021 — Erzeugen des Bildes beim Speichern und Anzeige in der Kartenliste kommen mit Phase 5/7 des Karteneditor-Plans), Endpunkte `/api/cards*` inkl. `/api/cards/{id}/images*`. Noch keine Oberfläche |
| `print-projects` | Druckprojekt-Verwaltung, Druckbogen-Export (PDF/PNG) |
| `prompts` | Reine Anzeigeseite unter `/prompts`: die ChatGPT-Bild-Prompts für Rahmen, Icons und Artwork in drei Reitern, je mit Kopieren-Knopf. Kein Backend, kein Store — die Texte stehen als Konstanten in `features/prompts/prompt-texts.ts` und müssen deckungsgleich zu `docs/design/prompts-chatgpt/` bleiben |

## Globale Styles

`frontend/src/styles.scss` — Token-Schicht (`:root`) und Basis-Resets, siehe
`docs/conventions/css.md`. `frontend/src/styles/_bausteine.scss` — die gemeinsamen
Bausteinklassen (Buttons, Felder, Karten, Tags, Dialog, Tabelle, Segment-Umschalter),
per `@use` eingebunden; Komponenten bauen keine eigenen Button-/Feld-Grundregeln mehr.
`frontend/src/styles/_kartenschriften.scss` — die `@font-face`-Einträge der Schriften **für
die Karten** (nicht für die Oberfläche); die Dateien liegen in `frontend/public/fonts/`,
Herkunft und Lizenz in `frontend/public/fonts/LIZENZ.md`.

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
    cards/
      cards-list/          ← Route /cards: „Alle Karten" (Rohbau, füllt Phase 5)
      card-editor/         ← Routen /cards/new und /cards/:id: Formular, Live-Vorschau und
                             Bildausschnitt (Rohbau, füllt Phase 6-8)
    prompts/
      prompt-texts.ts       ← die Prompt-Texte als Konstanten (Zweitschrift der Doku)
      prompts-page/          ← Route /prompts: drei Reiter (Rahmen/Icons/Artwork), je
                               Erklärung, Prompt-Block mit Kopieren-Knopf und „Danach"-Liste
    templates/
      template-preview.ts   ← lädt das im Editor erzeugte Vorschaubild hoch
                               (`POST /templates/{id}/preview`), am Store vorbei wie die
                               Bild-Lader — Bilddaten sind kein Server-Zustand
      templates-list/       ← Raster, Suchfeld, Leerzustand, „Neues Template"
      template-editor/       ← Route .../:id — Vollbild-Ebene über der App (fest positioniert,
                               Ebene 50): Kopfzeile (Zurück, Name direkt bearbeitbar,
                               Rückgängig/Wiederherstellen, Speichern), linke Ebenenspalte,
                               dunkle Bühne mit der Karte, rechte Eigenschaftenspalte. Unter
                               1000 px werden beide Spalten zu einklappbaren Schubladen.
                               Bedien-Zustand im Signal Store `signal-stores/template-editor.ts`
        layer-list/          ← linke Spalte: Ebenen umbenennen, Sichtbarkeit,
                               Drag-Reihenfolge (CDK, Index gedreht zum Array) und die
                               Fußzeile mit nach vorn/nach hinten/Kopie/Löschen
        add-layer-menu/      ← Block-Button oben in der linken Spalte samt Aufklappmenü der
                               sieben Elementarten (Kürzelhinweis, Pfeiltasten/Escape,
                               „Rahmen" gesperrt, wenn es schon einen gibt)
        stage-controls/      ← die beiden Pillen über der Bühne: Maßstab (−, Prozent =
                               einpassen, +, Kürzel) unten links, Zeigerposition unten rechts
        layer-properties/    ← rechte Spalte: Kopf mit Punkt + Ebenenname, dann verzweigt
                               nach Ebenentyp auf `image-properties`, `shape-properties`,
                               `icon-properties`, `frame-properties`, `text-properties`;
                               `geometry-fields` (Position/Größe), `advanced-fields`
                               (Aufklappbereich „Erweitert" — Deckkraft, Drehung, Eckradius,
                               nimmt typspezifische Zusatzfelder per Content Projection auf)
                               und `color-field` (Farbe + Hex) sind von mehreren Typen
                               wiederverwendete Unterkomponenten
        asset-picker/         ← CDK-Dialog: vorhandene Rahmen/Icons wählen (einzeln oder
                               mehrfach für die Icon-Auswahlliste) oder ein neues PNG hochladen
        font-manager/         ← CDK-Dialog, aus `text-properties` über „Schriften verwalten"
                               geöffnet: eigene Schriften auflisten, hochladen (Datei + Name),
                               umbenennen, löschen (409 bei Benutzung durch ein Template)
        shortcuts-dialog/     ← CDK-Dialog mit der Kürzelübersicht, gespeist aus derselben
                               Tabelle wie die Tastaturbedienung
        editor-shortcuts.ts   ← die eine Zuordnung Tastenereignis → Aktion (ohne Angular):
                               Kürzeltabelle, Unterdrückung in Eingabefeldern und Menüs
  shared/
    components/       ← wiederverwendbare Komponenten (u.a. confirm-dialog — CDK Dialog,
                         Rückfrage vor Löschungen; field-hint — Fragezeichen-Knopf mit
                         aufklappbarem Klartext-Hinweis; not-found; notification-list)
    guards/            ← wiederverwendbare Route-Guards (u.a. pending-changes-guard —
                          canDeactivate bei ungespeicherten Formularen)
    canvas/            ← alles, was mit Konva zeichnet — Feature-Komponenten binden nur Daten
      card-canvas/      ← die Kartenvorschau: `card-canvas.*` (Bühne, Maßstab, Schachbrett,
                           Auswahl-Umriss, ab Phase 7 der Konva-Transformer als Anfasser,
                           dazu `exportPng()` — Anfasser ausblenden, Bühne in ein PNG fester
                           Breite zeichnen, wieder einblenden) und
                           `draw-items.ts` (Ebene → Konva-Konfiguration, inkl. Platzhalter für
                           fehlende Bilder und der Ziehbarkeits-/Namens-Zuordnung der
                           ausgewählten Ebene)
      blob-image-cache.ts ← der gemeinsame Unterbau beider Bild-Lader: Blob holen,
                           Bildelement bauen, alles in einem Signal halten, Objekt-Adressen
                           beim Zerstören freigeben
      asset-image-loader.ts ← lädt Bilder aus dem Vorrat (`/assets/{id}/file`), Schlüssel ist
                           die Bild-Kennung
      card-image-loader.ts ← lädt die Motivbilder einer Karte
                           (`/cards/{id}/images/{layerId}/file`), Schlüssel `cardId:layerId`;
                           `reload()`/`forget()` nach Austausch oder Entfernen eines Bildes
      font-loader.ts    ← fordert die Kartenschriften an und meldet, welche fertig geladen sind
                           (Konva zeichnet auf ein Bitmap — das zählt für den Browser nicht als
                           Schriftverwendung, ohne diese Anforderung bliebe still die
                           Ersatzschrift stehen). Zwei Wege: mitgelieferte Schriften über
                           `document.fonts.load`, hochgeladene als Blob hinter der Anmeldung →
                           `FontFace` (wie `asset-image-loader.ts`)
      rendering/        ← reine Zeichenregeln ohne Konva-Abhängigkeit: `layer.ts` (die fünf
                           Ebenentypen + Fabrikfunktionen), `fonts.ts` (die eingebauten
                           Schriften samt Sorte und Ersatzschrift — Gegenstück zur Prüfliste
                           in `LayerValidator.php`, beide müssen deckungsgleich bleiben —
                           dazu der Namensschlüssel `cmfont-<Kennung>` für hochgeladene
                           Schriften und `renderFontFamily()`, die einzige Stelle, die
                           entscheidet, welcher Schriftname ans Canvas geht),
                           `units.ts` (Canvas-Einheiten → Pixel), `auto-shrink.ts`
                           (automatisches Verkleinern von Text), `apply-transform.ts`
                           (Konva-Transform-Ergebnis → Geometrie-Patch in Canvas-Einheiten,
                           Linien-Punkte verschieben) — ADR-005, damit Meilenstein 4 (Drucken)
                           sie wiederverwendet. Einzige Ausnahme: `measure-text.ts`, die
                           Messbrücke zu `Konva.Text`
    services/
  store/               ← NgRx Classic Store Slices (auth, card-groups, cards, templates, assets,
                          fonts, tokens — Facade Pflicht pro Domain-Slice, `auth` bislang ohne, da
                          es keine eigene Domain-UI mit Zwischen-Zustand hat). `cards` hält
                          Kurzfassungen + die geöffnete Karte; die Bilddateien selbst nicht
                          (die liegen im Render-Zwischenspeicher, s. `canvas/`)
  signal-stores/        ← NgRx Signal Stores für UI-Zustand. `template-editor.ts`: Arbeitskopie
                          der Ebenenliste, Auswahl, `dirty`, der Verlauf (zwei Stapel mit
                          Momentaufnahmen für Rückgängig/Wiederherstellen) und der Ansichts-Zustand der Bühne
                          (Maßstab „eingepasst"/„von Hand", Verschiebung, gemessene
                          Bühnengröße, Leertaste, Zeigerposition) — component-scoped (pro Editor-
                          Aufruf neu, `providers: [TemplateEditorStore]`), nicht `root`
  layout/
    shell/               ← App-Shell: Kopfzeile (Wortmarke, Konto-E-Mail, Zugriffstoken-Link,
                           Abmelden) + Seitenspalte mit vier Einträgen (Alle Karten,
                           Kartengruppen, Templates, Druckprojekte) — die ersten und letzten
                           beiden davon bis Meilenstein 3 bzw. 5 gesperrt (aria-disabled,
                           kein Link)
```

`print-projects/` und `admin/` aus der Tabelle oben existieren noch nicht — sie
entstehen erst mit den jeweiligen Folgeplänen. `cards/` steht als Rohbau: Speicher, Routen
und Bild-Lader sind fertig, die beiden Oberflächen füllen die Phasen 5-8. `templates/` hat jetzt den vollständigen
Editor (Liste, Anlegen, Vorschau, Ebenenliste, Eigenschaften, direkte Bearbeitung im Bild).

## Backend-Layout (steht)

```
backend/
  public/         ← Eintrittsstelle: index.php, diag.php
  vendor/         ← Composer, nicht im Git (ADR-012)
  storage/logs/   ← app.log (nicht im Git)
  uploads/        ← hochgeladene Rahmen und Icons, außerhalb des ausgelieferten Bereichs
                     (ADR-015); Inhalt nicht im Git, vom Hochlade-Skript ausgenommen
  uploads/fonts/  ← hochgeladene Schriftdateien, Ablagename `<Kennung>.<Format>`;
                     wird beim ersten Hochladen angelegt, dieselben Ausnahmen wie oben
  uploads/cards/  ← Motivbilder der Karten (PNG/JPEG), getrennt vom Bildvorrat (ADR-017);
                     wird beim ersten Hochladen angelegt, dieselben Ausnahmen wie oben
  uploads/previews/templates/  ← Vorschaubilder der Templates (nur PNG, ADR-021);
                     wird beim ersten Speichern im Editor angelegt, dieselben Ausnahmen wie oben
  uploads/previews/cards/      ← Vorschaubilder der Karten (nur PNG, ADR-021), dasselbe Muster
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
