# Phase 4 — Frontend: Bildvorrat-Seite (Umbenennen, Multiupload, Artwork)

**Tier:** standard — normale Feature-Arbeit, Kontrakt steht (Phase 2/3), Muster im Bestand
vorhanden (`asset-picker`, `font-manager` für Umbenennen-UI).

**Voraussetzung:** Phase 2 (Backend-Endpoint) abgeschlossen.

## Kontext (lesen vor dem Start)

- `docs/code-map.md` → Feature-Tabelle, Zeile `assets`: „Backend und Speicher stehen, noch
  kein eigener UI-Screen (kommt mit dem Editor)" — diese Phase füllt genau diese Lücke, wie
  dort schon vorgesehen. Namensschema: `frontend/src/app/features/<feature>/`.
- `frontend/src/app/store/assets/assets.actions.ts` — bestehende Actions (`Load`, `Upload`,
  `Delete`). `AssetKind = 'frame' | 'icon'` (Zeile 3) muss auf `'frame' | 'icon' | 'artwork'`
  erweitert werden.
- `frontend/src/app/store/assets/assets.feature.ts` / `assets.effects.ts` /
  `assets.facade.ts` — Store-Slice komplett, `upload$`-Effect nimmt eine Datei pro Dispatch
  (Zeile 36–58 in `assets.effects.ts`). Für Multiupload: **keine neue Action**, die Seite ruft
  `assets.upload(file, kind, name)` einmal pro ausgewählter Datei in einer Schleife —
  `uploading`/`lastUploaded` im State ist heute ein Einzelwert, für eine Warteschlange reicht
  das (die Seite verfolgt selbst, wie viele Dateien noch offen sind, s. u.).
- `frontend/src/app/features/templates/template-editor/asset-picker/asset-picker.ts` +
  `.html` — vollständiges Muster für: Liste mit Thumbnail (`AssetImageLoader`), Upload-Dropzone
  (Drag&Drop + Datei-Input), Fehleranzeige. Diese Seite ist **kein Dialog** (volle Route statt
  CDK-Dialog), aber Thumbnail-Logik und Dropzone-Handling lassen sich wörtlich übernehmen.
- `frontend/src/app/features/templates/template-editor/font-manager/` (Pfad prüfen, laut
  `docs/code-map.md` Zeile 128–130: „eigene Schriften auflisten, hochladen, **umbenennen**,
  löschen") — bestes Vorbild für die Umbenennen-Interaktion (Eingabefeld erscheint,
  Enter/Blur speichert), falls vorhanden 1:1 als UI-Muster übernehmen; sonst minimal selbst
  bauen (Stift-Icon-Knopf → Textfeld ersetzt Namen → Enter/Blur ruft `rename`).
- `frontend/src/app/shared/canvas/asset-image-loader.ts` — `load(assetId)` +
  `images()`-Signal, wie in `asset-picker.ts` Zeile 42–44 benutzt.
