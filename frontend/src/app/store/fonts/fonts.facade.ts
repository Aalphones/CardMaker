import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { FontsActions } from './fonts.actions';
import { fontsFeature } from './fonts.feature';

@Injectable({
  providedIn: 'root',
})
export class FontsFacade {
  private readonly store = inject(Store);

  readonly all = this.store.selectSignal(fontsFeature.selectItems);
  readonly loaded = this.store.selectSignal(fontsFeature.selectLoaded);
  readonly loading = this.store.selectSignal(fontsFeature.selectLoading);
  readonly uploading = this.store.selectSignal(fontsFeature.selectUploading);
  readonly error = this.store.selectSignal(fontsFeature.selectError);
  readonly uploadFileError = this.store.selectSignal(fontsFeature.selectUploadFileError);
  readonly lastUploaded = this.store.selectSignal(fontsFeature.selectLastUploaded);

  ensureLoaded(): void {
    this.store.dispatch(FontsActions.load());
  }

  upload(file: File, name: string): void {
    this.store.dispatch(FontsActions.upload({ file, name }));
  }

  rename(id: number, name: string): void {
    this.store.dispatch(FontsActions.rename({ id, name }));
  }

  remove(id: number): void {
    this.store.dispatch(FontsActions.delete({ id }));
  }
}
