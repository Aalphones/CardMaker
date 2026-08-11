import { Dialog } from '@angular/cdk/dialog';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';

import { CardCanvas } from '../../../shared/canvas/card-canvas/card-canvas';
import { offsetLinePoints } from '../../../shared/canvas/rendering/apply-transform';
import { CANVAS_WIDTH, Layer, LayerPatch } from '../../../shared/canvas/rendering/layer';
import {
  Point,
  cardOrigin,
  clampZoom,
  isOverCard,
  panKeepingAnchor,
  screenToCanvas,
} from '../../../shared/canvas/rendering/units';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { TemplateEditorStore } from '../../../signal-stores/template-editor';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';
import { AddLayerRequest } from './add-layer-menu/add-layer-menu';
import { LayerList } from './layer-list/layer-list';
import { LayerProperties } from './layer-properties/layer-properties';
import { StageControls } from './stage-controls/stage-controls';

const ARROW_STEP = 1;
const ARROW_STEP_FAST = 10;

/** Aus Radweg in Maßstabsänderung: ein voller Rasterschritt (100) ändert um gut 16 %. */
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

/** Elemente, die die Leertaste selbst brauchen — dort schaltet sie nicht das Verschieben ein. */
const ACTIVATABLE_TAGS = ['BUTTON', 'A', 'SUMMARY'];

