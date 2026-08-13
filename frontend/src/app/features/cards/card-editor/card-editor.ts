import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Signal,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormRecord,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CardCanvas } from '../../../shared/canvas/card-canvas/card-canvas';
import { CardImageLoader, cardImageKey } from '../../../shared/canvas/card-image-loader';
import { CardRenderer } from '../../../shared/canvas/card-renderer.service';
import {
  PREVIEW_WIDTH_PX,
  PreviewUploadService,
} from '../../../shared/canvas/preview-upload.service';
import {
  CardImagePlacement,
  MAX_CARD_IMAGE_SCALE,
  MIN_CARD_IMAGE_SCALE,
  CardContent,
  areaCenter,
  clampPlacement,
  resetPlacement,
  zoomPlacementAt,
} from '../../../shared/canvas/rendering/card-content';
import { Geometry, Layer } from '../../../shared/canvas/rendering/layer';
import { PRINT_WIDTH_PX } from '../../../shared/canvas/rendering/print';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FieldHint } from '../../../shared/components/field-hint/field-hint';
import { ComponentWithUnsavedChanges } from '../../../shared/guards/pending-changes-guard';
import { cardFileName } from '../../../shared/services/card-file-name';
import { downloadBlob } from '../../../shared/services/download-file';
import { Notification } from '../../../shared/services/notification';
import { Asset } from '../../../store/assets/assets.actions';
import { AssetsFacade } from '../../../store/assets/assets.facade';
import { CardGroupsFacade } from '../../../store/card-groups/card-groups.facade';
import { Card, CardInput, CardTextOverride } from '../../../store/cards/cards.actions';
import { CardsFacade } from '../../../store/cards/cards.facade';
import { TemplatesFacade } from '../../../store/templates/templates.facade';
import {
  CardFormFields,
  CardIconField,
  CardImageField,
  CardTextField,
  EMPTY_CARD_FORM_FIELDS,
  describeCardFields,
} from './card-fields';
import { ImageDrop } from './image-drop/image-drop';

/**
 * Fett und Kursiv sind Abweichungen, keine Schalter: „aus dem Template" ist ein eigener
 * Zustand und lässt sich mit zwei Stellungen nicht ausdrücken.
 */
type OverrideFlag = 'inherit' | 'on' | 'off';

interface OverrideControls {
  fontSize: FormControl<number | null>;
  color: FormControl<string | null>;
  bold: FormControl<OverrideFlag>;
  italic: FormControl<OverrideFlag>;
}

interface OrphanKeys {
  texts: string[];
  icons: string[];
}

/** Der Entwurfsstand, wie ihn Formular und Vorschau gemeinsam sehen. */
interface DraftState {
  values: Record<string, string>;
  iconChoices: Record<string, number>;
  overrides: Record<string, CardTextOverride>;
}

const NEW_CARD_FALLBACK_NAME = 'Neue Karte';

const SIZE_HINT =
  'Leer heißt: so groß wie im Template. Ein Wert hier gilt nur für diese eine Karte.';
const COLOR_HINT =
  'Leer heißt: die Farbe aus dem Template. Ein Wert hier gilt nur für diese eine Karte.';
const ORPHAN_HINT =
  'Das Template kennt diese Felder nicht mehr — umbenannt oder gelöscht. Die Werte bleiben ' +
  'gespeichert und tauchen wieder auf, falls die Felder zurückkommen.';
const PREVIEW_FAILED_MESSAGE = 'Das Vorschaubild konnte nicht gespeichert werden.';

const PLACEMENT_HINT = 'Ziehen verschiebt das Bild, das Mausrad zoomt.';

const DOWNLOAD_HINT =
  'Ergibt ein PNG mit 744 × 1039 Bildpunkten — das ist die Kartengröße 63 × 88 mm bei ' +
  '300 Bildpunkten je Zoll, der übliche Wert fürs Drucken.';
const DOWNLOAD_FAILED_MESSAGE = 'Das Bild konnte nicht erzeugt werden.';

/**
 * Eine Mausbewegung ist keine Speicherung wert: erst wenn so lange nichts mehr passiert,
 * geht der neue Ausschnitt zum Server. Beim Verlassen des Editors sofort.
 */
const PLACEMENT_SAVE_DELAY_MS = 400;

