import { ChangeDetectionStrategy, Component, Signal, computed, input, output } from '@angular/core';

import { Point } from '../../../../shared/canvas/rendering/units';

const PAN_HINT = 'Leertaste + Ziehen verschiebt die Ansicht';

@Component({
  selector: 'app-stage-controls',
  templateUrl: './stage-controls.html',
  styleUrl: './stage-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageControls {
  /** Bildschirmpunkte je Canvas-Einheit — 1 entspricht 100 %. */
  readonly zoom = input.required<number>();
  /** Zeigerposition in Canvas-Einheiten, `null` wenn der Zeiger nicht über der Karte ist. */
  readonly cursorPos = input<Point | null>(null);

  readonly zoomIn = output<void>();
  readonly zoomOut = output<void>();
  readonly fitView = output<void>();

  protected readonly zoomPercent: Signal<number> = computed(() => Math.round(this.zoom() * 100));

  protected readonly statusText: Signal<string> = computed(() => {
    const position = this.cursorPos();

    if (!position) {
      return PAN_HINT;
    }

    return `${Math.round(position.x)} / ${Math.round(position.y)}`;
  });
}
