# Phase 6 — Ebenenliste & Eigenschaften

**Rating:** heikel · **Status:** done (Sichtprüfung offen)

Aus der Vorschau wird ein Werkzeug. Die linke Spalte verwaltet die Ebenen, die rechte
bearbeitet die ausgewählte. Heikel wegen der Menge an Zuständen und weil hier zum ersten
Mal ein Zwischen-Zustand entsteht, der noch nicht auf dem Server liegt.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → „Die fünf Ebenentypen" und „Bildschirmaufteilung
  des Editors" (beides verbindlich)
- `docs/conventions/state-management.md` — Classic Store für Serverdaten, Signal Store für
  Bedien-Zustand, **nie mischen**
- `docs/conventions/angular.md`, `docs/conventions/css.md`
- `frontend/src/app/shared/canvas/rendering/layer.ts` und `.../fonts.ts` (Phase 4)
- `frontend/src/app/shared/canvas/card-canvas/` (Phase 5)
- `frontend/src/app/store/templates/templates.facade.ts`, `.../store/assets/assets.facade.ts`
- `frontend/src/app/shared/guards/pending-changes-guard.ts` — die Schnittstelle, die der
  Editor bedienen muss
- `frontend/src/app/features/card-groups/card-groups-detail/` — Formularmuster
- `frontend/src/app/shared/components/confirm-dialog/`

## Abnahmekriterien

1. Der Editor zeigt die drei Spalten in den festgelegten Breiten, unter 1200 px untereinander.
2. Ebene anlegen (alle fünf Typen), umbenennen, duplizieren, löschen, Reihenfolge per Ziehen
   ändern — die Vorschau folgt jeder Änderung sofort.
3. In der Liste steht die vorderste Ebene **oben**; im gespeicherten Datenblock liegt sie
   **hinten**.
4. Die Eigenschaftenspalte zeigt genau die Felder des jeweiligen Typs, ohne Auswahl den Satz
   „Keine Ebene ausgewählt".
5. Ein zweiter Rahmen lässt sich gar nicht erst anlegen — der Eintrag ist gesperrt und sagt
   im Klartext, warum.
6. Rahmen- und Icon-Ebenen bieten eine Bildauswahl an, in der sich ein neues PNG hochladen
   lässt; das neue Bild erscheint sofort in der Vorschau.
7. Speichern schickt die vollständige Ebenenliste; danach ist der Editor wieder „sauber".
8. Verlassen mit ungespeicherten Änderungen fragt nach.
9. Jedes erklärungsbedürftige Feld hat ein Fragezeichen mit kurzem Klartext-Hinweis.

## Checkliste

- [x] **Bedien-Zustand `frontend/src/app/signal-stores/template-editor.ts`** — ein
      `signalStore` mit: `layers` (Arbeitskopie), `selectedLayerId`, `dirty`.
      Methoden: `startEditing(layers)`, `select(id)`, `addLayer(type, shape?)`,
      `renameLayer(id, name)`, `duplicateLayer(id)`, `removeLayer(id)`,
      `moveLayer(fromIndex, toIndex)`, `patchLayer(id, changes)`, `markSaved()`.
      Regeln:
      - `dirty` wird von jeder ändernden Methode gesetzt, von `startEditing` und
        `markSaved` gelöscht.
      - `duplicateLayer` erzeugt eine **neue** `id` und hängt „ (Kopie)" an den Namen.
      - `addLayer('frame')` ist nur erlaubt, wenn noch kein Rahmen existiert — abgeleitetes
        Signal `canAddFrame`, das die Oberfläche zum Sperren nutzt.
      - Serverdaten kommen **nicht** hier hinein: Der Editor liest das Template über die
        Facade und übergibt die Ebenen einmalig an `startEditing`.
- [x] **Hinweis-Baustein `frontend/src/app/shared/components/field-hint/`** — ein
      Fragezeichen-Knopf neben einem Feld, der per Klick einen kurzen Text aufklappt.
      Zugänglich: echter `<button>`, `aria-expanded`, `aria-controls`, mit der Tastatur
      bedienbar. Text kommt als Eingabe. Wird an jedem erklärungsbedürftigen Feld verwendet
      und ist ausdrücklich Teil der Abnahme.
- [x] **Editor-Rahmen `frontend/src/app/features/templates/template-editor/`** — ersetzt die
      Platzhalterseite aus Phase 4. Kopfzeile mit bearbeitbarem Template-Namen, Schaltfläche
      „Speichern" (gesperrt, solange nichts geändert wurde) und „Zurück". Darunter das
      Drei-Spalten-Gitter aus dem Plan-README. Meldet dem `pendingChangesGuard` den
      `dirty`-Zustand.
- [x] **Ebenenliste `.../template-editor/layer-list/`** — Liste in umgekehrter
      Array-Reihenfolge (vorderste Ebene oben). Pro Eintrag: Typ-Symbol, Name (per
      Doppelklick umbenennbar), Auge zum Aus-/Einblenden, Menü mit Duplizieren und Löschen
      (Löschen mit Rückfrage). Darüber eine Schaltfläche „Ebene hinzufügen" mit den sechs
      Auswahlmöglichkeiten (Bildfläche, Rechteck, Kreis, Linie, Icon, Rahmen, Text —
      Rahmen gesperrt, wenn schon einer da ist).
      Umsortieren mit `@angular/cdk/drag-drop` (bereits installiert). **Beim Umrechnen der
      Indizes aufpassen:** Die Liste ist gedreht, der Speicher nicht — der Index aus dem
      Ziehereignis muss umgerechnet werden. Genau die Stelle, die man falsch herum baut;
      eine Hilfsfunktion mit Kommentar dafür anlegen, nicht inline rechnen.
