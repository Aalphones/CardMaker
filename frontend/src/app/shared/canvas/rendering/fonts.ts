/**
 * Die Schriften, die im Template-Editor wählbar sind.
 *
 * Drei Sorten: `system` verlässt sich auf das, was das Gerät ohnehin hat (schnell, aber auf
 * einem iPad steht statt „Impact" eben irgendetwas anderes) — die übrigen eingebauten liegen
 * als `.woff2` in `frontend/public/fonts/` und werden per `@font-face` aus
 * `styles/_kartenschriften.scss` eingebunden. Dazu kommen die **hochgeladenen** Schriften:
 * die stehen in keiner Liste hier, sie heißen `cmfont-<Kennung>` und werden zur Laufzeit
 * vom `FontLoader` als Datei geholt.
 *
 * Wichtig für das Canvas: Eine mitgelieferte Schrift gilt für den Browser erst dann als
 * gebraucht, wenn sie im Seitenlayout vorkommt — Konva zeichnet aber auf ein Bitmap, das
 * zählt nicht. Deshalb fordert `FontLoader` sie ausdrücklich an, und bis sie da ist, zeichnet
 * `draw-items` mit `fallback`. Ohne das misst das automatische Verkleinern in der
 * Ersatzschrift und der Text passt hinterher nicht in seine Box.
 */

export type FontCategory = 'system' | 'script' | 'fantasy' | 'comic' | 'reading';

interface FontDefinition {
  readonly family: string;
  readonly category: FontCategory;
  /** Was gezeichnet wird, solange die mitgelieferte Datei noch nicht geladen ist. */
  readonly fallback: string;
  /** Liegt die Schrift als Datei bei uns (`true`) oder kommt sie vom Gerät (`false`)? */
  readonly selfHosted: boolean;
}

const FONT_DEFINITIONS = [
  { family: 'Arial', category: 'system', fallback: 'sans-serif', selfHosted: false },
  { family: 'Verdana', category: 'system', fallback: 'sans-serif', selfHosted: false },
  { family: 'Trebuchet MS', category: 'system', fallback: 'sans-serif', selfHosted: false },
  { family: 'Georgia', category: 'system', fallback: 'serif', selfHosted: false },
  { family: 'Times New Roman', category: 'system', fallback: 'serif', selfHosted: false },
  { family: 'Courier New', category: 'system', fallback: 'monospace', selfHosted: false },
  { family: 'Impact', category: 'system', fallback: 'sans-serif', selfHosted: false },

  { family: 'Berkshire Swash', category: 'script', fallback: 'cursive', selfHosted: true },
  { family: 'Great Vibes', category: 'script', fallback: 'cursive', selfHosted: true },

  { family: 'Cinzel', category: 'fantasy', fallback: 'serif', selfHosted: true },
  { family: 'MedievalSharp', category: 'fantasy', fallback: 'serif', selfHosted: true },
  { family: 'Uncial Antiqua', category: 'fantasy', fallback: 'serif', selfHosted: true },

  { family: 'Bangers', category: 'comic', fallback: 'sans-serif', selfHosted: true },
  { family: 'Luckiest Guy', category: 'comic', fallback: 'sans-serif', selfHosted: true },
  { family: 'Bungee', category: 'comic', fallback: 'sans-serif', selfHosted: true },

  { family: 'Merriweather', category: 'reading', fallback: 'serif', selfHosted: true },
  { family: 'Lato', category: 'reading', fallback: 'sans-serif', selfHosted: true },
] as const satisfies readonly FontDefinition[];

export type BuiltInFontFamily = (typeof FONT_DEFINITIONS)[number]['family'];

/**
 * Eine hochgeladene Schrift. Den Namen vergibt das Backend (`FontRepository::family`), der
 * Wunschname des Nutzers ist nur Beschriftung — siehe Plan-README „Die zwei Entscheidungen".
 */
export type UploadedFontFamily = `cmfont-${number}`;

export type FontFamily = BuiltInFontFamily | UploadedFontFamily;

export const FONT_FAMILIES: readonly BuiltInFontFamily[] = FONT_DEFINITIONS.map(
  (definition: FontDefinition) => definition.family as BuiltInFontFamily,
);

export const DEFAULT_FONT_FAMILY: BuiltInFontFamily = 'Arial';

const UPLOADED_FONT_PATTERN = /^cmfont-\d+$/;

/** Was gezeichnet wird, solange eine hochgeladene Schrift noch nicht geladen ist. */
const UPLOADED_FONT_FALLBACK = 'sans-serif';

export function isUploadedFont(family: string): family is UploadedFontFamily {
  return UPLOADED_FONT_PATTERN.test(family);
}

export function uploadedFontFamily(fontId: number): UploadedFontFamily {
  return `cmfont-${fontId}`;
}

export function uploadedFontId(family: UploadedFontFamily): number {
  return Number(family.slice('cmfont-'.length));
}

const CATEGORY_LABELS: Record<FontCategory, string> = {
  system: 'Immer verfügbar',
  script: 'Kalligrafie',
  fantasy: 'Fantasy & Mittelalter',
  comic: 'Comic',
  reading: 'Gut lesbar',
};

export interface FontGroup {
  readonly label: string;
  readonly families: readonly FontFamily[];
}

/** Die Auswahlliste, nach Sorte gebündelt — Reihenfolge wie in `FONT_DEFINITIONS`. */
export const FONT_GROUPS: readonly FontGroup[] = (
  Object.keys(CATEGORY_LABELS) as FontCategory[]
).map((category: FontCategory): FontGroup => ({
  label: CATEGORY_LABELS[category],
  families: FONT_DEFINITIONS.filter(
    (definition: FontDefinition) => definition.category === category,
  ).map((definition: FontDefinition) => definition.family as FontFamily),
}));

function definitionOf(family: string): FontDefinition | undefined {
  return FONT_DEFINITIONS.find((definition: FontDefinition) => definition.family === family);
}

/** Liegt die Schrift als Datei bei uns — mitgeliefert oder hochgeladen? */
export function isSelfHostedFont(family: string): boolean {
  if (isUploadedFont(family)) {
    return true;
  }

  return definitionOf(family)?.selfHosted ?? false;
}

/** Die Schriften, die als Datei mitgeliefert werden und angefordert werden müssen. */
export const SELF_HOSTED_FONT_FAMILIES: readonly BuiltInFontFamily[] = FONT_DEFINITIONS.filter(
  (definition: FontDefinition) => definition.selfHosted,
).map((definition: FontDefinition) => definition.family as BuiltInFontFamily);

/**
 * Was Konva als Schriftname bekommt: die echte Familie, sobald sie geladen ist — vorher
 * (und wenn das Laden fehlschlägt) die Ersatzschrift, damit Messung und Anzeige
 * dieselbe Schrift benutzen.
 */
export function renderFontFamily(family: string, loadedFamilies: ReadonlySet<string>): string {
  if (isUploadedFont(family)) {
    return loadedFamilies.has(family) ? family : UPLOADED_FONT_FALLBACK;
  }

  const definition = definitionOf(family);

  if (!definition) {
    return family;
  }

  if (!definition.selfHosted || loadedFamilies.has(definition.family)) {
    return definition.family;
  }

  return definition.fallback;
}
