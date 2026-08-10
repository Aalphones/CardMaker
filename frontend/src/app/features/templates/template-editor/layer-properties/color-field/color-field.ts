import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { FieldHint } from '../../../../../shared/components/field-hint/field-hint';

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * Farbfeld nach Plan-README: `<input type="color">` plus Textfeld für den Hexwert.
 * Wiederverwendet in `shape-properties` (fill, stroke) und `text-properties`
 * (color, outlineColor, shadowColor) — daher `nullable`: die Textebenen-Farbe ist Pflicht,
 * Umrandung/Schatten/Füllung dürfen leer sein.
 */
@Component({
  selector: 'app-color-field',
  imports: [FieldHint],
  templateUrl: './color-field.html',
  styleUrl: './color-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorField {
  readonly label = input.required<string>();
  readonly value = input.required<string | null>();
  readonly nullable = input(false);
  readonly hint = input<string | null>(null);
  readonly valueChange = output<string | null>();

  protected onColorInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected onTextInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();

    if (raw === '' && this.nullable()) {
      this.valueChange.emit(null);
      return;
    }

    if (HEX_PATTERN.test(raw)) {
      this.valueChange.emit(raw);
    }
  }
}
