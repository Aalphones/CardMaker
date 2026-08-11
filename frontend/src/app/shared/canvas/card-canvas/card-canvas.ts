import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Signal,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import Konva from 'konva';
import { ContainerConfig } from 'konva/lib/Container';
import { LayerConfig } from 'konva/lib/Layer';
import { TransformerConfig } from 'konva/lib/shapes/Transformer';
import { CoreShapeComponent, NgKonvaEventObject, StageComponent } from 'ng2-konva';

import { AssetImageLoader } from '../asset-image-loader';
import { FontLoader } from '../font-loader';
import { geometryFromNodeSnapshot, offsetLinePoints } from '../rendering/apply-transform';
import { FontFamily } from '../rendering/fonts';
import { CANVAS_HEIGHT, CANVAS_WIDTH, Layer, LayerPatch } from '../rendering/layer';
import { DrawItem, buildDrawItems, requestedAssetIds, requestedFontFamilies } from './draw-items';

/** Bildschirmpunkte, nicht Canvas-Einheiten — werden unten durch den Bühnenmaßstab geteilt,
 *  damit Anfasser bei jeder Fenstergröße gleich groß aussehen. */
const ANCHOR_SIZE_PX = 10;
const BORDER_WIDTH_PX = 1.5;
const ROTATE_ANCHOR_OFFSET_PX = 26;

/**
 * Konvas eigene Voreinstellung (`Transformer`-Quelltext, `ANCHORS_NAMES`) — hier fest
 * ausgeschrieben statt `undefined` zu übergeben: Der Konfig-Abgleich in `ng2-konva` setzt
 * nur Schlüssel, die im Objekt stehen, ein `undefined` würde also `enabledAnchors` am
 * Konva-Knoten wirklich auf `undefined` setzen statt es unverändert zu lassen — mit
 * Linie-dann-Rechteck-Auswahl blieben sonst alle Anfasser stumm ausgeblendet.
 */
