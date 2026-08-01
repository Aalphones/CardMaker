const UNITS_PER_MM = 10;
const MM_PER_INCH = 25.4;

// Rechenprobe (es gibt keine Tests, die das sonst absichern):
// 630 Einheiten bei 300 DPI ergeben 744 Pixel, 880 Einheiten ergeben 1039.
export function canvasUnitsToPixels(units: number, dpi: number): number {
  const millimeters = units / UNITS_PER_MM;
  const inches = millimeters / MM_PER_INCH;
  return Math.round(inches * dpi);
}
