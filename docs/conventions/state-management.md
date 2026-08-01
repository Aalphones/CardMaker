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

## Geplante Slices (Meilenstein 1–5)

| Slice | Store-Typ | Grund |
|---|---|---|
| `auth` | Classic Store (außerhalb Facade-Pflicht) | Server-State, aber auth-spezifische Sonderrolle |
| `characters` | Classic Store + Facade | Server-State |
| `images` | Classic Store + Facade | Server-State |
| `templates` | Classic Store + Facade | Server-State — Layer-Struktur lebt hier |
| `cards` | Classic Store + Facade | Server-State — Karteninstanzen |
| `print-projects` | Classic Store + Facade | Server-State |
| `template-editor` | SignalStore | UI-State: aktive Auswahl, Zoom-Level, Undo/Redo-Stack |
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

## Critical Rules

1. **Facade-Pflicht ohne Ausnahme für neue Domain-Slices** — direkter `Store`-Zugriff aus
   einer Feature-Component ist ein Review-Blocker.
2. **Optimistische Updates nie gleichzeitig im Reducer UND im Effect** — siehe Pitfall oben,
   führt zu invertierter Logik.
3. **Konva-Transform-Events puffern, nicht pro Frame dispatchen** — siehe Pitfall oben.