- `frontend/src/app/layout/shell/shell.html` Zeile 84–133 — Muster für einen Sidebar-Eintrag
  (`<li><a routerLink="..." routerLinkActive="shell__nav-link--active"><svg>...</svg>
  Beschriftung</a></li>`). Ein generisches Bild-Icon (lucide „image"):
  `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/>
  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>` (gleiche `stroke`-Attribute wie die
  Nachbar-Icons übernehmen).
- `frontend/src/app/app.routes.ts` Zeile 12–94 — Routen-Liste innerhalb des geschützten
  Bereichs (`AuthGuard`), Muster für eine neue Route `{ path: 'assets', ... }`.
- `docs/conventions/angular.md` + `docs/conventions/css.md` — Styling/Komponenten-Konventionen
  (Semantic CSS, keine Utility-Klassen; Design-Tokens aus
  `docs/design/handoff-organic/design-system/styles.css`).

## Design-Entscheidungen (hier fixiert, nicht dem Umsetzer überlassen)

- **Route:** `/assets`, Feature-Ordner `frontend/src/app/features/assets/asset-library/`
  (Komponente `AssetLibrary`, Selector-Konvention wie Nachbar-Features).
- **Struktur:** ein Reiter-Umschalter oben (Rahmen / Icons / Artwork — 3 Werte, kein Dialog),
  darunter eine Liste (Thumbnail + Name inline editierbar + Löschen-Knopf), darunter eine
  Dropzone, die **mehrere** Dateien akzeptiert (`<input type="file" multiple accept="image/png"
  />` plus Drag&Drop mit `event.dataTransfer.files` als `FileList`, nicht nur `files[0]`).
- **Multiupload-Ablauf:** beim Bestätigen wird für jede ausgewählte Datei
  `assets.upload(file, currentKind, file.name)` dispatcht, **sequenziell** (eine Datei wartet
  auf `lastUploaded`/`uploading:false` der vorherigen, dann die nächste) — nicht parallel, weil
  der Store nur einen `uploading`/`lastUploaded`-Wert kennt und paralleles Dispatchen die
  Zuordnung „welche Antwort gehört zu welcher Datei" verlieren würde. Eine kleine lokale
  Warteschlange (Signal `queue: File[]`) in `AssetLibrary` reicht: ein `effect()` beobachtet
  `assets.uploading()` und `assets.lastUploaded()`/`assets.error()`, schiebt bei Leerlauf die
  nächste Datei aus der Warteschlange nach. Fortschritt anzeigen als „lädt Datei 3 von 7 hoch".
  Eine fehlgeschlagene Datei stoppt die Warteschlange nicht — Fehler sammeln, am Ende als Liste
  zeigen, weiter mit der nächsten Datei.
- **Umbenennen:** neue Store-Actions `Rename { id, name }` / `Rename Success { asset }` /
  `Rename Failure { message }`, neuer Effect `rename$` (`PATCH /assets/{id}`), neue Facade-
  Methode `rename(id, name)`. Reducer aktualisiert das betroffene Element in `items` per `map`.

## AK

1. `/assets` zeigt drei Reiter (Rahmen/Icons/Artwork), jeder listet die vorhandenen Bilder
   dieser Art mit Thumbnail.
2. Ein Klick auf einen Namen (oder einen Stift-Knopf daneben) macht ihn editierbar; Enter oder
   Fokusverlust speichert über `PATCH /api/assets/{id}`, ein Fehler zeigt eine Klartext-
   Meldung und der alte Name bleibt stehen.
3. Mehrere PNG-Dateien gleichzeitig auswählen (Datei-Dialog oder Drag&Drop mehrerer Dateien) →
   alle werden nacheinander hochgeladen, Fortschritt sichtbar, am Ende erscheinen alle in der
   Liste.
4. Löschen funktioniert wie gehabt (bestehende `Delete`-Action wiederverwendet), inkl. 409-
   Meldung, wenn ein Template das Bild noch benutzt.
5. Sidebar zeigt einen neuen Eintrag „Bildvorrat", aktiv markiert auf `/assets`.
6. Bestehender `asset-picker` im Template-Editor filtert weiterhin nur nach `frame`/`icon` —
   Artwork taucht dort **nicht** auf (Regressionscheck, siehe README-Scope-Grenze).

## Implementation

- [x] `frontend/src/app/store/assets/assets.actions.ts`: `AssetKind` →
      `'frame' | 'icon' | 'artwork'`; neue Events `Rename`, `'Rename Success'`,
      `'Rename Failure'` (Props analog `Upload`/`Delete`: `{ id: number; name: string }`,
      `{ asset: Asset }`, `{ message: string }`).
- [x] `frontend/src/app/store/assets/assets.feature.ts`: `on(rename, ...)` setzt kein eigenes
      Uploading-Flag (eigenes `renaming: boolean` + `renameError: string | null` im State,
      analog `uploading`/`uploadFileError`); `on(renameSuccess, ...)` ersetzt das Element in
      `items` per `map((asset) => asset.id === updated.id ? updated : asset)`.
- [x] `frontend/src/app/store/assets/assets.effects.ts`: neuer `rename$`-Effect, Muster wie
      `delete$` (Zeile 60–70), aber `this.api.patch<Asset>('/assets/' + id, { name })`.
- [x] `frontend/src/app/store/assets/assets.facade.ts`: `rename(id, name)`-Methode +
      `renaming`/`renameError`-Signale ergänzen.
- [x] `frontend/src/app/features/assets/asset-library/asset-library.ts` (+ `.html` + `.scss`):
      neue Komponente wie oben unter „Design-Entscheidungen" beschrieben. Reitersteuerung als
      lokales Signal `activeKind = signal<AssetKind>('frame')`.
- [x] `frontend/src/app/app.routes.ts`: neue Route `{ path: 'assets', loadComponent: () =>
      import('./features/assets/asset-library/asset-library').then((m) => m.AssetLibrary) }`
      im geschützten Bereich, gleiche Ebene wie `templates`/`prompts`.
- [x] `frontend/src/app/layout/shell/shell.html`: neuer `<li>`-Eintrag „Bildvorrat" nach
      „Templates" (vor „Bild-Prompts", da inhaltlich näher an Templates) mit `routerLink=
      "/assets"`.
