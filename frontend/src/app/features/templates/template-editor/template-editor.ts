import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { CardCanvas } from '../../../shared/canvas/card-canvas/card-canvas';
import { Layer, LayerPatch } from '../../../shared/canvas/rendering/layer';
import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { TemplateEditorStore } from '../../../signal-stores/template-editor';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';
import { AddLayerRequest, LayerList } from './layer-list/layer-list';
import { LayerProperties } from './layer-properties/layer-properties';

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
}
