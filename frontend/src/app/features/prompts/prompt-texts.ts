/**
 * Die Bild-Prompts für ChatGPT, wie sie auch in `docs/design/prompts-chatgpt/` liegen.
 * Beide Orte müssen deckungsgleich bleiben — die Doku ist die Quelle, das hier die
 * bequem kopierbare Fassung in der Anwendung.
 */

export interface PromptBlock {
  readonly id: string;
  readonly title: string;
  readonly hint: string;
  readonly text: string;
}

export interface PromptTab {
  readonly id: string;
  readonly label: string;
  readonly target: string;
  readonly intro: readonly string[];
  readonly blocks: readonly PromptBlock[];
  readonly afterwards: readonly string[];
}

const RAHMEN_PROMPT = `You are an expert Art Director for premium trading cards, collectible cards, and card games.

Create a professional, theme-specific card frame based on the inputs below.

# INPUT

## THEME

{THEMA}

## CARD LAYOUT

{KARTENLAYOUT}

The CARD LAYOUT defines every functional area that will later receive digital content.

Each functional area has a specific purpose and type.

Possible types include:

* IMAGE AREA — will later contain an image
* TEXT AREA — will later contain text
* TITLE AREA — will later contain a title or name
* VALUE AREA — will later contain numbers or game values
* ICON AREA — will later contain an icon or symbol
* OTHER — as specifically defined in the layout

The CARD LAYOUT is strictly binding.

Do not invent, remove, resize, or reposition functional areas.

If the layout specifies different types of areas, treat them differently.

---

# CRITICAL LAYOUT RULES

## IMAGE AREAS

Every area explicitly defined as an **IMAGE AREA** must be a chroma-key area.

Use exactly:

**#00FF00 / RGB 0,255,0**

The entire image area must be one perfectly uniform, flat, fully saturated green.

No gradients, shadows, highlights, texture, glow, reflections, transparency, or color variation.

Every pixel inside the IMAGE AREA must be exactly #00FF00.

The image area exists solely for later image replacement.

---

## TEXT, TITLE, VALUE AND ICON AREAS

Areas defined as **TEXT AREA, TITLE AREA, VALUE AREA, ICON AREA, or OTHER** must NOT be green.

Give these areas a **solid, opaque, theme-appropriate background** that provides strong contrast and good readability for later digital content.

The background may be:

* a solid material surface
* a solid color
* a dark panel
* a light panel
* a solid metal plate
* a solid glass-like panel
* a solid fabric or leather surface
* another thematically appropriate opaque surface

Choose the background according to the THEME.

The background must be visually calm enough for later content.

It must NOT contain:

* gradients across the text area
* busy patterns
* illustrations
* excessive texture
* strong highlights behind the text
* shadows crossing the text area
* decorative elements behind the future text

The interior of these areas must remain completely empty.

**Do not render any text, letters, numbers, symbols, icons, placeholders, or example content.**

---

# ABSOLUTELY NO GENERATED PLACEHOLDER CONTENT

Never render content representing the future digital content.

Do NOT write things such as:

* CHARACTER
* CHARACTER IMAGE
* NAME
* TITLE
* TEXT
* ACTOR
* VALUE
* SCORE
* NUMBER
* DESCRIPTION
* IMAGE
* ICON
* PLAYER
* PLACEHOLDER
* SAMPLE TEXT
* Lorem Ipsum

Do not generate fake writing or pseudo-text.

Do not generate generic person icons or image placeholders.

Do not generate sample numbers.

Do not generate any visual representation of future content.

The areas must be **visually empty and ready for later digital compositing**.

---

# FULL-BLEED FRAME — CRITICAL

The frame must extend completely to all four edges of the 1024 × 1440 canvas.

**ZERO OUTER MARGIN.
ZERO PADDING.
ZERO BORDER AROUND THE FRAME.**

The actual frame must touch:

* top edge
* bottom edge
* left edge
* right edge

The outermost pixels of the image must contain the actual frame design.

The frame is intentionally cropped by the canvas boundaries.

Do NOT place the frame inside the canvas like a standalone picture frame.

Do NOT leave a green, black, white, transparent, or decorative margin around it.

---

# DESIGN PRINCIPLE

Design the frame from the THEME itself.

Do NOT start with a generic fantasy trading-card frame.

First determine the visual DNA of the THEME:

* architecture
* environment
* era
* culture
* technology
* materials
* geometry
* organic forms
* patterns
* surface treatment
* color relationships
* visual rhythm
* mood

Translate that visual DNA into the:

* frame architecture
* materials
* shapes
* borders
* structural elements
* decorative details
* surface treatment
* color palette

The result must look specifically designed for the THEME.

Ask internally:

**"Could this frame belong to a hundred unrelated themes?"**

If yes, redesign it.

---

# AVOID GENERIC FANTASY

Do NOT automatically use:

* gold ornament
* gilded filigree
* floral vines
* Art Nouveau
* Baroque
* Gothic
* medieval decoration
* Victorian ornament
* gemstones
* fantasy scrollwork
* classical fantasy cartouches
* generic magical ornaments

Use them only when genuinely appropriate to the THEME.

Premium does not mean medieval, ornate, or golden.

Do not reuse a fixed visual template between generations.

---

# THEME-SPECIFIC DESIGN

Use the characteristics of the THEME as one coherent visual design system.

Abstract the theme into:

* shapes
* geometry
* materials
* patterns
* architecture
* line work
* surface structures
* visual rhythm

Do not simply attach obvious symbols to a generic frame.

The entire frame architecture should communicate the THEME.

Every major decorative element should have a clear relationship to the THEME.

---

# MATERIALS

Choose materials appropriate to the THEME.

Possible materials include:

* metal
* brushed metal
* chrome
* titanium
* carbon fiber
* glass
* acrylic
* polymer
* ceramic
* stone
* concrete
* wood
* leather
* fabric
* paper
* holographic surfaces
* digital surfaces
* organic materials

These are possibilities, not defaults.

Do not mix materials randomly.

---

# FRAME ARCHITECTURE

The frame reaches all four canvas edges.

All decorative elements belong physically and visually to the frame.

No floating decorations.

No decorative elements floating over future content.

The frame may contain:

* outer structural layers
* inner borders
* thematic structures
* technical or decorative modules
* thematic details
* transitions around functional areas

The entire frame must feel like one coherent design system.

---

# FUNCTIONAL AREA BOUNDARIES

Functional areas may have designed borders or frames around them.

The border may reflect the THEME.

However, the interior of each functional area must remain clean.

For IMAGE AREAS:

**Interior = exactly #00FF00.**

For TEXT/TITLE/VALUE/ICON/OTHER AREAS:

**Interior = solid, opaque, theme-appropriate background.**

Do not allow decorative elements to intrude into the functional area interiors.

---

# READABILITY OF TEXT AREAS

Text areas must be deliberately designed for later typography.

Provide sufficient:

* contrast
* visual calm
* empty space
* consistent surface treatment
* readable scale

Do not place important decorative details directly behind future text.

Do not make the text area transparent.

Do not make the text area green unless the CARD LAYOUT explicitly defines it as an IMAGE AREA.

---

# COLOR RULE

#00FF00 is a technical chroma-key color only.

It must appear **only inside areas explicitly defined as IMAGE AREAS**.

Do not use #00FF00 as:

* a frame color
* an accent color
* a material
* a decorative color
* a text-panel background
* a general background

All other parts of the design should use the THEME-appropriate color palette.

---

# PRIORITY ORDER

When requirements conflict, follow this order:

1. CARD LAYOUT
2. Correct area type
3. Correct IMAGE AREA chroma color
4. Empty functional areas
5. Full-bleed frame
6. Theme-specific visual identity
7. Frame quality
8. Decorative complexity

Never sacrifice layout correctness for decoration.

---

# ORIGINAL DESIGN

Do not reproduce:

* copyrighted characters
* official logos
* trademarks
* official emblems
* franchise lettering
* character portraits
* official insignia

If the THEME references an existing property, translate its general visual language into an original frame design.

---

# FORMAT

Portrait orientation.

Aspect ratio:

**63:88**

Canvas:

**1024 × 1440 px**

---

# OUTPUT

Provide exactly these four sections:

## 1. Design Description

Briefly describe:

* theme-specific visual language
* frame architecture
* shapes
* materials
* colors
* mood

## 2. Color Palette

Provide HEX values for:

* Primary
* Secondary
* Accent
* Light text
* Dark text

Note:

**#00FF00 is reserved exclusively for IMAGE AREAS and is not part of the frame color palette.**

## 3. Fonts

Recommend freely available fonts suitable for the THEME.

Briefly explain why they fit.

The fonts will be applied later by software.

**Do not render any text in the generated image.**

## 4. Image Prompt

Create a concise, precise English image-generation prompt using:

**Scene / Subject / Design Language / Frame Architecture / Materials / Thematic Details / Card Layout / Functional Areas / Chroma Areas / Text Areas / Background / Composition / Constraints**

The image prompt must explicitly state:

* the exact CARD LAYOUT
* which areas are IMAGE AREAS
* which areas are TEXT/TITLE/VALUE/ICON/OTHER AREAS
* IMAGE AREAS use exactly #00FF00 / RGB 0,255,0
* TEXT/TITLE/VALUE/ICON/OTHER AREAS use solid, opaque, theme-appropriate backgrounds
* all functional areas remain completely empty
* no text anywhere in the image
* no placeholder text
* no fake writing
* no placeholder icons
* no sample numbers
* no invented functional areas
* full-bleed frame
* zero outer margin
* frame touches all four canvas edges
* theme-specific design
* no generic fantasy ornamentation

Then generate the image directly.

Do not ask for confirmation.`;

