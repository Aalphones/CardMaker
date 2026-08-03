import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { CardCanvas } from '../../../shared/canvas/card-canvas/card-canvas';
import { Layer } from '../../../shared/canvas/rendering/layer';
import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';
import { exampleLayers } from './example-layers';

@Component({
  selector: 'app-template-editor',
  imports: [CardCanvas, RouterLink],
  templateUrl: './template-editor.html',
  styleUrl: './template-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateEditor implements ComponentWithUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  protected readonly templates = inject(TemplatesFacade);
  private readonly assets = inject(AssetsFacade);

  // Wegwerf-Vorschau, bis die Ebenenliste in Phase 6 echte Ebenen anlegen kann.
  private readonly example = exampleLayers();

  protected readonly showExample = signal(false);

  protected readonly previewLayers: Signal<Layer[]> = computed(() => {
    if (this.showExample()) {
      return this.example;
    }

    return this.templates.current()?.layers ?? [];
  });

  protected readonly exampleButtonLabel: Signal<string> = computed(() => {
    if (this.showExample()) {
      return 'Beispielebenen ausblenden';
    }

    return 'Beispielebenen anzeigen';
  });

  private readonly templateId = toSignal(
    this.route.paramMap.pipe(map((paramMap: ParamMap) => Number(paramMap.get('id')))),
    { initialValue: NaN },
  );

  constructor() {
    effect(() => {
      const id = this.templateId();

      if (!Number.isNaN(id)) {
        this.templates.loadOne(id);
      }
    });
    this.assets.ensureLoaded();
  }

  hasUnsavedChanges(): boolean {
    return false;
  }

  protected toggleExample(): void {
    this.showExample.update((isShown: boolean) => !isShown);
  }
}
