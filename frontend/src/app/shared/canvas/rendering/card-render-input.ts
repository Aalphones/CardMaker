import { Card, CardImage } from '../../../store/cards/cards.actions';
import { Template } from '../../../store/templates/templates.actions';
import { CardImagePlacement } from './card-content';
import { CardRenderInput } from './render-input';

/**
 * Übersetzt eine gespeicherte Karte in das, was der Renderer braucht — dieselbe
 * Feld-für-Feld-Zuordnung wie die Vorschau des Karteneditors, nur auf dem **gespeicherten**
 * Stand statt auf dem Entwurf (Formularwerte, unbestätigte Bildausschnitte). Reine Funktion
 * ohne Angular-Bezug, damit sie Meilenstein 5 (Druckbögen) ohne Umbau wiederverwenden kann.
 */
export function buildRenderInput(card: Card, template: Template): CardRenderInput {
  return {
    layers: template.layers,
    content: {
      cardId: card.id,
      values: card.values,
      iconChoices: card.iconChoices,
      textOverrides: card.textOverrides,
      images: card.images.map((image: CardImage): CardImagePlacement => ({ ...image })),
    },
  };
}
