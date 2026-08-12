# Phase 3 — Gemeinsamer Bild-Lader, Übersicht zeigt die Vorschau

**Rating:** standard · **Status:** complete

Die Kacheln der Template-Übersicht zeigen oben das Bild der Karte, darunter wie bisher Name,
Ebenenzahl und Änderungsdatum.

Der Bild-Lader wird **gleich für beide Sorten gebaut** (Templates und Karten), auch wenn hier
nur die Template-Übersicht ihn benutzt: Die Kartenliste aus dem Karteneditor-Plan (Phase 5)
greift denselben Baustein ab und soll ihn nicht nachrüsten müssen.

## Kontext — was vorher zu lesen ist

- `docs/planning/2026-08-12_template-vorschaubilder/README.md` — Kontrakt.
- `frontend/src/app/features/templates/templates-list/` — alle drei Dateien.
- `frontend/src/app/store/templates/templates.actions.ts` — `TemplateSummary` (Zeile 5).
- `frontend/src/app/store/templates/templates.feature.ts` — `toSummary()` (Zeile 23): daraus
  entsteht die Kachel-Zeile nach dem Speichern, dort muss `previewUpdatedAt` mitwandern.
- `frontend/src/app/shared/canvas/blob-image-cache.ts` — der Bild-Cache, der die Dateien mit
  Anmeldung holt und als Objekt-Adresse bereitstellt. Wichtig: `images()` liefert fertige
  `HTMLImageElement`; deren `.src` ist genau die Objekt-Adresse, die ein `<img>` braucht.
- `frontend/src/app/shared/canvas/asset-image-loader.ts` — das Muster für einen Lader.
- `docs/conventions/css.md` — Klassennamen und Tokens.

## Abnahmekriterien

1. Jede Kachel mit gespeichertem Bild zeigt die Karte im Verhältnis 630 : 880, oben in der
   Kachel, ohne Verzerrung.
2. Templates ohne Bild zeigen eine gleich große, ruhige Platzhalter-Fläche mit dem Satz
   „Noch keine Vorschau — Template öffnen und speichern." Das Raster springt dadurch nicht.
3. Nach dem Speichern im Editor zeigt die Übersicht beim Zurückkehren das neue Bild, nicht das
   alte (ohne Neuladen der Seite).
4. Das Bild ist für Vorlesewerkzeuge kein Rauschen: leeres `alt`, weil der Name direkt
   darunter steht.
5. `npm run lint` und `npm run build` im `frontend/` sind grün.

## Checkliste

### Daten

- [x] `TemplateSummary` (`templates.actions.ts`) um `previewUpdatedAt: string | null` erweitern.
- [x] `Template` (dieselbe Datei) ebenso — sonst kann `toSummary()` das Feld nicht füllen.
- [x] `toSummary()` in `templates.feature.ts`: Feld durchreichen.

### Bild-Lader (für beide Sorten)

- [x] `frontend/src/app/shared/canvas/preview-image-loader.ts` — liegt in `shared/`, **nicht**
      in `features/templates/`, weil die Kartenliste ihn ebenfalls benutzt.
      `@Injectable({ providedIn: 'root' })`, innen ein `BlobImageCache<string>`.
      - Öffentlicher Sorten-Typ: `export type PreviewKind = 'templates' | 'cards';` —
        die beiden Werte sind zugleich die Pfadstücke der Endpunkte, das ist Absicht und
        gehört als Kommentar dazu.
      - `load(kind: PreviewKind, id: number, previewUpdatedAt: string): void` →
        `cache.load(key, () => api.getBlob('/' + kind + '/' + id + '/preview/file'))`.
      - **Schlüssel ist `` `${kind}:${id}:${previewUpdatedAt}` ``** — dadurch lädt ein neu
        gespeichertes Bild automatisch neu, ohne dass irgendwo eine Zwischenspeicher-Leerung
        nötig wäre. Das ist der Grund für den Zeitstempel im Kontrakt; als Kommentar in den
        Code schreiben.
      - `imageUrl(kind, id, previewUpdatedAt): string | null` — liefert
        `images().get(key)?.src ?? null`.
      - Objekt-Adressen beim Zerstören freigeben (`releaseObjectUrls()`, wie im
        `AssetImageLoader`).
