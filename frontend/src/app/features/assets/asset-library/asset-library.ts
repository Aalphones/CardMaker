import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AssetImageLoader } from '../../../shared/canvas/asset-image-loader';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { Asset, AssetKind } from '../../../store/assets/assets.actions';
import { AssetsFacade } from '../../../store/assets/assets.facade';

interface KindTab {
  value: AssetKind;
  label: string;
}

const KIND_TABS: KindTab[] = [
  { value: 'frame', label: 'Rahmen' },
  { value: 'icon', label: 'Icons' },
  { value: 'artwork', label: 'Artwork' },
];

@Component({
  selector: 'app-asset-library',
  imports: [],
  templateUrl: './asset-library.html',
  styleUrl: './asset-library.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetLibrary {
  private readonly dialog = inject(Dialog);
  private readonly imageLoader = inject(AssetImageLoader);
  protected readonly assets = inject(AssetsFacade);

  protected readonly tabs = KIND_TABS;
  protected readonly activeKind = signal<AssetKind>('frame');
  protected readonly editingId = signal<number | null>(null);
  protected readonly dragActive = signal(false);

  protected readonly totalInBatch = signal(0);
  protected readonly uploadErrors = signal<string[]>([]);
  private readonly queue = signal<File[]>([]);
  private readonly awaitingUpload = signal(false);
  private currentFileName = '';

  protected readonly items = computed(() =>
    this.assets.all().filter((asset: Asset) => asset.kind === this.activeKind()),
  );

  protected readonly currentFileIndex = computed(() => this.totalInBatch() - this.queue().length);
  protected readonly batchActive = computed(
    () => this.totalInBatch() > 0 && (this.queue().length > 0 || this.awaitingUpload()),
  );

  constructor() {
    this.assets.ensureLoaded();

    effect(() => {
      this.items().forEach((asset: Asset) => this.imageLoader.load(asset.id));
    });

    // Warteschlange: sobald der Store wieder frei ist, geht die nächste Datei raus. Ein
    // Fehlschlag stoppt die Reihe nicht — Fehler sammeln, mit der nächsten Datei weiter.
    effect(() => {
      const uploading = this.assets.uploading();
      const uploadFileError = this.assets.uploadFileError();
      const error = this.assets.error();

      if (!this.awaitingUpload() || uploading) {
        return;
      }

      this.awaitingUpload.set(false);
      const failureMessage = uploadFileError ?? error;

      if (failureMessage) {
        this.uploadErrors.update((list: string[]) => [...list, `${this.currentFileName}: ${failureMessage}`]);
      }

      this.dequeueNext();
    });
  }

  protected isEditing(assetId: number): boolean {
    return this.editingId() === assetId;
  }

  protected thumbUrl(id: number): string | null {
    return this.imageLoader.images().get(id)?.src ?? null;
  }

  protected formatSize(byteSize: number): string {
    return `${Math.max(1, Math.round(byteSize / 1024))} KB`;
  }

  protected selectTab(kind: AssetKind): void {
    this.activeKind.set(kind);
  }

  protected startRename(asset: Asset): void {
    this.editingId.set(asset.id);
  }

  protected commitRename(asset: Asset, event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();

    if (name.length > 0 && name !== asset.name) {
      this.assets.rename(asset.id, name);
    }

    this.editingId.set(null);
  }

  protected cancelRename(): void {
    this.editingId.set(null);
  }

  protected async remove(asset: Asset): Promise<void> {
    const data: ConfirmDialogData = {
      title: 'Bild löschen',
      message: `„${asset.name}" wird endgültig gelöscht.`,
      confirmLabel: 'Löschen',
    };
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, { data });
    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.assets.remove(asset.id);
    }
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.enqueue(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  protected onDragLeave(): void {
    this.dragActive.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    this.enqueue(event.dataTransfer?.files ?? null);
  }

  private enqueue(files: FileList | null): void {
    if (!files || files.length === 0) {
      return;
    }

    const list = [...files];
    this.totalInBatch.set(list.length);
    this.uploadErrors.set([]);
    this.queue.set(list);
    this.dequeueNext();
  }

  private dequeueNext(): void {
    const [next, ...rest] = this.queue();

    if (!next) {
      this.totalInBatch.set(0);
      return;
    }

    this.queue.set(rest);
    this.currentFileName = next.name;
    this.awaitingUpload.set(true);
    this.assets.upload(next, this.activeKind(), next.name);
  }
}
