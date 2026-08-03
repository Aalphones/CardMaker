import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CardGroup } from '../../../store/card-groups/card-groups.actions';
import { CardGroupsFacade } from '../../../store/card-groups/card-groups.facade';

@Component({
  selector: 'app-card-groups-list',
  imports: [RouterLink],
  templateUrl: './card-groups-list.html',
  styleUrl: './card-groups-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGroupsList {
  private readonly dialog = inject(Dialog);
  protected readonly cardGroups = inject(CardGroupsFacade);

  protected readonly searchTerm = signal('');

  protected readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.cardGroups.all();

    if (term === '') {
      return items;
    }

    return items.filter((item: CardGroup) => item.name.toLowerCase().includes(term));
  });

  constructor() {
    this.cardGroups.ensureLoaded();
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  async remove(item: CardGroup): Promise<void> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Kartengruppe löschen',
        message: `Kartengruppe „${item.name}" wirklich löschen?`,
      },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.cardGroups.remove(item.id);
    }
  }
}
