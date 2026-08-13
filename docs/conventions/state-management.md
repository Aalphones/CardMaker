# State Management — NgRx Conventions

> **Source-of-truth references:**
> - Promptigofant `docs/conventions/state-management.md` (gleiches Facade-Pattern, adaptiert)
> - [ngrx.io](https://ngrx.io)
>
> Ergänzt [`angular.md`](angular.md) um NgRx-spezifische Regeln und Fallstricke.

> **Mantra:** Classic Store für *Server*-State, SignalStore für *UI*-State, nie mischen.

## Facade-Pflicht für Domain-Slices

Components greifen **nie direkt** auf `Store` für Domain-Slices zu. Pro Slice läuft eine
`<Slice>Facade` unter `frontend/src/app/store/<slice>/<slice>.facade.ts`, die alle Selektoren
als Signals exposed und Mutationen als Methoden anbietet.

### Aufbau einer Facade

- **Read-Signals** für selektierte Daten (`all`, `loaded`, `byId`, …)
- **`ensureLoaded()`** — idempotenter Lade-Trigger, dispatcht `load()` nur bei
  `loaded() === false`
- **Mutation-Methoden** (`create`, `update`, `remove`, …) als Dispatch-Wrapper

Parametrisierte Selektoren (`selectById(id)`) werden **pro Key gecached** in der Facade —
sonst legt jeder Konsument eine eigene Selector-Instanz an und NgRx-Memoization greift nicht.

### Defense-in-depth im Effect

Effects, die `load()` verarbeiten, bekommen einen `withLatestFrom`-Guard auf den
`loaded`-Selektor:

```ts
return actions$.pipe(
  ofType(SliceActions.load),
  withLatestFrom(store.select(selectLoaded)),
  filter(([, loaded]: [unknown, boolean]) => !loaded),
  switchMap(() => /* API-Call */),
);
```

### Wo direkter Store-Zugriff erlaubt bleibt

- Innerhalb `frontend/src/app/store/**` (Facade-Implementierung selbst, Effects, Reducer,
  Selectors)
- `core/services/auth.ts` (auth-spezifisch, außerhalb der Facade-Pflicht)
- `app.config.ts` (Store-Provider-Setup)

### Wo ein HTTP-Call ohne Effect erlaubt bleibt

Zwei dokumentierte Fälle, beide im Canvas-Ordner, beide mit derselben Begründung: Was sie
holen, ist **kein serialisierbarer Server-Zustand** und gehört deshalb nicht in den Store —
ein Effect müsste es trotzdem dort ablegen, um es an die Vorschau zu bekommen.

- `shared/canvas/asset-image-loader.ts` holt Bilddateien und hält sie als
  `HTMLImageElement`. Reiner Render-Cache mit eigener Lebensdauer (Objekt-Adressen werden
  beim Zerstören freigegeben).
- `shared/canvas/font-loader.ts` holt hochgeladene Schriftdateien und trägt sie als
  `FontFace` in `document.fonts` ein. Was **doch** serialisierbar ist — die Liste der
  Schriften mit Name und Kennung — liegt im Slice `store/fonts/`.

Jeder weitere Fall dieser Art braucht denselben Nachweis „nicht serialisierbar" — sonst gilt
die Effect-Regel.

## Geplante Slices (Meilenstein 1–5)

| Slice | Store-Typ | Grund |
|---|---|---|
| `auth` | Classic Store (außerhalb Facade-Pflicht) | Server-State, aber auth-spezifische Sonderrolle |
| `card-groups` | Classic Store + Facade | Server-State |
| `templates` | Classic Store + Facade | Server-State — Layer-Struktur lebt hier |
| `fonts` | Classic Store + Facade | Server-State — Liste der hochgeladenen Schriften (die Dateien selbst nicht, siehe oben) |
| `cards` | Classic Store + Facade | Server-State — Karteninstanzen |
| `print-project` | Classic Store + Facade | Server-State — genau ein Druckprojekt (ADR-024) |
| `template-editor` | SignalStore | UI-State: Arbeitskopie der Ebenenliste, aktive Auswahl, `dirty`-Flag. Component-scoped statt `root` — Kein Rückgängig-Stapel (bewusst zurückgestellt, siehe Plan-README) |
| `card-editor` | SignalStore | UI-State: Crop-Rechteck-Entwurf, ungespeicherte Textänderungen |

## Pitfalls

### Reducer laufen vor Effects auf derselbe Action

Wenn eine Action dispatcht wird, laufen **alle** Reducer zuerst, dann **alle** Effects. Ein
Effect, der `withLatestFrom(store.select(<selector>))` nutzt, um State nach einem Reducer zu
lesen, sieht den **Post-Reducer**-Snapshot — nicht den, den der User beim Klick sah.

**Symptom:** Effect-Logik, die auf „ist die Entity schon in der Collection?" verzweigt, sieht
bei einem Reducer auf derselben Action immer die invertierte Antwort.

**Fix (bevorzugt): optimistisches Update aus dem Reducer ziehen.** Nur die
Success-Action bewegt State. Response vom Server → neuer State.

```ts
// reducer — kein Handler für Foo.toggle, nur Success-Handler bewegt State
on(Foo.toggleSuccess, (state, { items }) => ({ ...state, items }));

// effect — wasPresent ist jetzt korrekt
const fooEffect = createEffect(() =>
  actions$.pipe(
    ofType(Foo.toggle),
    withLatestFrom(store.select(selectItems)),
    switchMap(([{ id }, currentItems]) => {
      const wasPresent = currentItems.some((item) => item.id === id);
      const request = wasPresent ? api.delete(...) : api.post(...);
      return from(request).pipe(map((items) => Foo.toggleSuccess({ items })));
    }),
  ),
);
```

**Konsequenz:** `failure`-Actions werden meist No-Ops — ohne optimistisches Update im Reducer
gibt es nichts zurückzurollen. Entweder Failure-Handler streichen oder als reinen
Seiteneffekt-Trigger (Toast, Log) behalten.

### Konva-Transform-Events und Reducer-Frequenz

Drag/Resize/Rotate auf einem Konva-Node feuert kontinuierlich (jeder `dragmove`-Frame).
Nicht jedes Zwischenevent dispatchen — lokal im Component/SignalStore puffern
(`template-editor`-Slice) und erst auf `dragend`/`transformend` eine Action gegen den
Classic-Store dispatchen. Sonst füllt sich die NgRx-DevTools-History mit hunderten
Zwischenständen pro Drag-Geste, und jeder Frame löst eine volle Selector-Neuberechnung aus.

**Bühnenmaßstab beim Transformer (bestätigt in Phase 7, `card-canvas.ts`):** Die
Konva-Ebene, in der die Karte zeichnet, trägt selbst `scaleX`/`scaleY` (Canvas-Einheiten →
Bildschirmpunkte, siehe `card-canvas.ts`). Ein Kind-Knoten dieser Ebene rechnet seine
eigenen `x`/`y`/`width`/`height`/`scaleX`/`scaleY` trotzdem **in Canvas-Einheiten** — Konvas
`Transformer._fitNodesInto()` invertiert den Eltern-Transform selbst, bevor es die neuen
Werte an den Knoten schreibt (`node.getParent().getAbsoluteTransform()`, siehe
`konva/lib/shapes/Transformer.js`). Nach `transformend` also `neueBreite = node.width() *
node.scaleX()` **ohne** weitere Division durch den Bühnenmaßstab — der ist in den
Konva-eigenen Werten schon herausgerechnet (`shared/canvas/rendering/apply-transform.ts`).

Was den Bühnenmaßstab **doch** braucht: die reinen Anzeige-Werte des Transformers selbst
(`anchorSize`, `borderStrokeWidth`, `rotateAnchorOffset`) — die sind literale Bildschirm-
Pixelwerte und werden beim Zeichnen genauso durch die Eltern-Skalierung vergrößert wie jede
andere Kantenbreite. Durch den Maßstab teilen, sonst sehen die Anfasser bei jeder
Fenstergröße unterschiedlich groß aus.

**`id`-Attribut meiden:** `ng2-konva` warnt selbst davor, Konvas `id`-Attribut zu benutzen
("may produce bugs"). Für die Knotensuche (`stage.findOne()`) stattdessen `name` setzen und
über den `.name`-Selektor suchen.

## Critical Rules

1. **Facade-Pflicht ohne Ausnahme für neue Domain-Slices** — direkter `Store`-Zugriff aus
   einer Feature-Component ist ein Review-Blocker.
2. **Optimistische Updates nie gleichzeitig im Reducer UND im Effect** — siehe Pitfall oben,
   führt zu invertierter Logik.
3. **Konva-Transform-Events puffern, nicht pro Frame dispatchen** — siehe Pitfall oben.
