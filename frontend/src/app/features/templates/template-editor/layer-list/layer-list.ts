import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Layer, LayerType, ShapeKind } from '../../../../shared/canvas/rendering/layer';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

export interface AddLayerRequest {
  type: LayerType;
  shape?: ShapeKind;
}

const TYPE_LABELS: Record<LayerType, string> = {
  image: 'Bild',
  shape: 'Form',
  icon: 'Icon',
  frame: 'Rahmen',
  text: 'Text',
};

@Component({
  selector: 'app-layer-list',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './layer-list.html',
  styleUrl: './layer-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayerList {
  private readonly dialog = inject(Dialog);

  readonly layers = input.required<Layer[]>();
  readonly selectedLayerId = input<string | null>(null);
  readonly canAddFrame = input(true);

  readonly selectLayer = output<string>();
  readonly add = output<AddLayerRequest>();
  readonly rename = output<{ id: string; name: string }>();
  readonly duplicate = output<string>();
  readonly remove = output<string>();
  readonly toggleVisible = output<string>();
  readonly move = output<{ fromIndex: number; toIndex: number }>();

  // Die Liste zeigt die vorderste Ebene oben — genau umgekehrt zum gespeicherten Array
  // (Index 0 liegt zuunterst). Siehe Plan-README „Bildschirmaufteilung des Editors".
  protected readonly reversedLayers = computed(() => [...this.layers()].reverse());

  protected readonly addMenuOpen = signal(false);
  protected readonly menuOpenFor = signal<string | null>(null);
  protected readonly renamingId = signal<string | null>(null);

  protected typeLabel(layer: Layer): string {
    return TYPE_LABELS[layer.type];
  }

  protected toggleAddMenu(): void {
    this.addMenuOpen.update((isOpen: boolean) => !isOpen);
  }

  protected chooseType(type: LayerType, shape?: ShapeKind): void {
    this.add.emit({ type, shape });
    this.addMenuOpen.set(false);
  }

  protected toggleMenu(id: string): void {
    this.menuOpenFor.update((current: string | null) => (current === id ? null : id));
  }

  protected startRename(id: string): void {
    this.menuOpenFor.set(null);
    this.renamingId.set(id);
  }

  protected commitRename(id: string, event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();

    if (name !== '') {
      this.rename.emit({ id, name });
    }

    this.renamingId.set(null);
  }

  protected duplicateLayer(id: string): void {
    this.menuOpenFor.set(null);
    this.duplicate.emit(id);
  }

  protected async confirmRemove(id: string, name: string): Promise<void> {
    this.menuOpenFor.set(null);

    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: { title: 'Ebene löschen', message: `Ebene „${name}" wirklich löschen?` },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.remove.emit(id);
    }
  }

  /**
   * Index-Umrechnung: Die Liste ist gedreht, der Speicher nicht. Anzeige-Index `i`
   * entspricht Speicher-Index `länge - 1 - i` (Plan-README-Warnung, genau die Stelle, die
   * man falsch herum baut).
   */
  protected onDrop(event: CdkDragDrop<Layer[]>): void {
    const lastIndex = this.reversedLayers().length - 1;
    const fromIndex = lastIndex - event.previousIndex;
    const toIndex = lastIndex - event.currentIndex;

    if (fromIndex !== toIndex) {
      this.move.emit({ fromIndex, toIndex });
    }
  }
}
