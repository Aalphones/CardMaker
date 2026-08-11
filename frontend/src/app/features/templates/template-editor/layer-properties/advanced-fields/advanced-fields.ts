import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FieldHint } from '../../../../../shared/components/field-hint/field-hint';

/**
 * Aufklappbereich „Erweitert" — Deckkraft, Drehung und (nur bei Rechtecken) Eckradius.
 * `rotation`/`cornerRadius` sind `null`, wenn der Layer-Typ das jeweilige Feld nicht kennt
 * (Linie hat keine Drehung, nur Rechtecke haben einen Eckradius) — dann bleibt das Feld weg.
 * Typspezifische Zusatzfelder (Text) werden per Content Projection ergänzt: eine einzige
 * `<details>`-Instanz pro Eigenschaften-Unterkomponente, damit der offene Zustand beim
 * Ebenenwechsel erhalten bleibt (README „Aufklappbereich Erweitert").
 */
@Component({
  selector: 'app-advanced-fields',
  imports: [ReactiveFormsModule, FieldHint],
  templateUrl: './advanced-fields.html',
  styleUrl: './advanced-fields.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedFields {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly opacity = input.required<number>();
  readonly rotation = input<number | null>(null);
  readonly cornerRadius = input<number | null>(null);

  readonly opacityChange = output<number>();
  readonly rotationChange = output<number>();
  readonly cornerRadiusChange = output<number>();

  protected readonly opacityForm = this.formBuilder.group({
    opacity: [1, [Validators.min(0), Validators.max(1)]],
  });

  protected readonly rotationForm = this.formBuilder.group({
    rotation: [0, [Validators.min(-360), Validators.max(360)]],
  });

  protected readonly cornerRadiusForm = this.formBuilder.group({
    cornerRadius: [0, [Validators.min(0)]],
  });

  constructor() {
    effect(() => this.opacityForm.patchValue({ opacity: this.opacity() }, { emitEvent: false }));

    effect(() => {
      const value = this.rotation();

      if (value !== null) {
        this.rotationForm.patchValue({ rotation: value }, { emitEvent: false });
      }
    });

    effect(() => {
      const value = this.cornerRadius();

      if (value !== null) {
        this.cornerRadiusForm.patchValue({ cornerRadius: value }, { emitEvent: false });
      }
    });
  }

  protected emitOpacity(): void {
    if (this.opacityForm.valid) {
      this.opacityChange.emit(this.opacityForm.getRawValue().opacity);
    }
  }

  protected emitRotation(): void {
    if (this.rotationForm.valid) {
      this.rotationChange.emit(this.rotationForm.getRawValue().rotation);
    }
  }

  protected emitCornerRadius(): void {
    if (this.cornerRadiusForm.valid) {
      this.cornerRadiusChange.emit(this.cornerRadiusForm.getRawValue().cornerRadius);
    }
  }
}
