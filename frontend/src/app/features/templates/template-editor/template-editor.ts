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
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
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
import { PreviewUploadService } from '../../../shared/canvas/preview-upload.service';
import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { Notification } from '../../../shared/services/notification';
import { TemplateEditorStore } from '../../../signal-stores/template-editor';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';
import { AddLayerRequest } from './add-layer-menu/add-layer-menu';
import { EditorAction, LayerAction, isTypingTarget, resolveShortcut } from './editor-shortcuts';
import { LayerList } from './layer-list/layer-list';
import { LayerProperties } from './layer-properties/layer-properties';
import { ShortcutsDialog } from './shortcuts-dialog/shortcuts-dialog';
import { StageControls } from './stage-controls/stage-controls';

/** Aus Radweg in Maßstabsänderung: ein voller Rasterschritt (100) ändert um gut 16 %. */
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

/** Elemente, die die Leertaste selbst brauchen — dort schaltet sie nicht das Verschieben ein. */
const ACTIVATABLE_TAGS = ['BUTTON', 'A', 'SUMMARY'];

/** Breite des Vorschaubildes in Bildpunkten; die Höhe folgt dem Kartenverhältnis (587). */
const PREVIEW_WIDTH_PX = 420;

const PREVIEW_FAILED_MESSAGE = 'Das Vorschaubild konnte nicht gespeichert werden.';

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
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly document = inject(DOCUMENT);
  protected readonly templates = inject(TemplatesFacade);
  protected readonly assets = inject(AssetsFacade);
  protected readonly editor = inject(TemplateEditorStore);
  private readonly templatePreview = inject(PreviewUploadService);
  private readonly notification = inject(Notification);

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

  /** Für das Vorschaubild nach dem Speichern — die Zeichenfläche liefert das PNG. */
  private readonly canvas = viewChild(CardCanvas);

  /** Nur fürs Umbenennen per F2 — das Eingabefeld dafür gehört der Ebenenliste. */
  private readonly layerList = viewChild(LayerList);

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
        void this.uploadPreview(template.id);
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

  /**
   * Läuft neben dem Speichern her: Das Template ist zu diesem Zeitpunkt bereits gespeichert.
   * Scheitert das Bild, bleibt es deshalb bei einer Hinweismeldung — kein Dialog, kein
   * Zurückrollen, keine Sperre.
   */
  private async uploadPreview(templateId: number): Promise<void> {
    try {
      const image = await this.canvas()?.exportPng(PREVIEW_WIDTH_PX);

      if (!image) {
        this.notification.show(PREVIEW_FAILED_MESSAGE, 'info');
        return;
      }

      await firstValueFrom(this.templatePreview.upload('templates', templateId, image));
    } catch {
      this.notification.show(PREVIEW_FAILED_MESSAGE, 'info');
    }
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

  protected openShortcuts(): void {
    this.dialog.open(ShortcutsDialog, { autoFocus: 'first-tabbable', restoreFocus: true });
  }

  /**
   * Die gesamte Tastaturbedienung des Editors. Welche Taste was bedeutet, steht in
   * `editor-shortcuts.ts` — hier wird nur ausgeführt.
   */
  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    // Ist ein Dialog offen, gehört ihm die Tastatur — auch Escape, das dort die oberste
    // Stufe der Leiter schließt (CDK macht das selbst).
    if (this.dialog.openDialogs.length > 0) {
      return;
    }

    if (
      event.key === ' ' &&
      !isTypingTarget(event.target) &&
      !this.isActivatableTarget(event.target)
    ) {
      // Nicht auf Schaltflächen: dort löst die Leertaste die Schaltfläche aus, und genau das
      // soll sie auch weiterhin tun.
      event.preventDefault();
      this.editor.setSpaceDown(true);
      return;
    }

    const action = resolveShortcut(event);

    if (!action) {
      return;
    }

    // Trifft ein Kürzel, gehört die Taste dem Editor: Pfeiltasten würden sonst die Seite
    // rollen, Strg+S/Strg+D/Strg+0 zöge sich der Browser.
    event.preventDefault();
    this.runAction(action, event);
  }

  private runAction(action: EditorAction, event: KeyboardEvent): void {
    switch (action.kind) {
      case 'escape':
        this.escape();
        return;
      case 'blurField':
        (event.target as HTMLElement).blur();
        return;
      case 'deselect':
        this.editor.select(null);
        return;
      case 'addLayer':
        this.editor.addLayer(action.type, action.shape);
        return;
      case 'save':
        this.save();
        return;
      case 'undo':
        this.editor.undo();
        return;
      case 'redo':
        this.editor.redo();
        return;
      case 'zoomIn':
        this.editor.zoomIn();
        return;
      case 'zoomOut':
        this.editor.zoomOut();
        return;
      case 'fitView':
        this.editor.fitView();
        return;
      case 'resetZoom':
        this.editor.resetZoom();
        return;
      case 'showShortcuts':
        this.openShortcuts();
        return;
      default:
        this.runLayerAction(action);
    }
  }

  /** Alles, was ohne ausgewählte Ebene kein Ziel hätte. */
  private runLayerAction(action: LayerAction): void {
    const layer = this.selectedLayer();

    if (!layer) {
      return;
    }

    switch (action.kind) {
      case 'move':
        this.moveLayer(layer, action.deltaX, action.deltaY);
        return;
      case 'order':
        this.reorderSelected(action.direction);
        return;
      case 'duplicate':
        this.editor.duplicateLayer(layer.id);
        return;
      case 'remove':
        void this.confirmAndRemoveLayer(layer);
        return;
      case 'toggleVisible':
        this.onToggleVisible(layer.id);
        return;
      case 'rename':
        this.layerList()?.startRenameSelected();
    }
  }

  /**
   * Escape-Reihenfolge, an genau einer Stelle entschieden: Dialoge schließen sich weiter oben
   * selbst (siehe `onKeydown`), danach fällt erst die Auswahl, dann der Editor.
   */
  private escape(): void {
    if (this.editor.selectedLayerId()) {
      this.editor.select(null);
      return;
    }

    void this.router.navigate(['/templates']);
  }

  /** „Nach vorn" ist im Speicher-Array ein Platz weiter hinten (Index 0 liegt zuunterst). */
  private reorderSelected(direction: 1 | -1): void {
    const layers = this.editor.layers();
    const fromIndex = layers.findIndex(
      (layer: Layer) => layer.id === this.editor.selectedLayerId(),
    );
    const toIndex = fromIndex + direction;

    if (fromIndex === -1 || toIndex < 0 || toIndex >= layers.length) {
      return;
    }

    this.editor.moveLayer(fromIndex, toIndex);
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

  private isActivatableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const role = target.getAttribute('role');

    return ACTIVATABLE_TAGS.includes(target.tagName) || role === 'button' || role === 'menuitem';
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
