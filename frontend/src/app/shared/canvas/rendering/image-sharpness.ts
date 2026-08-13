import { CardImagePlacement, cardImageBox } from './card-content';
import { Layer } from './layer';
import { PRINT_DPI } from './print';
import { CardRenderInput } from './render-input';

/**
 * 10 Canvas-Einheiten sind ein Millimeter, 25,4 mm ein Zoll — macht 254 Einheiten je Zoll.
 * Das ist der Nenner aus `effektiveDpi = placement.width / (gezeichnete Breite / 254)`.
 */
const CANVAS_UNITS_PER_INCH = 254;

/**
 * Wie viele Bildpunkte je Zoll das Motiv liefert, so groß wie es gezeichnet wird — die
 * Originalmaße der Datei geteilt durch die gezeichnete Breite in Zoll. Eine Bildebene, die
 * kleiner gezeichnet wird als sie ist, hat eine höhere effektive Auflösung als ihre Datei.
 */
export function effectiveDpi(placement: CardImagePlacement, layer: Layer): number {
  if (layer.type !== 'image') {
    return Infinity;
  }

  const box = cardImageBox(layer, placement);

  if (box.width <= 0) {
    return Infinity;
  }

  return placement.width / (box.width / CANVAS_UNITS_PER_INCH);
}

/**
 * Namen der Bildebenen einer Karte, deren Motiv unter `PRINT_DPI` liegt. Eine Karte ohne
 * platziertes Bild liefert nie einen Treffer — `content.images` enthält dann nichts, worüber
 * sich iterieren ließe.
 */
export function lowResolutionLayers(input: CardRenderInput): string[] {
  const names: string[] = [];

  for (const image of input.content.images) {
    const layer = input.layers.find((candidate: Layer) => candidate.id === image.layerId);

    if (layer === undefined || layer.type !== 'image') {
      continue;
    }

    if (effectiveDpi(image, layer) < PRINT_DPI) {
      names.push(layer.name);
    }
  }

  return names;
}
