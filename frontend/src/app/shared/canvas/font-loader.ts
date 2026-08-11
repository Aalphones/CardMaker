import { DOCUMENT, Injectable, Signal, inject, signal } from '@angular/core';

import { FontFamily, isSelfHostedFont } from './rendering/fonts';

/**
 * Fordert die mitgelieferten Kartenschriften an und meldet, welche fertig geladen sind.
 *
 * Warum das nötig ist: Der Browser lädt eine `@font-face`-Schrift erst, wenn sie im
 * Seitenlayout wirklich vorkommt. Konva zeichnet aber auf ein Bitmap — das zählt für den
 * Browser nicht als Verwendung. Ohne diese ausdrückliche Anforderung würde die Karte still
 * in der Ersatzschrift gezeichnet, und das automatische Verkleinern würde die falsche
 * Schrift ausmessen.
 *
 * Die Größenangabe im Ladeaufruf ist Pflichtbestandteil der Kurzschreibweise, nicht die
 * spätere Zeichengröße: Geladen wird die ganze Schriftdatei, egal welche Größe hier steht.
 */
const LOAD_REQUEST_FONT_SIZE_PX = 40;

@Injectable({
  providedIn: 'root',
})
export class FontLoader {
  private readonly document = inject(DOCUMENT);
  private readonly requestedFamilies = new Set<string>();
  private readonly loadedFamilies = signal<ReadonlySet<string>>(new Set());

  /** Die Schriften, die fertig geladen sind — bis dahin zeichnet `draw-items` die Ersatzschrift. */
  readonly loaded: Signal<ReadonlySet<string>> = this.loadedFamilies.asReadonly();

  load(family: FontFamily): void {
    if (!isSelfHostedFont(family) || this.requestedFamilies.has(family)) {
      return;
    }

    this.requestedFamilies.add(family);
    this.document.fonts
      .load(`${LOAD_REQUEST_FONT_SIZE_PX}px "${family}"`)
      .then((faces: FontFace[]) => {
        if (faces.length === 0) {
          throw new Error('keine passende Schriftdatei gefunden');
        }

        this.publish(family);
      })
      .catch((error: unknown) => {
        // Nicht erneut anfordern: Bleibt die Datei weg, bleibt die Ersatzschrift stehen —
        // ein Wiederholungsversuch pro Neuzeichnen würde nur das Netz vollmachen.
        console.warn(`Schriftart "${family}" konnte nicht geladen werden.`, error);
      });
  }

  private publish(family: FontFamily): void {
    const withNewFamily = new Set(this.loadedFamilies());

    withNewFamily.add(family);
    this.loadedFamilies.set(withNewFamily);
  }
}
