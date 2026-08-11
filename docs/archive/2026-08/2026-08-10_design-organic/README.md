# Neues Aussehen: „Organic" über die ganze App

Setzt den Design-Handoff aus [`docs/design/handoff-organic/`](../../design/handoff-organic/) um: warmes,
helles Erscheinungsbild („Organic"), Caprasimo-Überschriften über Figtree, runde Formen,
Pillen-Buttons — **und** die im Entwurf gezeigte Editor-Bedienung (Vollbild, Zoom,
Ansicht verschieben, Rückgängig, Tastenkürzel).

Kommt **vor** Meilenstein 3, damit der Karteneditor direkt im neuen Aussehen entsteht
und nichts zweimal gestylt wird.

## Quelle

Der vollständige Design-Handoff liegt **im Repo** unter
[`docs/design/handoff-organic/`](../../design/handoff-organic/) — der ursprüngliche
Download-Ordner wird nicht mehr gebraucht.

| Was | Wo |
|---|---|
| Handoff-Beschreibung (Screens, Verhalten, Werte) | [`handoff-organic/README.md`](../../design/handoff-organic/README.md) |
| Token- und Klassendefinitionen (verbindlich) | [`handoff-organic/design-system/styles.css`](../../design/handoff-organic/design-system/styles.css) |
| Gestaltungsrichtung (Do/Don't) | [`handoff-organic/design-system/readme.md`](../../design/handoff-organic/design-system/readme.md) |
| Prototyp zum Nachsehen im Browser | [`handoff-organic/CardMaker.dc.html`](../../design/handoff-organic/CardMaker.dc.html) |

Der Prototyp ist **Referenz, kein Code zum Kopieren** — seine Laufzeit wird nicht portiert.
`CardMaker v1.dc.html` ist eine ältere Fassung und wird ignoriert. Zum Öffnen im Browser
werden `support.js`, `image-slot.js` und `design-system/_ds_bundle.js` gebraucht; sie
liegen deshalb mit im Ordner, obwohl aus ihnen nichts übernommen wird.

## Bewusst nicht Teil dieses Plans

- **„Alle Karten"-Screen, Karteneditor, Druckprojekt** — die gehören zu Meilenstein 3/5
  und werden dort direkt im neuen Aussehen gebaut (`2026-08-10_karteneditor/`).
- **Seltenheit an der Karte** (Gewöhnlich/Selten/Episch/Legendär) — im Entwurf nur
  Beispielinhalt, wird nicht übernommen (Entscheidung 2026-08-10). In CardMaker ist das
  ein Textfeld im Template wie jedes andere.
- **Die Bastel-Schalter des Prototyps** (`inputShape`, `showEmptyStates`) — Werkzeug des
  Designers, kein Produktmerkmal. Einzige Ausnahme: das Fangraster (`snapGrid`) bleibt als
  fester Wert von 5 Canvas-Einheiten, nicht als Bedienelement.

## Übersicht

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Token-Fundament und Grundschrift](phase-1-token-fundament.md) | heikel | complete |
| 2 | [Gemeinsame Bausteine](phase-2-bausteine.md) | standard | complete |
| 3 | [App-Rahmen, Anmeldung, Zugriffstoken](phase-3-rahmen-und-anmeldung.md) | standard | complete |
| 4 | [Kartengruppen und Template-Liste](phase-4-listen.md) | standard | complete |
| 5 | [Template-Editor: Vollbild-Aufbau](phase-5-editor-vollbild.md) | heikel | complete |
| 6 | [Template-Editor: Zoom, Ansicht, Element-Menü](phase-6-editor-ansicht.md) | heikel | complete |
| 7 | [Template-Editor: Rückgängig und Tastenkürzel](phase-7-editor-tastatur.md) | heikel | complete |
| 8 | [Eigenschaften, Bildauswahl, Doku und Abnahme](phase-8-eigenschaften-und-abschluss.md) | standard | complete |

## Kontrakt: die Token-Schicht

Ein Modul, aber der Kontrakt zwischen Phase 1 und allen folgenden Phasen ist die
Token-Schicht in `frontend/src/styles.scss`. Er gilt ab Phase 1 als eingefroren:

- **Die bestehenden Zweck-Token-Namen bleiben bestehen** (`--color-bg-base`,
  `--color-text-primary`, `--space-md`, `--radius-md` …) und werden nur **neu belegt**.
  Dadurch sehen alle 23 Komponenten-Stylesheets sofort neu aus, ohne dass jede Zeile
  angefasst werden muss.
- **Neu hinzu** kommen die Namen, die der Entwurf braucht und die es heute nicht gibt:
  `--color-surface`, `--color-divider`, `--color-bg-canvas`, `--font-family-heading`,
  `--shadow-lg`, `--radius-pill`, die Farbleitern `--color-neutral-*`, `--color-accent-*`,
  `--color-accent-2-*`.
- **Komponenten greifen weiterhin ausschließlich auf Zweck-Token zu**, nie auf die
  Farbleitern direkt (`docs/conventions/css.md`, Regel 2). Ausnahme sind die
  Bausteinklassen aus Phase 2 — die sind die Zweck-Schicht für alles Wiederkehrende.

## Finale Abnahmekriterien

1. Die App ist durchgehend hell und warm: Grundfläche `#f5ead8`, Flächen `#ebddc5`,
   Akzent Terrakotta `#c67139`. Kein Rest der violett-dunklen Palette ist mehr sichtbar —
   auch nicht in Dialogen, Toasts, Fehlermeldungen oder auf der 404-Seite.
2. Überschriften stehen in Caprasimo, Fließtext in Figtree. Buttons, Eingabefelder, Tags
   und der Segment-Umschalter sind Pillen (`999px`); Karten und Dialoge sind stark gerundet.
3. Jedes bedienbare Element hat einen sichtbaren Zeigerzustand und einen
   Tastatur-Fokusring (2px Akzent, 2px Abstand). Nirgends bleibt der blaue Browser-Ring.
4. Der Template-Editor öffnet als Vollbild über der App, mit dunkler Bühne, linker
   Ebenenspalte (250px), rechter Eigenschaftenspalte (308px), Zoom-Pille unten links und
   Status-Pille unten rechts.
5. Im Editor funktionieren: Zoom (Rad, ±, Einpassen, 100%), Ansicht verschieben
   (Leertaste+Ziehen und mittlere Maustaste), Rückgängig/Wiederherstellen über die
   Kopfzeile und die Tastatur, alle Tastenkürzel aus der Handoff-Tabelle und der
   Kürzel-Dialog über `?`.
6. Tastatureingaben im Editor greifen nicht, während in einem Eingabefeld getippt wird —
   außer Speichern; Escape verlässt dann das Feld.
7. `npm run lint` und `npm run build` laufen sauber durch.

## Summary

Die gesamte App läuft jetzt im warmen, hellen „Organic"-Look: Token-Fundament,
gemeinsame Bausteinklassen, App-Rahmen/Anmeldung/Zugriffstoken, Kartengruppen/Template-Liste,
der Template-Editor als Vollbild-Ebene (Zoom, Ansicht verschieben, Rückgängig, Tastenkürzel)
und zuletzt die Eigenschaftenspalte samt Bildauswahl. `npm run lint` und `npm run build`
laufen sauber durch.

## Files touched

23 Komponenten-Stylesheets plus `styles.scss`/`_bausteine.scss` (Phasen 1–2), App-Rahmen/
Anmeldung/Zugriffstoken (Phase 3), Kartengruppen/Template-Liste (Phase 4), Template-Editor
Grundgerüst/Ansicht/Tastatur (Phasen 5–7), Eigenschaftenspalte + Bildauswahl (Phase 8, neu:
`layer-properties/advanced-fields/`). Vollständige Liste: `git log --stat` über die Commits
unten.

## Commits

- `5d2b3ee` App-Rahmen, Anmeldung und Zugriffstoken im Organic-Look
- `8f24502` Kartengruppen und Template-Liste im Organic-Look
- `23a3837` Template-Editor als Vollbild-Ebene im Organic-Look
- `edc8614` Zoom, Ansicht verschieben und Element-Menü im Template-Editor
- `b97cfe1` Rückgängig, Tastenkürzel und Kürzel-Dialog im Template-Editor
- `46f2df4` Eigenschaftenspalte und Bildauswahl im Organic-Look

(Phase-1/2-Commits liegen vor diesem Log-Ausschnitt — Token-Fundament und Bausteine.)

## Deviations from plan

- **Bildauswahl-Dialog ohne „Abbrechen"-Knopf**: die Handoff-Beschreibung nennt nur die
  Aktion „Fertig". Abbrechen läuft jetzt wie bei der Löschbestätigung über Escape/Backdrop
  (CDK schließt dann mit `undefined`, von den Aufrufern schon als Abbruch behandelt).
- **`shadowOffsetX`/`shadowOffsetY` bei Text** stehen nicht im Handoff, existierten aber
  schon im Datenmodell und in der Vorphase — beibehalten (im Aufklappbereich „Erweitert"),
  nicht stillschweigend entfernt.
- **Prettier-Zeilenbreite** (`.prettierrc` 100 vs. Bestand ~110, siehe `FINDINGS.md`)
  bewusst nicht angefasst — Entscheidung liegt bei Sascha, siehe Follow-ups.

## Follow-ups

- 🔴 **Prettier-Zeilenbreite entscheiden**: `.prettierrc` auf 100 Zeichen, Bestand auf
  ~110 geschrieben — `npx prettier --write` formatiert sonst quer durch unbeteiligte
  Dateien. Entweder einmal komplett durchformatieren (eigener Commit) oder die Breite im
  Bestand heben.
- Kartenumrandung (`--shadow-canvas-card`) muss an jeder weiteren Stelle, die die Karte
  zeigt (Kartenliste, Druckvorschau — Meilenstein 3/5), den Token passend setzen statt in
  `card-canvas.scss` zu schreiben (`FINDINGS.md`, noch offen — Surface existiert erst dort).
- Smoke-Test steht aus (siehe Report-Back in Phase 8) — insbesondere die neue
  Eigenschaftenspalte (Aufklappbereich, Ankreuzfelder, Segment-Umschalter) und die
  umgebaute Bildauswahl (Zeilenliste, Drag&Drop, Escape-Leiter) im Browser gegenprüfen.
