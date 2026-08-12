import { IconLayer, ImageLayer, Layer, TextLayer } from '../../../shared/canvas/rendering/layer';

/** Eine Bildfläche des Templates — pro Fläche gibt es ein Ablagefeld. */
export interface CardImageField {
  layerId: string;
  label: string;
}

/** Eine Textebene, die pro Karte ausgefüllt wird. */
export interface CardTextField {
  key: string;
  layerId: string;
  label: string;
  defaultText: string;
  templateFontSize: number;
  templateColor: string;
  templateBold: boolean;
  templateItalic: boolean;
}

/** Eine Icon-Ebene, deren Bild pro Karte gewählt wird. */
export interface CardIconField {
  layerId: string;
  label: string;
  choiceAssetIds: number[];
}

export interface CardFormFields {
  images: CardImageField[];
  texts: CardTextField[];
  icons: CardIconField[];
}

export const EMPTY_CARD_FORM_FIELDS: CardFormFields = { images: [], texts: [], icons: [] };

/**
 * Leitet aus den Ebenen eines Templates ab, was das Kartenformular anzeigt. Bewusst ohne
 * Angular-Abhängigkeit: die Live-Vorschau leitet aus derselben Funktion ab, welche Werte
 * sie zeichnet.
 *
 * Zwei Textebenen dürfen denselben Feldschlüssel tragen — sie teilen sich dann einen Wert.
 * Das Formular zeigt sie deshalb nur einmal; die erste Ebene bestimmt die Beschriftung.
 */
export function describeCardFields(layers: Layer[]): CardFormFields {
  const images: CardImageField[] = [];
  const texts: CardTextField[] = [];
  const icons: CardIconField[] = [];
  const seenTextKeys = new Set<string>();

  for (const layer of layers) {
    if (layer.type === 'image') {
      images.push(toImageField(layer));
    }

    if (layer.type === 'text' && layer.source === 'user' && !seenTextKeys.has(layer.key)) {
      seenTextKeys.add(layer.key);
      texts.push(toTextField(layer));
    }

    if (layer.type === 'icon' && layer.source === 'user') {
      icons.push(toIconField(layer));
    }
  }

  return { images, texts, icons };
}

function toImageField(layer: ImageLayer): CardImageField {
  return { layerId: layer.id, label: layer.name };
}

function toTextField(layer: TextLayer): CardTextField {
  return {
    key: layer.key,
    layerId: layer.id,
    label: layer.name,
    defaultText: layer.defaultText,
    templateFontSize: layer.fontSize,
    templateColor: layer.color,
    templateBold: layer.bold,
    templateItalic: layer.italic,
  };
}

function toIconField(layer: IconLayer): CardIconField {
  return { layerId: layer.id, label: layer.name, choiceAssetIds: [...layer.choiceAssetIds] };
}
