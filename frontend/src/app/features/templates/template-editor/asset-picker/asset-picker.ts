import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { AssetImageLoader } from '../../../../shared/canvas/asset-image-loader';
import { Asset, AssetKind } from '../../../../store/assets/assets.actions';
import { AssetsFacade } from '../../../../store/assets/assets.facade';

export type AssetPickerData =
  | { kind: AssetKind; mode: 'single'; selectedId: number | null }
  | { kind: AssetKind; mode: 'multiple'; selectedIds: number[] };

export type AssetPickerResult = number | number[] | null;

@Component({
  selector: 'app-asset-picker',
  imports: [],
  templateUrl: './asset-picker.html',
  styleUrl: './asset-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetPicker {
  protected readonly data = inject<AssetPickerData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<AssetPickerResult>);
  protected readonly assets = inject(AssetsFacade);
  private readonly imageLoader = inject(AssetImageLoader);

  protected readonly items = computed(() =>
    this.assets.all().filter((asset: Asset) => asset.kind === this.data.kind),
  );

  private readonly selection = signal<ReadonlySet<number>>(
    new Set(this.data.mode === 'single' ? initialSingleSelection(this.data.selectedId) : this.data.selectedIds),
  );

  protected readonly pendingFile = signal<File | null>(null);
  protected readonly dragActive = signal(false);
  private readonly awaitingUpload = signal(false);

  constructor() {
    this.assets.ensureLoaded();

    effect(() => {
      this.items().forEach((asset: Asset) => this.imageLoader.load(asset.id));
    });

    effect(() => {
      const uploaded = this.assets.lastUploaded();

      if (uploaded && this.awaitingUpload() && uploaded.kind === this.data.kind) {
        this.toggle(uploaded.id);
        this.pendingFile.set(null);
        this.awaitingUpload.set(false);
      }
    });
  }

  protected isSelected(id: number): boolean {
    return this.selection().has(id);
  }

  protected thumbUrl(id: number): string | null {
    return this.imageLoader.images().get(id)?.src ?? null;
  }

  protected toggle(id: number): void {
    if (this.data.mode === 'single') {
      this.selection.set(new Set([id]));
      return;
    }

    this.selection.update((current: ReadonlySet<number>) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  protected onFileSelected(event: Event): void {
    this.pendingFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
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
    const file = event.dataTransfer?.files?.[0] ?? null;

    if (file) {
      this.pendingFile.set(file);
    }
  }

  protected upload(): void {
    const file = this.pendingFile();

    if (!file) {
      return;
    }

    this.awaitingUpload.set(true);
    this.assets.upload(file, this.data.kind, file.name);
  }

  protected confirm(): void {
    const selected = [...this.selection()];
    this.dialogRef.close(this.data.mode === 'single' ? (selected[0] ?? null) : selected);
  }
}

function initialSingleSelection(selectedId: number | null): number[] {
  return selectedId === null ? [] : [selectedId];
}
