import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FieldHint } from '../../../shared/components/field-hint/field-hint';
import { PRINT_ITEM_MAX_QUANTITY, PrintItem } from '../../../store/print-project/print-project.actions';
import { PrintProjectFacade } from '../../../store/print-project/print-project.facade';

const CARDS_PER_SHEET = 9;
const pluralRules = new Intl.PluralRules('de');

@Component({
  selector: 'app-print-project-page',
  imports: [RouterLink, FieldHint],
  templateUrl: './print-project-page.html',
  styleUrl: './print-project-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintProjectPage {
  private readonly dialog = inject(Dialog);
  protected readonly printProject = inject(PrintProjectFacade);
  protected readonly maxQuantity = PRINT_ITEM_MAX_QUANTITY;

  protected readonly cartEmpty = computed(() => this.printProject.items().length === 0);

  protected readonly summary = computed(() => {
    const totalQuantity = this.printProject.totalQuantity();

    if (totalQuantity === 0) {
      return 'Noch keine Karten im Druckprojekt.';
    }

    const sheetCount = Math.ceil(totalQuantity / CARDS_PER_SHEET);
    return `${this.quantityLabel(totalQuantity)} auf ${this.sheetLabel(sheetCount)}`;
  });

  constructor() {
    this.printProject.ensureLoaded();
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
