import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';

/**
 * Rohbau — Formular (Phase 6), Live-Vorschau (Phase 7) und das Zurechtschieben des
 * Bildes (Phase 8) entstehen hier. Der Rohbau hat noch keinen Entwurf, den man verlieren
 * könnte; sobald das Formular steht, meldet `hasUnsavedChanges()` echte Änderungen.
 */
@Component({
  selector: 'app-card-editor',
  templateUrl: './card-editor.html',
  styleUrl: './card-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditor implements ComponentWithUnsavedChanges {
  hasUnsavedChanges(): boolean {
    return false;
  }
}