@Component({
  selector: 'app-template-editor',
  imports: [CardCanvas, RouterLink, LayerList, LayerProperties, StageControls],
  templateUrl: './template-editor.html',
  styleUrl: './template-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TemplateEditorStore],
})
export class TemplateEditor implements ComponentWithUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(Dialog);
  private readonly document = inject(DOCUMENT);
  protected readonly templates = inject(TemplatesFacade);
  protected readonly assets = inject(AssetsFacade);
  protected readonly editor = inject(TemplateEditorStore);

  private readonly templateId = toSignal(
    this.route.paramMap.pipe(map((paramMap: ParamMap) => Number(paramMap.get('id')))),
    { initialValue: NaN },
  );

  private readonly loadedForId = signal<number | null>(null);
  private readonly originalName = signal('');
  protected readonly nameDraft = signal('');
  protected readonly saving = signal(false);

  protected readonly nameChanged: Signal<boolean> = computed(() => this.nameDraft() !== this.originalName());
  protected readonly canSave: Signal<boolean> = computed(
    () => (this.editor.dirty() || this.nameChanged()) && this.nameDraft().trim() !== '' && !this.saving(),
  );

  protected readonly selectedLayer = this.editor.selectedLayer;

  /** Nur unter 1000px Fensterbreite wirksam — darüber stehen beide Spalten ohnehin fest. */
  protected readonly layersPanelOpen = signal(false);
  protected readonly propertiesPanelOpen = signal(false);

  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');

  /** Läuft gerade eine Verschiebe-Geste? (Leertaste allein reicht dafür noch nicht.) */
  protected readonly panning = signal(false);
  private panPointerId: number | null = null;
  private lastPanClientPoint: Point | null = null;

  /** Die Karte hängt absolut in der Bühne — Breite aus dem Maßstab, Ecke aus Maßstab + Verschiebung. */
  protected readonly cardWidth: Signal<number> = computed(() => CANVAS_WIDTH * this.editor.zoom());
  protected readonly cardPosition: Signal<Point> = computed(() => cardOrigin(this.editor.view()));

  constructor() {
    // Der Editor deckt die App vollständig ab; die Seite darunter darf nicht mitscrollen.
    this.document.body.classList.add('editor-open');
    inject(DestroyRef).onDestroy(() => this.document.body.classList.remove('editor-open'));

    effect(() => {
      const id = this.templateId();

      if (!Number.isNaN(id)) {
        this.templates.loadOne(id);
      }
    });

    effect(() => {
      const template = this.templates.current();

      if (template && template.id !== this.loadedForId()) {
        this.editor.startEditing(template.layers);
        this.originalName.set(template.name);
        this.nameDraft.set(template.name);
        this.loadedForId.set(template.id);
      }
    });

    effect(() => {
      const template = this.templates.current();

      if (template && this.saving() && template.id === this.loadedForId()) {
        this.editor.markSaved();
        this.originalName.set(template.name);
        this.saving.set(false);
      }
    });

    effect(() => {
      if (this.templates.error() && this.saving()) {
        this.saving.set(false);
      }
    });

    // Die Bühnengröße wird gemessen, nicht geraten: „Einpassen" rechnet damit, und die
    // Bühne erscheint erst, wenn das Template geladen ist — deshalb hängt der Beobachter
    // am Signal des Kindelements statt einmalig im Konstruktor.
    const stageObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const rect = entries[0]?.contentRect;

      if (rect) {
        this.editor.setStageSize({ width: rect.width, height: rect.height });
      }
    });

    effect(() => {
      const stage = this.stageRef();

      stageObserver.disconnect();

      if (stage) {
        stageObserver.observe(stage.nativeElement);
      }
    });

    inject(DestroyRef).onDestroy(() => stageObserver.disconnect());

    this.assets.ensureLoaded();
  }

  hasUnsavedChanges(): boolean {
    return this.editor.dirty() || this.nameChanged();
  }

  protected toggleLayersPanel(): void {
    this.layersPanelOpen.update((isOpen: boolean) => !isOpen);
  }

  protected togglePropertiesPanel(): void {
    this.propertiesPanelOpen.update((isOpen: boolean) => !isOpen);
  }

  /** Rad über der Bühne: stufenlos zum Zeiger hin, in den Grenzen 10 % bis 400 %. */
  protected onStageWheel(event: WheelEvent): void {
    event.preventDefault();

    const view = this.editor.view();
    const anchor = this.stagePoint(event);
    const zoom = clampZoom(view.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY));

    this.editor.zoomTo(zoom, panKeepingAnchor(view, anchor, zoom));
  }

  protected onStagePointerDown(event: PointerEvent): void {
    const isMiddleButton = event.button === 1;

    if (!isMiddleButton && !this.editor.spaceDown()) {
      return;
    }

    // Unterbindet zugleich das Rollen-Kreuz, das die mittlere Maustaste sonst aufspannt.
    event.preventDefault();

    this.panning.set(true);
    this.panPointerId = event.pointerId;
    this.lastPanClientPoint = { x: event.clientX, y: event.clientY };
    this.stageRef()?.nativeElement.setPointerCapture(event.pointerId);
  }

  protected onStagePointerMove(event: PointerEvent): void {
    const canvasPoint = screenToCanvas(this.stagePoint(event), this.editor.view());
    this.editor.setCursorPos(isOverCard(canvasPoint) ? canvasPoint : null);

    const lastPoint = this.lastPanClientPoint;

    if (!this.panning() || event.pointerId !== this.panPointerId || !lastPoint) {
      return;
    }

    this.editor.panBy(event.clientX - lastPoint.x, event.clientY - lastPoint.y);
    this.lastPanClientPoint = { x: event.clientX, y: event.clientY };
  }

  protected onStagePointerUp(event: PointerEvent): void {
    if (event.pointerId === this.panPointerId) {
      this.endPan();
    }
  }

  protected onStagePointerLeave(): void {
    this.editor.setCursorPos(null);
  }

  /** Zeigerposition relativ zur oberen linken Ecke der Bühne. */
  private stagePoint(event: MouseEvent): Point {
    const bounds = this.stageRef()?.nativeElement.getBoundingClientRect();

    if (!bounds) {
      return { x: 0, y: 0 };
    }

    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  private endPan(): void {
    const pointerId = this.panPointerId;
    const stage = this.stageRef()?.nativeElement;

    if (pointerId !== null && stage?.hasPointerCapture(pointerId)) {
      stage.releasePointerCapture(pointerId);
    }

    this.panPointerId = null;
    this.lastPanClientPoint = null;
    this.panning.set(false);
  }

  protected onNameInput(event: Event): void {
    this.nameDraft.set((event.target as HTMLInputElement).value);
  }

  protected save(): void {
    const template = this.templates.current();

    if (!template || !this.canSave()) {
      return;
    }

    this.saving.set(true);
    this.templates.save(template.id, this.nameDraft().trim(), template.description, this.editor.layers());
  }

  protected onAddLayer(request: AddLayerRequest): void {
    this.editor.addLayer(request.type, request.shape);
  }

  protected onToggleVisible(id: string): void {
    const layer = this.editor.layers().find((candidate: Layer) => candidate.id === id);

    if (layer) {
      this.editor.patchLayer(id, { visible: !layer.visible });
    }
  }

  protected onPatch(patch: LayerPatch): void {
    const id = this.editor.selectedLayerId();

    if (id) {
      this.editor.patchLayer(id, patch);
    }
  }

  /**
   * Entf löscht die ausgewählte Ebene (mit derselben Rückfrage wie in der Ebenenliste),
   * Pfeiltasten verschieben sie um eine Canvas-Einheit, mit Umschalttaste um zehn — nur
   * wirksam, wenn kein Eingabefeld den Fokus hat (Plan-Phase-7-Checkliste „Tastatur").
   */
  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' && !this.isTypingTarget(event.target) && !this.isActivatableTarget(event.target)) {
      // Nicht auf Schaltflächen: dort löst die Leertaste die Schaltfläche aus, und genau das
      // soll sie auch weiterhin tun.
      event.preventDefault();
      this.editor.setSpaceDown(true);
      return;
    }

    const layer = this.selectedLayer();

    if (!layer || this.isTypingTarget(event.target)) {
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      void this.confirmAndRemoveLayer(layer);
      return;
    }

    const step = event.shiftKey ? ARROW_STEP_FAST : ARROW_STEP;
    const arrowDelta = this.arrowKeyDelta(event.key, step);

    if (arrowDelta) {
      event.preventDefault();
      this.moveLayer(layer, arrowDelta.deltaX, arrowDelta.deltaY);
    }
  }

  @HostListener('window:keyup', ['$event'])
  protected onKeyup(event: KeyboardEvent): void {
    if (event.key === ' ') {
      this.editor.setSpaceDown(false);
      this.endPan();
    }
  }

  /**
   * Verlässt das Fenster den Vordergrund, kommt kein `keyup` mehr an — ohne das hier bliebe
   * der Editor nach einem Fensterwechsel im Verschiebe-Modus hängen.
   */
  @HostListener('window:blur')
  protected onWindowBlur(): void {
    this.editor.setSpaceDown(false);
    this.endPan();
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  private isActivatableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const role = target.getAttribute('role');

    return ACTIVATABLE_TAGS.includes(target.tagName) || role === 'button' || role === 'menuitem';
  }

  private arrowKeyDelta(key: string, step: number): { deltaX: number; deltaY: number } | null {
    switch (key) {
      case 'ArrowLeft':
        return { deltaX: -step, deltaY: 0 };
      case 'ArrowRight':
        return { deltaX: step, deltaY: 0 };
      case 'ArrowUp':
        return { deltaX: 0, deltaY: -step };
      case 'ArrowDown':
        return { deltaX: 0, deltaY: step };
      default:
        return null;
    }
  }

  private moveLayer(layer: Layer, deltaX: number, deltaY: number): void {
    if (layer.type === 'shape' && layer.shape === 'line') {
      this.editor.patchLayer(layer.id, { points: offsetLinePoints(layer.points, deltaX, deltaY) });
      return;
    }

    if (layer.type === 'frame') {
      return;
    }

    this.editor.patchLayer(layer.id, { x: layer.x + deltaX, y: layer.y + deltaY });
  }

  private async confirmAndRemoveLayer(layer: Layer): Promise<void> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: { title: 'Ebene löschen', message: `Ebene „${layer.name}" wirklich löschen?` },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.editor.removeLayer(layer.id);
    }
  }
}
