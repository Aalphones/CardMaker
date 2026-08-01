import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AccessToken } from '../../../../store/tokens/tokens.actions';
import { TokensFacade } from '../../../../store/tokens/tokens.facade';

@Component({
  selector: 'app-tokens-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './tokens-page.html',
  styleUrl: './tokens-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokensPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly tokens = inject(TokensFacade);

  protected readonly form = this.formBuilder.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.tokens.ensureLoaded();
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.tokens.create(this.form.getRawValue().name);
    this.form.reset();
  }

  remove(item: AccessToken): void {
    if (!confirm(`Zugriffstoken „${item.name}" wirklich löschen?`)) {
      return;
    }

    this.tokens.remove(item.id);
  }

  async copy(token: string): Promise<void> {
    await navigator.clipboard.writeText(token);
  }
}
