# Phase 2 — Bilder und Schriften abwarten

Der Motor aus Phase 1 zeichnet sofort — mit dem, was gerade da ist. In der Live-Vorschau ist
das richtig (das Bild kommt eben eine Sekunde später nach), in einem Export ist es ein
Fehler: fehlt ein Bild, brennt sich der gestrichelte Platzhalter ein; fehlt eine Schrift,
steht der Text in der Ersatzschrift **und** das automatische Verkleinern hat die falsche
Schrift ausgemessen. Diese Phase baut das Warten ein.

## Kontext — vorher lesen

- `frontend/src/app/shared/canvas/blob-image-cache.ts` — insbesondere `images` und
  `failedKeys`. Wer wartet, braucht beides: sonst wartet er auf ein Bild, das nie kommt.
- `frontend/src/app/shared/canvas/asset-image-loader.ts`, `card-image-loader.ts`,
  `font-loader.ts` — die drei Lader, alle `providedIn: 'root'`, alle signalbasiert.
- `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` — `requestedAssetIds(layers,
  content)` und `requestedFontFamilies(layers)` liefern die Auftragslisten.
- `frontend/src/app/shared/canvas/rendering/card-content.ts` — `CardContent.images` trägt die
  Bildflächen der Karte; deren Schlüssel im Kartenbild-Lader ist `layerId`.
- `frontend/src/app/features/cards/card-editor/card-editor.ts` ab Zeile 260 — dort steht, wie
  die Vorschau heute Ebenen und Karteninhalt zusammensetzt und die Lader anstößt.

## Abnahmekriterien

- `renderPng` gibt erst zurück, wenn alle benötigten Bilder und Schriften geladen sind — oder
  endgültig gescheitert.
- Schlägt eine Datei fehl oder läuft die Wartezeit ab, wird trotzdem ein Bild geliefert; die
  betroffenen Bildflächen stehen als Klartext in `RenderResult.missing` (z. B. der Name der
  Ebene), damit der Aufrufer es sagen kann.
- Ein Export direkt nach dem Neuladen der Seite zeigt die richtigen Schriften (Punkt 2 der
  Smoke-Checkliste).
- Es gibt keine Endlosschleife: nach spätestens 10 Sekunden wird gezeichnet, egal was fehlt.

## Checkliste

- [x] `shared/canvas/render-resources.service.ts` anlegen (`providedIn: 'root'`), mit einer
      Methode `await collect(input: CardRenderInput): Promise<RenderResources>`, wobei
      `RenderResources = { images, cardImages, loadedFonts, missing }` — genau die drei Felder,
      die der `DrawContext` braucht, plus die Fehlliste.
- [x] Anfordern (nicht warten): `requestedAssetIds(input.layers, input.content)` an
      `AssetImageLoader.load()`, jede `CardImagePlacement` aus `input.content.images` an
      `CardImageLoader.load()`, `requestedFontFamilies(input.layers)` an `FontLoader.load()`.
      Die Lader ignorieren Doppelaufträge von sich aus.
- [x] Warten: ein `computed()` bauen, das „fertig" meldet, sobald **jeder** angeforderte
      Schlüssel entweder in `images` steht oder in `failedKeys` — und jede angeforderte Schrift
      in `FontLoader.loaded`. Daraus per `toObservable(…, { injector })` ein Observable,
      `filter(...)`, `first()`, `timeout({ first: 10_000, with: () => of(true) })`,
      `firstValueFrom`. Den `Injector` im Konstruktor injizieren, da `toObservable` außerhalb
      des Aufbau-Kontexts läuft.
  - [x] Kommentar dazu, **warum** gewartet wird (Platzhalter und Ersatzschrift brennen sich
        sonst ins Bild) — das ist die Sorte Warum, die man dem Code nicht ansieht.
- [x] `missing` füllen: für jeden gescheiterten oder nach Ablauf fehlenden Schlüssel den
      **Ebenennamen** nachschlagen (`input.layers`), nicht die Kennung — der Aufrufer zeigt das
      dem Nutzer.
- [x] `CardRenderer.renderPng()` umbauen: vor dem Zeichnen `collect()` aufrufen und die drei
      Felder in den `DrawContext` geben; `missing` in das `RenderResult` durchreichen.
- [x] `docs/code-map.md`: `render-resources.service.ts` unter `shared/canvas/` eintragen, mit
      einem Halbsatz, wozu sie da ist.

## Report-Back

**Status: complete.** `npm run lint` und `npm run build` grün.

### Zwei Abweichungen von der Checkliste — beide gegen dieselbe Falle

Die Checkliste wollte auf **jede** angeforderte Schrift in `FontLoader.loaded` warten. Das
wäre in genau zwei Fällen eine garantierte 10-Sekunden-Wartezeit vor jedem Export gewesen:

1. **Systemschriften.** `FontLoader.load()` lehnt alles ab, was nicht als eigene Datei
   ausgeliefert wird (`isSelfHostedFont`) — Arial, Verdana, Impact kommen vom Gerät. Sie
   landen nie in `loaded`. Der Wartesatz filtert deshalb auf selbst ausgelieferte Schriften.
   Ohne diesen Filter hätte **jede Karte mit Standardschrift** volle zehn Sekunden gewartet.
2. **Gescheiterte Schriften.** Der Schriftlader kannte bisher nur „geladen", kein
   Gegenstück zu `failedKeys` der Bild-Lader. Eine kaputte oder fehlende Schriftdatei hätte
   den Export ebenfalls in die Wartezeit laufen lassen. `FontLoader` bekommt daher ein
   `failed`-Signal, gefüllt an beiden Fehlerpfaden (Datei kommt nicht an / Browser kann sie
   nicht lesen).

Dazu Kleinkram: `AssetImageLoader` gab seine Fehlliste bisher nicht nach außen (der
gemeinsame Unterbau führte sie längst) — jetzt schon, sonst hätte ein fehlendes Icon
denselben Effekt gehabt.

### Wo es noch wackelt

`toObservable` hängt an einem Angular-Effect. Feuert der nicht (kein Change-Detection-Lauf
nach dem Aufruf), greift nach 10 Sekunden die Notbremse und es wird trotzdem gezeichnet —
kein Hänger, aber langsam. Ob der Effect verlässlich sofort läuft, entscheidet erst der
Export im echten Browser (Smoke-Punkt 2: ein Export direkt nach F5 muss **sofort** kommen,
nicht nach zehn Sekunden). Die Wartezeit ist damit auch der Prüfstein für den Filter oben.
