import { CANVAS_WIDTH } from './layer';
import { canvasUnitsToPixels } from './units';

/** Druckauflösung in Bildpunkten je Zoll — 300 ist die übliche Grenze für saubere Drucke. */
export const PRINT_DPI = 300;

/**
 * 744 Bildpunkte. Eine Höhen-Konstante gibt es bewusst nicht: Die Höhe folgt aus dem
 * Kartenverhältnis (630 × 880 Einheiten) und wird dort gerechnet, wo ein Bild entsteht —
 * zwei Konstanten könnten auseinanderlaufen, das Verhältnis kann es nicht.
 */
export const PRINT_WIDTH_PX = canvasUnitsToPixels(CANVAS_WIDTH, PRINT_DPI);