const ICONS_STILBLATT_PROMPT = `Du bist Icon-Designer für ein Sammelkartenspiel.

Thema / Stilwelt: {THEMA — z.B. "Piraten und offene See"}
Icon-Set: {LISTE, z.B. "Feuer, Wasser, Erde, Luft, Blitz, Eis"}

=== ANALYSE (nicht ausgeben) ===
Leite aus dem Thema eine gemeinsame Formensprache ab: Silhouettentyp,
Linienstärke, Materialanmutung, Farbfamilie. Alle Icons des Sets teilen diese
Sprache.

=== VORGABEN ===
- Ein Bild, darin ein sauberes Raster mit {ANZAHL} Feldern, ein Icon je Feld,
  in genau der oben genannten Reihenfolge
- Jedes Icon sitzt mittig in seinem Feld, mit gleichem Abstand zum Feldrand,
  und alle Icons wirken optisch gleich groß
- Kräftige, sofort erkennbare Silhouette; das Icon bleibt lesbar, wenn es auf
  Daumennagelgröße verkleinert wird
- Wenige, große Formen statt feiner Binnenzeichnung; klare Innenabstände
- Einheitliche Beleuchtung über alle Icons hinweg
- Alle Flächen sind frei von Schrift, Zahlen und Signaturen
- Keine Rahmen, keine Kreise, keine Plaketten um die Icons herum — nur das
  Symbol selbst

=== HINTERGRUND ===
Der gesamte Hintergrund inklusive der Rasterfelder ist eine vollkommen
gleichmäßige Chroma-Magenta-Fläche in #FF00FF — one single flat value, glatt
und matt, ohne Verlauf, ohne Schatten, ohne Leuchten, ohne sichtbare
Rasterlinien. Magenta kommt ausschließlich im Hintergrund vor, nirgends in den
Icons.

=== FORMAT ===
Quadratisch, erzeuge das Bild in 1024x1024.

=== AUSGABE ===
1. Kurzbeschreibung der gemeinsamen Formensprache (wenige Sätze)
2. Farbpalette als Hex-Werte
3. Der Bildprompt in gegliederter Form (Scene / Subject / Details /
   Constraints) in einem Codeblock
Danach erzeuge das Bild direkt in diesem Chat.`;

