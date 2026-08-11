import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Layer, LayerType } from '../../../../shared/canvas/rendering/layer';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AddLayerMenu, AddLayerRequest } from '../add-layer-menu/add-layer-menu';

const TYPE_LABELS: Record<LayerType, string> = {
  image: 'Bild',
  shape: 'Form',
  icon: 'Icon',
  frame: 'Rahmen',
  text: 'Text',
};

@Component({
  selector: 'app-layer-list',
  imports: [AddLayerMenu, CdkDropList, CdkDrag],
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

  private readonly selectedLayer = computed(
    () => this.layers().find((layer: Layer) => layer.id === this.selectedLayerId()) ?? null,
  );

  protected readonly renamingId = signal<string | null>(null);

  private readonly renameInput = viewChild<ElementRef<HTMLInputElement>>('renameInput');

  constructor() {
    // Das Feld erscheint erst mit dem nächsten Rendern — deshalb hängt der Effekt am Signal
    // des Kindelements. Ohne Fokus wäre F2 wirkungslos: das Feld stünde da, der Tastendruck
    // ginge weiter ans Fenster.
    effect(() => {
      const input = this.renameInput();

      if (input) {
        input.nativeElement.focus();
        input.nativeElement.select();
      }
    });
  }

  /** Ruft die Editor-Komponente auf, wenn F2 gedrückt wurde. */
  startRenameSelected(): void {
    const layer = this.selectedLayer();

    if (layer) {
      this.renamingId.set(layer.id);
    }
  }

  protected typeLabel(layer: Layer): string {
    return TYPE_LABELS[layer.type];
  }

  /** Der Punkt vor dem Namen trägt die Typfarbe — die Farben selbst stehen als Token fest. */
  protected dotClass(layer: Layer): string {
    return `layer-list__dot--${layer.type}`;
  }

  protected startRename(id: string): void {
    this.renamingId.set(id);
  }

  protected commitRename(id: string, event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();

    if (name !== '') {
      this.rename.emit({ id, name });
    }

    this.renamingId.set(null);
  }

  /** Escape verwirft die Umbenennung — das anschließende `blur` darf sie nicht doch noch übernehmen. */
  protected cancelRename(event: Event): void {
    event.stopPropagation();
    this.renamingId.set(null);
  }

  protected duplicateSelected(): void {
    const layer = this.selectedLayer();

    if (layer) {
      this.duplicate.emit(layer.id);
    }
  }

  protected async removeSelected(): Promise<void> {
    const layer = this.selectedLayer();

    if (!layer) {
      return;
    }

    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: { title: 'Ebene löschen', message: `Ebene „${layer.name}" wirklich löschen?` },
    });

    const confirmed = await firstValueFrom(dialogRef.closed);

    if (confirmed) {
      this.remove.emit(layer.id);
    }
  }

  /**
   * „Nach vorn" heißt im Speicher-Array einen Platz weiter nach hinten (Index 0 liegt
   * zuunterst) — dieselbe Drehung wie bei der Anzeige, nur ohne Liste dazwischen.
   */
  protected moveSelected(direction: 1 | -1): void {
    const layers = this.layers();
    const fromIndex = layers.findIndex((layer: Layer) => layer.id === this.selectedLayerId());
    const toIndex = fromIndex + direction;

    if (fromIndex === -1 || toIndex < 0 || toIndex >= layers.length) {
      return;
    }

    this.move.emit({ fromIndex, toIndex });
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
