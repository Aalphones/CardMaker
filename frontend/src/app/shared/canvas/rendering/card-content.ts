import { Geometry, IconLayer, TextLayer } from './layer';

/** Abweichung einer einzelnen Karte von dem, was die Textebene im Template vorgibt. */
export interface CardTextOverride {
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Ein Kartenbild in seiner Bildfläche. `offsetX`/`offsetY` sind Canvas-Einheiten,
 * `width`/`height` die Originalmaße der hochgeladenen Datei in Bildpunkten.
 */
export interface CardImagePlacement {
  layerId: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  width: number;
  height: number;
}

/**
 * Was eine Karte zu ihrem Template beisteuert. Bewusst ohne Angular- und ohne
 * Store-Abhängigkeit: Meilenstein 4 (Drucken) rechnet mit denselben Regeln, und die
 * Zeichenschicht soll nichts über NgRx wissen (ADR-005).
 */
export interface CardContent {
  cardId: number | null;
  values: Record<string, string>;
  iconChoices: Record<string, number>;
  textOverrides: Record<string, CardTextOverride>;
  images: CardImagePlacement[];
}

export function resolveText(layer: TextLayer, content: CardContent | null): string {
  const value = valueFor(layer, content);

  if (value === null || value.trim() === '') {
    return layer.defaultText;
  }

  return value;
}

export function resolveFontSize(layer: TextLayer, content: CardContent | null): number {
  return overrideFor(layer, content)?.fontSize ?? layer.fontSize;
}

export function resolveColor(layer: TextLayer, content: CardContent | null): string {
  return overrideFor(layer, content)?.color ?? layer.color;
}

export function resolveBold(layer: TextLayer, content: CardContent | null): boolean {
  return overrideFor(layer, content)?.bold ?? layer.bold;
}

export function resolveItalic(layer: TextLayer, content: CardContent | null): boolean {
  return overrideFor(layer, content)?.italic ?? layer.italic;
}

export function resolveIconAssetId(layer: IconLayer, content: CardContent | null): number | null {
  if (layer.source !== 'user' || content === null) {
    return layer.assetId;
  }

  return content.iconChoices[layer.id] ?? null;
}

export function findCardImage(
  layerId: string,
  content: CardContent | null,
): CardImagePlacement | null {
  if (content === null) {
    return null;
  }

  return content.images.find((image: CardImagePlacement) => image.layerId === layerId) ?? null;
}

/**
 * Wo das Kartenbild in seiner Fläche liegt — in Koordinaten **der Fläche**, deren linke obere
 * Ecke der Nullpunkt ist.
 *
 * Maßstab 1 heißt „das Bild füllt die Fläche gerade eben aus": die kürzere Seite passt genau,
 * die längere steht über und wird weggeschnitten. Erst dieser Grundmaßstab macht den
 * gespeicherten Wert vom Seitenverhältnis der Datei unabhängig — ein Hochformat und ein
 * Querformat sehen bei 1 beide gefüllt aus. Von dort aus zentriert das Bild in der Fläche und
 * wird um die gespeicherte Verschiebung versetzt.
 */
export function cardImageBox(area: Geometry, placement: CardImagePlacement): Geometry {
  const sourceWidth = placement.width > 0 ? placement.width : 1;
  const sourceHeight = placement.height > 0 ? placement.height : 1;
  const cover = Math.max(area.width / sourceWidth, area.height / sourceHeight);
  const width = sourceWidth * cover * placement.scale;
  const height = sourceHeight * cover * placement.scale;

  return {
    x: (area.width - width) / 2 + placement.offsetX,
    y: (area.height - height) / 2 + placement.offsetY,
    width,
    height,
    rotation: 0,
  };
}

function valueFor(layer: TextLayer, content: CardContent | null): string | null {
  if (layer.source !== 'user' || content === null) {
    return null;
  }

  return content.values[layer.key] ?? null;
}

function overrideFor(layer: TextLayer, content: CardContent | null): CardTextOverride | null {
  if (layer.source !== 'user' || content === null) {
    return null;
  }

  return content.textOverrides[layer.key] ?? null;
}
