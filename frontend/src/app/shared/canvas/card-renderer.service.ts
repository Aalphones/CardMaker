import { DOCUMENT, Injectable, inject } from '@angular/core';
import Konva from 'konva';

import { DrawContext, buildDrawItems } from './card-canvas/draw-items';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './rendering/layer';
import { CardRenderInput } from './rendering/render-input';
import { drawItemsToStage } from './render-stage';

export interface RenderResult {
  /** Das fertige Bild, immer PNG. */
  image: Blob;
  /** Bildflächen/Icons, deren Datei nicht geladen werden konnte — leer heißt vollständig. */
  missing: readonly string[];
}

/**
 * Zeichnet eine Karte in Druckauflösung, ohne dass ein Editor offen sein muss: Die Bühne
 * entsteht auf einem `div`, das nie im Dokument hängt, und wird nach dem Ausgeben sofort
 * wieder abgeräumt (ADR-022).
 */
@Injectable({
  providedIn: 'root',
})
export class CardRenderer {
  private readonly document = inject(DOCUMENT);

  async renderPng(input: CardRenderInput, targetWidthPx: number): Promise<RenderResult> {
    const scale = targetWidthPx / CANVAS_WIDTH;

    // Die Bühne bekommt gleich die Zielgröße in Bildpunkten, der Maßstab sitzt auf der
    // Konva-Ebene — genau wie in der sichtbaren Vorschau. Über `pixelRatio` zu skalieren
    // wäre der zweite Weg, aber dort landet die gerundete Zielbreite als Fließkomma-Produkt
    // in der Leinwandgröße; so ist sie zugesichert ganzzahlig.
    const stage = new Konva.Stage({
      container: this.document.createElement('div'),
      width: targetWidthPx,
      height: Math.round(targetWidthPx * (CANVAS_HEIGHT / CANVAS_WIDTH)),
    });

    try {
      drawItemsToStage(stage, buildDrawItems(input.layers, this.exportContext(input)), scale);

      const exported = await stage.toBlob({ mimeType: 'image/png', pixelRatio: 1 });

      // Konva verspricht nur `Promise<unknown>` — geprüft statt behauptet.
      if (!(exported instanceof Blob)) {
        throw new Error('Der Browser hat kein Bild geliefert.');
      }

      return { image: exported, missing: [] };
    } finally {
      stage.destroy();
    }
  }

  /**
   * Beim Export gibt es niemanden, der etwas auswählen könnte: Ohne Auswahl und ohne
   * Bildbearbeitung erzeugt `buildDrawItems` von sich aus weder Auswahlrahmen noch den Rahmen
   * einer aktiven Bildfläche — es muss nichts nachträglich ausgeblendet werden.
   *
   * Bilder und Schriften sind hier noch leer; Phase 2 lädt sie und ersetzt genau diese drei
   * Zeilen.
   */
  private exportContext(input: CardRenderInput): DrawContext {
    return {
      images: new Map(),
      cardImages: new Map(),
      loadedFonts: new Set(),
      content: input.content,
      selectedLayerId: null,
      interactive: false,
      imageEditing: false,
      activeImageLayerId: null,
    };
  }
}
