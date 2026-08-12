import { Signal, signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Gemeinsamer Unterbau der Bild-Lader im Canvas: holt eine Bilddatei als Blob, macht
 * daraus ein fertiges `HTMLImageElement` und hält alle geladenen Bilder in einem Signal.
 *
 * Warum Blobs statt `<img src="/api/…">`: die Dateien liegen hinter der Anmeldung, ein
 * direktes `src` schickt die Anmeldekopfzeile nicht mit.
 *
 * Ein Signal für alle Bilder statt eines pro Schlüssel: Die Vorschau leitet ihre
 * komplette Zeichenliste aus einem einzigen `computed()` ab, das ohnehin von jedem Bild
 * abhängt — feinere Signale würden nichts einsparen.
 */
export class BlobImageCache<TKey> {
  private readonly requestedKeys = new Set<TKey>();
  private readonly objectUrls: string[] = [];
  private readonly loadedImages = signal<ReadonlyMap<TKey, HTMLImageElement>>(new Map());

  readonly images: Signal<ReadonlyMap<TKey, HTMLImageElement>> = this.loadedImages.asReadonly();

  load(key: TKey, fetchBlob: () => Observable<Blob>): void {
    if (this.requestedKeys.has(key)) {
      return;
    }

    this.requestedKeys.add(key);
    fetchBlob().subscribe({
      next: (blob: Blob) => this.publish(key, blob),
      // Fehlgeschlagene Bilder wieder freigeben, damit ein späterer Versuch erneut lädt.
      error: () => this.requestedKeys.delete(key),
    });
  }

  /** Vergisst ein Bild, damit derselbe Schlüssel wieder neu geladen werden darf. */
  forget(key: TKey): void {
    this.requestedKeys.delete(key);

    const remaining = new Map(this.loadedImages());

    if (remaining.delete(key)) {
      this.loadedImages.set(remaining);
    }
  }

  /** Beim Zerstören des Halters aufrufen — sonst bleiben die Objekt-Adressen liegen. */
  releaseObjectUrls(): void {
    this.objectUrls.forEach((objectUrl: string) => URL.revokeObjectURL(objectUrl));
    this.objectUrls.length = 0;
  }

  private publish(key: TKey, blob: Blob): void {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    this.objectUrls.push(objectUrl);
    image.onload = () => {
      const withNewImage = new Map(this.loadedImages());
      withNewImage.set(key, image);
      this.loadedImages.set(withNewImage);
    };
    image.src = objectUrl;
  }
}
