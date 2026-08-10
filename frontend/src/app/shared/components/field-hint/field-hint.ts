import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

let nextInstanceId = 0;

@Component({
  selector: 'app-field-hint',
  imports: [],
  templateUrl: './field-hint.html',
  styleUrl: './field-hint.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldHint {
  readonly text = input.required<string>();
  readonly panelId = `field-hint-${++nextInstanceId}`;

  protected readonly expanded = signal(false);

  protected toggle(): void {
    this.expanded.update((isExpanded: boolean) => !isExpanded);
  }
}
