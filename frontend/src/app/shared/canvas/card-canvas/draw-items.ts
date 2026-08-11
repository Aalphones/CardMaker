import { EllipseConfig } from 'konva/lib/shapes/Ellipse';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { LineConfig } from 'konva/lib/shapes/Line';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';

import { fitFontSize } from '../rendering/auto-shrink';
import { DEFAULT_FONT_FAMILY } from '../rendering/fonts';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FrameLayer,
  Geometry,
  IconLayer,
  ImageLayer,
  Layer,
  LineShapeLayer,
  ShapeLayer,
  TextLayer,
} from '../rendering/layer';
import { measureTextHeight } from '../rendering/measure-text';

/**
 * Das Canvas kennt keine CSS-Variablen — diese drei Werte spiegeln bewusst
 * `--color-accent-400` (heller Platzhalterrand) und `--color-accent` (Auswahl,
 * Platzhalterfüllung) aus `styles.scss`. Ändert sich dort die Akzentfarbe, gehören diese
 * drei Zeilen mit nachgezogen — es gibt keinen automatischen Weg von CSS ins Canvas.
 */
const PLACEHOLDER_STROKE = '#f6a06b';
const PLACEHOLDER_FILL = 'rgb(198 113 57 / 12%)';
const SELECTION_STROKE = '#c67139';

/** Der Rahmen liegt immer vollflächig — er hat keine eigene Geometrie (Kontrakt). */
const FRAME_BOX: Geometry = { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, rotation: 0 };

const PLACEHOLDER_FONT_SIZE = 28;
const PLACEHOLDER_DASH = [12, 8];
const SELECTION_DASH = [8, 6];
const OUTLINE_WIDTH = 2;

export type DrawElement = 'image' | 'rect' | 'ellipse' | 'line' | 'text';
export type DrawConfig = ImageConfig | RectConfig | EllipseConfig | LineConfig | TextConfig;

export interface DrawItem {
  key: string;
  layerId: string;
  element: DrawElement;
  config: DrawConfig;
}

export interface DrawContext {
  images: ReadonlyMap<number, HTMLImageElement>;
  selectedLayerId: string | null;
  interactive: boolean;
}

/**
 * Aus der Ebenenliste wird die flache Zeichenliste. Die Reihenfolge hier ist die
 * Zeichenreihenfolge: Index 0 der Ebenenliste liegt zuunterst. Eine Ebene kann mehrere
 * Einträge erzeugen (Platzhalter = Kasten + Beschriftung).
 */
export function buildDrawItems(layers: Layer[], context: DrawContext): DrawItem[] {
  const items: DrawItem[] = layers
    .filter((layer: Layer) => layer.visible)
    .flatMap((layer: Layer) => itemsForLayer(layer, context));
  const selectedLayer = layers.find((layer: Layer) => layer.id === context.selectedLayerId && layer.visible);

  // Nicht-Rahmen-Ebenen bekommen ab Phase 7 den echten Konva-Transformer als Auswahlrahmen
  // (card-canvas) — der gestrichelte Platzhalterrahmen hier würde sich sonst mit dessen
  // Rand überlagern. Beim Rahmen gibt es keinen Transformer (er hat keine Geometrie), der
  // gestrichelte Umriss bleibt dort die einzige Auswahlanzeige.
  if (selectedLayer && (!context.interactive || selectedLayer.type === 'frame')) {
    items.push(selectionItem(selectedLayer));
  }

  return items;
}

/** Bildnummern, die die Vorschau braucht — Auftragsliste für den Bildlader. */
export function requestedAssetIds(layers: Layer[]): number[] {
  const assetIds = new Set<number>();

  for (const layer of layers) {
    if ((layer.type === 'icon' || layer.type === 'frame') && layer.assetId !== null) {
      assetIds.add(layer.assetId);
    }
  }

  return [...assetIds];
}

function itemsForLayer(layer: Layer, context: DrawContext): DrawItem[] {
  switch (layer.type) {
    case 'image':
      return imageAreaItems(layer, context);
    case 'shape':
      return [shapeItem(layer, context)];
    case 'icon':
      return iconItems(layer, context);
    case 'frame':
      return frameItems(layer, context);
    case 'text':
      return textItems(layer, context);
  }
}

