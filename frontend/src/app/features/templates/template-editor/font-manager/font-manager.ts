import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { FontLoader } from '../../../../shared/canvas/font-loader';
import { Font } from '../../../../store/fonts/fonts.actions';
import { FontsFacade } from '../../../../store/fonts/fonts.facade';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { FieldHint } from '../../../../shared/components/field-hint/field-hint';

@Component({
  selector: 'app-font-manager',
  imports: [FieldHint],
  templateUrl: './font-manager.html',
  styleUrl: './font-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FontManager {
  private readonly dialogRef = inject(DialogRef<void>);
  private readonly dialog = inject(Dialog);
  private readonly fontLoader = inject(FontLoader);
  protected readonly fonts = inject(FontsFacade);

  protected readonly pendingFile = signal<File | null>(null);
  protected readonly pendingName = signal('');
  protected readonly allowedToUse = signal(false);
  protected readonly editingId = signal<number | null>(null);

  constructor() {
    this.fonts.ensureLoaded();

    effect(() => {
      this.fonts.all().forEach((font: Font) => this.fontLoader.load(font.family));
    });
  }

  protected canUpload(): boolean {
    return this.pendingFile() !== null && this.pendingName().trim().length > 0 && this.allowedToUse();
  }

  protected formatSize(byteSize: number): string {
    return `${Math.max(1, Math.round(byteSize / 1024))} KB`;
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.pendingFile.set(file);
    this.pendingName.set(file ? nameWithoutExtension(file.name) : '');
  }

  protected onNameInput(event: Event): void {
    this.pendingName.set((event.target as HTMLInputElement).value);
  }

  protected onAllowedToUseChange(event: Event): void {
    this.allowedToUse.set((event.target as HTMLInputElement).checked);
  }

  protected upload(): void {
    const file = this.pendingFile();

    if (!file || !this.canUpload()) {
      return;
    }

    this.fonts.upload(file, this.pendingName().trim());
    this.pendingFile.set(null);
    this.pendingName.set('');
    this.allowedToUse.set(false);
  }

  protected startRename(font: Font): void {
    this.editingId.set(font.id);
  }

  protected commitRename(font: Font, event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();

    if (name.length > 0 && name !== font.name) {
      this.fonts.rename(font.id, name);
    }

    this.editingId.set(null);
  }

  protected cancelRename(): void {
    this.editingId.set(null);
  }

  protected async remove(font: Font): Promise<void> {
    const data: ConfirmDialogData = {
      title: 'Schrift löschen',
      message: `„${font.name}" wird endgültig gelöscht.`,
      confirmLabel: 'Löschen',
    };
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, { data });
    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.fonts.remove(font.id);
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }
}

function nameWithoutExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}
