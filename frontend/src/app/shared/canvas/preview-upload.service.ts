import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../core/services/api';
import { PreviewKind } from './preview-image-loader';

/** Breite des Vorschaubildes in Bildpunkten; die Höhe folgt dem Kartenverhältnis (587). */
export const PREVIEW_WIDTH_PX = 420;

/**
 * Lädt ein im Editor erzeugtes Vorschaubild hoch — für Templates und Karten gleichermaßen.
 *
 * Warum hier direkt der `Api`-Dienst statt eines NgRx-Effects (Abweichung von
 * `docs/conventions/state-management.md`, dieselbe Begründung wie beim Bild-Lader):
 * Bilddaten sind kein serialisierbarer Server-Zustand und gehören nicht in den Store.
 */
@Injectable({
  providedIn: 'root',
})
export class PreviewUploadService {
  private readonly api = inject(Api);

  upload(kind: PreviewKind, id: number, image: Blob): Observable<{ previewUpdatedAt: string }> {
    const form = new FormData();
    form.append('file', image, 'preview.png');

    return this.api.postForm<{ previewUpdatedAt: string }>(`/${kind}/${id}/preview`, form);
  }
}
