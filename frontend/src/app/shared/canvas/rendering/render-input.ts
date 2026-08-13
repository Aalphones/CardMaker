import { CardContent } from './card-content';
import { Layer } from './layer';

/**
 * Alles, was der Renderer über eine Karte wissen muss. Bilder und Schriften stehen bewusst
 * nicht drin — die besorgt sich der Renderer selbst (Phase 2), Aufrufer sollen nichts
 * vorladen müssen.
 */
export interface CardRenderInput {
  /** Die Ebenen des Templates, unverändert. */
  layers: Layer[];
  /** Was die Karte zum Template beisteuert. */
  content: CardContent;
}
