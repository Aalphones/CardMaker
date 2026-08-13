import { MM_PER_INCH } from './units';

/**
 * Wo eine Karte auf dem A4-Bogen liegt — die eine Rechnung, auf der Vorschau, PDF und PNG
 * sitzen. Alles in Millimetern, weil das die Sprache des Druckers ist; Bildpunkte entstehen
 * erst ganz am Ende über `mmToPx`.
 *
 * **Warum „Beschnitt" hier Vergrößern heißt:** Sonst legt man um das fertige Motiv einen
 * Rand aus Material, das über die Schnittkante hinausragt. Unser Kartenbild hat das nicht —
 * das interne Canvas endet exakt an der Kartenkante, es gibt nichts jenseits davon. Also
 * ziehen wir stattdessen die ganze Karte auf 65 × 90 mm auf: die Schnittlinie liegt dann
 * 1 mm innerhalb des Gedruckten, und ein leicht verrutschter Schnitt trifft immer noch
 * Motiv statt Papier. Der Preis steht so im Oberflächen-Hinweis: am Rand fällt etwas weg.
 *
 * Bewusst ohne Angular und ohne Konva — eine reine Rechnung, die überall aufgerufen werden kann.
 */

export const SHEET_WIDTH_MM = 210;
export const SHEET_HEIGHT_MM = 297;
export const CARD_WIDTH_MM = 63;
export const CARD_HEIGHT_MM = 88;
export const BLEED_MM = 1;
export const MARK_LENGTH_MM = 5;
export const MARK_WIDTH_MM = 0.2;
export const COLUMNS = 3;
export const ROWS = 3;
export const SLOTS_PER_SHEET = COLUMNS * ROWS;

/**
 * Strukturgleich zu `PrintOptions` aus dem Store — hier eigenständig, damit dieses Modul
 * nichts aus der Zustandsverwaltung mitzieht.
 */
export interface SheetOptions {
  cutMarks: boolean;
  bleed: boolean;
}

/** Nur das, was die Geometrie braucht — eine Position aus dem Druckprojekt passt darauf. */
export interface SheetItem {
  cardId: number;
  quantity: number;
}

/** Ein Platz im 3×3-Raster, unabhängig davon, ob eine Karte darin liegt. */
export interface SheetFrame {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface PrintSheetSlot extends SheetFrame {
  cardId: number;
}

export interface PrintSheet {
  index: number;
  slots: PrintSheetSlot[];
}

export interface SheetMark {
  x1Mm: number;
  y1Mm: number;
  x2Mm: number;
  y2Mm: number;
}

/** Millimeter → Bildpunkte. Jede Umrechnung geht hier durch, damit keine zweite entsteht. */
export function mmToPx(millimeters: number, dpi: number): number {
  return Math.round((millimeters / MM_PER_INCH) * dpi);
}

/**
 * Gedruckte Kartengröße und die Ränder, die dann auf dem Blatt übrig bleiben. Das Raster
 * steht ohne Abstand zwischen den Karten und sitzt mittig — ohne Beschnitt ergibt das
 * 10,5 / 16,5 mm Rand, mit Beschnitt 7,5 / 13,5 mm.
 */
export function sheetGeometry(options: SheetOptions): {
  widthMm: number;
  heightMm: number;
  marginXMm: number;
  marginYMm: number;
} {
  const overhang = options.bleed ? BLEED_MM * 2 : 0;
  const widthMm = CARD_WIDTH_MM + overhang;
  const heightMm = CARD_HEIGHT_MM + overhang;

  return {
    widthMm,
    heightMm,
    marginXMm: (SHEET_WIDTH_MM - COLUMNS * widthMm) / 2,
    marginYMm: (SHEET_HEIGHT_MM - ROWS * heightMm) / 2,
  };
}

/** Die neun Plätze eines Bogens, zeilenweise von links oben. */
export function sheetFrames(options: SheetOptions): SheetFrame[] {
  const { widthMm, heightMm, marginXMm, marginYMm } = sheetGeometry(options);
  const frames: SheetFrame[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      frames.push({
        xMm: marginXMm + column * widthMm,
        yMm: marginYMm + row * heightMm,
        widthMm,
        heightMm,
      });
    }
  }

