import { DestroyRef, Injectable, Signal, inject } from '@angular/core';

import { Api } from '../../core/services/api';
import { BlobImageCache } from './blob-image-cache';

/** Schlüssel im Zwischenspeicher — ein Kartenbild hängt an Karte **und** Bildfläche. */
export function cardImageKey(cardId: number, layerId: string): string {
  return `${cardId}:${layerId}`;
}

/**
 * Lädt die hochgeladenen Bilder einer Karte als fertige `HTMLImageElement`.
 *
 * Warum hier direkt der `Api`-Dienst statt eines NgRx-Effects (Abweichung von
 * `docs/conventions/state-management.md`, dokumentiert wie beim Vorratslader):
 * Bildelemente sind kein serialisierbarer Server-Zustand, sie gehören nicht in den Store.
 * Der Dienst ist ein reiner Render-Zwischenspeicher.
 */
@Injectable({
  providedIn: 'root',
})
export class CardImageLoader {
  private readonly api = inject(Api);
  private readonly cache = new BlobImageCache<string>();

  /** Alle geladenen Kartenbilder, Schlüssel `cardId:layerId`. */
  readonly images: Signal<ReadonlyMap<string, HTMLImageElement>> = this.cache.images;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cache.releaseObjectUrls());
  }

  load(cardId: number, layerId: string): void {
    this.cache.load(cardImageKey(cardId, layerId), () =>
      this.api.getBlob(`/cards/${cardId}/images/${layerId}/file`),
    );
  }

  /** Nach dem Ersetzen der Datei in derselben Bildfläche. */
  reload(cardId: number, layerId: string): void {
    this.cache.forget(cardImageKey(cardId, layerId));
    this.load(cardId, layerId);
  }

  forget(cardId: number, layerId: string): void {
    this.cache.forget(cardImageKey(cardId, layerId));
  }
}
