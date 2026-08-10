import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CircleShapeLayer,
  LayerPatch,
  RectShapeLayer,
  ShapeLayer,
} from '../../../../../shared/canvas/rendering/layer';
import { FieldHint } from '../../../../../shared/components/field-hint/field-hint';
import { ColorField } from '../color-field/color-field';
import { GeometryFields, GeometryValue } from '../geometry-fields/geometry-fields';

@Component({
  selector: 'app-shape-properties',
  imports: [GeometryFields, ColorField, FieldHint, ReactiveFormsModule],
  templateUrl: './shape-properties.html',
  styleUrl: './shape-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShapeProperties {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly layer = input.required<ShapeLayer>();
  readonly layerChange = output<LayerPatch>();

  protected readonly strokeWidthForm = this.formBuilder.group({
    strokeWidth: [0, [Validators.min(0)]],
  });

  protected readonly cornerRadiusForm = this.formBuilder.group({
    cornerRadius: [0, [Validators.min(0)]],
  });

  protected readonly pointsForm = this.formBuilder.group({
    x1: [0],
    y1: [0],
    x2: [0],
    y2: [0],
  });

  protected readonly isRect = computed(() => this.layer().shape === 'rect');
  protected readonly isLine = computed(() => this.layer().shape === 'line');

  constructor() {
    effect(() => {
      const layer = this.layer();
      this.strokeWidthForm.patchValue({ strokeWidth: layer.strokeWidth }, { emitEvent: false });

      if (layer.shape === 'rect') {
        this.cornerRadiusForm.patchValue({ cornerRadius: layer.cornerRadius }, { emitEvent: false });
      }

      if (layer.shape === 'line') {
        const [x1, y1, x2, y2] = layer.points;
        this.pointsForm.patchValue({ x1, y1, x2, y2 }, { emitEvent: false });
      }
    });
  }

  protected geometryOf(layer: RectShapeLayer | CircleShapeLayer): GeometryValue {
    return { x: layer.x, y: layer.y, width: layer.width, height: layer.height, rotation: layer.rotation };
  }

  protected geometryOrNull(layer: ShapeLayer): GeometryValue | null {
    return layer.shape === 'line' ? null : this.geometryOf(layer);
  }

  protected fillOrNull(layer: ShapeLayer): string | null {
    return layer.shape === 'line' ? null : layer.fill;
  }

  protected emitGeometry(geometry: GeometryValue): void {
    this.layerChange.emit(geometry);
  }

  protected emitOpacity(opacity: number): void {
    this.layerChange.emit({ opacity });
  }

  protected emitStrokeWidth(): void {
    if (this.strokeWidthForm.valid) {
      this.layerChange.emit({ strokeWidth: this.strokeWidthForm.getRawValue().strokeWidth });
    }
  }

  protected emitCornerRadius(): void {
    if (this.cornerRadiusForm.valid) {
      this.layerChange.emit({ cornerRadius: this.cornerRadiusForm.getRawValue().cornerRadius });
    }
  }

  protected emitPoints(): void {
    if (this.pointsForm.invalid) {
      return;
    }

    const { x1, y1, x2, y2 } = this.pointsForm.getRawValue();
    this.layerChange.emit({ points: [x1, y1, x2, y2] });
  }

  protected emitFill(value: string | null): void {
    this.layerChange.emit({ fill: value });
  }

  protected emitStroke(value: string | null): void {
    this.layerChange.emit({ stroke: value });
  }
}
