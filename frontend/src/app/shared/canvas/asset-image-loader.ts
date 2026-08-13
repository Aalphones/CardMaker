import { DestroyRef, Injectable, Signal, inject } from '@angular/core';

import { Api } from '../../core/services/api';
import { BlobImageCache } from './blob-image-cache';

/**
 * Lädt Bilder aus dem Vorrat als fertige `HTMLImageElement`.
 *
 * Warum hier direkt der `Api`-Dienst statt eines NgRx-Effects (Abweichung von
 * `docs/conventions/state-management.md`): Bildelemente sind kein serialisierbarer
 * Server-Zustand, sie gehören nicht in den Store. Der Dienst ist ein reiner Render-Cache.
 *
 * Das Holen, Zwischenspeichern und Freigeben steckt in `BlobImageCache` — dasselbe
 * Verhalten braucht der Kartenbild-Lader.
 */
@Injectable({
  providedIn: 'root',
})
export class AssetImageLoader {
  private readonly api = inject(Api);
  private readonly cache = new BlobImageCache<number>();

  readonly images: Signal<ReadonlyMap<number, HTMLImageElement>> = this.cache.images;

  /** Bilder, die nicht geholt werden konnten — der Export wartet sonst auf sie. */
  readonly failedKeys: Signal<ReadonlySet<number>> = this.cache.failedKeys;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cache.releaseObjectUrls());
  }

  load(assetId: number): void {
    this.cache.load(assetId, () => this.api.getBlob(`/assets/${assetId}/file`));
  }
}
