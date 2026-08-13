import { Injectable, Injector, Signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, first, firstValueFrom, of, timeout } from 'rxjs';

import { AssetImageLoader } from './asset-image-loader';
import { requestedAssetIds, requestedFontFamilies } from './card-canvas/draw-items';
import { CardImageLoader, cardImageKey } from './card-image-loader';
import { FontLoader } from './font-loader';
import { CardContent, CardImagePlacement } from './rendering/card-content';
import { FontFamily, isSelfHostedFont } from './rendering/fonts';
import { Layer } from './rendering/layer';
import { CardRenderInput } from './rendering/render-input';

/** Nach dieser Zeit wird gezeichnet, egal was noch fehlt — ein Export darf nie hängen bleiben. */
const MAX_WAIT_MS = 10_000;

/** Genau das, was der `DrawContext` an Vorräten braucht — plus die Liste dessen, was fehlt. */
export interface RenderResources {
  images: ReadonlyMap<number, HTMLImageElement>;
  /** Kartenbilder, umgeschlüsselt auf die Bildfläche — der Lader sortiert nach Karte. */
  cardImages: ReadonlyMap<string, HTMLImageElement>;
  loadedFonts: ReadonlySet<string>;
  /** Klartext-Namen der Ebenen, deren Bild nicht geladen werden konnte. */
  missing: readonly string[];
}

/** Ein Kartenbild, wie es angefordert wird: Fläche für die Zeichenliste, Schlüssel für den Lader. */
interface CardImageRequest {
  layerId: string;
  cacheKey: string;
}

interface ResourceRequest {
  assetIds: readonly number[];
  cardImages: readonly CardImageRequest[];
  fontFamilies: readonly FontFamily[];
}

/**
 * Besorgt alles, was das Zeichnen einer Karte braucht, und **wartet darauf**.
 *
 * Warum gewartet wird: In der laufenden Vorschau darf ein Bild eine Sekunde später
 * nachkommen — im Export nicht. Fehlt dort ein Bild, brennt sich der gestrichelte
 * Platzhalter ins Ergebnis; fehlt eine Schrift, steht der Text nicht nur in der
 * Ersatzschrift, sondern das automatische Verkleinern hat auch noch die falsche Schrift
 * ausgemessen und die Textgröße sitzt dauerhaft daneben.
 */
@Injectable({
  providedIn: 'root',
})
export class RenderResourceLoader {
  private readonly assetImages = inject(AssetImageLoader);
  private readonly cardImages = inject(CardImageLoader);
  private readonly fonts = inject(FontLoader);
  // `toObservable` läuft außerhalb des Aufbau-Kontexts — es braucht den Injektor von Hand.
  private readonly injector = inject(Injector);

  async collect(input: CardRenderInput): Promise<RenderResources> {
    const request = buildRequest(input);

    this.startLoading(input.content, request);
    await this.awaitSettled(request);

    return this.snapshot(input, request);
  }

  /** Anfordern, nicht warten — die Lader werfen Doppelaufträge von sich aus weg. */
  private startLoading(content: CardContent, request: ResourceRequest): void {
    request.assetIds.forEach((assetId: number) => this.assetImages.load(assetId));
    request.fontFamilies.forEach((family: FontFamily) => this.fonts.load(family));

    const cardId = content.cardId;

    if (cardId === null) {
      return;
    }

    request.cardImages.forEach((cardImage: CardImageRequest) =>
      this.cardImages.load(cardId, cardImage.layerId),
    );
  }

  private async awaitSettled(request: ResourceRequest): Promise<void> {
    const settled: Signal<boolean> = computed(() => this.isSettled(request));

    await firstValueFrom(
      toObservable(settled, { injector: this.injector }).pipe(
        filter((isDone: boolean) => isDone),
        first(),
        timeout({ first: MAX_WAIT_MS, with: () => of(true) }),
      ),
    );
  }

  /**
   * „Fertig" heißt nicht „vollständig": Ein Bild, das der Server nicht liefert, ist genauso
   * erledigt wie eines, das ankommt. Ohne die Fehllisten wartete der Export auf etwas, das
   * nie kommt.
   */
  private isSettled(request: ResourceRequest): boolean {
    const assetImages = this.assetImages.images();
    const failedAssets = this.assetImages.failedKeys();
    const cardImages = this.cardImages.images();
    const failedCardImages = this.cardImages.failedKeys();
    const loadedFonts = this.fonts.loaded();
    const failedFonts = this.fonts.failed();

    return (
      request.assetIds.every(
        (assetId: number) => assetImages.has(assetId) || failedAssets.has(assetId),
      ) &&
      request.cardImages.every(
        (cardImage: CardImageRequest) =>
          cardImages.has(cardImage.cacheKey) || failedCardImages.has(cardImage.cacheKey),
      ) &&
      request.fontFamilies.every(
        (family: FontFamily) => loadedFonts.has(family) || failedFonts.has(family),
      )
    );
  }

  private snapshot(input: CardRenderInput, request: ResourceRequest): RenderResources {
    const assetImages = this.assetImages.images();
    const loadedCardImages = this.cardImages.images();
    const cardImagesByLayer = new Map<string, HTMLImageElement>();
    const missing = new Set<string>();

    for (const assetId of request.assetIds) {
      if (!assetImages.has(assetId)) {
        missing.add(assetLayerName(input.layers, input.content, assetId));
      }
    }

    for (const cardImage of request.cardImages) {
      const image = loadedCardImages.get(cardImage.cacheKey);

      if (image) {
        cardImagesByLayer.set(cardImage.layerId, image);
      } else {
        missing.add(layerName(input.layers, cardImage.layerId));
      }
    }

    return {
      images: assetImages,
      cardImages: cardImagesByLayer,
      loadedFonts: this.fonts.loaded(),
      missing: [...missing],
    };
  }
}

function buildRequest(input: CardRenderInput): ResourceRequest {
  const cardId = input.content.cardId;

  return {
    assetIds: requestedAssetIds(input.layers, input.content),
    cardImages:
      cardId === null
        ? []
        : input.content.images.map(
            (placement: CardImagePlacement): CardImageRequest => ({
              layerId: placement.layerId,
              cacheKey: cardImageKey(cardId, placement.layerId),
            }),
          ),
    // Nur eigene Schriftdateien melden sich beim Lader zurück. Eine Systemschrift kommt vom
    // Gerät und stünde nie in `loaded` — auf sie zu warten hieße, bei jedem Export in die
    // volle Wartezeit zu laufen.
    fontFamilies: requestedFontFamilies(input.layers).filter((family: FontFamily) =>
      isSelfHostedFont(family),
    ),
  };
}

/**
 * Welche Ebene wollte dieses Bild? Gefragt wird dieselbe Funktion, die die Auftragsliste
 * erzeugt hat — so gibt es keine zweite Zuordnung, die auseinanderlaufen könnte.
 */
function assetLayerName(layers: Layer[], content: CardContent, assetId: number): string {
  const layer = layers.find((candidate: Layer) =>
    requestedAssetIds([candidate], content).includes(assetId),
  );

  return layer?.name ?? 'Ein Bild';
}

function layerName(layers: Layer[], layerId: string): string {
  return layers.find((layer: Layer) => layer.id === layerId)?.name ?? 'Eine Bildfläche';
}
