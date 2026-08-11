# Phase 5 — Template-Editor: Vollbild-Aufbau

**Rating:** heikel (Layout-Paradigma wechselt, der Editor ist der komplexeste Screen)

Heute ist der Editor ein Drei-Spalten-Gitter **innerhalb** der App-Hülle
(`grid-template-columns: 280px 1fr 340px`, unter 1200px gestapelt). Der Entwurf zeigt ihn
als Vollbild-Ebene **über** der App. Diese Phase baut nur die Hülle um — Zoom, Tastatur
und Rückgängig kommen in Phase 6 und 7.

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitt „7. Template-Editor (full-screen overlay)" — Kopfzeile,
  linke Spalte, Bühne, rechte Spalte
- `frontend/src/app/features/templates/template-editor/template-editor.{ts,html,scss}`
- `frontend/src/app/features/templates/template-editor/layer-list/`
- `frontend/src/app/signal-stores/template-editor.ts` — Bedienzustand, Arbeitskopie
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.{ts,scss}`
- `frontend/src/app/app.routes.ts` — die Editor-Route und ihr Verlassen-Schutz

## Chesterton's Fence — was hier ersetzt wird und warum es existiert

- Das **Drei-Spalten-Gitter mit Umbruch unter 1200px** entstand in Meilenstein 2, damit
  der Editor auch auf schmalen Fenstern bedienbar bleibt (Vorschau zuerst, Spalten
  darunter). Diese Fähigkeit darf nicht ersatzlos verschwinden: im Vollbild bleiben die
  Spalten unterhalb von 1000px **als einklappbare Schubladen** erhalten (siehe Checkliste).
- Der **Verlassen-Schutz** (`pendingChangesGuard`) hängt heute an der Route. Da der Editor
  eine Route bleibt (nur anders dargestellt), bleibt er unverändert wirksam — nichts daran
  ändern.

## Abnahmekriterien

- Der Editor liegt über der App: fest positioniert, alle vier Kanten auf 0, Ebene 50.
  Kopfzeile und Seitenspalte der App sind nicht sichtbar.
- **Kopfzeile** 56px hoch, Flächenfarbe, Trennlinie unten, Innenabstand 0/13.2px,
  Abstand 13.2px zwischen den Teilen:
  Textbutton „Templates" mit Pfeil-links (verlässt den Editor) · direkt bearbeitbarer
  Templatename (Caprasimo 20px, durchsichtiger Rahmen und Hintergrund, Innenabstand
  4px/8px, Radius 10px, Breite 20rem) · gedämpfter 12px-Hinweis auf ungespeicherte
  Änderungen · Freiraum · zwei Icon-Buttons für Rückgängig/Wiederherstellen
  (17px, Deckkraft 0.35 wenn nicht verfügbar; Funktion folgt in Phase 7) ·
  Zweitrang-Button „Karte erstellen" (bis Meilenstein 3 gesperrt, Titel „kommt mit dem
  Karteneditor") · Erstrang-Speichern-Button, gesperrt solange nichts geändert wurde.
- **Linke Spalte** 250px breit, Flächenfarbe, Trennlinie rechts: oben der Block-Button
  „Element hinzufügen" (Menü folgt in Phase 6), darunter die scrollende Ebenenliste
  (Innenabstand 6px, Abstand 2px), unten vier Textbuttons zu gleichen Teilen —
  „↑ nach vorn", „↓ nach hinten", „Kopie", „Löschen" (letzterer in `--color-accent-700`),
  alle gesperrt ohne Auswahl.
- **Ebenenzeile**: Augen-Umschalter (15px, gedämpft wenn versteckt), 7px großer Punkt in
  der Typfarbe, Name (13px, abgeschnitten wenn zu lang), Typbezeichnung 10px gedämpft.
  Ausgewählte Zeile auf `--color-accent-200`. Umbenennen per Doppelklick bleibt.
- **Bühne** nimmt den Rest ein, Hintergrund `--color-bg-canvas` (#474238), nichts ragt
  heraus. Die Karte liegt mittig, 630×880 Einheiten, im aktuellen Maßstab.
- **Rechte Spalte** 308px breit, Flächenfarbe, Trennlinie links, scrollt. Überschrift
  klebt oben: 11px, Großbuchstaben, Sperrung 0.09em, `--color-accent-700`.
- Unter 1000px Fensterbreite lassen sich beide Spalten über je einen Griff ein- und
  ausklappen; die Bühne bleibt immer sichtbar.
- Der Schutz vor ungespeicherten Änderungen greift unverändert beim Verlassen.

## Checkliste

- [x] `template-editor.html` und `.scss` auf den Vollbild-Aufbau umstellen. Das Umschalten
      der Darstellung ist reine Gestaltung — Zustand und Datenfluss aus dem Signal-Store
      bleiben unangetastet.
- [x] Kopfzeile neu bauen. Rückgängig/Wiederherstellen als Icon-Buttons **anlegen und
      dauerhaft gesperrt lassen**; Phase 7 verdrahtet sie. Keine Attrappe ohne Sperre.
- [x] Die App-Hülle darf beim geöffneten Editor nicht mitscrollen: solange der Editor
      offen ist, bekommt `body` `overflow: hidden`.
- [x] `layer-list` auf die neue Zeilendarstellung umstellen (Punkt in Typfarbe,
      Typbezeichnung). Typfarben als Zweck-Token festlegen: Text `--color-accent-500`,
      Bild `--color-accent-2-500`, Icon `--color-accent-300`, Form `--color-neutral-500`,
      Rahmen `--color-neutral-700`. Das Ziehen zum Umsortieren (CDK) bleibt.
- [x] Fußzeile der linken Spalte mit den vier Aktionen aufbauen; sie rufen die bereits
      vorhandenen Store-Methoden auf, es entsteht keine neue Logik.
- [x] Bühne: Hintergrundfarbe und das Übersteuern des Kartenschattens in
      `card-canvas.scss` prüfen — das Schachbrett hinter der Karte bleibt erhalten.
- [x] Einklappbare Spalten für schmale Fenster umsetzen (Griffe mit `aria-expanded`).
- [x] `docs/code-map.md`: Beschreibung von `template-editor/` auf Vollbild-Aufbau
      aktualisieren, den Satz zum Drei-Spalten-Gitter ersetzen.

## Report-Back

**Status:** complete. `npm run lint` und `npm run build` laufen sauber durch.

**Was entstanden ist**

- Der Editor liegt fest positioniert über der App (alle Kanten 0, Ebene 50). Solange er
  offen ist, trägt `body` die Klasse `editor-open` (`overflow: hidden`); die Komponente
  entfernt sie beim Verlassen wieder.
- Kopfzeile 56px mit Zurück-Textbutton, direkt bearbeitbarem Namen in Caprasimo,
  Hinweis „Nicht gespeichert", Rückgängig/Wiederherstellen (angelegt und **fest gesperrt**,
  Deckkraft 0.35), gesperrtem „Karte erstellen" und dem Speichern-Button.
- Linke Spalte 250px mit Hinzufügen-Knopf, scrollender Ebenenliste und der neuen Fußzeile;
  rechte Spalte 308px mit klebender Überschrift „Eigenschaften"; dazwischen die dunkle Bühne.
- Ebenenzeile neu: Augen-Umschalter (SVG statt Emoji), 7px-Punkt in der Typfarbe, Name,
  Typbezeichnung. Umbenennen per Doppelklick und das Ziehen zum Umsortieren bleiben.
- Unter 1000px werden beide Spalten zu Schubladen über der Bühne, je ein Griff mit
  `aria-expanded`; eingeklappt sind sie auch für den Tabulator weg (`visibility: hidden`).

**Abweichungen und bewusste Entscheidungen**

- **Das Zeilenmenü (⋮) ist weg.** Es trug „Duplizieren" und „Löschen" — beides steht jetzt
  in der Fußzeile der Spalte, wie der Entwurf es vorsieht. Keine Funktion verloren, nur
  umgezogen; die Löschabfrage ist dieselbe.
- **Zwei neue Zweck-Token** über den Kontrakt der README hinaus, beide additiv:
  `--shadow-canvas-card` (Kartenumrandung, von der Umgebung gesetzt) und die fünf
  `--color-layer-*` für die Typpunkte. Der Löschen-Knopf nutzt `--color-accent-text`, das
  bereits auf `--color-accent-700` zeigt — so bleibt die Regel „nur Zweck-Token" heil.
- **Zoom- und Status-Pille fehlen bewusst** — sie gehören zu Phase 6. Attrappen wären
  Blindtext gewesen.

**Wo ich mir am wenigsten sicher bin**

Die Einpassung der Karte auf der Bühne: `template-editor.scss` setzt
`container-type: size` auf die Bühne und leitet die Kartenhöhe über Container-Einheiten ab
(`min(100cqh, 100cqw * 880 / 630)`), inklusive einer Überschreibung der Breitenregel, die
`card-canvas` selbst mitbringt. Das ist rechnerisch sauber, aber nur im Browser wirklich zu
sehen — Sichtprüfung: Karte mittig, unverzerrt, kein Überstand, bei sehr breitem **und**
sehr flachem Fenster.