  return frames;
}

/**
 * Verteilt die Positionen in ihrer Reihenfolge auf Bögen — jede Position so oft wie ihre
 * Anzahl, zeilenweise von links oben. Der letzte Bogen bleibt teilweise leer.
 */
export function buildSheets(items: readonly SheetItem[], options: SheetOptions): PrintSheet[] {
  const frames = sheetFrames(options);
  const cardIds = items.flatMap((item: SheetItem) =>
    Array.from({ length: Math.max(0, item.quantity) }, () => item.cardId),
  );
  const sheets: PrintSheet[] = [];

  for (let start = 0; start < cardIds.length; start += SLOTS_PER_SHEET) {
    const onThisSheet = cardIds.slice(start, start + SLOTS_PER_SHEET);

    sheets.push({
      index: sheets.length,
      // Die Plätze am Ende eines angefangenen Bogens bleiben leer und fallen hier weg.
      slots: frames.flatMap((frame: SheetFrame, position: number): PrintSheetSlot[] => {
        const cardId = onThisSheet[position];

        return cardId === undefined ? [] : [{ cardId, ...frame }];
      }),
    });
  }

  return sheets;
}

/**
 * Schnittmarken: kurze Striche in den Blatträndern, jeder die Verlängerung einer Schnittlinie.
 * Über eine Karte läuft nie ein Strich — die Marken beginnen erst außerhalb des Rasters.
 * Ohne Schnittmarken-Option gibt es nichts zu zeichnen.
 */
export function sheetMarks(options: SheetOptions): SheetMark[] {
  if (!options.cutMarks) {
    return [];
  }

  const { widthMm, heightMm, marginXMm, marginYMm } = sheetGeometry(options);
  const gridLeftMm = marginXMm;
  const gridTopMm = marginYMm;
  const gridRightMm = SHEET_WIDTH_MM - marginXMm;
  const gridBottomMm = SHEET_HEIGHT_MM - marginYMm;
  const marks: SheetMark[] = [];

  for (const xMm of cutPositions(marginXMm, widthMm, COLUMNS, options)) {
    marks.push({ x1Mm: xMm, y1Mm: gridTopMm - MARK_LENGTH_MM, x2Mm: xMm, y2Mm: gridTopMm });
    marks.push({ x1Mm: xMm, y1Mm: gridBottomMm, x2Mm: xMm, y2Mm: gridBottomMm + MARK_LENGTH_MM });
  }

  for (const yMm of cutPositions(marginYMm, heightMm, ROWS, options)) {
    marks.push({ x1Mm: gridLeftMm - MARK_LENGTH_MM, y1Mm: yMm, x2Mm: gridLeftMm, y2Mm: yMm });
    marks.push({ x1Mm: gridRightMm, y1Mm: yMm, x2Mm: gridRightMm + MARK_LENGTH_MM, y2Mm: yMm });
  }

  return marks;
}

/**
 * Die Linien einer Achse, an denen geschnitten wird — immer auf der Kante der *fertigen*
 * Karte. Ohne Beschnitt stoßen die Karten aneinander, benachbarte Kanten fallen also auf
 * dieselbe Linie (4 statt 6). Mit Beschnitt liegt die Schnittkante je 1 mm im Gedruckten,
 * jede Karte bringt dadurch zwei eigene Linien mit.
 */
function cutPositions(
  marginMm: number,
  blockSizeMm: number,
  blockCount: number,
  options: SheetOptions,
): number[] {
  const starts = Array.from(
    { length: blockCount },
    (_: unknown, block: number) => marginMm + block * blockSizeMm,
  );

  if (!options.bleed) {
    return [...starts, marginMm + blockCount * blockSizeMm];
  }

  return starts.flatMap((start: number) => [start + BLEED_MM, start + blockSizeMm - BLEED_MM]);
}
