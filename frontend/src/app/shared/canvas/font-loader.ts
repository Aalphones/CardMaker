import { DOCUMENT, Injectable, Signal, inject, signal } from '@angular/core';

import { Api } from '../../core/services/api';
import {
  FontFamily,
  UploadedFontFamily,
  isSelfHostedFont,
  isUploadedFont,
  uploadedFontId,
} from './rendering/fonts';

const LOAD_REQUEST_FONT_SIZE_PX = 40;

/**
 * Fordert die Kartenschriften an und meldet, welche fertig geladen sind.
 *
 * Warum das nötig ist: Der Browser lädt eine `@font-face`-Schrift erst, wenn sie im
 * Seitenlayout wirklich vorkommt. Konva zeichnet aber auf ein Bitmap — das zählt für den
 * Browser nicht als Verwendung. Ohne diese ausdrückliche Anforderung würde die Karte still
 * in der Ersatzschrift gezeichnet, und das automatische Verkleinern würde die falsche
 * Schrift ausmessen.
 *
 * Zwei Wege, ein Ergebnis:
 * - **mitgeliefert** — `document.fonts.load(...)` reicht, die `@font-face`-Regel steht schon
 *   in `styles/_kartenschriften.scss`.
 * - **hochgeladen** — die Datei liegt hinter der Anmeldung. Ein `@font-face` mit `url(...)`
 *   schickt die Anmeldekopfzeile nicht mit und liefe still in ein 401. Deshalb derselbe Weg
 *   wie bei den Bildern (`asset-image-loader.ts`): als Blob holen, daraus ein `FontFace`
 *   bauen und in `document.fonts` eintragen. Den Namen vergeben wir dabei selbst — der in
 *   der Datei eingebettete Name interessiert niemanden.
 *
 * Warum hier direkt der `Api`-Dienst statt eines NgRx-Effects (dokumentierte Abweichung in
 * `docs/conventions/state-management.md`): Ein geladenes `FontFace` ist kein serialisierbarer
 * Server-Zustand. Was in den Store gehört — die Liste der Schriften mit Namen und Kennung —
 * liegt im Slice `store/fonts/`.
 */
@Injectable({
  providedIn: 'root',
})
export class FontLoader {
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(Api);
  private readonly requestedFamilies = new Set<string>();
  private readonly loadedFamilies = signal<ReadonlySet<string>>(new Set());
  private readonly failedFamilies = signal<ReadonlySet<string>>(new Set());

  /** Die Schriften, die fertig geladen sind — bis dahin zeichnet `draw-items` die Ersatzschrift. */
  readonly loaded: Signal<ReadonlySet<string>> = this.loadedFamilies.asReadonly();

  /**
   * Schriften, deren Datei nicht ankam oder unlesbar war. Wer auf eine Schrift wartet, braucht
   * das — sonst wartet er auf eine, die nie kommt (siehe `render-resources.service.ts`).
   */
  readonly failed: Signal<ReadonlySet<string>> = this.failedFamilies.asReadonly();

  load(family: FontFamily): void {
    if (!isSelfHostedFont(family) || this.requestedFamilies.has(family)) {
      return;
    }

    this.requestedFamilies.add(family);

    if (isUploadedFont(family)) {
      this.loadUploadedFont(family);
      return;
    }

    this.loadBundledFont(family);
  }

  /**
   * Die Größenangabe im Ladeaufruf ist Pflichtbestandteil der Kurzschreibweise, nicht die
   * spätere Zeichengröße: Geladen wird die ganze Schriftdatei, egal welche Größe hier steht.
   */
  private loadBundledFont(family: FontFamily): void {
    this.document.fonts
      .load(`${LOAD_REQUEST_FONT_SIZE_PX}px "${family}"`)
      .then((faces: FontFace[]) => {
        if (faces.length === 0) {
          throw new Error('keine passende Schriftdatei gefunden');
        }

        this.publish(family);
      })
      .catch((error: unknown) => this.warn(family, error));
  }

  private loadUploadedFont(family: UploadedFontFamily): void {
    this.api.getBlob(`/fonts/${uploadedFontId(family)}/file`).subscribe({
      next: (blob: Blob) => void this.registerUploadedFont(family, blob),
      error: (error: unknown) => this.warn(family, error),
    });
  }

  /**
   * Hier kommt an, was das Hochladen nicht prüfen konnte: Das Backend schaut nur auf die
   * ersten vier Bytes, ob die Datei überhaupt eine Schrift sein will. Sind die Innentabellen
   * kaputt, weist erst der Browser sie zurück — deshalb die eigene Meldung.
   */
  private async registerUploadedFont(family: UploadedFontFamily, blob: Blob): Promise<void> {
    try {
      const face = new FontFace(family, await blob.arrayBuffer());

      await face.load();
      this.document.fonts.add(face);
      this.publish(family);
    } catch (error: unknown) {
      console.warn(
        `Die hochgeladene Schriftdatei "${family}" ist für den Browser nicht lesbar — ` +
          'die Ersatzschrift bleibt stehen.',
        error,
      );
      this.publishFailure(family);
    }
  }

  private warn(family: FontFamily, error: unknown): void {
    // Nicht erneut anfordern: Bleibt die Datei weg, bleibt die Ersatzschrift stehen —
    // ein Wiederholungsversuch pro Neuzeichnen würde nur das Netz vollmachen.
    console.warn(`Schriftart "${family}" konnte nicht geladen werden.`, error);
    this.publishFailure(family);
  }

  private publish(family: FontFamily): void {
    const withNewFamily = new Set(this.loadedFamilies());

    withNewFamily.add(family);
    this.loadedFamilies.set(withNewFamily);
  }

  private publishFailure(family: FontFamily): void {
    const withNewFamily = new Set(this.failedFamilies());

    withNewFamily.add(family);
    this.failedFamilies.set(withNewFamily);
  }
}
