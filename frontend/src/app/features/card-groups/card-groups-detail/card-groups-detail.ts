import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { CardGroupsFacade } from '../../../store/card-groups/card-groups.facade';

@Component({
  selector: 'app-card-groups-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './card-groups-detail.html',
  styleUrl: './card-groups-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGroupsDetail implements ComponentWithUnsavedChanges {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  protected readonly cardGroups = inject(CardGroupsFacade);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly cardGroupId = computed(() => {
    const idParam = this.paramMap().get('id');
    return idParam === null ? null : Number(idParam);
  });
  protected readonly isEditMode = computed(() => this.cardGroupId() !== null);
  protected readonly existing = computed(() => {
    const id = this.cardGroupId();
    return id === null ? undefined : this.cardGroups.byId(id)();
  });
  protected readonly notFound = computed(
    () => this.isEditMode() && this.cardGroups.loaded() && !this.existing(),
  );

  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(191)]],
    description: ['', Validators.maxLength(2000)],
  });

  constructor() {
    this.cardGroups.ensureLoaded();

    effect(() => {
      const item = this.existing();

      if (item && !this.form.dirty) {
        this.form.patchValue({ name: item.name, description: item.description ?? '' });
      }
    });

    effect(() => {
      if (this.cardGroups.error()) {
        this.submitting.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { name, description } = this.form.getRawValue();
    const trimmedDescription = description.trim() === '' ? null : description.trim();
    const id = this.cardGroupId();

    if (id === null) {
      this.cardGroups.create(name, trimmedDescription);
    } else {
      this.cardGroups.update(id, name, trimmedDescription);
    }
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.submitting();
  }
}
