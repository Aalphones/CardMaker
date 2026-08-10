# Phase 5 — Kartenvorschau auf Konva

**Rating:** heikel · **Status:** complete (Code steht, Sichtprüfung im Browser offen)

Aus einer Ebenenliste wird ein Bild. Das Herzstück — und der Teil, den Meilenstein 4
(Drucken in 300 DPI) unverändert wiederverwenden soll. Deshalb liegt alles, was rechnet,
getrennt von allem, was zeichnet.

Diese Phase hängt nur am Datenmodell, nicht am Backend. Sie darf vor Phase 2/3 gebaut
werden, wenn es zeitlich besser passt.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → „Die fünf Ebenentypen" (die Zeichenregeln)
- `docs/decisions/005-client-side-rendering.md`
- `docs/decisions/001-canvas-rendering-konva.md`
- `docs/conventions/state-management.md` → Fallstrick „Konva-Transform-Events und
  Reducer-Frequenz"
- `frontend/src/app/shared/canvas/rendering/units.ts` — die vorhandene Umrechnung
- `frontend/src/app/shared/canvas/rendering/layer.ts` (aus Phase 4)
- `node_modules/ng2-konva/README.md` — Anwendungsbeispiel

**Was `ng2-konva` 12.0.1 bietet** (geprüft am 2026-08-03): `ko-stage` sowie
`ko-layer`, `ko-group`, `ko-rect`, `ko-circle`, `ko-ellipse`, `ko-line`, `ko-image`,
`ko-text`, `ko-transformer` und weitere über eine einzige Komponente `CoreShapeComponent`.
Alles wird über eine einzige Eingabe `[config]` gesteuert (ein Modell-Signal), Ereignisse
wie `dragend` und `transformend` sind als Ausgaben vorhanden, `getNode()` liefert den
darunterliegenden Konva-Knoten. Importiert werden nur `StageComponent` und
`CoreShapeComponent`.

## Abnahmekriterien

1. Eine Beispiel-Ebenenliste wird als Karte gezeichnet — alle fünf Typen sichtbar.
2. Die Zeichenreihenfolge stimmt: Index 0 des Arrays liegt zuunterst.
3. Ausgeblendete Ebenen (`visible: false`) erscheinen nicht.
4. Die Karte behält bei jeder Fenstergröße das Verhältnis 630:880 und ist scharf.
5. Ein Textfeld mit zu langem Text wird verkleinert, bis es passt, aber nie unter die
   Mindestgröße — und was dann noch nicht passt, wird abgeschnitten statt herauszulaufen.
6. Ein Rahmen liegt immer vollflächig, unabhängig von seiner Position in der Liste — er
   **wird** aber an seiner Listenposition gezeichnet, nicht zwangsweise zuoberst.
7. Ohne zugeordnetes Bild zeigen Bildfläche, Icon und Rahmen einen erkennbaren Platzhalter
   statt nichts.

## Checkliste

- [x] **Reine Rechenfunktion `frontend/src/app/shared/canvas/rendering/auto-shrink.ts`** —
      `fitFontSize(options): number`. Bekommt Text, Boxbreite/-höhe, Start- und
      Mindestschriftgröße, Schriftart, Zeilenabstand und eine Messfunktion als Parameter,
      liefert die größte passende Schriftgröße. Absteigend in Einer-Schritten von der
      Startgröße bis zur Mindestgröße, erste passende gewinnt. **Keine Konva-Abhängigkeit** —
      die Messfunktion wird hineingereicht. Grund als Kommentar: Meilenstein 4 misst anders
      (Zielauflösung), soll aber dieselbe Regel benutzen.
- [x] **Messbrücke `frontend/src/app/shared/canvas/rendering/measure-text.ts`** — kapselt
      das Messen mit `Konva.Text` (Knoten mit fester `width` und `wrap: 'word'` bauen,
      `getClientRect().height` lesen, Knoten wieder verwerfen).
      **Das ist der unsicherste Punkt dieser Phase.** Vor dem Weiterbauen prüfen: Textknoten
      anlegen, Text schrittweise verlängern, gemessene Höhe protokollieren. Liefert Konva
      keine brauchbare Höhe, den Ausweg nehmen: Zeilenzahl aus dem Umbruch (`textArr` am
      Konva-Textknoten) mal Schriftgröße mal Zeilenabstand. Ergebnis unten festhalten.