- [x] `frontend/src/app/features/templates/template-editor/asset-picker/asset-picker.ts`
      Zeile 27–29 (`items`-`computed`): **keine Änderung nötig** — gegengelesen, filtert schon
      nach `this.data.kind`, das bleibt `'frame' | 'icon'` an jeder bestehenden Aufrufstelle
      (`icon-properties.ts`, `frame-properties.ts`).

## Manuelle Abnahme-Checkliste

**Zuerst (Wackelstelle — sequenzielle Warteschlange):**
- [ ] 3 PNG-Dateien gleichzeitig per Datei-Dialog auswählen, hochladen — alle drei erscheinen,
      keine geht verloren, keine doppelt.
- [ ] Eine der drei Dateien absichtlich zu groß machen (>8 MB oder Konfiguration prüfen) —
      Fehler für diese eine Datei, die anderen beiden laden trotzdem durch.

**Dann:**
- [ ] Rahmen/Icon/Artwork-Reiter je einmal öffnen, Thumbnails laden sichtbar.
- [ ] Namen ändern, Seite neu laden (F5) → neuer Name bleibt (Backend bestätigt).
- [ ] Ein per Template benutztes Bild löschen → 409-Meldung, Bild bleibt in der Liste.
- [ ] Template-Editor öffnen, Icon-Ebene → Icon-Auswahl-Dialog → Artwork-Bilder tauchen dort
      nicht auf.

## Doc-Updates

- [x] `docs/code-map.md` → Zeile zu `assets` aktualisiert: „UI-Screen `features/assets/
      asset-library/`, Route `/assets`, Sidebar-Eintrag „Bildvorrat"" statt „noch kein eigener
      UI-Screen".
- [x] `docs/code-map.md` → Frontend-Layout-Baum: neuen Ordner `features/assets/` alphabetisch
      vor `auth/` eingetragen.

## Report-Back

**Umgesetzt wie geplant**, keine Kontrakt-Abweichung. Store-Erweiterung (`Rename`-Actions,
`renaming`/`renameError`) 1:1 nach dem `fonts`-Muster. Neue Komponente `AssetLibrary` unter
`features/assets/asset-library/`, Route `/assets`, Sidebar-Eintrag „Bildvorrat" zwischen
Templates und Bild-Prompts.

**Wackelstelle laut Plan (sequenzielle Warteschlange):** Die lokale Warteschlange in
`asset-library.ts` steuert genau eine Datei gleichzeitig über einen `effect()`, der
`assets.uploading()` beobachtet — kein Store-Redesign, aber ungetestet gegen echte
Netzwerklatenz/Race-Bedingungen. Das ist die Stelle aus der manuellen Abnahme-Checkliste
unten, die zuerst geprüft werden sollte.

**Nicht angefasst (bewusst):** kein Meta-Store für `assets.nameMaxLength` — siehe
`FINDINGS.md`. Backend-Migration `M012ExtendAssetKind` ist laut `STATE.md` weiterhin nicht
angewandt; Artwork-Uploads/-Umbenennungen laufen gegen den lokalen Dev-Server erst nach dem
nächsten `POST /api/migrate`.
