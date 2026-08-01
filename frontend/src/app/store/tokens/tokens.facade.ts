import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { TokensActions } from './tokens.actions';
import { tokensFeature } from './tokens.feature';

@Injectable({
  providedIn: 'root',
})
export class TokensFacade {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(tokensFeature.selectItems);
  readonly loaded = this.store.selectSignal(tokensFeature.selectLoaded);
  readonly loading = this.store.selectSignal(tokensFeature.selectLoading);
  readonly newToken = this.store.selectSignal(tokensFeature.selectNewToken);

  ensureLoaded(): void {
    this.store.dispatch(TokensActions.load());
  }

  create(name: string): void {
    this.store.dispatch(TokensActions.create({ name }));
  }

  remove(id: number): void {
    this.store.dispatch(TokensActions.delete({ id }));
  }

  dismissNewToken(): void {
    this.store.dispatch(TokensActions.dismissNewToken());
  }
}
