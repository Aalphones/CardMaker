import Konva from 'konva';

import { TextMeasurement } from './auto-shrink';

/**
 * Die eine Stelle in `rendering/`, die Konva kennen darf — sie misst, damit
 * `fitFontSize()` rechnen kann, ohne Konva zu kennen.
 *
 * Der Messknoten bekommt bewusst KEINE feste Höhe: Konva bricht beim Setzen der Textdaten
 * nur so viele Zeilen um, wie in eine fest gesetzte Höhe passen — mit fester Höhe käme also
 * nie ein Wert heraus, der größer als die Box ist, und das Verkleinern würde nie greifen.
 * Ohne feste Höhe ist die gemeldete Höhe genau Zeilenzahl × Schriftgröße × Zeilenabstand.
 */
export function measureTextHeight(measurement: TextMeasurement): number {
  const node = new Konva.Text({
    text: measurement.text,
    width: measurement.width,
    fontSize: measurement.fontSize,
    fontFamily: measurement.fontFamily,
    lineHeight: measurement.lineHeight,
    wrap: 'word',
  });
  const height = node.getClientRect({ skipTransform: true, skipShadow: true, skipStroke: true }).height;

  node.destroy();

  return height;
}
