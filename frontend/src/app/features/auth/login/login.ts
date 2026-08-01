import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Api } from '../../../core/services/api';
import { Auth } from '../../../core/services/auth';

interface HealthResponse {
  status: string;
  phpVersion: string;
  dbConnected: boolean;
  migrationsApplied: number;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  protected readonly auth = inject(Auth);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly health = toSignal(
    this.api.get<HealthResponse>('/health').pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  protected readonly sessionExpiredHint = computed(
    () => this.queryParamMap().get('reason') === 'expired',
  );
  protected readonly setupIncomplete = computed(() => this.health()?.migrationsApplied === 0);

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const redirectTo = this.route.snapshot.queryParamMap.get('redirect') ?? '/';
    this.auth.login(email, password, redirectTo);
  }
}
