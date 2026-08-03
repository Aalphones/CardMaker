import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Signal,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ContainerConfig } from 'konva/lib/Container';
import { LayerConfig } from 'konva/lib/Layer';
import { CoreShapeComponent, StageComponent } from 'ng2-konva';

import { AssetImageLoader } from '../asset-image-loader';
import { CANVAS_HEIGHT, CANVAS_WIDTH, Layer } from '../rendering/layer';
import { DrawItem, buildDrawItems, requestedAssetIds } from './draw-items';

@Component({
  selector: 'app-card-canvas',
  imports: [CoreShapeComponent, StageComponent],
  templateUrl: './card-canvas.html',
  styleUrl: './card-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCanvas {
  private readonly hostElement: HTMLElement = inject(ElementRef).nativeElement;
  private readonly imageLoader = inject(AssetImageLoader);

  readonly layers = input.required<Layer[]>();
  readonly selectedLayerId = input<string | null>(null);
  readonly interactive = input(false);

  readonly layerClicked = output<string>();

  protected readonly stageWidth = signal(0);

  /**
   * Die Bühne bekommt Bildschirmpunkte, alle Ebenenwerte bleiben in Canvas-Einheiten —
   * umgerechnet wird genau einmal, über den Maßstab der Konva-Ebene. Um scharfe Kanten auf
   * hochauflösenden Bildschirmen kümmert sich Konva selbst (es zeichnet intern mit
   * `devicePixelRatio`); die Bühnengröße hier zusätzlich zu multiplizieren würde doppelt
   * skalieren.
   */
  protected readonly stageConfig: Signal<ContainerConfig> = computed(() => ({
    width: this.stageWidth(),
    height: Math.round(this.stageWidth() * (CANVAS_HEIGHT / CANVAS_WIDTH)),
  }));

  protected readonly konvaLayerConfig: Signal<LayerConfig> = computed(() => {
    const scale = this.stageWidth() / CANVAS_WIDTH;

    return { scaleX: scale, scaleY: scale, listening: this.interactive() };
  });

  protected readonly drawItems: Signal<DrawItem[]> = computed(() =>
    buildDrawItems(this.layers(), {
      images: this.imageLoader.images(),
      selectedLayerId: this.selectedLayerId(),
    }),
  );

  constructor() {
    effect(() => {
      requestedAssetIds(this.layers()).forEach((assetId: number) => this.imageLoader.load(assetId));
    });

    const sizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      this.stageWidth.set(Math.round(entries[0]?.contentRect.width ?? 0));
    });

    sizeObserver.observe(this.hostElement);
    inject(DestroyRef).onDestroy(() => sizeObserver.disconnect());
  }

  protected selectLayer(layerId: string): void {
    if (this.interactive()) {
      this.layerClicked.emit(layerId);
    }
  }
}