const ARROW_STEP = 5;
const ARROW_STEP_LARGE = 25;
const KEY_ZOOM_STEP = 0.25;

const TEMPLATE_HINT =
  'Die Felder unten richten sich nach dem Template. Wechselst du es, verschwinden Felder, ' +
  'die das neue Template nicht kennt — ihre Werte bleiben trotzdem erhalten.';

@Component({
  selector: 'app-card-editor',
  imports: [ReactiveFormsModule, RouterLink, CardCanvas, FieldHint, ImageDrop],
  templateUrl: './card-editor.html',
  styleUrl: './card-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditor implements ComponentWithUnsavedChanges {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(Dialog);
  private readonly cardImages = inject(CardImageLoader);
  private readonly cardPreview = inject(PreviewUploadService);
  private readonly cardRenderer = inject(CardRenderer);
  private readonly notification = inject(Notification);
  protected readonly cards = inject(CardsFacade);
  protected readonly templates = inject(TemplatesFacade);
  protected readonly cardGroups = inject(CardGroupsFacade);
  protected readonly assets = inject(AssetsFacade);

  protected readonly flagOptions: readonly { value: OverrideFlag; label: string }[] = [
    { value: 'inherit', label: 'Template' },
    { value: 'on', label: 'An' },
    { value: 'off', label: 'Aus' },
  ];

  protected readonly flagFields: readonly { field: 'bold' | 'italic'; label: string }[] = [
    { field: 'bold', label: 'Fett' },
    { field: 'italic', label: 'Kursiv' },
  ];

  protected readonly sizeHint = SIZE_HINT;
  protected readonly colorHint = COLOR_HINT;
  protected readonly orphanHint = ORPHAN_HINT;
  protected readonly templateHint = TEMPLATE_HINT;
  protected readonly placementHint = PLACEMENT_HINT;
  protected readonly downloadHint = DOWNLOAD_HINT;
  protected readonly minScale = MIN_CARD_IMAGE_SCALE;
  protected readonly maxScale = MAX_CARD_IMAGE_SCALE;

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly cardId = computed(() => {
    const idParam = this.paramMap().get('id');
    return idParam === null ? null : Number(idParam);
  });

  protected readonly card = computed(() => {
    const id = this.cardId();
    const current = this.cards.current();
    return id !== null && current?.id === id ? current : null;
  });

  protected readonly selectedTemplateId = signal<number | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly downloadingImage = signal(false);

  /** Ein Template-Wechsel ist eine Änderung, die kein Formular-Control mitbekommt. */
  private readonly templateChanged = signal(false);

  /**
   * Der Entwurfsstand **aller** je gesehenen Werte — auch der, die das aktuelle Template
   * nicht kennt. Das Formular zeigt nur die passenden; gespeichert wird alles. Sonst
   * würde ein Template-Wechsel Werte still löschen.
   */
  private readonly draftValues = signal<Record<string, string>>({});
  private readonly draftIconChoices = signal<Record<string, number>>({});
  private readonly draftOverrides = signal<Record<string, CardTextOverride>>({});

  /** Die Bildfläche, deren Motiv gerade zurechtgeschoben wird (ADR-018). */
  protected readonly activeImageLayerId = signal<string | null>(null);

  /**
   * Zuletzt eingestellte Ausschnitte, solange der Server sie noch nicht bestätigt hat. Sie
   * liegen über dem geladenen Stand — sonst spränge das Bild nach jedem Zug für einen
   * Augenblick auf die alte Lage zurück.
   */
  private readonly pendingPlacements = signal<Record<string, CardImagePlacement>>({});

  private loadedCardId: number | null = null;
  private requestedTemplateId: number | null = null;
  private placementSaveTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Die drei veränderlichen Teile stehen als eigene Felder da: über `form.controls` gelesen
   * verlieren sie ihren `FormRecord`-Typ und damit das Hinzufügen/Entfernen zur Laufzeit.
   */
  private readonly valueControls = new FormRecord<FormControl<string>>({});
  private readonly iconControls = new FormRecord<FormControl<number | null>>({});
  private readonly overrideControls = new FormRecord<FormGroup<OverrideControls>>({});

  protected readonly form = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.maxLength(191)]),
    cardGroupId: this.formBuilder.control<number | null>(null),
    values: this.valueControls,
    icons: this.iconControls,
    overrides: this.overrideControls,
  });

  protected readonly templateLoaded = computed(() => {
    const id = this.selectedTemplateId();
    return id !== null && this.templates.current()?.id === id;
  });

  protected readonly fields = computed<CardFormFields>(() => {
    const template = this.templates.current();

    if (!this.templateLoaded() || template === null) {
      return EMPTY_CARD_FORM_FIELDS;
    }

    return describeCardFields(template.layers);
  });

  protected readonly title = computed(() => this.card()?.name ?? NEW_CARD_FALLBACK_NAME);

  protected readonly iconAssetsById = computed(
    () => new Map(this.assets.all().map((asset: Asset) => [asset.id, asset])),
  );

  protected readonly orphanKeys = computed<OrphanKeys>(() => {
    if (!this.templateLoaded()) {
      return { texts: [], icons: [] };
    }

    const fields = this.fields();
    const knownTextKeys = new Set(fields.texts.map((text: CardTextField) => text.key));
    const knownIconLayerIds = new Set(fields.icons.map((icon: CardIconField) => icon.layerId));
    const values = this.draftValues();
    const overrides = this.draftOverrides();

    const textKeys = new Set(
      Object.keys(values).filter((key: string) => (values[key] ?? '').trim() !== ''),
    );
    Object.keys(overrides).forEach((key: string) => textKeys.add(key));

    return {
      texts: [...textKeys].filter((key: string) => !knownTextKeys.has(key)),
      icons: Object.keys(this.draftIconChoices()).filter(
        (layerId: string) => !knownIconLayerIds.has(layerId),
      ),
    };
  });

  protected readonly orphanCount = computed(
    () => this.orphanKeys().texts.length + this.orphanKeys().icons.length,
  );

  /**
   * Jede Tastatureingabe meldet sich hier — Formular-Controls sind keine Signale, ohne
   * diesen Anschluss stünde die Vorschau bis zum nächsten Speichern still.
   */
  private readonly formValue = toSignal(this.form.valueChanges);

  protected readonly previewLayers: Signal<Layer[]> = computed(() => {
    if (!this.templateLoaded()) {
      return [];
    }

    return this.templates.current()?.layers ?? [];
  });

  protected readonly previewContent: Signal<CardContent> = computed(() => {
    this.formValue();

    const draft = this.collectDraft();

    const pending = this.pendingPlacements();

    return {
      cardId: this.cardId(),
      values: draft.values,
      iconChoices: draft.iconChoices,
      textOverrides: draft.overrides,
      images: (this.card()?.images ?? []).map(
        (image: CardImagePlacement) => pending[image.layerId] ?? image,
      ),
    };
  });

  /** Der Ausschnitt der bearbeiteten Fläche — Grundlage für Regler, Tastatur und Zurücksetzen. */
  protected readonly activePlacement = computed<CardImagePlacement | null>(() => {
    const layerId = this.activeImageLayerId();

    if (layerId === null) {
      return null;
    }

    return (
      this.previewContent().images.find(
        (image: CardImagePlacement) => image.layerId === layerId,
      ) ?? null
    );
  });

  protected readonly activeImageLabel = computed<string>(() => {
    const layerId = this.activeImageLayerId();

    return (
      this.fields().images.find((image: CardImageField) => image.layerId === layerId)?.label ?? ''
    );
  });

  /** Nach dem nächsten erfolgreichen Speichern ein Vorschaubild erzeugen. */
  private previewRequested = false;

  constructor() {
    this.cards.ensureLoaded();
    this.templates.ensureLoaded();
    this.cardGroups.ensureLoaded();
    this.assets.ensureLoaded();

    const id = this.cardId();

    if (id !== null) {
      this.cards.loadOne(id);
    } else {
      // Kommt der Aufruf aus dem Template-Editor („Karte erstellen"), steht das Template
      // schon fest — kein Wechsel-Dialog nötig, hier gibt es noch nichts zu verlieren.
      const templateParam = this.route.snapshot.queryParamMap.get('template');
      const templateId = templateParam === null ? NaN : Number(templateParam);

      if (Number.isInteger(templateId)) {
        this.selectedTemplateId.set(templateId);
      }
    }

    effect(() => {
      const card = this.card();

      if (card !== null) {
        untracked(() => this.adoptCard(card));
      }
    });

    effect(() => {
      const templateId = this.selectedTemplateId();

      if (templateId !== null && this.requestedTemplateId !== templateId) {
        this.requestedTemplateId = templateId;
        this.templates.loadOne(templateId);
      }
    });

    effect(() => {
      const fields = this.fields();
      const values = this.draftValues();
      const icons = this.draftIconChoices();
      const overrides = this.draftOverrides();

      untracked(() => this.rebuildDynamicControls(fields, values, icons, overrides));
    });

    effect(() => {
      const card = this.card();

      if (card === null) {
        return;
      }

      for (const image of card.images) {
        this.cardImages.load(card.id, image.layerId);
      }
    });

    effect(() => {
      if (this.cards.error()) {
        this.submitting.set(false);
      }
    });

    // Verschwindet die bearbeitete Fläche — Bild entfernt, Template gewechselt —, endet die
    // Bearbeitung von selbst; sonst zeigte die Leiste auf ein Bild, das es nicht mehr gibt.
    effect(() => {
      const layerId = this.activeImageLayerId();

      if (layerId !== null && this.activePlacement() === null) {
        untracked(() => this.activeImageLayerId.set(null));
      }
    });

    inject(DestroyRef).onDestroy(() => this.savePlacementsNow());
  }

  hasUnsavedChanges(): boolean {
    return (this.form.dirty || this.templateChanged()) && !this.submitting();
  }

  protected imageUrlFor(layerId: string): string | null {
    const id = this.cardId();

    if (id === null) {
      return null;
    }

    return this.cardImages.images().get(cardImageKey(id, layerId))?.src ?? null;
  }

  /**
   * Wartet die Bildfläche noch? Erst wenn die Datei beim Server ist **und** das fertige Bild
   * im Zwischenspeicher liegt, ist die Sache durch — dazwischen läge sonst ein Augenblick, in
   * dem die Fläche leer aussieht, obwohl gerade ein Bild ankommt.
   */
  protected imageBusy(layerId: string): boolean {
    if (this.cards.uploadingImageLayerIds().includes(layerId)) {
      return true;
    }

    const id = this.cardId();

    if (id === null) {
      // Ohne Karte gibt es noch kein Bild: das Warten gilt dem Anlegen, das gerade läuft.
      return this.submitting();
    }

    const isStored = (this.card()?.images ?? []).some(
      (image: CardImagePlacement) => image.layerId === layerId,
    );

    if (!isStored) {
      return false;
    }

    const key = cardImageKey(id, layerId);

    return !this.cardImages.images().has(key) && !this.cardImages.failedKeys().has(key);
  }

  protected valueControl(key: string): FormControl<string> | null {
    return this.valueControls.controls[key] ?? null;
  }

  protected overrideGroup(key: string): FormGroup<OverrideControls> | null {
    return this.overrideControls.controls[key] ?? null;
  }

  /** Genau ein Tag der Gruppe ist mit der Tabulatortaste erreichbar — das gewählte. */
  protected iconTabIndex(layerId: string, assetId: number, index: number): number {
    const chosen = this.chosenIconAssetId(layerId);

    if (chosen === null) {
      return index === 0 ? 0 : -1;
    }

    return chosen === assetId ? 0 : -1;
  }

  protected chosenIconAssetId(layerId: string): number | null {
    return this.iconControls.controls[layerId]?.value ?? null;
  }

  protected colorFor(text: CardTextField): string {
    return this.overrideGroup(text.key)?.controls.color.value ?? text.templateColor;
  }

  protected setColor(key: string, event: Event): void {
    const control = this.overrideGroup(key)?.controls.color;

    if (control) {
      control.setValue((event.target as HTMLInputElement).value);
      control.markAsDirty();
    }
  }

  protected resetColor(key: string): void {
    const control = this.overrideGroup(key)?.controls.color;

    if (control) {
      control.setValue(null);
      control.markAsDirty();
    }
  }

  protected resetFontSize(key: string): void {
    const control = this.overrideGroup(key)?.controls.fontSize;

    if (control) {
      control.setValue(null);
      control.markAsDirty();
    }
  }

  protected flagFor(key: string, field: 'bold' | 'italic'): OverrideFlag {
    return this.overrideGroup(key)?.controls[field].value ?? 'inherit';
  }

  protected setFlag(key: string, field: 'bold' | 'italic', value: OverrideFlag): void {
    const control = this.overrideGroup(key)?.controls[field];

    if (control) {
      control.setValue(value);
      control.markAsDirty();
    }
  }

  protected chooseIcon(layerId: string, assetId: number): void {
    const control = this.iconControls.controls[layerId];

    if (!control) {
      return;
    }

    control.setValue(control.value === assetId ? null : assetId);
    control.markAsDirty();
  }

  /** Pfeiltasten bewegen Auswahl und Fokus — wie in einer Radiogruppe. */
  protected onIconKeydown(event: KeyboardEvent, field: CardIconField, index: number): void {
    const step = iconStepFor(event.key);

    if (step === 0) {
      return;
    }

    event.preventDefault();

    const count = field.choiceAssetIds.length;
    const nextIndex = (index + step + count) % count;
    const nextAssetId = field.choiceAssetIds[nextIndex];

    if (nextAssetId === undefined) {
      return;
    }

    this.chooseIcon(field.layerId, nextAssetId);

    const group = (event.currentTarget as HTMLElement).parentElement;
    const buttons = group?.querySelectorAll('button');
    buttons?.item(nextIndex)?.focus();
  }

  protected async onTemplateChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const nextTemplateId = Number(select.value);
    const previousTemplateId = this.selectedTemplateId();

    if (previousTemplateId === nextTemplateId) {
      return;
    }

    if (previousTemplateId !== null && this.hasEnteredValues()) {
      const confirmed = await this.confirmTemplateSwitch();

      if (!confirmed) {
        select.value = String(previousTemplateId);
        return;
      }
    }

    this.mergeFormIntoDraft();
    this.selectedTemplateId.set(nextTemplateId);
    this.templateChanged.set(true);
  }

  protected onCardGroupChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.form.controls.cardGroupId.setValue(value === '' ? null : Number(value));
    this.form.controls.cardGroupId.markAsDirty();
  }

  protected onImageAreaActivated(layerId: string | null): void {
    this.activeImageLayerId.set(layerId);
  }

  protected onPlacementChanged(placement: CardImagePlacement): void {
    this.pendingPlacements.update((pending: Record<string, CardImagePlacement>) => ({
      ...pending,
      [placement.layerId]: placement,
    }));

    if (this.placementSaveTimer !== null) {
      clearTimeout(this.placementSaveTimer);
    }

    this.placementSaveTimer = setTimeout(() => {
      this.savePlacementsNow();
      this.refreshPreviewImage();
    }, PLACEMENT_SAVE_DELAY_MS);
  }

  protected onScaleInput(event: Event): void {
    const placement = this.activePlacement();
    const area = this.activeImageArea();

    if (placement === null || area === null) {
      return;
    }

    const nextScale = Number((event.target as HTMLInputElement).value);

    this.onPlacementChanged(zoomPlacementAt(area, placement, nextScale, areaCenter(area)));
  }

  protected resetActivePlacement(): void {
    const placement = this.activePlacement();
    const area = this.activeImageArea();

    if (placement === null || area === null) {
      return;
    }

    this.onPlacementChanged(resetPlacement(area, placement));
  }

  /** Pfeiltasten verschieben, Plus und Minus zoomen — dieselbe Geste ohne Maus. */
  protected onPreviewKeydown(event: KeyboardEvent): void {
    const placement = this.activePlacement();
    const area = this.activeImageArea();

    if (placement === null || area === null) {
      return;
    }

    const step = event.shiftKey ? ARROW_STEP_LARGE : ARROW_STEP;
    const move = arrowStepFor(event.key);

    if (move !== null) {
      event.preventDefault();
      this.onPlacementChanged(
        clampPlacement(area, {
          ...placement,
          offsetX: placement.offsetX + move.x * step,
          offsetY: placement.offsetY + move.y * step,
        }),
      );
      return;
    }

    const zoom = zoomStepFor(event.key);

    if (zoom !== 0) {
      event.preventDefault();
      this.onPlacementChanged(
        zoomPlacementAt(area, placement, placement.scale + zoom, areaCenter(area)),
      );
    }
  }

  protected onImageChosen(layerId: string, file: File): void {
    const templateId = this.selectedTemplateId();

    if (templateId === null) {
      return;
    }

    const id = this.cardId();

    // Ein neues Motiv bringt eigene Maße mit — der gemerkte Ausschnitt des alten passt nicht
    // mehr darauf und würde das frische Bild schief in die Fläche legen.
    this.forgetPlacement(layerId);

    if (id !== null) {
      this.cards.uploadImage(id, layerId, file);
      return;
    }

    // Ein Bild braucht eine Karte, an der es hängt: die entsteht hier — der Effekt im
    // Speicher schickt das Bild direkt hinterher und die Adresse wechselt auf /cards/{id}.
    this.mergeFormIntoDraft();
    this.submitting.set(true);
    this.cards.create(this.buildInput(templateId), { layerId, file });
  }

  protected onImageRemoved(layerId: string): void {
    const id = this.cardId();

    this.forgetPlacement(layerId);

    if (id !== null) {
      this.cards.removeImage(id, layerId);
    }
  }

  protected removeOrphans(): void {
    const orphans = this.orphanKeys();
    const orphanTexts = new Set(orphans.texts);
    const orphanIcons = new Set(orphans.icons);

    this.draftValues.update((values: Record<string, string>) =>
      withoutKeys(values, orphanTexts),
    );
    this.draftOverrides.update((overrides: Record<string, CardTextOverride>) =>
      withoutKeys(overrides, orphanTexts),
    );
    this.draftIconChoices.update((choices: Record<string, number>) =>
      withoutKeys(choices, orphanIcons),
    );
    this.form.markAsDirty();
  }

  protected submit(): void {
    const templateId = this.selectedTemplateId();

    if (templateId === null) {
      this.formError.set('Bitte zuerst ein Template wählen.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Bitte einen Kartennamen angeben.');
      return;
    }

    this.formError.set(null);
    this.mergeFormIntoDraft();
    this.submitting.set(true);
    this.previewRequested = true;

    const input = this.buildInput(templateId);
    const id = this.cardId();

    if (id === null) {
      this.cards.create(input);
      return;
    }

    // Der Server-Stand darf nach dem Speichern wieder ins Formular zurückfließen.
    this.loadedCardId = null;
    this.cards.save(id, input);
  }

  /** Zeichnet die Live-Vorschau in Druckauflösung und legt sie als PNG auf die Platte. */
  protected async downloadImage(): Promise<void> {
    if (this.downloadingImage()) {
      return;
    }

    this.downloadingImage.set(true);

    try {
      const result = await this.cardRenderer.renderPng(
        { layers: this.previewLayers(), content: this.previewContent() },
        PRINT_WIDTH_PX,
      );

      downloadBlob(result.image, cardFileName(this.form.controls.name.value || this.title()));

      if (result.missing.length > 0) {
        this.notification.show(
          `Fertig — aber diese Bilder fehlen im Bild: ${result.missing.join(', ')}.`,
          'info',
        );
      }
    } catch {
      this.notification.show(DOWNLOAD_FAILED_MESSAGE, 'error');
    } finally {
      this.downloadingImage.set(false);
    }
  }

  private activeImageArea(): Geometry | null {
    const layerId = this.activeImageLayerId();
    const layer = this.previewLayers().find((candidate: Layer) => candidate.id === layerId);

    if (!layer || layer.type !== 'image') {
      return null;
    }

    return { x: layer.x, y: layer.y, width: layer.width, height: layer.height, rotation: layer.rotation };
  }

  /**
   * Schreibt alle offenen Ausschnitte sofort. Die gemerkten Werte bleiben danach stehen: die
   * Antwort des Servers braucht einen Moment, und bis dahin ist der gemerkte Stand der
   * richtigere. Erst ein neues Bild in derselben Fläche wirft ihn weg.
   */
  private savePlacementsNow(): void {
    if (this.placementSaveTimer !== null) {
      clearTimeout(this.placementSaveTimer);
      this.placementSaveTimer = null;
    }

    const cardId = this.cardId();
    const pending = this.pendingPlacements();

    if (cardId === null) {
      return;
    }

    for (const placement of Object.values(pending)) {
      this.cards.updateImagePlacement(cardId, placement.layerId, {
        offsetX: placement.offsetX,
        offsetY: placement.offsetY,
        scale: placement.scale,
      });
    }
  }

  /**
   * Die Kachel in „Alle Karten" zeigt ein gespeichertes Bild — ohne diesen Nachschub bliebe
   * dort der Ausschnitt von vor der Korrektur stehen, bis jemand die Karte erneut speichert.
   */
  private refreshPreviewImage(): void {
    const cardId = this.cardId();

    if (cardId !== null) {
      void this.uploadPreview(cardId);
    }
  }

  private forgetPlacement(layerId: string): void {
    this.pendingPlacements.update((pending: Record<string, CardImagePlacement>) =>
      withoutKeys(pending, new Set([layerId])),
    );
  }

  private adoptCard(card: Card): void {
    if (this.loadedCardId === card.id) {
      return;
    }

    this.loadedCardId = card.id;
    this.form.patchValue({ name: card.name, cardGroupId: card.cardGroupId });
    this.draftValues.set({ ...card.values });
    this.draftIconChoices.set({ ...card.iconChoices });
    this.draftOverrides.set({ ...card.textOverrides });
    this.selectedTemplateId.set(card.templateId);
    this.form.markAsPristine();
    this.templateChanged.set(false);
    this.submitting.set(false);

    if (this.previewRequested) {
      this.previewRequested = false;
      void this.uploadPreview(card.id);
    }
  }

  /**
   * Das Vorschaubild für die Kartenliste. Es entsteht aus der Live-Vorschau, die zu diesem
   * Zeitpunkt bereits genau das zeigt, was gespeichert wurde — deshalb ist kein Warten auf
   * ein erneutes Zeichnen nötig. Scheitert es, bleibt die Karte trotzdem gespeichert; die
   * Kachel zeigt dann weiter den Platzhalter.
   */
  private async uploadPreview(cardId: number): Promise<void> {
    try {
      const result = await this.cardRenderer.renderPng(
        { layers: this.previewLayers(), content: this.previewContent() },
        PREVIEW_WIDTH_PX,
      );

      await firstValueFrom(this.cardPreview.upload('cards', cardId, result.image));
    } catch {
      this.notification.show(PREVIEW_FAILED_MESSAGE, 'info');
    }
  }

  private rebuildDynamicControls(
    fields: CardFormFields,
    values: Record<string, string>,
    iconChoices: Record<string, number>,
    overrides: Record<string, CardTextOverride>,
  ): void {
    const valueRecord = this.valueControls;
    const iconRecord = this.iconControls;
    const overrideRecord = this.overrideControls;

    Object.keys(valueRecord.controls).forEach((key: string) => valueRecord.removeControl(key));
    Object.keys(iconRecord.controls).forEach((key: string) => iconRecord.removeControl(key));
    Object.keys(overrideRecord.controls).forEach((key: string) =>
      overrideRecord.removeControl(key),
    );

    for (const text of fields.texts) {
      valueRecord.addControl(text.key, this.formBuilder.control(values[text.key] ?? ''));
      overrideRecord.addControl(text.key, createOverrideGroup(overrides[text.key]));
    }

    for (const icon of fields.icons) {
      iconRecord.addControl(
        icon.layerId,
        this.formBuilder.control<number | null>(iconChoices[icon.layerId] ?? null),
      );
    }
  }

  /** Formularwerte in den Entwurfsstand übernehmen, ohne fremde Schlüssel zu verlieren. */
  private mergeFormIntoDraft(): void {
    const draft = this.collectDraft();

    this.draftValues.set(draft.values);
    this.draftIconChoices.set(draft.iconChoices);
    this.draftOverrides.set(draft.overrides);
  }

  /**
   * Entwurfsstand und Formular übereinandergelegt, ohne etwas zu ändern — die Vorschau
   * zeichnet daraus, das Speichern übernimmt dasselbe Ergebnis.
   */
  private collectDraft(): DraftState {
    const values = { ...this.draftValues() };
    const iconChoices = { ...this.draftIconChoices() };
    const overrides = { ...this.draftOverrides() };

    for (const [key, control] of Object.entries(this.valueControls.controls)) {
      values[key] = control.value;
    }

    for (const [layerId, control] of Object.entries(this.iconControls.controls)) {
      if (control.value === null) {
        delete iconChoices[layerId];
      } else {
        iconChoices[layerId] = control.value;
      }
    }

    for (const [key, group] of Object.entries(this.overrideControls.controls)) {
      const override = toOverride(group);

      if (override === null) {
        delete overrides[key];
      } else {
        overrides[key] = override;
      }
    }

    return { values, iconChoices, overrides };
  }

  private buildInput(templateId: number): CardInput {
    const name = this.form.controls.name.value.trim();

    return {
      name: name === '' ? NEW_CARD_FALLBACK_NAME : name,
      templateId,
      cardGroupId: this.form.controls.cardGroupId.value,
      values: this.draftValues(),
      iconChoices: this.draftIconChoices(),
      textOverrides: this.draftOverrides(),
    };
  }

  private hasEnteredValues(): boolean {
    const hasDraftValues = Object.values(this.draftValues()).some(
      (value: string) => value.trim() !== '',
    );
    const hasFormValues = Object.values(this.valueControls.controls).some(
      (control: FormControl<string>) => control.value.trim() !== '',
    );

    return (
      hasDraftValues ||
      hasFormValues ||
      Object.keys(this.draftIconChoices()).length > 0 ||
      Object.values(this.iconControls.controls).some(
        (control: FormControl<number | null>) => control.value !== null,
      )
    );
  }

  private async confirmTemplateSwitch(): Promise<boolean> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: {
        title: 'Template wechseln',
        message:
          'Felder, die das neue Template nicht kennt, werden nicht mehr angezeigt. Ihre Werte ' +
          'bleiben gespeichert. Fortfahren?',
        confirmLabel: 'Wechseln',
      },
    });

    return (await firstValueFrom(dialogRef.closed)) === true;
  }
}

