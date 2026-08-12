import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../core/services/api';

/**
 * Lädt das im Editor erzeugte Vorschaubild eines Templates hoch.
 *
 * Warum hier direkt der `Api`-Dienst statt eines NgRx-Effects (Abweichung von
 * `docs/conventions/state-management.md`, dieselbe Begründung wie beim Bild-Lader):
 * Bilddaten sind kein serialisierbarer Server-Zustand und gehören nicht in den Store.
 */
@Injectable({
  providedIn: 'root',
})
export class TemplatePreview {
  private readonly api = inject(Api);

  upload(templateId: number, image: Blob): Observable<{ previewUpdatedAt: string }> {
    const form = new FormData();
    form.append('file', image, 'preview.png');

    return this.api.postForm<{ previewUpdatedAt: string }>(`/templates/${templateId}/preview`, form);
  }
}
