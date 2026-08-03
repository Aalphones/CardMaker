import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core';

import { Api } from '../../core/services/api';

/**
 * Lädt hochgeladene Bilder als Blob und hält sie als fertige `HTMLImageElement` bereit.
 *
 * Warum hier direkt der `Api`-Dienst statt eines NgRx-Effects (Abweichung von
 * `docs/conventions/state-management.md`): Bildelemente sind kein serialisierbarer
 * Server-Zustand, sie gehören nicht in den Store. Der Dienst ist ein reiner Render-Cache.
 *
 * Warum überhaupt der Umweg über Blobs: `/assets/{id}/file` liegt hinter der Anmeldung,
 * ein direktes `<img src="/api/assets/…">` schickt die Anmeldekopfzeile nicht mit.
 */
@Injectable({
  providedIn: 'root',
})
export class AssetImageLoader {
  private readonly api = inject(Api);
  private readonly requestedIds = new Set<number>();
  private readonly objectUrls: string[] = [];
  private readonly loadedImages = signal<ReadonlyMap<number, HTMLImageElement>>(new Map());

  /**
   * Ein Signal für alle Bilder statt eines pro Bildnummer: Die Vorschau leitet ihre
   * komplette Zeichenliste aus einem einzigen `computed()` ab, das ohnehin von jedem
   * Bild abhängt — feinere Signale würden hier nichts einsparen.
   */
  readonly images: Signal<ReadonlyMap<number, HTMLImageElement>> = this.loadedImages.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.objectUrls.forEach((objectUrl: string) => URL.revokeObjectURL(objectUrl));
      this.objectUrls.length = 0;
    });
  }

  load(assetId: number): void {
    if (this.requestedIds.has(assetId)) {
      return;
    }

    this.requestedIds.add(assetId);
    this.api.getBlob(`/assets/${assetId}/file`).subscribe({
      next: (blob: Blob) => this.publish(assetId, blob),
      // Fehlgeschlagene Bilder wieder freigeben, damit ein späterer Versuch erneut lädt.
      error: () => this.requestedIds.delete(assetId),
    });
  }

  private publish(assetId: number, blob: Blob): void {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    this.objectUrls.push(objectUrl);
    image.onload = () => {
      const withNewImage = new Map(this.loadedImages());
      withNewImage.set(assetId, image);
      this.loadedImages.set(withNewImage);
    };
    image.src = objectUrl;
  }
}