/**
 * Anfasser/Ziehbarkeit gibt es nur für die gerade ausgewählte Ebene (Plan-README „Ein
 * Klick wählt aus" — nicht jede Ebene ist die ganze Zeit ziehbar, sonst verschiebt ein
 * Klick-Drag über eine fremde Ebene diese versehentlich mit). Rahmen sind nie ziehbar, sie
 * haben keine Geometrie (Kontrakt).
 *
 * `name` statt `id`: `ng2-konva` warnt ausdrücklich davor, das Konva-`id`-Attribut zu
 * benutzen ("may produce bugs"), und empfiehlt `name`. Der Anfasser in `card-canvas` sucht
 * den Knoten entsprechend über den Namens-Selektor (`stage.findOne('.' + id)`).
 */
function interactionConfig(layer: Layer, context: DrawContext): { name: string; draggable: boolean } {
  return {
    name: layer.id,
    draggable: context.interactive && context.selectedLayerId === layer.id && layer.type !== 'frame',
  };
}

/**
 * Die Bildfläche bleibt im Template-Editor immer ein Platzhalter: Welches Bild dort landet,
 * entscheidet erst die Karteninstanz (Meilenstein 3) — das Template legt nur die Fläche fest.
 */
function imageAreaItems(layer: ImageLayer, context: DrawContext): DrawItem[] {
  return placeholderItems(layer.id, box(layer), 'Bildfläche', layer.opacity, interactionConfig(layer, context));
}

function iconItems(layer: IconLayer, context: DrawContext): DrawItem[] {
  const image = pickImage(layer.assetId, context);

  if (!image) {
    return placeholderItems(
      layer.id,
      box(layer),
      layer.assetId === null ? 'Icon' : 'Icon lädt …',
      layer.opacity,
      interactionConfig(layer, context),
    );
  }

  return [
    {
      key: layer.id,
      layerId: layer.id,
      element: 'image',
      config: { ...box(layer), image, opacity: layer.opacity, ...interactionConfig(layer, context) },
    },
  ];
}

function frameItems(layer: FrameLayer, context: DrawContext): DrawItem[] {
  const image = pickImage(layer.assetId, context);
  const interaction = interactionConfig(layer, context);

  if (!image) {
    return placeholderItems(layer.id, FRAME_BOX, layer.assetId === null ? 'Rahmen fehlt' : 'Rahmen lädt …', 1, interaction);
  }

  return [{ key: layer.id, layerId: layer.id, element: 'image', config: { ...FRAME_BOX, image, ...interaction } }];
}

function shapeItem(layer: ShapeLayer, context: DrawContext): DrawItem {
  const base = { key: layer.id, layerId: layer.id };
  const interaction = interactionConfig(layer, context);

  switch (layer.shape) {
    case 'rect':
      return {
        ...base,
        element: 'rect',
        config: {
          ...box(layer),
          fill: layer.fill ?? undefined,
          stroke: layer.stroke ?? undefined,
          strokeWidth: layer.strokeWidth,
          cornerRadius: layer.cornerRadius,
          opacity: layer.opacity,
          ...interaction,
        },
      };
    case 'circle':
      // Konva dreht eine Ellipse um ihren Mittelpunkt, der Kontrakt aber um die obere linke
      // Ecke der Box. Deshalb sitzt der Knoten auf der Ecke, und der negative Versatz schiebt
      // die Ellipse von dort aus um eine halbe Box nach innen.
      return {
        ...base,
        element: 'ellipse',
        config: {
          x: layer.x,
          y: layer.y,
          offsetX: -layer.width / 2,
          offsetY: -layer.height / 2,
          radiusX: layer.width / 2,
          radiusY: layer.height / 2,
          rotation: layer.rotation,
          fill: layer.fill ?? undefined,
          stroke: layer.stroke ?? undefined,
          strokeWidth: layer.strokeWidth,
          opacity: layer.opacity,
          ...interaction,
        },
      };
    case 'line':
      return {
        ...base,
        element: 'line',
        config: {
          points: [...layer.points],
          stroke: layer.stroke ?? undefined,
          strokeWidth: layer.strokeWidth,
          opacity: layer.opacity,
          ...interaction,
        },
      };
  }
}

