import { createActionGroup, emptyProps, props } from '@ngrx/store';

/** Abweichung einer einzelnen Karte von dem, was die Textebene im Template vorgibt. */
export interface CardTextOverride {
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Ein hochgeladenes Kartenbild in seiner Bildfläche. `offsetX`/`offsetY` sind
 * Canvas-Einheiten, `scale` 1 heißt „das Bild füllt die kürzere Seite der Fläche".
 * `width`/`height` sind die Originalmaße der Datei in Pixeln.
 */
export interface CardImage {
  layerId: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  width: number;
  height: number;
}

export interface CardImagePlacement {
  offsetX?: number;
  offsetY?: number;
  scale?: number;
}

/** Kurzfassung für die Liste — ohne `values`/`images`, dafür mit den aufgelösten Namen. */
export interface CardSummary {
  id: number;
  name: string;
  templateId: number;
  templateName: string;
  cardGroupId: number | null;
  cardGroupName: string | null;
  previewUpdatedAt: string | null;
  updatedAt: string;
}

export interface Card {
  id: number;
  name: string;
  templateId: number;
  cardGroupId: number | null;
  values: Record<string, string>;
  iconChoices: Record<string, number>;
  textOverrides: Record<string, CardTextOverride>;
  images: CardImage[];
  createdAt: string;
  updatedAt: string;
}

/** Was beim Anlegen mitgeschickt wird; beim Ändern reicht ein Ausschnitt davon (PATCH). */
export interface CardInput {
  name: string;
  templateId: number;
  cardGroupId: number | null;
  values: Record<string, string>;
  iconChoices: Record<string, number>;
  textOverrides: Record<string, CardTextOverride>;
}

export const CardsActions = createActionGroup({
  source: 'Cards',
  events: {
    Load: emptyProps(),
    // Holt die Liste ohne den `loaded`-Riegel — nach jeder Änderung nötig, weil die
    // Kurzfassung Template- und Gruppennamen enthält, die keine Antwort einer
    // Karten-Änderung mitliefert.
    Refresh: emptyProps(),
    'Load Success': props<{ items: CardSummary[] }>(),
    'Load Failure': props<{ message: string }>(),
    'Load One': props<{ id: number }>(),
    'Load One Success': props<{ card: Card }>(),
    'Load One Failure': props<{ message: string }>(),
    Create: props<{ input: CardInput }>(),
    'Create Success': props<{ card: Card }>(),
    'Create Failure': props<{ message: string }>(),
    Save: props<{ id: number; changes: Partial<CardInput> }>(),
    'Save Success': props<{ card: Card }>(),
    'Save Failure': props<{ message: string }>(),
    Delete: props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
    Duplicate: props<{ id: number }>(),
    'Duplicate Success': props<{ card: Card }>(),
    'Duplicate Failure': props<{ message: string }>(),
    'Upload Image': props<{ cardId: number; layerId: string; file: File }>(),
    'Upload Image Success': props<{ cardId: number; image: CardImage }>(),
    'Upload Image Failure': props<{ message: string }>(),
    'Update Image Placement': props<{
      cardId: number;
      layerId: string;
      placement: CardImagePlacement;
    }>(),
    'Update Image Placement Success': props<{ cardId: number; image: CardImage }>(),
    'Update Image Placement Failure': props<{ message: string }>(),
    'Remove Image': props<{ cardId: number; layerId: string }>(),
    'Remove Image Success': props<{ cardId: number; layerId: string }>(),
    'Remove Image Failure': props<{ message: string }>(),
  },
});
