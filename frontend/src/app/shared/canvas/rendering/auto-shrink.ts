export interface TextMeasurement {
  text: string;
  width: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  fontStyle: string;
}

export type MeasureTextHeight = (measurement: TextMeasurement) => number;

export interface FitFontSizeOptions {
  text: string;
  boxWidth: number;
  boxHeight: number;
  fontSize: number;
  minFontSize: number;
  fontFamily: string;
  lineHeight: number;
  fontStyle: string;
  measureHeight: MeasureTextHeight;
}

/**
 * Größte Schriftgröße, bei der der umbrochene Text noch in die Box passt.
 *
 * Die Messfunktion wird hineingereicht statt hier importiert: Meilenstein 4 (Drucken)
 * misst in Zielauflösung mit einem anderen Werkzeug, soll aber exakt dieselbe
 * Verkleinerungsregel benutzen. Deshalb bleibt diese Datei ohne Konva-Abhängigkeit.
 */
export function fitFontSize(options: FitFontSizeOptions): number {
  const {
    text,
    boxWidth,
    boxHeight,
    fontSize,
    minFontSize,
    lineHeight,
    fontFamily,
    fontStyle,
    measureHeight,
  } = options;
  const smallest = Math.min(minFontSize, fontSize);

  if (text.length === 0 || boxWidth <= 0 || boxHeight <= 0) {
    return fontSize;
  }

  for (let candidate = fontSize; candidate > smallest; candidate -= 1) {
    const height = measureHeight({
      text,
      width: boxWidth,
      fontSize: candidate,
      fontFamily,
      lineHeight,
      fontStyle,
    });

    if (height <= boxHeight) {
      return candidate;
    }
  }

  return smallest;
}
