import { Geometry, IconLayer, TextLayer } from './layer';
import { Point } from './units';

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

/**
 * Was der Template-Editor dem Renderer mitgibt: kein Karteninhalt, nur die Ebenen. Der
 * `CardRenderInput`-Kontrakt verlangt `CardContent`, kein `null` — diese Konstante ist die
 * leere Ausprägung davon.
 */
export const EMPTY_CARD_CONTENT: CardContent = {
  cardId: null,
  values: {},
  iconChoices: {},
  textOverrides: {},
  images: [],
};

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
  const size = scaledImageSize(area, placement);

  return {
    x: (area.width - size.width) / 2 + placement.offsetX,
    y: (area.height - size.height) / 2 + placement.offsetY,
    width: size.width,
    height: size.height,
    rotation: 0,
  };
}

/**
 * Unter 1 wäre die Fläche nicht mehr gefüllt — es gäbe nichts zu sehen außer Lücke. Nach oben
 * ist bei 10 Schluss, darüber ist von jedem Motiv nur noch Farbbrei übrig.
 */
export const MIN_CARD_IMAGE_SCALE = 1;
export const MAX_CARD_IMAGE_SCALE = 10;

export function clampCardImageScale(scale: number): number {
  if (!Number.isFinite(scale)) {
    return MIN_CARD_IMAGE_SCALE;
  }

  return Math.min(MAX_CARD_IMAGE_SCALE, Math.max(MIN_CARD_IMAGE_SCALE, scale));
}

/**
 * Hält Verschiebung und Maßstab in den Grenzen, in denen die Fläche lückenlos gefüllt bleibt:
 * das Bild darf nie so weit wandern, dass ein Rand der Fläche frei liegt. Die Grenze hängt am
 * Maßstab, deshalb wird sie hier aus dem **schon begrenzten** Maßstab gerechnet — sonst
 * risse ein Herauszoomen eine Lücke, die keine Zieh-Begrenzung mehr einfängt.
 *
 * Reine Funktion ohne Konva und ohne Angular: dieselbe Rechnung braucht später das Drucken.
 */
export function clampPlacement(area: Geometry, placement: CardImagePlacement): CardImagePlacement {
  const scale = clampCardImageScale(placement.scale);
  const size = scaledImageSize(area, { ...placement, scale });
  const limitX = Math.max(0, (size.width - area.width) / 2);
  const limitY = Math.max(0, (size.height - area.height) / 2);

  return {
    ...placement,
    scale: round(scale, 3),
    offsetX: round(clamp(placement.offsetX, -limitX, limitX), 2),
    offsetY: round(clamp(placement.offsetY, -limitY, limitY), 2),
  };
}

/**
 * Die Umkehrung von `cardImageBox`: aus der linken oberen Ecke des Bildes — in Koordinaten
 * der Fläche — wird die gespeicherte Verschiebung. Genau das braucht das Ziehen, denn Konva
 * meldet die neue Ecke, nicht den Versatz.
 */
export function placementFromBoxPosition(
  area: Geometry,
  placement: CardImagePlacement,
  boxPosition: Point,
): CardImagePlacement {
  const size = scaledImageSize(area, placement);

  return clampPlacement(area, {
    ...placement,
    offsetX: boxPosition.x - (area.width - size.width) / 2,
    offsetY: boxPosition.y - (area.height - size.height) / 2,
  });
}

/**
 * Maßstabswechsel, bei dem derselbe Punkt des Motivs unter dem Ankerpunkt bleibt (Zeiger beim
 * Mausrad, Flächenmitte bei Regler und Tastatur). Der Anker zählt in Koordinaten der Fläche.
 */
export function zoomPlacementAt(
  area: Geometry,
  placement: CardImagePlacement,
  nextScale: number,
  anchor: Point,
): CardImagePlacement {
  const scale = clampCardImageScale(nextScale);
  const currentScale = placement.scale > 0 ? placement.scale : MIN_CARD_IMAGE_SCALE;
  const ratio = scale / currentScale;
  const box = cardImageBox(area, placement);

  return placementFromBoxPosition(
    area,
    { ...placement, scale },
    {
      x: anchor.x - ratio * (anchor.x - box.x),
      y: anchor.y - ratio * (anchor.y - box.y),
    },
  );
}

/** Ausgangszustand: mittig und gerade eben gefüllt. */
export function resetPlacement(
  area: Geometry,
  placement: CardImagePlacement,
): CardImagePlacement {
  return clampPlacement(area, {
    ...placement,
    offsetX: 0,
    offsetY: 0,
    scale: MIN_CARD_IMAGE_SCALE,
  });
}

/** Mitte der Fläche — der Anker für Zoomen ohne Zeiger (Regler, Tastatur). */
export function areaCenter(area: Geometry): Point {
  return { x: area.width / 2, y: area.height / 2 };
}

/**
 * Wie groß das Bild in der Fläche gezeichnet wird. Maßstab 1 heißt „gerade eben gefüllt": der
 * größere der beiden Faktoren gewinnt, damit die kürzere Seite genau passt und die längere
 * übersteht.
 */
function scaledImageSize(
  area: Geometry,
  placement: CardImagePlacement,
): { width: number; height: number } {
  const sourceWidth = placement.width > 0 ? placement.width : 1;
  const sourceHeight = placement.height > 0 ? placement.height : 1;
  const cover = Math.max(area.width / sourceWidth, area.height / sourceHeight);

  return { width: sourceWidth * cover * placement.scale, height: sourceHeight * cover * placement.scale };
}

function clamp(value: number, lower: number, upper: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(upper, Math.max(lower, value));
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
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