const ICONS_EINZELN_PROMPT = `Erzeuge jetzt das Icon "{NAME}" aus diesem Set als einzelnes Bild in
1024x1024. Formensprache, Linienstärke, Farbpalette und Beleuchtung bleiben
exakt wie im Stilblatt — geändert wird nichts außer der Bildgröße und dass nur
dieses eine Symbol zu sehen ist.

Das Symbol sitzt mittig und füllt etwa 80 Prozent der Bildfläche. Der gesamte
übrige Hintergrund ist eine vollkommen gleichmäßige Chroma-Magenta-Fläche in
#FF00FF, one single flat value, glatt und matt, ohne Verlauf und ohne Schatten.
Keine Schrift, keine Signatur, kein Rahmen.`;

const ARTWORK_STICHWORTE_PROMPT = `Du bist Illustrator für Sammelkarten-Artwork.

Motiv: {STICHWORTE — z.B. "Rotfuchs, Herbstwald, aufmerksam, Abendlicht"}
Stimmung: {STIMMUNG — z.B. "warm und heroisch" | "düster und still"}
Stil: {STIL — z.B. "malerische Illustration mit weichem Cel-Shading, klare
      Linienführung, warme gesättigte Farben"}

=== VORGABEN ===
- Genau ein Hauptmotiv, mittig, es füllt den größten Teil des Bildes
- Um das Motiv bleibt auf allen vier Seiten ein ruhiger Rand, damit das Bild
  später in einer Kartenfläche verschoben und gezoomt werden kann, ohne dass
  Wesentliches anschneidet
- Der Bildschwerpunkt liegt in der {SCHWERPUNKT: "oberen Hälfte" |
  "Bildmitte"}, weil der untere Teil der Karte später von Text überdeckt wird
- Hintergrund: {HINTERGRUND — z.B. "weicher radialer Schimmer, von hellem Gold
  in der Mitte zu tiefem Indigo an den Ecken" | "unscharfer Herbstwald"}
- Licht: {LICHT — Quelle, Richtung, Charakter, Farbtemperatur}
- Jede Fläche im Bild ist frei von Schrift, Signaturen, Wasserzeichen und Logos

=== FORMAT ===
{FORMAT: "Hochkant 63:88, erzeuge in 1024x1440" | "Quadratisch, erzeuge in
1024x1024"} — das Format der Bildfläche im Kartentemplate.

=== AUSGABE ===
1. Zwei bis drei Sätze, wie du das Motiv anlegst
2. Der Bildprompt in gegliederter Form (Scene / Subject / Style / Light /
   Composition / Constraints) in einem Codeblock
Danach erzeuge das Bild direkt in diesem Chat.`;

