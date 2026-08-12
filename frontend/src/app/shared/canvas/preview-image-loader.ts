import { DestroyRef, Injectable, inject } from '@angular/core';

import { Api } from '../../core/services/api';
import { BlobImageCache } from './blob-image-cache';

/**
 * Sorte des Vorschaubildes — zugleich das Pfadstück der Endpunkte
 * (`/api/templates/{id}/preview/file`, `/api/cards/{id}/preview/file`). Absicht, nicht Zufall.
 */
export type PreviewKind = 'templates' | 'cards';

/**
 * Lädt Vorschaubilder für Templates und Karten als fertige `HTMLImageElement`.
 *
 * Gemeinsam für beide Sorten, weil Template-Übersicht und Kartenliste dieselbe Kachel mit
 * Bild zeigen — das Holen/Zwischenspeichern/Freigeben steckt in `BlobImageCache`.
 */
@Injectable({
  providedIn: 'root',
})
export class PreviewImageLoader {
  private readonly api = inject(Api);
  private readonly cache = new BlobImageCache<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cache.releaseObjectUrls());
  }

  load(kind: PreviewKind, id: number, previewUpdatedAt: string): void {
    const key = this.key(kind, id, previewUpdatedAt);

    this.cache.load(key, () => this.api.getBlob(`/${kind}/${id}/preview/file`));
  }

  /**
   * `previewUpdatedAt` ist Teil des Schlüssels — ein neu gespeichertes Bild lädt dadurch
   * automatisch neu, ohne dass irgendwo eine Zwischenspeicher-Leerung nötig wäre.
   */
  imageUrl(kind: PreviewKind, id: number, previewUpdatedAt: string): string | null {
    const key = this.key(kind, id, previewUpdatedAt);

    return this.cache.images().get(key)?.src ?? null;
  }

  private key(kind: PreviewKind, id: number, previewUpdatedAt: string): string {
    return `${kind}:${id}:${previewUpdatedAt}`;
  }
}
