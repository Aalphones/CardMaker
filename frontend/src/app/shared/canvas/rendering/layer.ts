import { DEFAULT_FONT_FAMILY, FontFamily } from './fonts';

export const CANVAS_WIDTH = 630;
export const CANVAS_HEIGHT = 880;

export const LAYER_TYPES = ['image', 'shape', 'icon', 'frame', 'text'] as const;
export type LayerType = (typeof LAYER_TYPES)[number];

export const SHAPE_KINDS = ['rect', 'circle', 'line'] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

export const LAYER_SOURCES = ['static', 'user'] as const;
export type LayerSource = (typeof LAYER_SOURCES)[number];

export const TEXT_ALIGNS = ['left', 'center', 'right'] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

export const TEXT_VERTICAL_ALIGNS = ['top', 'middle', 'bottom'] as const;
export type TextVerticalAlign = (typeof TEXT_VERTICAL_ALIGNS)[number];

export interface LayerBase {
  id: string;
  name: string;
  visible: boolean;
}

export interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ImageLayer extends LayerBase, Geometry {
  type: 'image';
  opacity: number;
}

interface ShapeLayerBase extends LayerBase {
  type: 'shape';
  stroke: string | null;
  strokeWidth: number;
  opacity: number;
}

export interface RectShapeLayer extends ShapeLayerBase, Geometry {
  shape: 'rect';
  fill: string | null;
  cornerRadius: number;
}

export interface CircleShapeLayer extends ShapeLayerBase, Geometry {
  shape: 'circle';
  fill: string | null;
}

export interface LineShapeLayer extends ShapeLayerBase {
  shape: 'line';
  points: [number, number, number, number];
}

export type ShapeLayer = RectShapeLayer | CircleShapeLayer | LineShapeLayer;

export interface IconLayer extends LayerBase, Geometry {
  type: 'icon';
  opacity: number;
  source: LayerSource;
  assetId: number | null;
  choiceAssetIds: number[];
}

export interface FrameLayer extends LayerBase {
  type: 'frame';
  assetId: number | null;
}

export interface TextLayer extends LayerBase, Geometry {
  type: 'text';
  key: string;
  source: LayerSource;
  defaultText: string;
  fontFamily: FontFamily;
  fontSize: number;
  minFontSize: number;
  color: string;
  align: TextAlign;
  verticalAlign: TextVerticalAlign;
  lineHeight: number;
  outlineColor: string | null;
  outlineWidth: number;
  shadowColor: string | null;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  autoShrink: boolean;
  opacity: number;
}

export type Layer = ImageLayer | ShapeLayer | IconLayer | FrameLayer | TextLayer;

/**
 * Änderungsmenge für `patchLayer`: eine beliebige Teilmenge der Felder **irgendeiner**
 * Ebenenvariante, jedes einzeln optional. `Partial<Layer>` würde nicht reichen — `keyof`
 * einer Union bildet nur die gemeinsamen Schlüssel, also z. B. nicht `fill` oder `fontSize`.
 * Die Eigenschaften-Unterkomponenten kennen ihre konkrete Ebene und schicken nur deren
 * eigene Felder; diese Schnittmenge aus Partials lässt genau das ohne Typ-Zusammenbiegen zu.
 */
export type LayerPatch = Partial<ImageLayer> &
  Partial<RectShapeLayer> &
  Partial<CircleShapeLayer> &
  Partial<LineShapeLayer> &
  Partial<IconLayer> &
  Partial<FrameLayer> &
  Partial<TextLayer>;

const DEFAULT_LAYER_SIZE = 200;
const DEFAULT_LAYER_X = (CANVAS_WIDTH - DEFAULT_LAYER_SIZE) / 2;
const DEFAULT_LAYER_Y = (CANVAS_HEIGHT - DEFAULT_LAYER_SIZE) / 2;

function defaultGeometry(): Geometry {
  return { x: DEFAULT_LAYER_X, y: DEFAULT_LAYER_Y, width: DEFAULT_LAYER_SIZE, height: DEFAULT_LAYER_SIZE, rotation: 0 };
}

function createId(): string {
  return crypto.randomUUID();
}

export function createLayer(type: 'image'): ImageLayer;
export function createLayer(type: 'shape', shape: 'rect'): RectShapeLayer;
export function createLayer(type: 'shape', shape: 'circle'): CircleShapeLayer;
export function createLayer(type: 'shape', shape: 'line'): LineShapeLayer;
export function createLayer(type: 'icon'): IconLayer;
export function createLayer(type: 'frame'): FrameLayer;
export function createLayer(type: 'text'): TextLayer;
export function createLayer(type: LayerType, shape?: ShapeKind): Layer {
  switch (type) {
    case 'image':
      return { id: createId(), name: 'Bildfläche', visible: true, type, opacity: 1, ...defaultGeometry() };
    case 'shape':
      return createShapeLayer(shape ?? 'rect');
    case 'icon':
      return {
        id: createId(),
        name: 'Icon',
        visible: true,
        type,
        opacity: 1,
        source: 'static',
        assetId: null,
        choiceAssetIds: [],
        ...defaultGeometry(),
      };
    case 'frame':
      return { id: createId(), name: 'Rahmen', visible: true, type, assetId: null };
    case 'text':
      return {
        id: createId(),
        name: 'Textfeld',
        visible: true,
        type,
        key: 'text',
        source: 'static',
        defaultText: '',
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 40,
        minFontSize: 12,
        color: '#1a1a1a',
        align: 'center',
        verticalAlign: 'middle',
        lineHeight: 1.2,
        outlineColor: null,
        outlineWidth: 0,
        shadowColor: null,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        autoShrink: false,
        opacity: 1,
        ...defaultGeometry(),
      };
  }
}

function createShapeLayer(shape: ShapeKind): ShapeLayer {
  const base = {
    id: createId(),
    visible: true,
    type: 'shape' as const,
    stroke: null,
    strokeWidth: 2,
    opacity: 1,
  };

  switch (shape) {
    case 'rect':
      return { ...base, name: 'Rechteck', shape, fill: '#6d5ef8', cornerRadius: 0, ...defaultGeometry() };
    case 'circle':
      return { ...base, name: 'Kreis', shape, fill: '#6d5ef8', ...defaultGeometry() };
    case 'line':
      return {
        ...base,
        name: 'Linie',
        shape,
        points: [DEFAULT_LAYER_X, DEFAULT_LAYER_Y, DEFAULT_LAYER_X + DEFAULT_LAYER_SIZE, DEFAULT_LAYER_Y],
      };
  }
}
