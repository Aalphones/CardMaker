import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FONT_GROUPS } from '../../../../../shared/canvas/rendering/fonts';
import { LayerPatch, TextLayer } from '../../../../../shared/canvas/rendering/layer';
import { FieldHint } from '../../../../../shared/components/field-hint/field-hint';
import { AdvancedFields } from '../advanced-fields/advanced-fields';
import { ColorField } from '../color-field/color-field';
import { GeometryFields, GeometryValue } from '../geometry-fields/geometry-fields';

const KEY_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;

@Component({
  selector: 'app-text-properties',
  imports: [GeometryFields, ColorField, AdvancedFields, FieldHint, ReactiveFormsModule],
  templateUrl: './text-properties.html',
  styleUrl: './text-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextProperties {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly layer = input.required<TextLayer>();
  readonly layerChange = output<LayerPatch>();

  protected readonly fontGroups = FONT_GROUPS;

  protected readonly form = this.formBuilder.group({
    key: ['', [Validators.required, Validators.pattern(KEY_PATTERN)]],
    source: ['static' as TextLayer['source']],
    defaultText: ['', [Validators.maxLength(500)]],
    fontFamily: ['Arial' as TextLayer['fontFamily']],
    fontSize: [40, [Validators.min(4), Validators.max(200)]],
    minFontSize: [12, [Validators.min(4), Validators.max(200)]],
    align: ['center' as TextLayer['align']],
    verticalAlign: ['middle' as TextLayer['verticalAlign']],
    lineHeight: [1.2, [Validators.min(0.5), Validators.max(3)]],
    outlineWidth: [0, [Validators.min(0)]],
    shadowBlur: [0, [Validators.min(0)]],
    shadowOffsetX: [0],
    shadowOffsetY: [0],
    autoShrink: [false],
  });

  protected readonly minFontSizeExceedsFontSize = computed(() => {
    const value = this.form.getRawValue();
    return value.minFontSize > value.fontSize;
  });

  constructor() {
    effect(() => {
      const layer = this.layer();

      this.form.patchValue(
        {
          key: layer.key,
          source: layer.source,
          defaultText: layer.defaultText,
          fontFamily: layer.fontFamily,
          fontSize: layer.fontSize,
          minFontSize: layer.minFontSize,
          align: layer.align,
          verticalAlign: layer.verticalAlign,
          lineHeight: layer.lineHeight,
          outlineWidth: layer.outlineWidth,
          shadowBlur: layer.shadowBlur,
          shadowOffsetX: layer.shadowOffsetX,
          shadowOffsetY: layer.shadowOffsetY,
          autoShrink: layer.autoShrink,
        },
        { emitEvent: false },
      );
    });
  }

  protected geometryOf(layer: TextLayer): GeometryValue {
    return { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  }

  protected onSourceChange(event: Event): void {
    const source: TextLayer['source'] = (event.target as HTMLInputElement).checked
      ? 'user'
      : 'static';
    this.form.patchValue({ source }, { emitEvent: false });
    this.layerChange.emit({ source });
  }

  protected emitForm(): void {
    if (this.form.invalid || this.minFontSizeExceedsFontSize()) {
      return;
    }

    this.layerChange.emit(this.form.getRawValue());
  }

  protected emitOpacity(opacity: number): void {
    this.layerChange.emit({ opacity });
  }

  protected emitRotation(rotation: number): void {
    this.layerChange.emit({ rotation });
  }

  protected emitColor(color: string | null): void {
    if (color !== null) {
      this.layerChange.emit({ color });
    }
  }

  protected emitOutlineColor(outlineColor: string | null): void {
    this.layerChange.emit({ outlineColor });
  }

  protected emitShadowColor(shadowColor: string | null): void {
    this.layerChange.emit({ shadowColor });
  }
}
