# Meilenstein 4 — Rendering-Engine

Eine fertige Karte in Druckauflösung erzeugen — **ohne dass ein Editor offen sein muss**.
Ergebnis für den Nutzer: ein Knopf „Als Bild herunterladen" im Karteneditor und in der
Kartenliste, der ein PNG mit 744 × 1039 Bildpunkten liefert (63 × 88 mm bei 300 Bildpunkten
je Zoll). Ergebnis für die Architektur: der Motor, auf dem Meilenstein 5 die Druckbögen baut
— neun Karten pro A4-Seite lassen sich nicht rendern, indem man neunmal den Editor öffnet.

## Grundsatz

Es gibt genau **eine** Quelle für die Zeichenreihenfolge und die Zeichenregeln:
`buildDrawItems()` in `shared/canvas/card-canvas/draw-items.ts`. Der neue Motor baut daraus
Konva-Knoten im Speicher statt über die Vorlage — er erfindet keine eigenen Regeln. Die
Reihenfolge Image → Shape → Icon → Frame → Text ergibt sich weiterhin aus der Ebenenliste
des Templates, nicht aus einer neuen Sortierung.

## Entscheidungen, die schon gefallen sind (2026-08-13)

- **Umfang:** Motor + Einzelkarte herunterladen. Kein Mehrfach-Export, kein ZIP — das kommt
  mit den Druckprojekten.
- **Keine Optionen beim Herunterladen:** ein Klick, PNG, 300 Bildpunkte je Zoll,
  transparenter Hintergrund dort, wo das Template nichts zeichnet. Kein Dialog, keine
  Auflösungs- oder Formatwahl.
- **Kein Mockup vorhanden** für die Export-Oberfläche → freihändig aus den vorhandenen
  Bausteinklassen. Die Struktur steht als prüfbare Abnahmekriterien in Phase 4.
- **Ein Zeichenweg statt zwei:** die Kachel-Vorschaubilder entstehen künftig ebenfalls im
  neuen Motor, nicht mehr aus der sichtbaren Bühne des offenen Editors (Phase 5).
- **Kopfloser Renderer statt versteckter Komponente** → ADR-022 in Phase 1.

## Übersicht

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Der Render-Motor](phase-1-render-motor.md) | heikel | pending |
| 2 | [Bilder und Schriften abwarten](phase-2-bilder-und-schriften-abwarten.md) | heikel | pending |
| 3 | [Eine gespeicherte Karte ohne Editor rendern](phase-3-karte-ohne-editor.md) | standard | pending |
| 4 | [Als Bild herunterladen](phase-4-herunterladen.md) | standard | pending |
| 5 | [Vorschaubilder auf denselben Motor legen](phase-5-vorschaubilder.md) | standard | pending |

## Kontrakt (gilt ab Phase 1 als festgenagelt)

Ein Modul (Frontend), aber drei Phasen hängen an diesen Signaturen — deshalb stehen sie hier
und nicht verstreut in den Phasen.

```ts
// shared/canvas/rendering/render-input.ts  (rein, kein Angular, kein Konva)
export interface CardRenderInput {
  layers: Layer[];         // die Ebenen des Templates, unverändert
  content: CardContent;    // was die Karte beisteuert (rendering/card-content.ts)
}

// shared/canvas/rendering/print.ts
export const PRINT_DPI = 300;
/** 744 — canvasUnitsToPixels(CANVAS_WIDTH, PRINT_DPI) */
export const PRINT_WIDTH_PX: number;

// shared/canvas/card-renderer.service.ts   (providedIn: 'root')
export interface RenderResult {
  image: Blob;                       // PNG
  /** Bildflächen/Icons, deren Datei nicht geladen werden konnte — leer heißt vollständig. */
  missing: readonly string[];
}
export class CardRenderer {
  renderPng(input: CardRenderInput, targetWidthPx: number): Promise<RenderResult>;
}
```

`renderPng` erledigt alles selbst: Bilder und Schriften anfordern, auf sie warten (Phase 2),
zeichnen, ausgeben, aufräumen. Aufrufer übergeben nur Ebenen, Karteninhalt und Zielbreite.

## Finale Abnahmekriterien (Spec-first — vor Umsetzungsbeginn fixiert)

1. Der Knopf „Als Bild herunterladen" im Karteneditor liefert eine PNG-Datei mit **genau
   744 × 1039 Bildpunkten**.
2. Das heruntergeladene Bild zeigt **dieselbe Karte wie die Live-Vorschau daneben** —
   gleiche Texte, gleiche Bildausschnitte, gleiche Icons, gleiche Schriften.
3. Im Bild ist **keine Bedienhilfe** zu sehen: kein Auswahlrahmen, keine Anfasser, kein
   Rahmen um die bearbeitete Bildfläche, kein gestrichelter Platzhalter.
4. Die Texte stehen in der **richtigen Schrift**, nicht in einer Ersatzschrift — auch beim
   allerersten Export direkt nach dem Neuladen der Seite.
