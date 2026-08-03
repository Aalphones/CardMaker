export const FONT_FAMILIES = [
  'Arial',
  'Verdana',
  'Trebuchet MS',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Impact',
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

export const DEFAULT_FONT_FAMILY: FontFamily = 'Arial';
