import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  PrintSheet,
  PrintSheetSlot,
  SHEET_HEIGHT_MM,
  SHEET_WIDTH_MM,
  SheetFrame,
  SheetOptions,
  sheetFrames,
} from '../../../shared/canvas/rendering/sheet-layout';

/** Was die Vorschau über eine Karte wissen muss — Bild und Name kommen von der Seite. */
export interface SheetPreviewCard {
  cardName: string;
  imageUrl: string | null;
}

interface SheetCellView {
  position: number;
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
  cardName: string | null;
  imageUrl: string | null;
}

@Component({
  selector: 'app-print-sheet',
  imports: [],
  templateUrl: './print-sheet.html',
  styleUrl: './print-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintSheetPreview {
  readonly sheet = input.required<PrintSheet>();
  readonly options = input.required<SheetOptions>();
  readonly previews = input.required<ReadonlyMap<number, SheetPreviewCard>>();

  /**
   * Die Vorschau rechnet nichts selbst: die Plätze kommen aus `sheet-layout`, hier werden sie
   * nur in Prozent der Blattmaße umgerechnet. Belegt ist ein Platz, wenn `buildSheets` ihn
   * gefüllt hat — die Plätze werden der Reihe nach besetzt, also passt Platz `n` zum Eintrag
   * `n` des Bogens.
   */
  protected readonly cells = computed<SheetCellView[]>(() => {
    const slots = this.sheet().slots;
    const previews = this.previews();

    return sheetFrames(this.options()).map((frame: SheetFrame, position: number) => {
      const slot: PrintSheetSlot | undefined = slots[position];
      const preview = slot === undefined ? undefined : previews.get(slot.cardId);

      return {
        position,
        leftPercent: (frame.xMm / SHEET_WIDTH_MM) * 100,
        topPercent: (frame.yMm / SHEET_HEIGHT_MM) * 100,
        widthPercent: (frame.widthMm / SHEET_WIDTH_MM) * 100,
        heightPercent: (frame.heightMm / SHEET_HEIGHT_MM) * 100,
        cardName: preview?.cardName ?? null,
        imageUrl: preview?.imageUrl ?? null,
      };
    });
  });
}
