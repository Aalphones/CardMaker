import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';

@Component({
  selector: 'app-template-editor',
  imports: [RouterLink],
  templateUrl: './template-editor.html',
  styleUrl: './template-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateEditor implements ComponentWithUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  protected readonly templates = inject(TemplatesFacade);
  private readonly assets = inject(AssetsFacade);

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
}
