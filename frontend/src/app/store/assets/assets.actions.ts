import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type AssetKind = 'frame' | 'icon';

export interface Asset {
  id: number;
  kind: AssetKind;
  name: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  createdAt: string;
}

export const AssetsActions = createActionGroup({
  source: 'Assets',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: Asset[] }>(),
    'Load Failure': props<{ message: string }>(),
    Upload: props<{ file: File; kind: AssetKind; name: string }>(),
    'Upload Success': props<{ asset: Asset }>(),
    'Upload Failure': props<{ message: string }>(),
    Delete: props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
  },
});
