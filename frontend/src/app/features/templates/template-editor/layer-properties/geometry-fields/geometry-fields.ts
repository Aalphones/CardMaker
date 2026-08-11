import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

export interface GeometryValue {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Position und Größe — von allen Eigenschaften-Unterkomponenten außer Rahmen verwendet
 * (Plan-README „Bildschirmaufteilung des Editors"). `geometry` ist `null` bei der Linie
 * (kein Geometrie-Rechteck, siehe Layer-Tabelle) — dann rendert die Komponente nichts.
 * Drehung und Deckkraft leben seit Phase 8 im Aufklappbereich „Erweitert"
 * (`app-advanced-fields`), nicht mehr hier.
 */
@Component({
  selector: 'app-geometry-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './geometry-fields.html',
  styleUrl: './geometry-fields.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeometryFields {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly geometry = input<GeometryValue | null>(null);
  readonly geometryChange = output<GeometryValue>();

  protected readonly geometryForm = this.formBuilder.group({
    x: [0],
    y: [0],
    width: [0],
    height: [0],
  });

  constructor() {
    effect(() => {
      const value = this.geometry();

      if (value) {
        this.geometryForm.patchValue(value, { emitEvent: false });
      }
    });
  }

  protected emitGeometry(): void {
    if (this.geometryForm.valid) {
      this.geometryChange.emit(this.geometryForm.getRawValue());
    }
  }
}