const ALL_ANCHORS = [
  'top-left',
  'top-center',
  'top-right',
  'middle-right',
  'middle-left',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

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
  private readonly fontLoader = inject(FontLoader);

  readonly layers = input.required<Layer[]>();
  readonly selectedLayerId = input<string | null>(null);
  readonly interactive = input(false);

  /**
   * Solange die Ansicht verschoben wird (Leertaste oder mittlere Maustaste), hört die
   * Zeichenebene nicht mehr auf Zeigerereignisse: Ein Ziehen verschiebt dann die Ansicht,
   * nie die ausgewählte Ebene — und der Anfasser reagiert ebenfalls nicht. Die Auswahl
   * bleibt dabei sichtbar, deshalb ein eigener Eingang statt `interactive` umzuschalten.
   */
  readonly panning = input(false);

  readonly layerClicked = output<string>();
  readonly layerTransformed = output<{ id: string; changes: LayerPatch }>();

  /**
   * Beginn einer Zieh- oder Skaliergeste. Der Editor legt darauf seine Momentaufnahme für den
   * Verlauf ab — eine Geste ergibt so einen Schritt, nicht einen pro Mausbewegung.
   */
  readonly gestureStart = output<void>();

  protected readonly stageWidth = signal(0);

  private readonly transformerRef = viewChild<CoreShapeComponent>('transformer');

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

  private readonly canvasScale: Signal<number> = computed(() => this.stageWidth() / CANVAS_WIDTH);

  protected readonly konvaLayerConfig: Signal<LayerConfig> = computed(() => {
    const scale = this.canvasScale();

    return { scaleX: scale, scaleY: scale, listening: this.interactive() && !this.panning() };
  });

  protected readonly drawItems: Signal<DrawItem[]> = computed(() =>
    buildDrawItems(this.layers(), {
      images: this.imageLoader.images(),
      loadedFonts: this.fontLoader.loaded(),
      selectedLayerId: this.selectedLayerId(),
      interactive: this.interactive(),
    }),
  );

  private readonly selectedLayer: Signal<Layer | null> = computed(
    () => this.layers().find((layer: Layer) => layer.id === this.selectedLayerId()) ?? null,
  );

  /** Der Rahmen liegt immer vollflächig (Kontrakt) — keine Geometrie, also kein Anfasser. */
  private readonly transformable: Signal<boolean> = computed(() => {
    const layer = this.selectedLayer();

    return this.interactive() && layer !== null && layer.type !== 'frame';
  });

  private readonly isSelectedLine: Signal<boolean> = computed(() => {
    const layer = this.selectedLayer();

    return layer !== null && layer.type === 'shape' && layer.shape === 'line';
  });

  /**
   * Eine Linie hat keine Fläche zum Skalieren/Drehen — nur die zwei Punkte lassen sich
   * verschieben (Plan-Phase-7-Checkliste „Linien gesondert behandeln").
   */
  protected readonly transformerConfig: Signal<TransformerConfig> = computed(() => {
    const scale = this.canvasScale() || 1;
    const isLine = this.isSelectedLine();

    return {
      rotateEnabled: !isLine,
      enabledAnchors: isLine ? [] : ALL_ANCHORS,
      keepRatio: false,
      ignoreStroke: true,
      anchorSize: ANCHOR_SIZE_PX / scale,
      borderStrokeWidth: BORDER_WIDTH_PX / scale,
      rotateAnchorOffset: ROTATE_ANCHOR_OFFSET_PX / scale,
    };
  });

  constructor() {
    effect(() => {
      requestedAssetIds(this.layers()).forEach((assetId: number) => this.imageLoader.load(assetId));
      requestedFontFamilies(this.layers()).forEach((family: FontFamily) =>
        this.fontLoader.load(family),
      );
    });

    const sizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      this.stageWidth.set(Math.round(entries[0]?.contentRect.width ?? 0));
    });

    sizeObserver.observe(this.hostElement);
    inject(DestroyRef).onDestroy(() => sizeObserver.disconnect());

    // Der Anfasser wird imperativ an den ausgewählten Knoten gehängt, statt je Ebene einen
    // eigenen `ko-transformer` mitzuzeichnen (Wegwerf-Check aus dem Plan, siehe
    // README „Wo ich mir am wenigsten sicher bin"): Es kann ohnehin immer nur eine Ebene
    // gleichzeitig ausgewählt sein, ein einziger umgehängter Anfasser ist also nicht nur der
    // im Plan vorgesehene Ausweg, sondern von vornherein die einfachere Lösung — die
    // Wegwerf-Probe für die Alternative (ein Anfasser pro Ebene aus der `@for`-Schleife)
    // entfällt damit. `afterRenderEffect`, weil der Konva-Knoten erst nach dem Rendern der
    // `@for`-Schleife über `stage.findOne()` auffindbar ist.
    afterRenderEffect(() => {
      const transformerComponent = this.transformerRef();

      if (!transformerComponent) {
        return;
      }

      const transformer = transformerComponent.getNode() as Konva.Transformer;

      if (!this.transformable()) {
        transformer.nodes([]);
        return;
      }

      // `.name` statt `#id` — siehe Kommentar bei `interactionConfig()` in draw-items.ts.
      const layer = this.selectedLayer();
      const target = layer ? transformer.getStage()?.findOne(`.${layer.id}`) : undefined;

      transformer.nodes(target ? [target] : []);
    });
  }

  protected selectLayer(layerId: string): void {
    if (this.interactive()) {
      this.layerClicked.emit(layerId);
    }
  }

  protected onGestureStart(): void {
    if (this.interactive()) {
      this.gestureStart.emit();
    }
  }

  protected onDragEnd(event: NgKonvaEventObject<MouseEvent>): void {
    const layer = this.selectedLayer();
    const node = event.event.target as Konva.Shape;

    if (!layer) {
      return;
    }

    if (layer.type === 'shape' && layer.shape === 'line') {
      const points = offsetLinePoints(layer.points, node.x(), node.y());

      node.position({ x: 0, y: 0 });
      this.layerTransformed.emit({ id: layer.id, changes: { points } });
      return;
    }

    this.emitGeometry(layer.id, node);
  }

  protected onTransformEnd(event: NgKonvaEventObject<MouseEvent>): void {
    const layer = this.selectedLayer();

    // Linien haben keine Anfasser (enabledAnchors: []) — kommt trotzdem ein Event, lieber
    // nichts anwenden als eine Ebene ohne Geometrie mit x/y/width/height zu überschreiben.
    if (!layer || (layer.type === 'shape' && layer.shape === 'line')) {
      return;
    }

    this.emitGeometry(layer.id, event.event.target as Konva.Shape);
  }

  private emitGeometry(layerId: string, node: Konva.Shape): void {
    const changes = geometryFromNodeSnapshot({
      x: node.x(),
      y: node.y(),
      width: node.width(),
      height: node.height(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });

    node.scaleX(1);
    node.scaleY(1);

    this.layerTransformed.emit({ id: layerId, changes });
  }
}