function textItems(layer: TextLayer, context: DrawContext): DrawItem[] {
  if (layer.defaultText.length === 0) {
    return placeholderItems(layer.id, box(layer), 'Text', layer.opacity, interactionConfig(layer, context));
  }

  return [
    {
      key: layer.id,
      layerId: layer.id,
      element: 'text',
      config: {
        ...box(layer),
        ...interactionConfig(layer, context),
        text: layer.defaultText,
        fontFamily: layer.fontFamily,
        fontSize: effectiveFontSize(layer),
        lineHeight: layer.lineHeight,
        fill: layer.color,
        align: layer.align,
        verticalAlign: layer.verticalAlign,
        // Feste Höhe + ellipsis: Was auch bei der Mindestgröße nicht mehr passt, wird
        // abgeschnitten statt aus der Box zu laufen.
        wrap: 'word',
        ellipsis: true,
        stroke: layer.outlineColor ?? undefined,
        strokeWidth: layer.outlineWidth,
        fillAfterStrokeEnabled: true,
        shadowColor: layer.shadowColor ?? undefined,
        shadowBlur: layer.shadowBlur,
        shadowOffsetX: layer.shadowOffsetX,
        shadowOffsetY: layer.shadowOffsetY,
        opacity: layer.opacity,
      },
    },
  ];
}

function effectiveFontSize(layer: TextLayer): number {
  if (!layer.autoShrink) {
    return layer.fontSize;
  }

  return fitFontSize({
    text: layer.defaultText,
    boxWidth: layer.width,
    boxHeight: layer.height,
    fontSize: layer.fontSize,
    minFontSize: layer.minFontSize,
    fontFamily: layer.fontFamily,
    lineHeight: layer.lineHeight,
    measureHeight: measureTextHeight,
  });
}

function placeholderItems(
  layerId: string,
  area: Geometry,
  label: string,
  opacity: number,
  interaction: { name: string; draggable: boolean },
): DrawItem[] {
  return [
    {
      key: `${layerId}:placeholder`,
      layerId,
      element: 'rect',
      config: {
        ...area,
        fill: PLACEHOLDER_FILL,
        stroke: PLACEHOLDER_STROKE,
        strokeWidth: OUTLINE_WIDTH,
        dash: PLACEHOLDER_DASH,
        opacity,
        ...interaction,
      },
    },
    {
      key: `${layerId}:placeholder-label`,
      layerId,
      element: 'text',
      config: {
        ...area,
        text: label,
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: PLACEHOLDER_FONT_SIZE,
        fill: PLACEHOLDER_STROKE,
        align: 'center',
        verticalAlign: 'middle',
        wrap: 'word',
        ellipsis: true,
        opacity,
      },
    },
  ];
}

function selectionItem(layer: Layer): DrawItem {
  return {
    key: `${layer.id}:selection`,
    layerId: layer.id,
    element: 'rect',
    config: {
      ...selectionBox(layer),
      stroke: SELECTION_STROKE,
      strokeWidth: OUTLINE_WIDTH,
      dash: SELECTION_DASH,
      listening: false,
    },
  };
}

function selectionBox(layer: Layer): Geometry {
  if (layer.type === 'frame') {
    return FRAME_BOX;
  }

  if (layer.type === 'shape') {
    return layer.shape === 'line' ? lineBox(layer) : box(layer);
  }

  return box(layer);
}

function lineBox(layer: LineShapeLayer): Geometry {
  const [startX, startY, endX, endY] = layer.points;

  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
    rotation: 0,
  };
}

function box(layer: Geometry): Geometry {
  return { x: layer.x, y: layer.y, width: layer.width, height: layer.height, rotation: layer.rotation };
}

function pickImage(assetId: number | null, context: DrawContext): HTMLImageElement | undefined {
  if (assetId === null) {
    return undefined;
  }

  return context.images.get(assetId);
}
