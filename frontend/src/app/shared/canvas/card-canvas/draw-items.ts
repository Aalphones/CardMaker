import { ContainerConfig } from 'konva/lib/Container';
import { EllipseConfig } from 'konva/lib/shapes/Ellipse';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { LineConfig } from 'konva/lib/shapes/Line';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';

import { fitFontSize } from '../rendering/auto-shrink';
import {
  CardContent,
  CardImagePlacement,
  cardImageBox,
  findCardImage,
  resolveBold,
  resolveColor,
  resolveFontSize,
  resolveIconAssetId,
  resolveItalic,
  resolveText,
} from '../rendering/card-content';
import { DEFAULT_FONT_FAMILY, FontFamily, renderFontFamily } from '../rendering/fonts';
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

/**
 * Der Rahmen der bearbeiteten Bildfläche ist Bedienhilfe, kein Kartenbestandteil — beim
 * Ausgeben als Bild wird er über diesen Namen gefunden und ausgeblendet (`exportPng`).
 */
export const ACTIVE_AREA_NAME = 'card-image-active-area';

const PLACEHOLDER_FONT_SIZE = 28;
const PLACEHOLDER_DASH = [12, 8];
const SELECTION_DASH = [8, 6];
const OUTLINE_WIDTH = 2;

export type DrawElement = 'image' | 'rect' | 'ellipse' | 'line' | 'text' | 'group';
export type DrawConfig =
  | ImageConfig
  | RectConfig
  | EllipseConfig
  | LineConfig
  | TextConfig
  | ContainerConfig;

export interface DrawItem {
  key: string;
  layerId: string;
  element: DrawElement;
  config: DrawConfig;
  /**
   * Nur bei `group` gesetzt, und dort ausschließlich Bilder: Zuschneiden kann in Konva nur
   * ein Container, keine einzelne Form. Die Vorlage zeichnet die Kinder entsprechend als
   * `ko-image` — wer hier andere Elemente einhängt, muss sie dort ergänzen.
   */
  children?: DrawItem[];
}

/** Was eine Ebene an Maus-Verhalten mitbringt — Name, Ziehbarkeit, Zuhören. */
interface InteractionConfig {
  name: string;
  draggable: boolean;
  listening: boolean;
}

export interface DrawContext {
  images: ReadonlyMap<number, HTMLImageElement>;
  /** Mitgelieferte Schriften, die fertig geladen sind (siehe `FontLoader`). */
  loadedFonts: ReadonlySet<string>;
  selectedLayerId: string | null;
  interactive: boolean;
  /**
   * Was die Karte beisteuert. Fehlt es, zeichnet alles unten genau wie bisher — das ist der
   * Template-Editor. Es gibt keinen zweiten Zeichenweg, nur diesen einen Unterschied.
   */
  content?: CardContent | null;
  /** Die geladenen Kartenbilder, Schlüssel ist die Bildfläche (`layerId`). */
  cardImages?: ReadonlyMap<string, HTMLImageElement>;
  /**
   * Bildflächen hören auf Maus und Mausrad — der Karteneditor schaltet das ein, damit sich
   * das Motiv in seiner Fläche zurechtschieben lässt (ADR-018).
   */
  imageEditing?: boolean;
  /** Die Bildfläche, die gerade bearbeitet wird: nur sie ist ziehbar und bekommt den Rahmen. */
  activeImageLayerId?: string | null;
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
  const selectedLayer = layers.find(
    (layer: Layer) => layer.id === context.selectedLayerId && layer.visible,
  );

  // Nicht-Rahmen-Ebenen bekommen ab Phase 7 den echten Konva-Transformer als Auswahlrahmen
  // (card-canvas) — der gestrichelte Platzhalterrahmen hier würde sich sonst mit dessen
  // Rand überlagern. Beim Rahmen gibt es keinen Transformer (er hat keine Geometrie), der
  // gestrichelte Umriss bleibt dort die einzige Auswahlanzeige.
  if (selectedLayer && (!context.interactive || selectedLayer.type === 'frame')) {
    items.push(selectionItem(selectedLayer));
  }

  // Ganz zuletzt, damit der Rahmen der bearbeiteten Bildfläche über den Ebenen liegt, die im
  // Template über ihr sitzen — sonst verdeckt ihn ausgerechnet der Kartenrahmen.
  const activeArea = activeImageLayer(layers, context);

  if (activeArea) {
    items.push(activeAreaItem(activeArea));
  }

  return items;
}