function createOverrideGroup(override: CardTextOverride | undefined): FormGroup<OverrideControls> {
  return new FormGroup<OverrideControls>({
    fontSize: new FormControl<number | null>(override?.fontSize ?? null, [
      Validators.min(4),
      Validators.max(200),
    ]),
    color: new FormControl<string | null>(override?.color ?? null),
    bold: new FormControl<OverrideFlag>(toFlag(override?.bold), { nonNullable: true }),
    italic: new FormControl<OverrideFlag>(toFlag(override?.italic), { nonNullable: true }),
  });
}

function toFlag(value: boolean | undefined): OverrideFlag {
  if (value === undefined) {
    return 'inherit';
  }

  return value ? 'on' : 'off';
}

function fromFlag(flag: OverrideFlag): boolean | undefined {
  if (flag === 'inherit') {
    return undefined;
  }

  return flag === 'on';
}

/** Eine Abweichung ohne gesetztes Feld ist keine — die wird gar nicht erst gespeichert. */
function toOverride(group: FormGroup<OverrideControls>): CardTextOverride | null {
  const override: CardTextOverride = {};
  const { fontSize, color, bold, italic } = group.getRawValue();

  if (fontSize !== null) {
    override.fontSize = fontSize;
  }

  if (color !== null) {
    override.color = color;
  }

  const boldValue = fromFlag(bold);
  const italicValue = fromFlag(italic);

  if (boldValue !== undefined) {
    override.bold = boldValue;
  }

  if (italicValue !== undefined) {
    override.italic = italicValue;
  }

  return Object.keys(override).length === 0 ? null : override;
}

function withoutKeys<T>(source: Record<string, T>, keys: Set<string>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(source).filter(([key]: [string, T]) => !keys.has(key)),
  );
}

function arrowStepFor(key: string): { x: number; y: number } | null {
  switch (key) {
    case 'ArrowLeft':
      return { x: -1, y: 0 };
    case 'ArrowRight':
      return { x: 1, y: 0 };
    case 'ArrowUp':
      return { x: 0, y: -1 };
    case 'ArrowDown':
      return { x: 0, y: 1 };
    default:
      return null;
  }
}

function zoomStepFor(key: string): number {
  if (key === '+' || key === '=') {
    return KEY_ZOOM_STEP;
  }

  if (key === '-') {
    return -KEY_ZOOM_STEP;
  }

  return 0;
}

function iconStepFor(key: string): number {
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return 1;
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return -1;
  }

  return 0;
}
