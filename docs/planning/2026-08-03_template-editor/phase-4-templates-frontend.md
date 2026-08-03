# Phase 4 — Templates im Frontend: Speicher, Liste, Anlegen

**Rating:** standard · **Status:** pending

Der bekannte Weg: zwei Speicher-Bereiche nach dem Muster der Kartengruppen, eine
Übersichtsseite, ein Navigationseintrag. Dazu die Typdatei für die Ebenen — die ist die
Grundlage für alles, was danach kommt.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → „Datenmodell und Schnittstelle" (vollständig)
- `docs/conventions/state-management.md` — Facade-Pflicht, Fallstricke
- `docs/conventions/angular.md`, `docs/conventions/css.md`
- `frontend/src/app/store/card-groups/` — alle vier Dateien, das Muster
- `frontend/src/app/features/card-groups/card-groups-list/` — Raster, Suchfeld, Leerzustand
- `frontend/src/app/app.routes.ts`, `frontend/src/app/app.config.ts`
- `frontend/src/app/layout/shell/shell.html`
- `frontend/src/app/shared/components/confirm-dialog/`

## Abnahmekriterien

1. Über die Navigation erreichst du eine Template-Übersicht, die die Templates vom Server
   zeigt — mit Leerzustand, wenn noch keins da ist.
2. „Neues Template" legt eins an und führt direkt in den Editor (der in Phase 6 entsteht;
   hier reicht die Route mit einer Platzhalterseite).
3. Löschen fragt vorher nach und entfernt das Template aus der Liste.
4. Der Bildvorrat lässt sich über den Speicher laden — nachweisbar in den NgRx-DevTools.
5. `npm run lint` und `npm run build` laufen durch.

## Checkliste

- [ ] **Typdatei `frontend/src/app/shared/canvas/rendering/layer.ts`** — die Ebenentypen aus
      dem Plan-README als TypeScript. Liegt bewusst unter `rendering/` und nicht im Speicher:
      Meilenstein 4 (Drucken) braucht dieselben Typen ohne NgRx-Bezug.
      - Basistyp `LayerBase` mit `id`, `name`, `visible`.
      - `Geometry` mit `x`, `y`, `width`, `height`, `rotation`.
      - Unterscheidungstyp `Layer = ImageLayer | ShapeLayer | IconLayer | FrameLayer | TextLayer`,
        unterschieden über `type`. `ShapeLayer` intern nochmal über `shape` unterschieden
        (`RectShapeLayer | CircleShapeLayer | LineShapeLayer`).
      - Keine losen Zeichenketten: `LayerType`, `ShapeKind`, `LayerSource`, `TextAlign`,
        `TextVerticalAlign` als const-Vereinigungen (Regel „keine magischen Strings").
      - Fabrikfunktionen `createLayer(type, shape?)`, die eine neue Ebene mit sinnvollen
        Standardwerten und `crypto.randomUUID()` liefern — mittig auf dem Canvas, sichtbare
        Größe. Genau eine Stelle, an der Standardwerte stehen.
- [ ] **Schriftenliste `frontend/src/app/shared/canvas/rendering/fonts.ts`** — die sieben
      Namen aus dem Plan-README als const-Vereinigung plus Anzeigeliste.
- [ ] **Speicher-Bereich `frontend/src/app/store/templates/`** — `templates.actions.ts`,
      `templates.feature.ts`, `templates.effects.ts`, `templates.facade.ts`, exakt nach dem
      Muster von `card-groups`, inklusive `concatLatestFrom`-Absicherung im Lade-Effekt und
      der pro Schlüssel zwischengespeicherten `byId`-Auswahl in der Facade.
      Besonderheit: Der Speicher hält **zwei** Sammlungen — `summaries` (die Liste) und
      `current` (das eine vollständig geladene Template mit Ebenen). Aktionen:
      `Load`/`LoadSuccess`/`LoadFailure`, `LoadOne`/…, `Create`/…, `Save`/… (schickt Name,
      Beschreibung und die vollständige Ebenenliste per `PATCH`), `Delete`/….
      **Kein optimistisches Ändern im Reduzierer** — nur die Erfolgs-Aktion bewegt den
      Zustand (Fallstrick in `docs/conventions/state-management.md`).
- [ ] **Speicher-Bereich `frontend/src/app/store/assets/`** — dieselben vier Dateien.
      Aktionen: `Load`, `Upload` (nimmt `File`, `kind`, `name`), `Delete`. Der
      Hochlade-Effekt baut ein `FormData` und ruft es über eine neue Methode
      `Api.postForm<T>(path, formData)` auf — `HttpClient` setzt die Kopfzeile für
      `multipart` selbst, sie darf **nicht** von Hand gesetzt werden, sonst fehlt die
      Trennmarke.
- [ ] **`frontend/src/app/core/services/api.ts` ergänzen** — Methode `postForm<T>`.
- [ ] **Beide Effekt-Klassen in `app.config.ts` eintragen** (`provideEffects`) und die
      Feature-Reduzierer registrieren, wie es für `card-groups` schon geschieht.
- [ ] **Seite `frontend/src/app/features/templates/templates-list/`** — Raster mit Name,
      Beschreibung, Anzahl Ebenen, Änderungsdatum; Suchfeld; Leerzustand mit einem Satz, was
      ein Template ist; Schaltfläche „Neues Template"; Löschen über den vorhandenen
      Rückfrage-Dialog. Struktur und Klassennamen analog `card-groups-list`, BEM, nur
      Zweck-Tokens.
- [ ] **Platzhalter `frontend/src/app/features/templates/template-editor/`** — Komponente,
      die vorerst nur den Namen des geladenen Templates und den Satz „Der Editor entsteht in
      Phase 6" zeigt. Lädt das Template über die Facade. Wird in Phase 6 ersetzt, nicht
      danebengebaut.
- [ ] **Routen in `app.routes.ts`** — `templates` (Liste) und `templates/:id` (Editor,
      mit `canDeactivate: [pendingChangesGuard]`), beide träge geladen wie die bestehenden.
- [ ] **Navigationseintrag in `shell.html`** — „Templates" neben „Kartengruppen".
- [ ] **Doc-Update `docs/code-map.md`** — Frontend-Layout um `features/templates/`,
      `store/templates/`, `store/assets/` und `shared/canvas/rendering/layer.ts` ergänzen.
- [ ] **Prüfen** — `npm run lint`, `npm run build`, App starten, Liste öffnen, Template
      anlegen und löschen.

## Report-Back
