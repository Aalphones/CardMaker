import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FieldHint } from '../../../../../shared/components/field-hint/field-hint';

export interface GeometryValue {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Gemeinsamer Block für Geometrie + Deckkraft, von allen Eigenschaften-Unterkomponenten
 * verwendet (Plan-README „Bildschirmaufteilung des Editors"). `geometry` ist `null` bei der
 * Linie (kein Geometrie-Rechteck, siehe Layer-Tabelle) — dann wird nur die Deckkraft gezeigt.
 */
@Component({
  selector: 'app-geometry-fields',
  imports: [ReactiveFormsModule, FieldHint],
  templateUrl: './geometry-fields.html',
  styleUrl: './geometry-fields.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeometryFields {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly geometry = input<GeometryValue | null>(null);
  readonly opacity = input.required<number>();
  readonly geometryChange = output<GeometryValue>();
  readonly opacityChange = output<number>();

  protected readonly geometryForm = this.formBuilder.group({
    x: [0],
    y: [0],
    width: [0],
    height: [0],
    rotation: [0, [Validators.min(-360), Validators.max(360)]],
  });

  protected readonly opacityForm = this.formBuilder.group({
    opacity: [1, [Validators.min(0), Validators.max(1)]],
  });

  constructor() {
    effect(() => {
      const value = this.geometry();

      if (value) {
        this.geometryForm.patchValue(value, { emitEvent: false });
      }
    });

    effect(() => {
      this.opacityForm.patchValue({ opacity: this.opacity() }, { emitEvent: false });
    });
  }

  protected emitGeometry(): void {
    if (this.geometryForm.valid) {
      this.geometryChange.emit(this.geometryForm.getRawValue());
    }
  }

  protected emitOpacity(): void {
    if (this.opacityForm.valid) {
      this.opacityChange.emit(this.opacityForm.getRawValue().opacity);
    }
  }
}
