import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PreviewImageLoader } from '../../../shared/canvas/preview-image-loader';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TemplateSummary } from '../../../store/templates/templates.actions';
import { TemplatesFacade } from '../../../store/templates/templates.facade';

const DEFAULT_TEMPLATE_NAME = 'Neues Template';
const layerCountPluralRules = new Intl.PluralRules('de');

@Component({
  selector: 'app-templates-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './templates-list.html',
  styleUrl: './templates-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesList {
  private readonly dialog = inject(Dialog);
  private readonly previewImages = inject(PreviewImageLoader);
  protected readonly templates = inject(TemplatesFacade);

  protected readonly searchTerm = signal('');

  protected readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.templates.summaries();

    if (term === '') {
      return items;
    }

    return items.filter((item: TemplateSummary) => item.name.toLowerCase().includes(term));
  });

  constructor() {
    this.templates.ensureLoaded();

    effect(() => {
      for (const item of this.filteredItems()) {
        if (item.previewUpdatedAt !== null) {
          this.previewImages.load('templates', item.id, item.previewUpdatedAt);
        }
      }
    });
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  createTemplate(): void {
    this.templates.create(DEFAULT_TEMPLATE_NAME, null);
  }

  protected previewUrl(item: TemplateSummary): string | null {
    if (item.previewUpdatedAt === null) {
      return null;
    }

    return this.previewImages.imageUrl('templates', item.id, item.previewUpdatedAt);
  }

  layerCountLabel(layerCount: number): string {
    const category = layerCountPluralRules.select(layerCount);
    return category === 'one' ? `${layerCount} Ebene` : `${layerCount} Ebenen`;
  }

  async remove(item: TemplateSummary): Promise<void> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Template löschen',
        message: `Template „${item.name}" wirklich löschen?`,
      },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.templates.remove(item.id);
    }
  }
}
