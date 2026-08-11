import { CANVAS_HEIGHT, CANVAS_WIDTH } from './layer';

const UNITS_PER_MM = 10;
const MM_PER_INCH = 25.4;

// Rechenprobe (es gibt keine Tests, die das sonst absichern):
// 630 Einheiten bei 300 DPI ergeben 744 Pixel, 880 Einheiten ergeben 1039.
export function canvasUnitsToPixels(units: number, dpi: number): number {
  const millimeters = units / UNITS_PER_MM;
  const inches = millimeters / MM_PER_INCH;
  return Math.round(inches * dpi);
}

// — Bühnenansicht: Umrechnung Bildschirmpunkte ↔ Canvas-Einheiten —
//
// Der Maßstab ist „Bildschirmpunkte je Canvas-Einheit": 1 heißt 100 %, die Karte ist dann
// 630x880 Punkte groß. Die Karte hängt immer in der Mitte der Bühne; `pan` verschiebt sie
// von dort aus. Alle Bildschirm-Koordinaten in diesen Funktionen sind relativ zur oberen
// linken Ecke der Bühne, nicht zum Fenster.

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

/** Luft zwischen Karte und Bühnenrand beim Einpassen (Entwurf: 96px). */
const FIT_PADDING_PX = 96;

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

export interface Point {
  x: number;
  y: number;
}

export interface StageSize {
  width: number;
  height: number;
}

export interface StageView {
  size: StageSize;
  zoom: number;
  pan: Point;
}

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/** Maßstab, bei dem die Karte in beide Richtungen in die gemessene Bühne passt. */
export function fitZoom(size: StageSize): number {
  const horizontal = (size.width - FIT_PADDING_PX) / CANVAS_WIDTH;
  const vertical = (size.height - FIT_PADDING_PX) / CANVAS_HEIGHT;

  return clampZoom(Math.min(horizontal, vertical));
}

export function nextZoomStep(zoom: number): number {
  return ZOOM_STEPS.find((step: number) => step > zoom + 0.001) ?? MAX_ZOOM;
}

export function previousZoomStep(zoom: number): number {
  return [...ZOOM_STEPS].reverse().find((step: number) => step < zoom - 0.001) ?? MIN_ZOOM;
}

/** Obere linke Ecke der Karte in Bühnenkoordinaten. */
export function cardOrigin(view: StageView): Point {
  return {
    x: (view.size.width - CANVAS_WIDTH * view.zoom) / 2 + view.pan.x,
    y: (view.size.height - CANVAS_HEIGHT * view.zoom) / 2 + view.pan.y,
  };
}

export function screenToCanvas(point: Point, view: StageView): Point {
  const origin = cardOrigin(view);

  return { x: (point.x - origin.x) / view.zoom, y: (point.y - origin.y) / view.zoom };
}

export function isOverCard(canvasPoint: Point): boolean {
  return (
    canvasPoint.x >= 0 && canvasPoint.y >= 0 && canvasPoint.x <= CANVAS_WIDTH && canvasPoint.y <= CANVAS_HEIGHT
  );
}

/**
 * Verschiebung, die beim Maßstabswechsel denselben Punkt der Karte unter dem Zeiger hält:
 * erst merken, welche Canvas-Einheit dort liegt, dann die Verschiebung so nachziehen, dass
 * sie beim neuen Maßstab wieder genau an dieser Bildschirmstelle sitzt.
 */
export function panKeepingAnchor(view: StageView, anchor: Point, nextZoom: number): Point {
  const canvasPoint = screenToCanvas(anchor, view);

  return {
    x: anchor.x - canvasPoint.x * nextZoom - (view.size.width - CANVAS_WIDTH * nextZoom) / 2,
    y: anchor.y - canvasPoint.y * nextZoom - (view.size.height - CANVAS_HEIGHT * nextZoom) / 2,
  };
}
