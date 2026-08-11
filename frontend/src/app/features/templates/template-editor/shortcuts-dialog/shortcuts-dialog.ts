import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

import { SHORTCUT_ROWS } from '../editor-shortcuts';

@Component({
  selector: 'app-shortcuts-dialog',
  imports: [],
  templateUrl: './shortcuts-dialog.html',
  styleUrl: './shortcuts-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortcutsDialog {
  private readonly dialogRef = inject(DialogRef<void>);

  /** Dieselbe Tabelle, die auch die Tasten auswertet — eine Quelle, keine zweite Liste. */
  protected readonly rows = SHORTCUT_ROWS;

  protected close(): void {
    this.dialogRef.close();
  }
}
