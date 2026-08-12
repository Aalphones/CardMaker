import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];

/** Dieselbe Grenze wie im Backend (`CardImageService::FALLBACK_MAX_BYTES`). */
const MAX_BYTES = 8 * 1024 * 1024;

let nextInstanceId = 0;

@Component({
  selector: 'app-image-drop',
  imports: [],
  templateUrl: './image-drop.html',
  styleUrl: './image-drop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageDrop {
  readonly label = input.required<string>();
  readonly imageUrl = input<string | null>(null);
  readonly busy = input(false);

  readonly fileChosen = output<File>();
  readonly removed = output<void>();

  readonly inputId = `image-drop-${++nextInstanceId}`;

  protected readonly dragActive = signal(false);
  protected readonly fileError = signal<string | null>(null);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  protected onDragLeave(): void {
    this.dragActive.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);

    const file = event.dataTransfer?.files?.[0];

    if (file) {
      this.accept(file);
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.accept(file);
    }

    // Dieselbe Datei noch einmal wählen soll wieder auslösen — ohne Zurücksetzen bleibt
    // der Wert stehen und das Feld meldet keine Änderung.
    input.value = '';
  }

  protected remove(): void {
    this.fileError.set(null);
    this.removed.emit();
  }

  private accept(file: File): void {
    const error = validateFile(file);

    if (error !== null) {
      this.fileError.set(error);
      return;
    }

    this.fileError.set(null);
    this.fileChosen.emit(file);
  }
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Nur PNG- und JPEG-Bilder sind möglich.';
  }

  if (file.size > MAX_BYTES) {
    return 'Das Bild ist größer als 8 MB.';
  }

  return null;
}
