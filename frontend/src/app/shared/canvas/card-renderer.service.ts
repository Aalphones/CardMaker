import { DOCUMENT, Injectable, inject } from '@angular/core';
import Konva from 'konva';

import { DrawContext, buildDrawItems } from './card-canvas/draw-items';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './rendering/layer';
import { CardRenderInput } from './rendering/render-input';
import { drawItemsToStage } from './render-stage';
import { RenderResourceLoader, RenderResources } from './render-resources.service';

export interface RenderResult {
  /** Das fertige Bild im angeforderten Format. */
  image: Blob;
  /** Bildflächen/Icons, deren Datei nicht geladen werden konnte — leer heißt vollständig. */
  missing: readonly string[];
}

/** Wie das fertige Bild aussehen soll. Ohne Angabe: PNG mit Durchsichtigkeit. */
export interface RenderOutput {
  mimeType: string;
  /** Nur bei verlustbehafteten Formaten wirksam, 0 bis 1. */
  quality?: number;
  /**
   * Weißes Rechteck unter die Karte legen. Pflicht für JPEG: das Format kennt keine
   * Durchsichtigkeit, ohne Grund werden durchsichtige Stellen schwarz.
   */
  opaqueBackground?: boolean;
}

const PNG_OUTPUT: RenderOutput = { mimeType: 'image/png' };

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
  private readonly resources = inject(RenderResourceLoader);

  async render(
    input: CardRenderInput,
    targetWidthPx: number,
    output: RenderOutput = PNG_OUTPUT,
  ): Promise<RenderResult> {
    // Erst die Vorräte, dann zeichnen: Wer sofort zeichnet, brennt Platzhalter und
    // Ersatzschriften ins Bild (siehe `render-resources.service.ts`).
    const resources = await this.resources.collect(input);
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
      if (output.opaqueBackground) {
        addWhiteBackground(stage);
      }

      drawItemsToStage(stage, buildDrawItems(input.layers, exportContext(input, resources)), scale);

      const exported = await stage.toBlob({
        mimeType: output.mimeType,
        quality: output.quality,
        pixelRatio: 1,
      });

      // Konva verspricht nur `Promise<unknown>` — geprüft statt behauptet.
      if (!(exported instanceof Blob)) {
        throw new Error('Der Browser hat kein Bild geliefert.');
      }

      return { image: exported, missing: resources.missing };
    } finally {
      stage.destroy();
    }
  }
}

/** Eigene Ebene ganz unten — sie liegt vor der Zeichenebene auf der Bühne, also darunter. */
function addWhiteBackground(stage: Konva.Stage): void {
  const layer = new Konva.Layer({ listening: false });

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: '#ffffff',
    }),
  );

  stage.add(layer);
}

/**
 * Beim Export gibt es niemanden, der etwas auswählen könnte: Ohne Auswahl und ohne
 * Bildbearbeitung erzeugt `buildDrawItems` von sich aus weder Auswahlrahmen noch den Rahmen
 * einer aktiven Bildfläche — es muss nichts nachträglich ausgeblendet werden.
 */
function exportContext(input: CardRenderInput, resources: RenderResources): DrawContext {
  return {
    images: resources.images,
    cardImages: resources.cardImages,
    loadedFonts: resources.loadedFonts,
    content: input.content,
    selectedLayerId: null,
    interactive: false,
    imageEditing: false,
    activeImageLayerId: null,
  };
}
