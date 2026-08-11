import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

import { LayerType, ShapeKind } from '../../../../shared/canvas/rendering/layer';

export interface AddLayerRequest {
  type: LayerType;
  shape?: ShapeKind;
}

export interface AddLayerEntry {
  label: string;
  shortcut: string;
  type: LayerType;
  shape?: ShapeKind;
}

/** Reihenfolge und Kürzel kommen aus dem Entwurf (Handoff, Abschnitt 7). */
const ENTRIES: readonly AddLayerEntry[] = [
  { label: 'Text', shortcut: 'T', type: 'text' },
  { label: 'Bildfläche', shortcut: 'I', type: 'image' },
  { label: 'Icon', shortcut: 'K', type: 'icon' },
  { label: 'Rechteck', shortcut: 'R', type: 'shape', shape: 'rect' },
  { label: 'Kreis', shortcut: 'O', type: 'shape', shape: 'circle' },
  { label: 'Linie', shortcut: 'L', type: 'shape', shape: 'line' },
  { label: 'Rahmen', shortcut: 'F', type: 'frame' },
];

@Component({
  selector: 'app-add-layer-menu',
  templateUrl: './add-layer-menu.html',
  styleUrl: './add-layer-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLayerMenu {
  private readonly document = inject(DOCUMENT);
  private readonly hostElement: HTMLElement = inject(ElementRef).nativeElement;

  readonly canAddFrame = input(true);

  readonly add = output<AddLayerRequest>();

  protected readonly entries = ENTRIES;
  protected readonly open = signal(false);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly entryButtons = viewChildren<ElementRef<HTMLButtonElement>>('entry');

  constructor() {
    // Beim Öffnen wandert der Fokus in den ersten Eintrag — sonst zeigen die Pfeiltasten
    // ins Leere. Die Einträge stehen erst nach dem Rendern bereit, deshalb hängt der
    // Effekt an der Liste der Schaltflächen und nicht nur am Offen-Zustand.
    effect(() => {
      const buttons = this.entryButtons();

      if (this.open() && buttons.length > 0) {
        this.focusEntry(0, 1);
      }
    });
  }

  protected isDisabled(entry: AddLayerEntry): boolean {
    return entry.type === 'frame' && !this.canAddFrame();
  }

  protected dotClass(entry: AddLayerEntry): string {
    return `add-layer-menu__dot--${entry.type}`;
  }

  protected toggle(): void {
    this.open.update((isOpen: boolean) => !isOpen);
  }

  protected choose(entry: AddLayerEntry): void {
    this.add.emit({ type: entry.type, shape: entry.shape });
    this.closeAndFocusTrigger();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeAndFocusTrigger();
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();
    // Ohne das Anhalten würden die Pfeiltasten zusätzlich die ausgewählte Ebene auf der
    // Karte verschieben — der Editor lauscht dafür am Fenster.
    event.stopPropagation();

    const direction = event.key === 'ArrowDown' ? 1 : -1;
    this.focusEntry(this.focusedIndex() + direction, direction);
  }

  /** Klick daneben schließt das Menü — ohne den Fokus zurückzuholen, der Klick setzt ihn selbst. */
  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && event.target instanceof Node && !this.hostElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  private closeAndFocusTrigger(): void {
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  private focusedIndex(): number {
    return this.entryButtons().findIndex(
      (button: ElementRef<HTMLButtonElement>) => button.nativeElement === this.document.activeElement,
    );
  }

  /** Wandert ab `startIndex` in Laufrichtung weiter, überspringt gesperrte Einträge und läuft um. */
  private focusEntry(startIndex: number, direction: number): void {
    const buttons = this.entryButtons();

    if (buttons.length === 0) {
      return;
    }

    for (let offset = 0; offset < buttons.length; offset++) {
      const index = (((startIndex + offset * direction) % buttons.length) + buttons.length) % buttons.length;
      const button = buttons[index]?.nativeElement;

      if (button && !button.disabled) {
        button.focus();
        return;
      }
    }
  }
}
