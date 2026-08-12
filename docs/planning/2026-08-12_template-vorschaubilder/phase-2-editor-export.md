# Phase 2 — Editor erzeugt das Bild und lädt es hoch

**Rating:** heikel · **Status:** pending

Nach jedem erfolgreichen Speichern im Template-Editor entsteht aus der gezeichneten Karte ein
PNG, das an das Backend geht. Heikel ist die Stelle, weil die gezeichnete Bühne auch die
Bedien-Elemente des Editors trägt — die dürfen nicht ins Bild.

## Kontext — was vorher zu lesen ist

- `docs/planning/2026-08-12_template-vorschaubilder/README.md` — Kontrakt und Bildmaße.
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` — die Zeichenkomponente.
  Wichtig: `stageWidth` (gemessene Breite in Bildschirmpunkten), `canvasScale`,
  der Anfasser (`transformerRef`, `afterRenderEffect` am Ende des Konstruktors).
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.html` — `<ko-stage>` hat noch keine
  Vorlagen-Referenz, `<ko-transformer #transformer>` schon.
- `frontend/src/app/shared/canvas/rendering/layer.ts` — `CANVAS_WIDTH` (630),
  `CANVAS_HEIGHT` (880).
- `frontend/src/app/features/templates/template-editor/template-editor.ts` — `save()`
  (Zeile 258) und der Effekt, der auf erfolgreiches Speichern reagiert (Zeile 125–133:
  `saving()` wird dort auf `false` gesetzt).
- `frontend/src/app/core/services/api.ts` — `postForm()`.
- `frontend/src/app/shared/canvas/asset-image-loader.ts` — der begründete Präzedenzfall dafür,
  dass Bild-Verkehr **nicht** über NgRx läuft, sondern direkt über `Api`.
- Meldungen an den Nutzer: `frontend/src/app/shared/components/notification-list/` und der
  Dienst, der sie speist (im selben Ordner bzw. `core/services/` — der Umsetzer folgt dem
  Import in `notification-list.ts`).
- `docs/conventions/typescript.md`, `docs/conventions/angular.md`.

## Abnahmekriterien

1. Speichern im Editor erzeugt ein PNG von 420 × 587 px und schickt es an
   `POST /api/templates/{id}/preview`.
2. Auf dem Bild sind keine Auswahl-Anfasser und kein Auswahlrahmen zu sehen — auch dann nicht,
   wenn beim Speichern eine Ebene ausgewählt ist.
3. Der Maßstab der Bühne im Editor (herangezoomt, herausgezoomt, schmales Fenster) ändert am
   erzeugten Bild nichts: es ist immer 420 × 587 px und zeigt die ganze Karte.
4. Schlägt Erzeugen oder Hochladen fehl, bleibt das Speichern erfolgreich; der Nutzer sieht
   eine Hinweismeldung („Das Vorschaubild konnte nicht gespeichert werden.").
5. `npm run lint` und `npm run build` im `frontend/` sind grün.

## Checkliste

### Export aus der Zeichenfläche

- [ ] `card-canvas.html`: der `<ko-stage>` bekommt eine Vorlagen-Referenz `#stage`.
- [ ] `card-canvas.ts`: `private readonly stageRef = viewChild<StageComponent>('stage');`
- [ ] Neue öffentliche Methode `async exportPng(targetWidth: number): Promise<Blob | null>`:
      - Bühne holen (`this.stageRef()?.getStage()`); fehlt sie, `null` zurückgeben.
      - Anfasser vor dem Zeichnen ausblenden und danach wieder einblenden:
        `transformer.hide()` … `transformer.show()` im `finally`.
        **Nicht** `transformer.nodes([])` benutzen — das würde die Auswahl-Logik des
        `afterRenderEffect` durcheinanderbringen.
      - `pixelRatio = targetWidth / this.stageWidth()` — so kommt immer dieselbe Bildgröße
        heraus, egal wie groß die Bühne gerade gezeichnet ist. Ist `stageWidth()` 0,
        `null` zurückgeben.
      - `stage.toBlob({ pixelRatio, mimeType: 'image/png' })`. Der Typ ist in Konva als
        `Promise<unknown>` deklariert — Ergebnis mit einer Prüfung (`instanceof Blob`)
        auswerten, **keine** Typ-Behauptung mit `as`.
      - Kommentar im Code, warum ausgeblendet statt abgehängt wird und warum `pixelRatio`
        aus der gemessenen Breite kommt.

### Hochladen

- [ ] `frontend/src/app/features/templates/template-preview.service.ts` — Name nach dem
      Feature-Schema aus `docs/code-map.md`. Eine Methode:
      `upload(templateId: number, image: Blob): Observable<{ previewUpdatedAt: string }>`,
      baut ein `FormData` mit dem Feld `file` (Dateiname `preview.png`) und ruft
      `api.postForm()`. Kopfkommentar: warum kein NgRx (dieselbe Begründung wie beim
      Bild-Lader — Bilddaten sind kein Server-Zustand im Store).
- [ ] `template-editor.ts`:
      - `private readonly canvas = viewChild(CardCanvas);`
      - In dem Effekt, der das erfolgreiche Speichern erkennt (Zeile 125–133), nach
        `this.saving.set(false)` das Hochladen anstoßen — als eigene, klar benannte private
        Methode `uploadPreview(templateId: number)`, nicht inline im Effekt.
      - `uploadPreview()`: Bild erzeugen (`PREVIEW_WIDTH_PX = 420` als Konstante oben in der
        Datei), bei `null` eine Hinweismeldung zeigen und aussteigen; sonst hochladen,
        Fehler abfangen und ebenfalls als Hinweismeldung zeigen. Kein Blockieren, kein Dialog.

### Doku

- [ ] `docs/code-map.md` — `template-preview.service.ts` und die Export-Methode der
      Zeichenfläche in der `templates`-Zeile erwähnen.
- [ ] `STATE.md` — Phase 2 abgehakt, nächster Schritt Phase 3.

## Report-Back

_(vom Umsetzer zu füllen)_