- [x] **Bildlader `frontend/src/app/shared/canvas/asset-image-loader.ts`** — Dienst, der zu
      einer Bildnummer ein `HTMLImageElement` liefert. Ruft `/assets/{id}/file` über den
      vorhandenen `Api`-Dienst als `blob` ab (damit der Anmelde-Abfänger greift), erzeugt
      eine Objekt-Adresse, setzt sie am Bildelement und hält beides in einer Karte im
      Speicher. Bereits geladene Nummern nicht erneut abrufen. Beim Zerstören des Dienstes
      die Objekt-Adressen wieder freigeben.
      Nach außen ein Signal je Bildnummer, damit die Vorschau von selbst neu zeichnet,
      sobald ein Bild da ist.
- [x] **Komponente `frontend/src/app/shared/canvas/card-canvas/`** — zeichnet eine
      Ebenenliste. Eingaben: `layers` (Pflicht), `selectedLayerId` (optional),
      `interactive` (Standard `false`). Ausgaben: `layerClicked`.
      - Äußerer Behälter hält das Verhältnis 630:880 (`aspect-ratio`), misst seine Breite
        und gibt dem `ko-stage` genau diese Pixelmaße. Ein `scale` auf der Konva-Ebene
        rechnet Canvas-Einheiten in Bildschirmpunkte um — **alle Ebenenwerte bleiben in
        Canvas-Einheiten**, umgerechnet wird nur einmal, am Bühnenmaßstab.
      - Für scharfe Kanten auf hochauflösenden Bildschirmen `Konva.pixelRatio` beziehungsweise
        die Bühnengröße mit `devicePixelRatio` multiplizieren.
      - Hinter der Karte ein helles Schachbrettmuster (reines CSS am Behälter), damit
        Transparenz sichtbar wird.
      - Eine `@for`-Schleife über die Ebenen, `track layer.id`, darin eine Fallunterscheidung
        nach `type`. Die Reihenfolge im Vorlagen-Baum **ist** die Zeichenreihenfolge —
        `ng2-konva` gleicht sie über eine Beobachtung des DOM ab.
      - Abbildung auf Konva: `image` → `ko-image`, `shape/rect` → `ko-rect`,
        `shape/circle` → `ko-ellipse` (Radien = halbe Breite/Höhe, damit gleiche Werte einen
        Kreis ergeben), `shape/line` → `ko-line`, `icon` → `ko-image`, `frame` → `ko-image`
        mit fest `x=0, y=0, width=630, height=880`, `text` → `ko-text`.
      - Drehung: Konva dreht um den Ursprung des Knotens; da `x`/`y` die obere linke Ecke
        sind, passt `rotation` direkt. Bei der Ellipse den Mittelpunkt entsprechend versetzen.
      - Textknoten bekommen `wrap: 'word'`, `ellipsis: true`, die per `fitFontSize`
        ermittelte Größe (nur wenn `autoShrink` an ist, sonst die Standardgröße), sowie
        Umrandung (`stroke`, `strokeWidth`, `fillAfterStrokeEnabled: true`) und Schatten.
      - Platzhalter ohne Bild: gestricheltes Rechteck in der Fläche der Ebene plus
        Beschriftung („Bildfläche", „Icon", „Rahmen fehlt").
      - `visible: false` → Ebene gar nicht erst zeichnen.
- [x] **Vorschauseite verdrahten** — die Platzhalterseite aus Phase 4 zeigt jetzt die
      Vorschau des geladenen Templates. Damit ist der Fortschritt sichtbar, bevor Phase 6
      die Bedienung baut.
- [x] **Doc-Update `docs/code-map.md`** — `shared/canvas/` ist nicht mehr leer: Eintrag für
      `card-canvas/`, `asset-image-loader.ts` und die drei Dateien unter `rendering/`.
- [x] **Doc-Update `docs/conventions/state-management.md`** — der notierte Konva-Fallstrick
      stimmt unverändert (Transform-Ereignisse kommen erst in Phase 7). Stattdessen die
      dokumentierte Ausnahme ergänzt, dass der Bildlader ohne NgRx-Effect lädt.
- [x] **Prüfen** — `npm run lint` und `npm run build` grün. **Die Sichtprüfung im Browser
      steht noch aus** und ist Sache des Users (private Profil: der Smoke-Test läuft beim
      User) — Checkliste im Report-Back.

## Report-Back

### Was steht

- `rendering/auto-shrink.ts` — `fitFontSize()`, reine Rechenfunktion, Messfunktion wird
  hineingereicht. Keine Konva-Abhängigkeit.
- `rendering/measure-text.ts` — die Messbrücke zu `Konva.Text`.
- `shared/canvas/asset-image-loader.ts` — lädt Bilder als Blob, hält sie im Speicher, gibt
  die Objekt-Adressen beim Zerstören frei.
- `shared/canvas/card-canvas/` — die Vorschau: `card-canvas.*` (Bühne, Maßstab, Schachbrett,
  Größenmessung) und `draw-items.ts` (Ebene → Konva-Konfiguration).
- `features/templates/template-editor/` — zeigt die Vorschau, dazu ein Wegwerf-Schalter
  „Beispielebenen anzeigen" mit `example-layers.ts`.
- `core/services/api.ts` — neue Methode für Blob-Abrufe.
- `styles.scss` — drei neue Zweck-Tokens für das Schachbrettmuster.

### Der unsichere Punkt ist geklärt

Die Textmessung war als heikelste Stelle markiert. Ergebnis aus dem Konva-Quelltext
(`Text._setTextData`): Ein Textknoten mit **fest gesetzter Höhe** bricht nur so viele Zeilen
um, wie in die Box passen — er meldet also **nie** eine Höhe größer als die Box, und ein
Messknoten mit fester Höhe hätte das automatische Verkleinern stillschweigend nie ausgelöst.
Der Messknoten bekommt deshalb nur eine feste Breite; die gemeldete Höhe ist dann exakt
Zeilenzahl × Schriftgröße × Zeilenabstand — der im Plan genannte Ausweg und der Hauptweg sind
also derselbe Wert. Kein Ausweg nötig.

### Abweichungen vom Plan

1. **Bildfläche zeichnet immer einen Platzhalter**, nie ein `ko-image`. Grund: Eine
   Bildflächen-Ebene hat laut Kontrakt gar keine Bildnummer — welches Bild dort landet,
   entscheidet erst die Karteninstanz (Meilenstein 3).
2. **Ein Signal für alle Bilder** statt eines pro Bildnummer. Die Vorschau leitet ihre
   Zeichenliste aus einem einzigen `computed()` ab, das ohnehin von jedem Bild abhängt —
   feinere Signale hätten hier nichts gespart, aber den Weg über „Signal im `computed()`
   anlegen" erzwungen, den Angular verbietet.
3. **Bühnengröße NICHT mit `devicePixelRatio` multipliziert.** Konva rechnet die
   Bildschirmauflösung bereits selbst ein; eine zweite Multiplikation hätte doppelt skaliert.
4. **Leere Textebenen bekommen einen Platzhalter.** Eine frisch angelegte Textebene hat noch
   keinen Text und wäre sonst unsichtbar — in Phase 6 („Vorschau ändert sich sofort") wäre
   das genau der Moment, in dem man denkt, das Anlegen sei kaputt.
5. **Zwei kleine Zugaben**: Der Auswahl-Umriss (macht die Eingabe `selectedLayerId` schon
   jetzt wirksam) und das Zeichnen der Beispielebenen — ohne die gäbe es in dieser Phase
   nichts zu sehen.
6. **Der Kartenrand ist ein Schatten, keine `border`** — eine `border` hätte das
   Seitenverhältnis des Inhaltskastens verschoben und die Bühne unten beschnitten.
