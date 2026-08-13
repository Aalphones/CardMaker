import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CardRenderSource } from '../../../shared/canvas/card-render-source.service';
import { CardRenderer } from '../../../shared/canvas/card-renderer.service';
import { PreviewImageLoader } from '../../../shared/canvas/preview-image-loader';
import { PRINT_WIDTH_PX } from '../../../shared/canvas/rendering/print';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { cardFileName } from '../../../shared/services/card-file-name';
import { downloadBlob } from '../../../shared/services/download-file';
import { Notification } from '../../../shared/services/notification';
import { CardGroup } from '../../../store/card-groups/card-groups.actions';
import { CardGroupsFacade } from '../../../store/card-groups/card-groups.facade';
import { CardSummary } from '../../../store/cards/cards.actions';
import { CardsFacade } from '../../../store/cards/cards.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';

const DOWNLOAD_FAILED_MESSAGE = 'Das Bild konnte nicht erzeugt werden.';

type GroupFilter = 'all' | 'none' | number;
type SortMode = 'recent' | 'name' | 'group';
type ViewMode = 'grid' | 'table';

interface GroupChip {
  id: GroupFilter;
  label: string;
  count: number;
}

const cardCountPluralRules = new Intl.PluralRules('de');

@Component({
  selector: 'app-cards-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './cards-list.html',
  styleUrl: './cards-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsList {
  private readonly dialog = inject(Dialog);
  private readonly previewImages = inject(PreviewImageLoader);
  private readonly cardRenderSource = inject(CardRenderSource);
  private readonly cardRenderer = inject(CardRenderer);
  private readonly notification = inject(Notification);
  private readonly route = inject(ActivatedRoute);
  protected readonly cards = inject(CardsFacade);
  protected readonly cardGroups = inject(CardGroupsFacade);
  protected readonly templates = inject(TemplatesFacade);

  protected readonly searchTerm = signal('');
  protected readonly templateFilter = signal<number | 'all'>('all');
  protected readonly groupFilter = signal<GroupFilter>('all');
  protected readonly sortMode = signal<SortMode>('recent');
  protected readonly view = signal<ViewMode>('grid');

  /** Karten, deren Bild gerade erzeugt wird — pro Karte, damit ein Export nicht die ganze Liste sperrt. */
  private readonly downloadingCardIds = signal<ReadonlySet<number>>(new Set());

  /** Von Suche und Template gefiltert, aber noch nicht vom Gruppen-Chip — die Chips zählen darauf. */
  private readonly searchAndTemplateFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const templateId = this.templateFilter();
    const items = this.cards.summaries();

    return items.filter((item: CardSummary) => {
      const matchesSearch = term === '' || item.name.toLowerCase().includes(term);
      const matchesTemplate = templateId === 'all' || item.templateId === templateId;
      return matchesSearch && matchesTemplate;
    });
  });

  protected readonly groupChips = computed<GroupChip[]>(() => {
    const items = this.searchAndTemplateFiltered();
    const groups = this.cardGroups.all();
    const withoutGroup = items.filter((item: CardSummary) => item.cardGroupId === null).length;

    return [
      { id: 'all', label: 'Alle', count: items.length },
      ...groups.map((group: CardGroup) => ({
        id: group.id,
        label: group.name,
        count: items.filter((item: CardSummary) => item.cardGroupId === group.id).length,
      })),
      { id: 'none', label: 'Ohne Gruppe', count: withoutGroup },
    ];
  });

  protected readonly filteredItems = computed(() => {
    const groupFilter = this.groupFilter();
    const items = this.searchAndTemplateFiltered().filter((item: CardSummary) => {
      if (groupFilter === 'all') {
        return true;
      }
      if (groupFilter === 'none') {
        return item.cardGroupId === null;
      }
      return item.cardGroupId === groupFilter;
    });

    return this.sortItems(items);
  });

  constructor() {
    this.cards.ensureLoaded();
    this.cardGroups.ensureLoaded();
    this.templates.ensureLoaded();

    const groupParam = this.route.snapshot.queryParamMap.get('group');
    const groupId = groupParam === null ? NaN : Number(groupParam);

    if (Number.isInteger(groupId)) {
      this.groupFilter.set(groupId);
    }

    effect(() => {
      for (const item of this.cards.summaries()) {
        if (item.previewUpdatedAt !== null) {
          this.previewImages.load('cards', item.id, item.previewUpdatedAt);
        }
      }
    });
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onTemplateFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.templateFilter.set(value === 'all' ? 'all' : Number(value));
  }

  onSortChange(event: Event): void {
    this.sortMode.set((event.target as HTMLSelectElement).value as SortMode);
  }

  selectGroupChip(id: GroupFilter): void {
    this.groupFilter.set(id);
  }

  toggleView(): void {
    this.view.set(this.view() === 'grid' ? 'table' : 'grid');
  }

  protected previewUrl(item: CardSummary): string | null {
    if (item.previewUpdatedAt === null) {
      return null;
    }

    return this.previewImages.imageUrl('cards', item.id, item.previewUpdatedAt);
  }

  cardCountLabel(count: number): string {
    const category = cardCountPluralRules.select(count);
    return category === 'one' ? '1 Karte' : `${count} Karten`;
  }

  duplicate(item: CardSummary): void {
    this.cards.duplicate(item.id);
  }

  protected isDownloading(item: CardSummary): boolean {
    return this.downloadingCardIds().has(item.id);
  }

  /** Rendert die gespeicherte Karte in Druckauflösung, ohne den Editor zu öffnen (Phase 3). */
  protected async download(item: CardSummary): Promise<void> {
    if (this.isDownloading(item)) {
      return;
    }

    this.setDownloading(item.id, true);

    try {
      const input = await this.cardRenderSource.inputForCard(item.id);
      const result = await this.cardRenderer.renderPng(input, PRINT_WIDTH_PX);

      downloadBlob(result.image, cardFileName(item.name));

      if (result.missing.length > 0) {
        this.notification.show(
          `Fertig — aber diese Bilder fehlen im Bild: ${result.missing.join(', ')}.`,
          'info',
        );
      }
    } catch {
      this.notification.show(DOWNLOAD_FAILED_MESSAGE, 'error');
    } finally {
      this.setDownloading(item.id, false);
    }
  }

  private setDownloading(cardId: number, value: boolean): void {
    this.downloadingCardIds.update((current: ReadonlySet<number>) => {
      const next = new Set(current);

      if (value) {
        next.add(cardId);
      } else {
        next.delete(cardId);
      }

      return next;
    });
  }

  async remove(item: CardSummary): Promise<void> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Karte löschen',
        message: `Karte „${item.name}" wirklich löschen?`,
      },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.cards.remove(item.id);
    }
  }

  private sortItems(items: CardSummary[]): CardSummary[] {
    const sorted = [...items];

    switch (this.sortMode()) {
      case 'name':
        sorted.sort((a: CardSummary, b: CardSummary) => a.name.localeCompare(b.name, 'de'));
        break;
      case 'group':
        sorted.sort((a: CardSummary, b: CardSummary) => this.compareByGroup(a, b));
        break;
      case 'recent':
      default:
        sorted.sort((a: CardSummary, b: CardSummary) => b.updatedAt.localeCompare(a.updatedAt));
        break;
    }

    return sorted;
  }

  /** Karten ohne Gruppe ans Ende, sonst nach Gruppennamen. */
  private compareByGroup(a: CardSummary, b: CardSummary): number {
    if (a.cardGroupId === null && b.cardGroupId === null) {
      return 0;
    }
    if (a.cardGroupId === null) {
      return 1;
    }
    if (b.cardGroupId === null) {
      return -1;
    }

    return (a.cardGroupName ?? '').localeCompare(b.cardGroupName ?? '', 'de');
  }
}