const ARTWORK_REFERENZ_PROMPT = `Du bist Illustrator für Sammelkarten-Artwork. Ich hänge Referenzbilder an.

Bild 1 — {ROLLE, z.B. "Motivreferenz"}: übernimm daraus {WAS GENAU, z.B.
"Körperbau, Fellzeichnung und Farbgebung des Tieres"}.
Bild 2 — {ROLLE, z.B. "Stilreferenz"}: übernimm daraus ausschließlich
{WAS GENAU, z.B. "Malweise, Linienführung und Farbstimmung"}, nicht den
Bildinhalt.
{Weitere Bilder analog — höchstens drei, sonst mischt sich alles.}

Nicht übernehmen: {WAS NICHT, z.B. "Bildausschnitt, Pose und Hintergrund von
Bild 1"}.

Neu ist: {ÄNDERUNG — z.B. "das Tier steht aufrecht und blickt nach links,
Hintergrund ein abendlicher Herbstwald"}.

=== VORGABEN ===
- Genau ein Hauptmotiv, mittig, es füllt den größten Teil des Bildes
- Ringsum bleibt ein ruhiger Rand, damit das Bild später in der Kartenfläche
  verschoben und gezoomt werden kann
- Bildschwerpunkt in der {SCHWERPUNKT}, der untere Teil wird später von Text
  überdeckt
- Jede Fläche im Bild ist frei von Schrift, Signaturen, Wasserzeichen und Logos

=== FORMAT ===
{FORMAT}

Zeige mir zuerst in zwei Sätzen, was du aus welchem Bild übernimmst, dann
erzeuge das Bild.`;

