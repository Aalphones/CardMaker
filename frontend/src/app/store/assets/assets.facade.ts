import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { AssetKind, AssetsActions } from './assets.actions';
import { assetsFeature } from './assets.feature';

@Injectable({
  providedIn: 'root',
})
export class AssetsFacade {
  private readonly store = inject(Store);

  readonly all = this.store.selectSignal(assetsFeature.selectItems);
  readonly loaded = this.store.selectSignal(assetsFeature.selectLoaded);
  readonly loading = this.store.selectSignal(assetsFeature.selectLoading);
  readonly uploading = this.store.selectSignal(assetsFeature.selectUploading);
  readonly error = this.store.selectSignal(assetsFeature.selectError);

  ensureLoaded(): void {
    this.store.dispatch(AssetsActions.load());
  }

  upload(file: File, kind: AssetKind, name: string): void {
    this.store.dispatch(AssetsActions.upload({ file, kind, name }));
  }

  remove(id: number): void {
    this.store.dispatch(AssetsActions.delete({ id }));
  }
}
