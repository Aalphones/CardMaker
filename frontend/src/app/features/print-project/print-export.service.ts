import { DOCUMENT, Injectable, inject } from '@angular/core';
import type { jsPDF as PdfDocument } from 'jspdf';

import { CardRenderSource } from '../../shared/canvas/card-render-source.service';
import { CardRenderer } from '../../shared/canvas/card-renderer.service';
import {
  MARK_WIDTH_MM,
  PrintSheet,
  PrintSheetSlot,
  SHEET_HEIGHT_MM,
  SHEET_WIDTH_MM,
  SheetMark,
  SheetOptions,
  mmToPx,
  sheetGeometry,
  sheetMarks,
} from '../../shared/canvas/rendering/sheet-layout';
import { downloadBlob } from '../../shared/services/download-file';

export const PDF_FILE_NAME = 'druckprojekt.pdf';

/**
 * Wie fein gedruckt wird. Kein gespeicherter Wert im Druckprojekt, sondern die Wahl im Moment
 * des Exports: 300 dpi ist der Normalfall, 200 dpi der Ausweg, wenn die Datei zu groß für den
 * Drucker wird.
 */
export interface ExportQuality {
  dpi: number;
  /** JPEG-Güte der Kartenbilder, 0 bis 1. */
  jpegQuality: number;
}

export const FULL_QUALITY: ExportQuality = { dpi: 300, jpegQuality: 0.9 };
export const SMALLER_QUALITY: ExportQuality = { dpi: 200, jpegQuality: 0.8 };

/** Eine Position des Druckprojekts — strukturgleich zu `PrintItem`, ohne Abhängigkeit dorthin. */
export interface ExportItem {
  cardId: number;
  cardName: string;
  quantity: number;
}

export interface ExportProgress {
  kind: 'card' | 'sheet';
  done: number;
  total: number;
}

export type ProgressHandler = (progress: ExportProgress) => void;

export interface RenderedCards {
  /** Ein Bild je Karten-Kennung — jedes Exemplar auf dem Bogen benutzt dasselbe. */
  images: ReadonlyMap<number, Blob>;
  /** Karten, die nicht gezeichnet werden konnten; ihre Plätze bleiben leer. */
  failedCardNames: readonly string[];
}

/**
 * Setzt die Bilder aus dem Renderer auf die Bögen aus `sheet-layout` — einmal als PDF, einmal
 * als PNG je Bogen. Beide Wege rechnen mit denselben Millimeter-Koordinaten; eine zweite
 * Stelle, die Ränder oder Schnittmarken kennt, gibt es nicht.
 */
@Injectable({
  providedIn: 'root',
})
export class PrintExport {
  private readonly document = inject(DOCUMENT);
  private readonly renderSource = inject(CardRenderSource);
  private readonly renderer = inject(CardRenderer);

  /**
   * Zeichnet jede Karte **einmal**, egal wie oft sie im Projekt liegt, und nacheinander:
   * neun Bühnen in Druckauflösung gleichzeitig sind der sichere Weg in den Speicherfehler.
   * Eine Karte, die nicht geladen werden kann, bricht den Lauf nicht ab.
   */
  async renderCards(
    items: readonly ExportItem[],
    options: SheetOptions,
    quality: ExportQuality,
    onProgress: ProgressHandler,
  ): Promise<RenderedCards> {
    const cards = uniqueCards(items);
    const cardWidthPx = mmToPx(sheetGeometry(options).widthMm, quality.dpi);
    const images = new Map<number, Blob>();
    const failedCardNames: string[] = [];

    for (const card of cards) {
      try {
        const input = await this.renderSource.inputForCard(card.cardId);
        const result = await this.renderer.render(input, cardWidthPx, {
          mimeType: 'image/jpeg',
          quality: quality.jpegQuality,
          opaqueBackground: true,
        });

        images.set(card.cardId, result.image);
      } catch {
        failedCardNames.push(card.cardName);
      }

      onProgress({ kind: 'card', done: images.size + failedCardNames.length, total: cards.length });
    }

    return { images, failedCardNames };
  }

  /**
   * Gibt die fertige Datei zurück, statt sie selbst zu speichern — die Seite braucht ihre
   * Größe, um über den 200-dpi-Ausweg zu entscheiden.
   */
  async exportPdf(
    sheets: readonly PrintSheet[],
    images: ReadonlyMap<number, Blob>,
    options: SheetOptions,
    onProgress: ProgressHandler,
  ): Promise<Blob> {
    // Erst beim Klick geladen: am Dateikopf zöge jsPDF drei ungenutzte Bibliotheken ins
    // Start-Bündel (html2canvas, canvg, dompurify — zusammen über 400 kB).
    const { jsPDF } = await import('jspdf');
    const dataUrls = await toDataUrls(images);
    const marks = sheetMarks(options);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

    for (const [position, sheet] of sheets.entries()) {
      if (position > 0) {
        pdf.addPage();
      }

      for (const slot of sheet.slots) {
        const dataUrl = dataUrls.get(slot.cardId);

        // Nicht gezeichnete Karte: Platz bleibt leer, der Rest des Bogens stimmt trotzdem.
        if (dataUrl !== undefined) {
          pdf.addImage(dataUrl, 'JPEG', slot.xMm, slot.yMm, slot.widthMm, slot.heightMm);
        }
      }

      drawPdfMarks(pdf, marks);
      onProgress({ kind: 'sheet', done: position + 1, total: sheets.length });
    }

    return pdf.output('blob');
  }