export const PROMPT_TABS: readonly PromptTab[] = [
  {
    id: 'rahmen',
    label: 'Rahmen',
    target: '630 × 880 PNG, freigestellt',
    intro: [
      'Der Rahmen ist die Rahmen-Ebene eines Templates: genau eine pro Template, vollflächig, ' +
        'nicht verschiebbar. Sie liegt über Bild, Formen und Icons und unter dem Text.',
      'Entscheidend ist deshalb nicht nur, wie schön der Rahmen ist, sondern wo er Platz ' +
        'lässt — Bildfläche, Titel, Textbox und Werte-Felder kommen später als eigene Ebenen ' +
        'darüber. Genau das trägst du unter „Kartenlayout“ ein: jeden Bereich mit Position und ' +
        'ungefährer Größe. Was dort nicht steht, gibt es nicht — der Prompt erfindet keine ' +
        'zusätzlichen Felder.',
    ],
    blocks: [
      {
        id: 'rahmen-master',
        title: 'Master-Prompt',
        hint:
          'Thema, Kartenlayout und optionale Zusatzvorgaben eintragen, alles andere wörtlich ' +
          'lassen.',
        text: RAHMEN_PROMPT,
      },
    ],
    afterwards: [
      'Grünfläche freistellen (Farbbereich, Zauberstab oder rembg).',
      'Ränder auf Grünsaum prüfen — Chroma-Grün blutet gern in helle Ornamente wie Gold und ' +
        'Holz. Fällt das auf, nächste Runde mit Chroma-Magenta (#FF00FF).',
      'Auf 630 × 880 verkleinern, als PNG mit Transparenz speichern.',
      'Hier hochladen und gegen ein Testbild und echte Texte prüfen: Passt die Bildfläche? ' +
        'Bleibt der Titel lesbar?',
    ],
  },
  {
    id: 'icons',
    label: 'Icons',
    target: '512 × 512 PNG, freigestellt',
    intro: [
      'Icons sind die Grafiken, die ein Template zur Auswahl anbietet — Element, Seltenheit, ' +
        'Typ, Symbolwert. Auf der gedruckten Karte sind sie oft nur wenige Millimeter groß.',
      'Das ist die eigentliche Schwierigkeit: Ein Icon, das am Bildschirm in voller Größe ' +
        'prächtig aussieht, ist bei 8 mm ein grauer Fleck. Deshalb verlangt der Prompt eine ' +
        'kräftige Silhouette und wenige Details. Zwei Runden — erst den Stil festlegen, dann ' +
        'sauber ausproduzieren.',
    ],
    blocks: [
      {
        id: 'icons-stilblatt',
        title: 'Runde 1 — Stilblatt',
        hint: 'Alle Icons des Sets in einem Bild, damit sie dieselbe Formensprache teilen.',
        text: ICONS_STILBLATT_PROMPT,
      },
      {
        id: 'icons-einzeln',
        title: 'Runde 2 — jedes Icon einzeln',
        hint:
          'Im selben Chat nachlegen. Aus einem 3 × 3-Raster geschnitten hätte ein Icon nur ' +
          'rund 340 Pixel — zu wenig für scharfe Kanten auf der Karte.',
        text: ICONS_EINZELN_PROMPT,
      },
    ],
    afterwards: [
      'Freistellen — Magenta ist bei bunten Symbolen der verträglichere Chroma-Wert als Grün, ' +
        'das in Blattwerk, Gift und Edelsteinen steckt.',
      'Auf 512 × 512 verkleinern, als PNG mit Transparenz speichern.',
      'Prüfen, ob das Icon in der Kartenvorschau bei tatsächlicher Größe noch erkennbar ist — ' +
        'nicht am 100-%-Zoom entscheiden.',
    ],
  },
  {
    id: 'artwork',
    label: 'Artwork',
    target: 'PNG, lange Kante ab 1024 Pixel',
    intro: [
      'Das Artwork ist das Motivbild einer einzelnen Karte. CardMaker speichert immer das ' +
        'Original plus Verschiebung und Maßstab und schneidet nie zu — du ziehst und zoomst ' +
        'später direkt in der Vorschau.',
      'Daraus folgen zwei Vorgaben im Prompt: rundum Luft lassen, und den Bildschwerpunkt ' +
        'dorthin legen, wo der Rahmen die Bildfläche freilässt.',
    ],
    blocks: [
      {
        id: 'artwork-stichworte',
        title: 'Variante A — nur Stichworte',
        hint: 'Wenn du kein Vorbild hast, sondern nur eine Vorstellung.',
        text: ARTWORK_STICHWORTE_PROMPT,
      },
      {
        id: 'artwork-referenz',
        title: 'Variante B — mit Referenzbildern',
        hint:
          'Bilder anhängen und jedes einzeln benennen. Ohne die Zeile „Nicht übernehmen“ ' +
          'mischt ChatGPT Stil und Inhalt zu Brei.',
        text: ARTWORK_REFERENZ_PROMPT,
      },
    ],
    afterwards: [
      'Nachschärfen: eine Änderung pro Runde, und dazusagen, was bleibt — „Behalte Pose, ' +
        'Beleuchtung und Farbpalette exakt bei, ändere nur den Hintergrund zu …“. Ohne diesen ' +
        'Halbsatz driftet das ganze Bild mit.',
      'Kein Freistellen nötig, das Artwork ist deckend. Als PNG speichern und beim Bearbeiten ' +
        'einer Karte in die Bildfläche hochladen.',
      'Gegenprüfen: Schneidet nach dem Zoomen etwas Wesentliches an? Dann in der nächsten ' +
        'Runde mehr Rand anfordern, nicht das Motiv verkleinern.',
    ],
  },
];