/**
 * Bildnummern, die die Vorschau braucht — Auftragsliste für den Bildlader. Mit Karteninhalt
 * zählt bei Icon-Ebenen die Wahl der Karte, nicht das im Template hinterlegte Bild.
 */
export function requestedAssetIds(layers: Layer[], content: CardContent | null = null): number[] {
  const assetIds = new Set<number>();

  for (const layer of layers) {
    if (layer.type === 'frame' && layer.assetId !== null) {
      assetIds.add(layer.assetId);
    }

    if (layer.type === 'icon') {
      const assetId = resolveIconAssetId(layer, content);

      if (assetId !== null) {
        assetIds.add(assetId);
      }
    }
  }

  return [...assetIds];
}

/** Schriften, die die Vorschau braucht — Auftragsliste für den Schriftlader. */
export function requestedFontFamilies(layers: Layer[]): FontFamily[] {
  const families = new Set<FontFamily>();

  for (const layer of layers) {
    if (layer.type === 'text') {
      families.add(layer.fontFamily);
    }
  }

  return [...families];
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
function interactionConfig(layer: Layer, context: DrawContext): InteractionConfig {
  return {
    name: layer.id,
    draggable:
      context.interactive && context.selectedLayerId === layer.id && layer.type !== 'frame',
    // In der Kartenvorschau hört ausschließlich die Bildfläche zu. Ohne das würde ein Klick
    // neben das Motiv auf der nächstbesten Text- oder Rahmenebene landen statt auf der Bühne —
    // und der Karteneditor bekäme nie mit, dass die Bearbeitung enden soll.
    listening: (context.content ?? null) === null,
  };
}

/**
 * Ohne Karteninhalt bleibt die Bildfläche ein Platzhalter: Welches Bild dort landet,
 * entscheidet erst die Karteninstanz — das Template legt nur die Fläche fest. Mit Inhalt
 * zeigt sie das Kartenbild, zugeschnitten auf ihre Fläche.
 */
function imageAreaItems(layer: ImageLayer, context: DrawContext): DrawItem[] {
  const content = context.content ?? null;

  if (content === null) {
    return placeholderItems(
      layer.id,
      box(layer),
      'Bildfläche',
      layer.opacity,
      interactionConfig(layer, context),
    );
  }

  const placement = findCardImage(layer.id, content);
  const image = placement ? context.cardImages?.get(layer.id) : undefined;

  if (!placement || !image) {
    return [];
  }

  return [cardImageItem(layer, placement, image, context)];
}

/**
 * Zugeschnitten wird über den Container, nicht über die Bilddaten: `clip` schneidet beim
 * Zeichnen ab, das hochgeladene Original bleibt unangetastet. Die Fläche ist der Nullpunkt
 * der Gruppe — deshalb sitzt der Zuschnitt auf (0,0) und das Bild trägt nur seinen Versatz
 * innerhalb der Fläche.
 */
function cardImageItem(
  layer: ImageLayer,
  placement: CardImagePlacement,
  image: HTMLImageElement,
  context: DrawContext,
): DrawItem {
  const area = box(layer);
  const inner = cardImageBox(area, placement);
  const editing = context.imageEditing === true;

  return {
    key: `${layer.id}:card-image`,
    layerId: layer.id,
    element: 'group',
    config: {
      ...area,
      opacity: layer.opacity,
      clip: { x: 0, y: 0, width: area.width, height: area.height },
      // Der Zuschnitt begrenzt auch, wo die Maus das Bild trifft: außerhalb der Fläche liegt
      // das überstehende Motiv zwar im Speicher, aber für Klicks nicht mehr da.
      listening: editing,
    },
    children: [
      {
        key: `${layer.id}:card-image-source`,
        layerId: layer.id,
        element: 'image',
        config: {
          ...inner,
          image,
          name: layer.id,
          listening: editing,
          // Ziehbar ist nur die bearbeitete Fläche — sonst verschöbe ein Klick-Zieher über
          // einer fremden Fläche deren Motiv versehentlich mit.
          draggable: editing && context.activeImageLayerId === layer.id,
        },
      },
    ],
  };
}

/** Findet die Bildfläche, die gerade bearbeitet wird — nur in der Kartenvorschau. */
function activeImageLayer(layers: Layer[], context: DrawContext): ImageLayer | null {
  if (context.imageEditing !== true || !context.activeImageLayerId) {
    return null;
  }

  const layer = layers.find(
    (candidate: Layer) => candidate.id === context.activeImageLayerId && candidate.visible,
  );

  return layer && layer.type === 'image' ? layer : null;
}

function activeAreaItem(layer: ImageLayer): DrawItem {
  return {
    key: `${layer.id}:active-area`,
    layerId: layer.id,
    element: 'rect',
    config: {
      ...box(layer),
      name: ACTIVE_AREA_NAME,
      stroke: SELECTION_STROKE,
      strokeWidth: OUTLINE_WIDTH,
      listening: false,
    },
  };
}

function iconItems(layer: IconLayer, context: DrawContext): DrawItem[] {
  const content = context.content ?? null;
  const assetId = resolveIconAssetId(layer, content);
  const image = pickImage(assetId, context);

  if (!image) {
    // In der Kartenvorschau gibt es keine Platzhalter — eine Ebene ohne Inhalt bleibt leer.
    if (content !== null) {
      return [];
    }

    return placeholderItems(
      layer.id,
      box(layer),
      assetId === null ? 'Icon' : 'Icon lädt …',
      layer.opacity,
      interactionConfig(layer, context),
    );
  }

  return [
    {
      key: layer.id,
      layerId: layer.id,
      element: 'image',
      config: {
        ...box(layer),
        image,
        opacity: layer.opacity,
        ...interactionConfig(layer, context),
      },
    },
  ];
}

function frameItems(layer: FrameLayer, context: DrawContext): DrawItem[] {
  const image = pickImage(layer.assetId, context);
  const interaction = interactionConfig(layer, context);

  if (!image) {
    return placeholderItems(
      layer.id,
      FRAME_BOX,
      layer.assetId === null ? 'Rahmen fehlt' : 'Rahmen lädt …',
      1,
      interaction,
    );
  }

  return [
    {
      key: layer.id,
      layerId: layer.id,
      element: 'image',
      config: { ...FRAME_BOX, image, ...interaction },
    },
  ];
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
  const content = context.content ?? null;
  const text = resolveText(layer, content);

  if (text.length === 0) {
    // In der Kartenvorschau gibt es keine Platzhalter — ein leeres Feld bleibt leer.
    if (content !== null) {
      return [];
    }

    return placeholderItems(
      layer.id,
      box(layer),
      'Text',
      layer.opacity,
      interactionConfig(layer, context),
    );
  }

  const fontFamily = renderFontFamily(layer.fontFamily, context.loadedFonts);
  const fontStyle = konvaFontStyle(resolveBold(layer, content), resolveItalic(layer, content));

  return [
    {
      key: layer.id,
      layerId: layer.id,
      element: 'text',
      config: {
        ...box(layer),
        ...interactionConfig(layer, context),
        text,
        fontFamily,
        fontStyle,
        fontSize: effectiveFontSize(layer, text, resolveFontSize(layer, content), fontFamily, fontStyle),
        lineHeight: layer.lineHeight,
        fill: resolveColor(layer, content),
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

/**
 * `text`, `fontSize`, `fontFamily` und `fontStyle` kommen von außen statt aus der Ebene:
 * Gemessen werden muss genau das, was auch gezeichnet wird — also der Text der Karte in ihrer
 * Schriftgröße, und solange eine mitgelieferte Schrift noch lädt, in der Ersatzschrift. Beim
 * Schnitt gilt dasselbe: ein fett geschalteter Text ist breiter als derselbe Text normal.
 */
function effectiveFontSize(
  layer: TextLayer,
  text: string,
  fontSize: number,
  fontFamily: string,
  fontStyle: string,
): number {
  if (!layer.autoShrink) {
    return fontSize;
  }

  return fitFontSize({
    text,
    boxWidth: layer.width,
    boxHeight: layer.height,
    fontSize,
    minFontSize: layer.minFontSize,
    fontFamily,
    fontStyle,
    lineHeight: layer.lineHeight,
    measureHeight: measureTextHeight,
  });
}

/**
 * Die einzige Stelle, die den Konva-`fontStyle`-String baut — er ist eine Konva-Eigenheit
 * und hat im Datenmodell nichts verloren (`TextLayer` kennt nur die zwei Wahrheitswerte).
 */
function konvaFontStyle(bold: boolean, italic: boolean): string {
  if (bold && italic) {
    return 'italic bold';
  }
  if (bold) {
    return 'bold';
  }
  if (italic) {
    return 'italic';
  }
  return 'normal';
}

function placeholderItems(
  layerId: string,
  area: Geometry,
  label: string,
  opacity: number,
  interaction: InteractionConfig,
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
  return {
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
  };
}

function pickImage(assetId: number | null, context: DrawContext): HTMLImageElement | undefined {
  if (assetId === null) {
    return undefined;
  }

  return context.images.get(assetId);
}
