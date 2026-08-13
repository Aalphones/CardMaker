import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PreviewImageLoader } from '../../../shared/canvas/preview-image-loader';
import { PrintSheet, buildSheets } from '../../../shared/canvas/rendering/sheet-layout';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FieldHint } from '../../../shared/components/field-hint/field-hint';
import { downloadBlob } from '../../../shared/services/download-file';
import { Notification } from '../../../shared/services/notification';
import {
  PRINT_ITEM_MAX_QUANTITY,
  PrintItem,
} from '../../../store/print-project/print-project.actions';
import { PrintProjectFacade } from '../../../store/print-project/print-project.facade';
import {
  ExportProgress,
  ExportQuality,
  FULL_QUALITY,
  PDF_FILE_NAME,
  PrintExport,
  SMALLER_QUALITY,
} from '../print-export.service';
import { PrintSheetPreview, SheetPreviewCard } from '../print-sheet/print-sheet';

const pluralRules = new Intl.PluralRules('de');
const megabyteFormat = new Intl.NumberFormat('de', { maximumFractionDigits: 1 });

const EXPORT_FAILED_MESSAGE = 'Der Export ist fehlgeschlagen. Bitte noch einmal versuchen.';

/** Ab hier wird die Datei für viele Netzwerkdrucker unangenehm — dann kommt der 200-dpi-Weg. */
const SMALLER_FILE_THRESHOLD_BYTES = 20_000_000;

type ExportKind = 'pdf' | 'png';

interface FinishedExport {
  kind: ExportKind;
  bytes: number;
}

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
  private readonly printExport = inject(PrintExport);
  private readonly notification = inject(Notification);
  protected readonly printProject = inject(PrintProjectFacade);
  protected readonly maxQuantity = PRINT_ITEM_MAX_QUANTITY;

  private readonly runningExport = signal<ExportKind | null>(null);
  private readonly progressLabel = signal<string>('');
  private readonly finishedExport = signal<FinishedExport | null>(null);

  protected readonly cartEmpty = computed(() => this.printProject.items().length === 0);
  protected readonly exportRunning = computed(() => this.runningExport() !== null);

  /** „PDF erstellt — 7,4 MB": erst nach einem Lauf, und nur für den zuletzt gewählten Weg. */
  protected readonly finishedText = computed<string | null>(() => {
    const finished = this.finishedExport();

    if (finished === null) {
      return null;
    }

    const what = finished.kind === 'pdf' ? 'PDF erstellt' : 'Bögen erstellt';

    return `${what} — ${megabyteFormat.format(finished.bytes / 1_000_000)} MB`;
  });

  protected readonly offersSmallerFile = computed(() => {
    const finished = this.finishedExport();

    return finished !== null && finished.bytes > SMALLER_FILE_THRESHOLD_BYTES;
  });

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

  /** Der auslösende Knopf trägt den Fortschritt, der andere bleibt bei seiner Beschriftung. */
  protected pdfLabel(): string {
    return this.runningExport() === 'pdf' ? this.progressLabel() : 'Als PDF drucken';
  }

  protected pngLabel(): string {
    return this.runningExport() === 'png' ? this.progressLabel() : 'PNG exportieren';
  }

  protected startPdfExport(): void {
    void this.runExport('pdf', FULL_QUALITY);
  }

  protected startPngExport(): void {
    void this.runExport('png', FULL_QUALITY);
  }

  protected retrySmaller(): void {
    const finished = this.finishedExport();

    if (finished !== null) {
      void this.runExport(finished.kind, SMALLER_QUALITY);
    }
  }

  /**
   * Erst alle Karten zeichnen, dann die Bögen füllen — die Karten sind der teure Teil und
   * werden für PDF und PNG gleich gebraucht.
   */
  private async runExport(kind: ExportKind, quality: ExportQuality): Promise<void> {
    if (this.runningExport() !== null) {
      return;
    }

    this.runningExport.set(kind);
    this.progressLabel.set('Karten werden gezeichnet …');
    this.finishedExport.set(null);

    const options = this.printProject.options();
    const sheets = this.sheets();
    const showProgress = (progress: ExportProgress): void => {
      this.progressLabel.set(progressText(progress));
    };

    try {
      const rendered = await this.printExport.renderCards(
        this.printProject.items(),
        options,
        quality,
        showProgress,
      );

      if (rendered.failedCardNames.length > 0) {
        this.notification.show(
          `Diese Karten konnten nicht gezeichnet werden und bleiben leer: ${rendered.failedCardNames.join(', ')}.`,
          'info',
        );
      }

      if (kind === 'pdf') {
        const pdf = await this.printExport.exportPdf(
          sheets,
          rendered.images,
          options,
          showProgress,
        );

        downloadBlob(pdf, PDF_FILE_NAME);
        this.finishedExport.set({ kind, bytes: pdf.size });
      } else {
        const bytes = await this.printExport.exportPngSheets(
          sheets,
          rendered.images,
          options,
          quality,
          showProgress,
        );

        this.finishedExport.set({ kind, bytes });
      }
    } catch {
      this.notification.show(EXPORT_FAILED_MESSAGE, 'error');
    } finally {
      this.runningExport.set(null);
    }
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

function progressText(progress: ExportProgress): string {
  const what = progress.kind === 'card' ? 'Karte' : 'Bogen';

  return `${what} ${progress.done} von ${progress.total}`;
}