  /**
   * Ein PNG je Bogen, nacheinander heruntergeladen. Jede Zeichenfläche wird sofort nach dem
   * Ausgeben freigegeben — sonst wächst der Speicher mit jedem Bogen um gut 35 Megapixel.
   * Rückgabe ist die Summe der Dateigrößen.
   */
  async exportPngSheets(
    sheets: readonly PrintSheet[],
    images: ReadonlyMap<number, Blob>,
    options: SheetOptions,
    quality: ExportQuality,
    onProgress: ProgressHandler,
  ): Promise<number> {
    const bitmaps = await toBitmaps(images);
    const marks = sheetMarks(options);
    let totalBytes = 0;

    try {
      for (const [position, sheet] of sheets.entries()) {
        const image = await this.drawSheetPng(sheet, bitmaps, marks, quality.dpi);

        totalBytes += image.size;
        downloadBlob(image, `druckbogen-${sheet.index + 1}.png`);
        onProgress({ kind: 'sheet', done: position + 1, total: sheets.length });
      }
    } finally {
      for (const bitmap of bitmaps.values()) {
        bitmap.close();
      }
    }

    return totalBytes;
  }

  private async drawSheetPng(
    sheet: PrintSheet,
    bitmaps: ReadonlyMap<number, ImageBitmap>,
    marks: readonly SheetMark[],
    dpi: number,
  ): Promise<Blob> {
    const canvas = this.document.createElement('canvas');
    canvas.width = mmToPx(SHEET_WIDTH_MM, dpi);
    canvas.height = mmToPx(SHEET_HEIGHT_MM, dpi);

    const context = canvas.getContext('2d');

    if (context === null) {
      throw new Error('Der Browser hat keine Zeichenfläche geliefert.');
    }

    try {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (const slot of sheet.slots) {
        drawSlot(context, bitmaps.get(slot.cardId), slot, dpi);
      }

      context.fillStyle = '#000000';

      for (const mark of marks) {
        drawMarkRect(context, mark, dpi);
      }

      return await canvasToBlob(canvas);
    } finally {
      // Freigeben statt auf den Aufräumer zu hoffen: Safari hält große Leinwände sonst fest.
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

/** Reihenfolge des Projekts, jede Karte nur einmal, leere Positionen fallen weg. */
function uniqueCards(items: readonly ExportItem[]): ExportItem[] {
  const seen = new Set<number>();

  return items.filter((item: ExportItem) => {
    if (item.quantity <= 0 || seen.has(item.cardId)) {
      return false;
    }

    seen.add(item.cardId);

    return true;
  });
}

function drawSlot(
  context: CanvasRenderingContext2D,
  bitmap: ImageBitmap | undefined,
  slot: PrintSheetSlot,
  dpi: number,
): void {
  if (bitmap === undefined) {
    return;
  }

  context.drawImage(
    bitmap,
    mmToPx(slot.xMm, dpi),
    mmToPx(slot.yMm, dpi),
    mmToPx(slot.widthMm, dpi),
    mmToPx(slot.heightMm, dpi),
  );
}

/**
 * Eine Schnittmarke ist ein Strich; auf der Leinwand wird daraus ein schmales Rechteck. Bei
 * 300 dpi sind 0,2 mm gerade zwei Bildpunkte — unter einen fällt die Marke nie, sonst wäre
 * sie unsichtbar.
 */
function drawMarkRect(context: CanvasRenderingContext2D, mark: SheetMark, dpi: number): void {
  const thickness = Math.max(1, mmToPx(MARK_WIDTH_MM, dpi));
  const left = mmToPx(Math.min(mark.x1Mm, mark.x2Mm), dpi);
  const top = mmToPx(Math.min(mark.y1Mm, mark.y2Mm), dpi);
  const width = Math.max(thickness, mmToPx(Math.abs(mark.x2Mm - mark.x1Mm), dpi));
  const height = Math.max(thickness, mmToPx(Math.abs(mark.y2Mm - mark.y1Mm), dpi));

  context.fillRect(left, top, width, height);
}

function drawPdfMarks(pdf: PdfDocument, marks: readonly SheetMark[]): void {
  if (marks.length === 0) {
    return;
  }

  pdf.setLineWidth(MARK_WIDTH_MM);
  pdf.setDrawColor(0, 0, 0);

  for (const mark of marks) {
    pdf.line(mark.x1Mm, mark.y1Mm, mark.x2Mm, mark.y2Mm);
  }
}

/** jsPDF nimmt kein `Blob` entgegen — die Bilder müssen als Daten-Adresse hineingereicht werden. */
async function toDataUrls(images: ReadonlyMap<number, Blob>): Promise<Map<number, string>> {
  const dataUrls = new Map<number, string>();

  for (const [cardId, image] of images) {
    dataUrls.set(cardId, await blobToDataUrl(image));
  }

  return dataUrls;
}

async function toBitmaps(images: ReadonlyMap<number, Blob>): Promise<Map<number, ImageBitmap>> {
  const bitmaps = new Map<number, ImageBitmap>();

  for (const [cardId, image] of images) {
    bitmaps.set(cardId, await createImageBitmap(image));
  }

  return bitmaps;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve: (value: string) => void, reject: (reason: Error) => void) => {
    const reader = new FileReader();

    reader.onload = (): void => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Das Kartenbild konnte nicht gelesen werden.'));
      }
    };
    reader.onerror = (): void => reject(new Error('Das Kartenbild konnte nicht gelesen werden.'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve: (value: Blob) => void, reject: (reason: Error) => void) => {
    canvas.toBlob((blob: Blob | null): void => {
      if (blob === null) {
        reject(new Error('Der Browser hat kein Bild geliefert.'));
      } else {
        resolve(blob);
      }
    }, 'image/png');
  });
}