5. Derselbe Knopf in der Kartenliste liefert für eine gespeicherte Karte **dasselbe Bild**,
   ohne dass der Editor je geöffnet wurde.
6. Der Dateiname ist aus dem Kartennamen abgeleitet und endet auf `.png`.
7. Die Kachel-Vorschaubilder in Karten- und Template-Liste entstehen weiterhin beim
   Speichern und sehen aus wie vorher.
8. `npm run lint` und `npm run build` laufen grün.

## Smoke-Checkliste für den Bildschirm-Rundlauf

Reihenfolge ist Absicht: oben stehen die Stellen, an denen ich beim Planen am unsichersten
war (siehe „Wackelstellen" unten).

1. **Bildmaße prüfen.** Eine Karte exportieren, die Datei im Explorer öffnen → Eigenschaften
   müssen 744 × 1039 zeigen. Nicht 630 × 880, nicht 1488 × 2078.
2. **Schriftprobe.** Seite neu laden (F5), sofort eine Karte mit einer eigenen hochgeladenen
   Schrift exportieren, ohne vorher zu warten. Steht der Text in der richtigen Schrift?
3. **Bildausschnitt.** Eine Karte mit stark hereingezoomtem Motiv exportieren und Bild neben
   Vorschau legen: derselbe Ausschnitt, keine sichtbare Verschiebung an den Kanten der
   Bildfläche.
4. Karte mit Auswahl im Editor (eine Ebene angeklickt, Bildfläche aktiv) exportieren →
   keinerlei Rahmen oder Anfasser im Bild.
5. Aus der Kartenliste exportieren, ohne den Editor je geöffnet zu haben → gleiches Bild.
6. Karte mit langem Text exportieren → das automatische Verkleinern greift genau wie in der
   Vorschau, kein abgeschnittener Text.
7. Eine Karte speichern und die Kachel in der Liste ansehen → Vorschaubild aktualisiert sich
   wie bisher. Dasselbe für ein Template im Template-Editor.

## Wackelstellen (Konfidenz-Ausweis)

- 🟡 **Konva-Bühne ohne sichtbaren Container.** Der Motor baut die Bühne auf einem `div`, das
  nie im Dokument hängt. Das ist gängige Praxis, aber ich habe es in diesem Projekt nicht
  belegt. *Check in Phase 1:* das erzeugte PNG durch `createImageBitmap` schicken und
  `width`/`height` in der Konsole ausgeben — 744 × 1039 oder es funktioniert nicht.
- 🟡 **Zuschnitt der Bildflächen beim hochskalierten Export.** Kartenbilder liegen in einer
  zuschneidenden Gruppe. Ob der Zuschnitt beim erhöhten Pixelverhältnis exakt mitwandert,
  ist Konva-Verhalten, das ich nicht aus dem Code ablesen kann. *Check:* Punkt 3 der
  Smoke-Checkliste.
- 🟡 **Zeitpunkt der Schriften.** Das automatische Verkleinern misst mit `Konva.Text` — misst
  es, bevor die Schrift da ist, sitzt die Textgröße dauerhaft falsch im Bild. Phase 2 baut
  das Warten ein. *Check:* Punkt 2 der Smoke-Checkliste.

## Risiken und Alternativen

- 🟡 **Zwei Zeichenwege statt einem.** Die sichtbare Vorschau zeichnet über die Angular-Vorlage
  (`ko-image`, `ko-rect`, …), der Motor baut dieselben Knoten von Hand. Kommt später ein
  sechster Elementtyp dazu und jemand ergänzt nur die Vorlage, fehlt er still im Export.
  Gegenmittel: beide Wege lesen dieselbe `DrawItem`-Liste, und die Zuordnung steckt in
  **einer** Datei mit einem Kommentar, der auf die Vorlage verweist.
  *Ernsthafte Alternative:* die `CardCanvas`-Komponente unsichtbar einhängen und ihr
  vorhandenes `exportPng()` benutzen — kein zweiter Zeichenweg. Verworfen, weil der Aufrufer
  dann auf Angulars Lebenszyklus warten muss (wann ist die Bühne fertig gezeichnet?), die
  Bühnengröße von der gemessenen Fensterbreite abhängt statt fest zu sein, und Meilenstein 5
  neun solcher Komponenten gleichzeitig einhängen müsste. Der Handbetrieb ist die kleinere
  Wunde.
- 🟡 **Phase 5 fasst funktionierenden Code an.** Die Vorschaubilder laufen heute. Sie auf den
  neuen Motor zu legen, ist Aufräumen, kein neues Feature — deshalb steht die Phase ganz
  hinten und hat einen eigenen Prüfpunkt in der Smoke-Checkliste.

## Zusammenfassung

_(beim Archivieren füllen)_

## Berührte Dateien

_(beim Archivieren füllen)_

## Commits

_(beim Archivieren füllen)_

## Abweichungen vom Plan

_(beim Archivieren füllen)_

## Folgearbeiten

_(beim Archivieren füllen)_
