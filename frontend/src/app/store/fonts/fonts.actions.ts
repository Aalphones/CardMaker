import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { UploadedFontFamily } from '../../shared/canvas/rendering/fonts';

export type FontFormat = 'woff2' | 'ttf' | 'otf';

/**
 * Eine hochgeladene Schrift, wie sie `/api/fonts` liefert.
 *
 * `family` ist der Name, der in `fontFamily` einer Textebene steht (`cmfont-<Kennung>`) —
 * `name` ist reine Beschriftung für die Oberfläche. Wer den Namen im Frontend anders ablegt,
 * hebelt den Löschschutz des Backends aus, der genau nach diesem Wert sucht.
 */
export interface Font {
  id: number;
  name: string;
  family: UploadedFontFamily;
  format: FontFormat;
  byteSize: number;
  createdAt: string;
}

export const FontsActions = createActionGroup({
  source: 'Fonts',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: Font[] }>(),
    'Load Failure': props<{ message: string }>(),
    Upload: props<{ file: File; name: string }>(),
    'Upload Success': props<{ font: Font }>(),
    'Upload Failure': props<{ message: string; fileError: string | null }>(),
    Rename: props<{ id: number; name: string }>(),
    'Rename Success': props<{ font: Font }>(),
    'Rename Failure': props<{ message: string }>(),
    Delete: props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
  },
});
