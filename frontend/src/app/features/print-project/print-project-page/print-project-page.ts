import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PreviewImageLoader } from '../../../shared/canvas/preview-image-loader';
import { PrintSheet, buildSheets } from '../../../shared/canvas/rendering/sheet-layout';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FieldHint } from '../../../shared/components/field-hint/field-hint';
import {
  PRINT_ITEM_MAX_QUANTITY,
  PrintItem,
} from '../../../store/print-project/print-project.actions';
import { PrintProjectFacade } from '../../../store/print-project/print-project.facade';
import { PrintSheetPreview, SheetPreviewCard } from '../print-sheet/print-sheet';

const pluralRules = new Intl.PluralRules('de');

@Component({
  selector: 'app-print-project-page',
  imports: [RouterLink, FieldHint, PrintSheetPreview],
  templateUrl: './print-project-page.html',
  styleUrl: './print-project-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintProjectPage {
  private readonly dialog = inject(Dialog);
  private readonly previewImages = inject(PreviewImageLoader);
  protected readonly printProject = inject(PrintProjectFacade);
  protected readonly maxQuantity = PRINT_ITEM_MAX_QUANTITY;

  protected readonly cartEmpty = computed(() => this.printProject.items().length === 0);

  /** Dieselbe Rechnung, die später auch PDF und PNG füllt — hier nur zum Anschauen. */
  protected readonly sheets = computed<PrintSheet[]>(() =>
    buildSheets(this.printProject.items(), this.printProject.options()),
  );

  /** Name und Kachelbild je Karte, damit die Bogen-Vorschau selbst nichts nachladen muss. */
  protected readonly previewsByCardId = computed<ReadonlyMap<number, SheetPreviewCard>>(() => {
    const previews = new Map<number, SheetPreviewCard>();

    for (const item of this.printProject.items()) {
      previews.set(item.cardId, {
        cardName: item.cardName,
        imageUrl: this.previewUrl(item),
      });
    }

    return previews;
  });

  protected readonly summary = computed(() => {
    const totalQuantity = this.printProject.totalQuantity();

    if (totalQuantity === 0) {
      return 'Noch keine Karten im Druckprojekt.';
    }

    return `${this.quantityLabel(totalQuantity)} auf ${this.sheetLabel(this.sheets().length)}`;
  });

  constructor() {
    this.printProject.ensureLoaded();

    effect(() => {
      for (const item of this.printProject.items()) {
        if (item.previewUpdatedAt !== null) {
          this.previewImages.load('cards', item.cardId, item.previewUpdatedAt);
        }
      }
    });
  }

  protected decrement(item: PrintItem): void {
    if (item.quantity <= 1) {
      return;
    }
    this.printProject.setQuantity(item.id, item.quantity - 1);
  }

  protected increment(item: PrintItem): void {
    if (item.quantity >= PRINT_ITEM_MAX_QUANTITY) {
      return;
    }
    this.printProject.setQuantity(item.id, item.quantity + 1);
  }

  private previewUrl(item: PrintItem): string | null {
    if (item.previewUpdatedAt === null) {
      return null;
    }

    return this.previewImages.imageUrl('cards', item.cardId, item.previewUpdatedAt);
  }

  protected removeItem(item: PrintItem): void {
    this.printProject.removeItem(item.id);
  }

  protected async clearAll(): Promise<void> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Druckprojekt leeren',
        message: 'Alle Karten aus dem Druckprojekt entfernen?',
      },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.printProject.clear();
    }
  }

  protected setCutMarks(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.printProject.setOptions({ ...this.printProject.options(), cutMarks: checked });
  }

  protected setBleed(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.printProject.setOptions({ ...this.printProject.options(), bleed: checked });
  }

  private quantityLabel(count: number): string {
    const category = pluralRules.select(count);
    return category === 'one' ? '1 Karte' : `${count} Karten`;
  }

  private sheetLabel(count: number): string {
    const category = pluralRules.select(count);
    return category === 'one' ? '1 Bogen' : `${count} Bögen`;
  }
}