- [x] `frontend/src/app/shared/canvas/preview-upload.service.ts` — ebenfalls für beide Sorten:
      `upload(kind: PreviewKind, id: number, image: Blob): Observable<{ previewUpdatedAt: string }>`.
      **Das ersetzt die in Phase 2 angelegte `template-preview.service.ts`** — beim Umsetzen
      dieser Phase wird die Datei aus Phase 2 hierher verschoben und im Template-Editor der
      Aufruf angepasst. (Steht bewusst so: Phase 2 soll nicht auf Phase 3 warten müssen.)

### Oberfläche

- [x] `templates-list.ts`: Lader injizieren; ein `effect()`, das für jeden Eintrag aus
      `filteredItems()` mit `previewUpdatedAt !== null` `load('templates', …)` anstößt.
      Eine geschützte Methode `previewUrl(item: TemplateSummary): string | null` für die
      Vorlage — keine Logik in der Vorlage.
- [x] `templates-list.html`: im Kachel-Link vor dem Kicker ein Block
      `<div class="templates-list__preview">` mit `@if (previewUrl(item); as url) { <img
      class="templates-list__preview-image" [src]="url" alt="" /> } @else { <p
      class="templates-list__preview-empty">Noch keine Vorschau …</p> }`.
- [x] `templates-list.scss`: `&__preview` mit `aspect-ratio: 630 / 880`, abgerundeten Ecken
      (`var(--radius-…)`), gedämpftem Hintergrund und `overflow: hidden`;
      `&__preview-image` mit `width: 100%`, `height: 100%`, `object-fit: contain`;
      `&__preview-empty` mittig, `var(--color-text-muted)`, kleine Schrift.
      Nur Zweck-Tokens, keine rohen Farben oder Pixelmaße (außer Haarlinien).
- [ ] Das Raster (`&__grid`) hat `minmax(17rem, 1fr)` — mit dem hohen Bild darüber prüfen, ob
      die Kacheln zu lang werden. **Falls ja, nur ergänzen, nicht ersetzen:** eine
      zusätzliche Regel für breite Fenster, die bestehende Regel bleibt stehen.
      **Nicht geprüft** — ist eine Bildschirm-Beurteilung, keine Code-Prüfung; in die
      Smoke-Checkliste aufgenommen (README, Punkt „Raster mit Vorschaubild").

### Doku

- [x] `docs/code-map.md` — `preview-image-loader.ts` und `preview-upload.service.ts` unter
      den geteilten Bausteinen (`shared/canvas/`), mit dem Hinweis, dass beide Listen sie
      benutzen.
- [x] `STATE.md` — Plan abgeschlossen, nächster Schritt: Karteneditor-Plan Phase 5;
      Verweis auf die Smoke-Checkliste in der README.

## Report-Back

Bild-Lader (`preview-image-loader.ts`) und Upload-Dienst (`preview-upload.service.ts`) liegen
wie geplant in `shared/canvas/`, sortenfähig für Templates und Karten. Die aus Phase 2
gefundene Fehlbenennung wurde eingearbeitet: der alte `features/templates/template-preview.ts`
(Klasse `TemplatePreview`) ist gelöscht, der Editor ruft jetzt `PreviewUploadService.upload(
'templates', id, image)`.

`TemplateSummary`/`Template` tragen `previewUpdatedAt`, `toSummary()` reicht es durch. Die
Übersicht lädt pro sichtbarer Kachel per `effect()` das Bild und zeigt entweder `<img>` oder den
Platzhaltersatz — beides über `previewUrl()`, keine Logik im Template.

**Nicht geprüft, weil visuell:** ob das Raster bei hohen Kacheln (630:88-Bildformat) zu lang
wird. Steht als Punkt in der Smoke-Checkliste der README, nicht blind abgehakt.

`npm run lint` und `npm run build` liefen grün.