- [x] **Eigenschaftenspalte `.../template-editor/layer-properties/`** — eine Komponente, die
      nach `type` (und bei Formen zusätzlich nach `shape`) auf Unterkomponenten verzweigt:
      `image-properties`, `shape-properties`, `icon-properties`, `frame-properties`,
      `text-properties`. Jede arbeitet auf einem reaktiven Formular, gibt Änderungen über
      `patchLayer` weiter und schreibt keine Werte direkt in die Ebene.
      - Gemeinsamer Block für Geometrie (X, Y, Breite, Höhe, Drehung) und Deckkraft — als
        eigene, wiederverwendete Unterkomponente, nicht fünfmal kopiert.
      - Zahlenfelder mit denselben Grenzen wie die Prüfung im Backend (Plan-README). Was der
        Editor nicht zulässt, muss das Backend gar nicht erst ablehnen.
      - Farbfelder: `<input type="color">` plus Textfeld für den Hexwert.
      - Textebene: alle Felder aus der Tabelle im Plan-README, Schriftart aus `fonts.ts`.
      - Fragezeichen-Hinweise mindestens an: Feldschlüssel, Datenquelle, Mindestschriftgröße,
        automatisches Verkleinern, Deckkraft, Zeilenabstand, Eckradius.
- [x] **Bildauswahl `.../template-editor/asset-picker/`** — Dialog (CDK, wie der
      Rückfrage-Dialog) mit den vorhandenen Bildern der passenden Sorte als Miniaturbilder,
      Auswahl per Klick, und einem Bereich zum Hochladen einer neuen PNG-Datei (Name,
      Datei). Nach dem Hochladen ist das neue Bild ausgewählt. Fehlermeldungen des Servers
      (falsches Format, zu groß) im Klartext anzeigen, nicht verschlucken.
      Bei der Icon-Ebene mit `source: 'user'` erlaubt derselbe Dialog eine
      **Mehrfachauswahl** für `choiceAssetIds`.
- [x] **Vorschau verdrahten** — `card-canvas` bekommt die Ebenen aus dem Bedien-Zustand,
      `selectedLayerId` und `interactive: true`; ein Klick auf eine Ebene wählt sie aus (die
      Ausgabe existiert seit Phase 5).
- [x] **Speichern** — ruft die Facade mit Name, Beschreibung und der vollständigen
      Ebenenliste auf; bei Erfolg `markSaved()`. Lehnt das Backend etwas ab, die
      Feldmeldungen (`layers.<index>.<feld>`) in eine verständliche Meldung übersetzen, die
      die betroffene Ebene beim Namen nennt.
- [x] **Doc-Update `docs/code-map.md`** — Editor-Unterordner und `signal-stores/` eintragen.
- [x] **Doc-Update `docs/conventions/state-management.md`** — Zeile für `template-editor` in
      der Slice-Tabelle auf den tatsächlichen Umfang bringen (kein Rückgängig-Stapel).
- [x] **Prüfen** — `npm run lint`, `npm run build` grün. **Offen:** die neun
      Abnahmekriterien einzeln im Browser durchgehen (Sichtprüfung beim User, wie schon bei
      Phase 5).

## Report-Back

Umgesetzt wie geplant. Signal Store (`signal-stores/template-editor.ts`), Fragezeichen-Hinweis
(`field-hint`), Editor-Rahmen mit Kopfzeile/Drei-Spalten-Gitter/Guard-Anbindung, Ebenenliste
mit Drag-Reihenfolge (Index-Umrechnung wie in der README beschrieben), Eigenschaftenspalte
mit fünf Typ-Unterkomponenten plus zwei gemeinsam genutzten Bausteinen (`geometry-fields`,
`color-field`), Bildauswahl-Dialog inkl. feldgenauer Upload-Fehlermeldung, Speichern mit
Ebenennamen-Übersetzung der Backend-Feldfehler.

**Abweichung vom Plantext:** README/Checkliste sprechen an einer Stelle von „sechs”
Auswahlmöglichkeiten beim Ebene-Hinzufügen, zählen aber sieben auf (Bildfläche, Rechteck,
Kreis, Linie, Icon, Rahmen, Text) — alle sieben sind umgesetzt, das ist ein Zähler-Schnitzer
im Plantext, keine Scope-Entscheidung.

**Typ-Erweiterung, die der Plan nicht explizit nannte:** `LayerPatch`
(`shared/canvas/rendering/layer.ts`) — eine Schnittmenge aus `Partial<...>` aller fünf
Ebenentypen. Nötig, weil `Partial<Layer>` bei einer Union nur die gemeinsamen Felder
(id/name/visible/type) zulässt, aber jede Eigenschaften-Komponente typspezifische Felder
wie `fill` oder `fontSize` patchen muss.

**Verifikationstiefe:** `npm run lint` und `npm run build` grün. Die Sichtprüfung im Browser
(neun Abnahmekriterien) läuft beim User — wie schon bei Phase 5 nicht durch diese Session
geprüft, siehe Risiko-Hinweis unten.

### Wo ich mir am wenigsten sicher bin

**Drag&Drop-Indexumrechnung in `layer-list.ts` (`onDrop`)** — die Formel
(`lastIndex - previousIndex`) wurde nur auf dem Papier durchgerechnet (zwei Beispiele per
Hand), nie im Browser gezogen. Genau die Stelle, vor der die Plan-README ausdrücklich warnt.
Prüfen: eine Ebene per Ziehen von ganz oben nach ganz unten (und umgekehrt) verschieben und
die resultierende Zeichenreihenfolge in der Vorschau mit der Listenreihenfolge abgleichen.