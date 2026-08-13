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
| `cards` | Karteneditor: Karteninstanz erstellen/bearbeiten — Textfelder per Formular/MCP befüllen, Bild direkt an der Karte hochladen/zurechtschieben/zoomen, Schriftgröße/-farbe/Fett/Kursiv überschreiben, Kartengruppe zuordnen. Backend komplett: Kartendaten (`CardController`/`CardService`/`CardRepository`/`CardValidator`), Kartenbilder (`CardImageController`/`CardImageService`/`CardImageRepository`/`CardImageValidator`, eigener Ordner `backend/uploads/cards/`, ADR-017) und Vorschaubild-Ablage (`CardPreviewController`/`CardPreviewService`, derselbe `PreviewImageStorage`-Baustein wie bei Templates, Endpunkte `/api/cards/{id}/preview*`, ADR-021). Frontend komplett: Liste (`cards-list/`, mit Suche/Filter/Sortierung/Duplizieren/Löschen) und Editor (`card-editor/`, Formular + Live-Vorschau + Bild ziehen/zoomen). Meilenstein 3 ist abgeschlossen |
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

## Frontend-Layout (Kartengruppen seit Meilenstein 1, Template-Editor seit Meilenstein 2, Karteneditor seit Meilenstein 3)

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
      cards-list/          ← Route /cards: „Alle Karten" — Raster/Tabelle-Umschalter, Suche,
                             Template-Filter, Gruppen-Chips, Sortierung, Kachel zeigt das
                             Vorschaubild (`shared/canvas/preview-image-loader.ts`)
      card-editor/         ← Routen /cards/new und /cards/:id: linke Formularspalte (Name,
                             Template-Auswahl, je Bildfläche ein Ablagefeld, je Textfeld ein
                             Block mit Größe/Farbe/Fett/Kursiv als Abweichung, Icon-Auswahl als
                             Tags, Kartengruppe) und rechts die mitlaufende Live-Vorschau
                             (dieselbe Zeichenfläche wie im Template-Editor, gefüttert aus
                             Formular + Entwurfsstand; nach dem Speichern entsteht daraus das
                             Vorschaubild der Kachel). `card-fields.ts` leitet ohne Angular aus den
                             Template-Ebenen ab, welche Felder das Formular zeigt — dieselbe
                             Ableitung benutzt die Vorschau. `image-drop/` ist das Ablagefeld
                             (Ziehen-und-Ablegen, Ersetzen, Entfernen, Klartext-Fehler)
    prompts/
      prompt-texts.ts       ← die Prompt-Texte als Konstanten (Zweitschrift der Doku)
      prompts-page/          ← Route /prompts: drei Reiter (Rahmen/Icons/Artwork), je
                               Erklärung, Prompt-Block mit Kopieren-Knopf und „Danach"-Liste
    templates/
      templates-list/       ← Raster, Suchfeld, Leerzustand, „Neues Template", Kachel zeigt das
                               Vorschaubild (`shared/canvas/preview-image-loader.ts`)
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
                           ausgewählten Ebene). Bekommt die Fläche einen Karteninhalt
                           (`content`), zeichnet dieselbe Stelle die Kartenwerte statt der
                           Template-Vorgaben — ohne Platzhalter, Kartenbilder in einer
                           zuschneidenden Gruppe. Mit `imageEditing` (Phase 8) lässt sich das
                           Motiv in seiner Fläche ziehen und mit dem Mausrad zoomen; die Fläche
                           meldet nur das Ergebnis nach außen, wann gespeichert wird entscheidet
                           der Karteneditor
      card-renderer.service.ts ← zeichnet eine Karte in Druckauflösung, ohne dass ein Editor
                           offen ist: Bühne auf einem nie eingehängten `div`, PNG raus, Bühne
                           abgeräumt (ADR-022). Grundlage für „Als Bild herunterladen" und die
                           Druckbögen
      render-stage.ts   ← die eine Stelle, die die Zeichenliste ohne Angular in Konva-Knoten
                           übersetzt — Gegenstück zu `card-canvas.html`, muss mit ihr
                           gleichziehen
      blob-image-cache.ts ← der gemeinsame Unterbau beider Bild-Lader: Blob holen,
                           Bildelement bauen, alles in einem Signal halten, Objekt-Adressen
                           beim Zerstören freigeben
      asset-image-loader.ts ← lädt Bilder aus dem Vorrat (`/assets/{id}/file`), Schlüssel ist
                           die Bild-Kennung
      card-image-loader.ts ← lädt die Motivbilder einer Karte
                           (`/cards/{id}/images/{layerId}/file`), Schlüssel `cardId:layerId`;
                           `reload()`/`forget()` nach Austausch oder Entfernen eines Bildes
      preview-image-loader.ts ← lädt Kachel-Vorschaubilder für Templates **und** Karten
                           (`/{templates|cards}/{id}/preview/file`), Schlüssel
                           `sorte:id:previewUpdatedAt` — ein neues Bild lädt dadurch automatisch
                           neu. Benutzt von `templates-list` und `cards-list`
      preview-upload.service.ts ← lädt ein im Editor erzeugtes Vorschaubild hoch, ebenfalls für
                           beide Sorten. Benutzt vom Template-Editor und (Phase 7) vom
                           Karteneditor
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
                           `units.ts` (Canvas-Einheiten → Pixel), `print.ts` (Druckauflösung
                           und die daraus folgende Zielbreite von 744 Bildpunkten),
                           `render-input.ts` (was der Renderer über eine Karte braucht:
                           Ebenen + Karteninhalt), `auto-shrink.ts`
                           (automatisches Verkleinern von Text), `card-content.ts` (was eine
                           Karte zum Template beisteuert, plus die Regeln „Kartenwert schlägt
                           Template-Vorgabe" für Text, Größe, Farbe, Fett/Kursiv, Icon-Wahl
                           und die Lage des Kartenbildes in seiner Fläche — dazu die Grenzen
                           des Ausschnitts (`clampPlacement`, nie eine leere Ecke), die
                           Umkehrung Bildecke → Verschiebung und das Zoomen um einen
                           Ankerpunkt), `apply-transform.ts`
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
                           Kartengruppen, Templates, Druckprojekte) — nur „Druckprojekte" ist
                           noch gesperrt (aria-disabled, kein Link), bis Meilenstein 5
```

`print-projects/` und `admin/` aus der Tabelle oben existieren noch nicht — sie
entstehen erst mit den jeweiligen Folgeplänen. `cards/` und `templates/` sind beide
vollständig (Liste, Editor, Vorschau).

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
