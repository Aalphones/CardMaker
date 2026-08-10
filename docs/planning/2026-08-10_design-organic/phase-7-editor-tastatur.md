# Phase 7 — Template-Editor: Rückgängig und Tastenkürzel

**Rating:** heikel (Verlaufsverwaltung, globale Tastaturbehandlung)

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitte „Undo/redo", „Escape ladder", „Keyboard shortcuts"
- `frontend/src/app/signal-stores/template-editor.ts` — alle ändernden Methoden
- `frontend/src/app/features/templates/template-editor/template-editor.ts`
- Ergebnis aus Phase 6 (Zoom-Pille mit dem „?"-Button)

## Abnahmekriterien

**Rückgängig / Wiederherstellen**
- Zwei Stapel („zurück" und „vor") halten Momentaufnahmen der Ebenenliste.
- **Jede** ändernde Aktion legt vor der Änderung eine Momentaufnahme ab und leert den
  Vorwärts-Stapel: Ebene anlegen, löschen, duplizieren, umbenennen, Sichtbarkeit,
  Reihenfolge, jede Eigenschaftsänderung, jedes Ziehen und Skalieren auf der Bühne.
- Ein Ziehen oder Skalieren erzeugt **eine** Momentaufnahme pro Geste, nicht eine pro
  Mausbewegung.
- Der Stapel ist auf 50 Einträge begrenzt; ältere fallen hinten raus.
- Die Icon-Buttons in der Kopfzeile sind gesperrt, wenn der jeweilige Stapel leer ist
  (Deckkraft 0.35), und werden hier scharf geschaltet.
- Rückgängig setzt auch die Auswahl zurück, wenn die ausgewählte Ebene nicht mehr
  existiert.
- Der Zustand „ungespeichert" folgt weiterhin jeder Änderung — auch einem Rückgängig.

**Tastenkürzel** (nur bei geöffnetem Editor)

| Aktion | Tasten |
|---|---|
| Auswahl aufheben | V / Esc |
| Text / Bildfläche | T / I |
| Icon / Rahmen | K / F |
| Rechteck / Kreis / Linie | R / O / L |
| Verschieben 1 Einheit / 10 Einheiten | Pfeiltasten / Umschalt+Pfeiltasten |
| Nach vorn / nach hinten | ] / [ |
| Duplizieren | Strg+D |
| Löschen | Entf / Rücktaste |
| Sichtbarkeit umschalten | H |
| Umbenennen | F2 |
| Speichern | Strg+S |
| Rückgängig / Wiederherstellen | Strg+Z / Umschalt+Strg+Z |
| Zoom | + / − , Strg+0 (einpassen), Strg+1 (100 %) |
| Ansicht verschieben | Leertaste+Ziehen / mittlere Maustaste |
| Tastenkürzel anzeigen | ? |

- Auf macOS gilt zusätzlich die Befehlstaste, wo oben Strg steht.
- **Während in einem Eingabefeld, Textfeld oder Auswahlfeld getippt wird, greift kein
  Kürzel** — einzige Ausnahme ist Speichern. Escape verlässt in diesem Fall das Feld,
  statt die Auswahl aufzuheben.
- Kürzel, die den Browser sonst wegnehmen würde (Strg+S, Strg+D, Strg+0), werden
  abgefangen.
- **Escape-Reihenfolge**, von oben nach unten: Kürzel-Dialog schließen → Bildauswahl
  schließen → Auswahl aufheben → Editor verlassen. Escape springt nie zwei Stufen.

**Kürzel-Dialog**
- Öffnet über `?` oder den „?"-Button der Zoom-Pille. Zweispaltiges Raster
  (`1fr 1fr`, Abstand 6px/17.6px) aus Aktion und Taste. Tasten als `<kbd>`: 11px,
  Innenabstand 2px/7px, Radius 6px, `--color-neutral-200`, 1px Trennlinienrahmen.
- Der Dialog fängt den Tastaturfokus ein und gibt ihn beim Schließen an den Auslöser
  zurück.

## Checkliste

- [ ] Verlauf in `signal-stores/template-editor.ts` ergänzen: `past`, `future`,
      Methoden `pushHistory()`, `undo()`, `redo()`, abgeleitete Signale `canUndo`,
      `canRedo`. Momentaufnahme = tiefe Kopie der Ebenenliste über `structuredClone`.
- [ ] `pushHistory()` an den Anfang **genau dieser sechs** Methoden setzen (Stand
      2026-08-10, geprüft in `signal-stores/template-editor.ts`):
      `addLayer`, `renameLayer`, `duplicateLayer`, `removeLayer`, `moveLayer`,
      `patchLayer`. **Nicht** in `load`, `select`, `markSaved` — die ändern keine
      Ebenendaten. Sind beim Umsetzen weitere ändernde Methoden dazugekommen, gehören
      sie ebenfalls dazu; die tatsächlich behandelte Liste im Report-Back aufzählen.
- [ ] Ziehen/Skalieren: die Momentaufnahme beim **Beginn** der Geste ablegen
      (`dragstart`/`transformstart`), nicht bei jeder Zwischenmeldung.
- [ ] Tastaturbehandlung als eigene Datei
      `template-editor/editor-shortcuts.ts` — eine reine Zuordnung
      Tastenereignis → Aktionsname, ohne Angular-Abhängigkeit, damit sie ohne laufende
      Oberfläche nachvollziehbar bleibt. Die Editor-Komponente hängt sie an
      `window` und ruft die Store-Methoden auf.
- [ ] Die Prüfung „wird gerade getippt" gegen das Ziel-Element führen
      (`input`, `textarea`, `select`, `contenteditable`), nicht gegen einen selbst
      gepflegten Merker.
- [ ] Kürzel-Dialog als Komponente `template-editor/shortcuts-dialog/` über den
      CDK-Dialog, Inhalt aus derselben Zuordnungstabelle wie die Tastaturbehandlung —
      die Tabelle steht **einmal** im Code, nicht zweimal.
- [ ] Escape-Reihenfolge an einer Stelle entscheiden (in der Editor-Komponente), nicht
      verteilt in den einzelnen Dialogen.
- [ ] Der „?"-Button aus Phase 6 wird hier entsperrt.
- [ ] `docs/code-map.md`: `editor-shortcuts.ts` und `shortcuts-dialog/` eintragen.

## Report-Back
