import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';

import { CardCanvas } from '../../../shared/canvas/card-canvas/card-canvas';
import { offsetLinePoints } from '../../../shared/canvas/rendering/apply-transform';
import { Layer, LayerPatch } from '../../../shared/canvas/rendering/layer';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { TemplateEditorStore } from '../../../signal-stores/template-editor';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';
import { AddLayerRequest, LayerList } from './layer-list/layer-list';
import { LayerProperties } from './layer-properties/layer-properties';

const ARROW_STEP = 1;
const ARROW_STEP_FAST = 10;

@Component({
  selector: 'app-template-editor',
  imports: [CardCanvas, RouterLink, LayerList, LayerProperties],
  templateUrl: './template-editor.html',
  styleUrl: './template-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TemplateEditorStore],
})
export class TemplateEditor implements ComponentWithUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(Dialog);
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

  constructor() {
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

    this.assets.ensureLoaded();
  }

  hasUnsavedChanges(): boolean {
    return this.editor.dirty() || this.nameChanged();
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

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
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
