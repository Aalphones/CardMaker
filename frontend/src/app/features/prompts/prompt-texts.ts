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

Your task is to create a **professional, theme-specific card frame** based on the inputs below.

# INPUT

## THEME

{THEMA}

## CARD LAYOUT

{KARTENLAYOUT}

The CARD LAYOUT defines every functional area that will later be filled digitally with images, names, text, values, icons, or other content.

The layout can vary completely between use cases.

It may contain only a single name field or many different image, text, value, and icon areas.

Treat the CARD LAYOUT as strictly binding.

Do not invent, remove, resize, or reposition functional areas.

## OPTIONAL CONSTRAINTS

{ZUSATZVORGABEN}

If empty, derive the design exclusively from THEME and CARD LAYOUT.

---

# 1. DESIGN PRINCIPLE

Design the frame **from the THEME itself**, not from a generic trading-card or fantasy-frame template.

First determine the visual DNA of the THEME:

* architecture and environment
* era and cultural context
* technology
* materials
* geometry and organic shapes
* patterns and textures
* color relationships
* visual movement
* overall mood

Then translate this visual DNA into the:

* frame architecture
* shapes
* materials
* surface treatment
* decorative structures
* visual rhythm
* color scheme

The result must feel as if the frame was **specifically designed for this THEME**.

Ask internally:

**"Could this frame belong to a hundred unrelated themes?"**

If yes, redesign it.

---

# 2. AVOID GENERIC FANTASY DESIGN

Do NOT automatically use:

* gold or gilded ornament
* filigree
* floral vines
* Art Nouveau
* Baroque
* Gothic ornament
* medieval decoration
* Victorian ornament
* gemstones
* fantasy scrollwork
* classical fantasy cartouches
* decorative metal flourishes

Use these only if they genuinely belong to the THEME.

Premium does not mean medieval, ornate, or golden.

Do not reuse a fixed frame style between generations.

Symmetry is optional. Choose the composition that best fits the THEME and CARD LAYOUT.

---

# 3. THEME-SPECIFIC DESIGN

Use characteristics of the THEME as a coherent visual system.

Abstract the theme into:

* shapes
* geometry
* materials
* patterns
* architecture
* line work
* surface structures
* visual rhythm

Do not simply place obvious symbols onto a generic frame.

The entire frame architecture should communicate the THEME.

Every major decorative element should have a clear connection to the THEME.

---

# 4. MATERIALS

Choose materials that naturally belong to the THEME.

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
* digital display surfaces
* organic materials

These are possibilities, not defaults.

Do not mix materials randomly.

---

# 5. CARD LAYOUT

The CARD LAYOUT controls:

* number of functional areas
* position
* approximate size
* hierarchy

The frame must adapt to the layout.

Do not change the layout to make the decoration easier.

Do not invent additional functional areas.

Do not place decorative elements over functional areas.

The functional areas are technical placeholders for later digital compositing.

---

# 6. FULL-BLEED FRAME — CRITICAL

The frame must extend **all the way to all four edges of the 1024 × 1440 canvas**.

**ZERO OUTER MARGIN.
ZERO PADDING.
ZERO BORDER AROUND THE FRAME.**

The frame must physically touch:

* the top edge
* the bottom edge
* the left edge
* the right edge

The outermost pixels of the image must contain the actual frame design.

The frame is intentionally cropped by the canvas boundaries.

**Do NOT place the frame inside the canvas like a standalone picture frame.**

**Do NOT create a visible green margin surrounding the frame.**

There must be no gap between the frame and any canvas edge.

---

# 7. CHROMA-KEY AREAS — CRITICAL

Every functional area defined by CARD LAYOUT must be filled with exactly:

**#00FF00**

**RGB: 0, 255, 0**

This is a technical chroma-key color for later digital removal.

The color must be:

* pure
* fully saturated
* completely uniform
* flat
* matte

Do NOT substitute it with:

* dark green
* muted green
* olive green
* forest green
* teal
* transparent green
* approximate green
* textured green

**Every pixel inside every defined functional area must be #00FF00 / RGB 0,255,0.**

---

# 8. ABSOLUTELY EMPTY CHROMA AREAS

Functional areas must contain **nothing except #00FF00**.

Never generate inside them:

* example text
* placeholder text
* names
* numbers
* letters
* Lorem Ipsum
* fake writing
* pseudo-writing
* runes
* logos
* icons
* symbols
* illustrations
* patterns
* textures
* shadows
* highlights
* gradients
* glow
* reflections
* decorative lines
* UI elements

Do not show what the future content might look like.

The actual content will be added later by software.

**No text is allowed anywhere inside a functional area.**

---

# 9. CLEAN CHROMA BOUNDARIES

The frame may be decorated around the boundaries of functional areas.

However, decoration must stop exactly at the #00FF00 boundary.

No decorative element may extend into the chroma area.

No shadow, glow, reflection, transparency, texture, or lighting effect may contaminate the chroma area.

The transition between frame and chroma area must be:

* sharp
* clean
* clearly defined
* suitable for automated color-key removal

The chroma areas must remain perfectly flat right up to their boundaries.

---

# 10. BACKGROUND

There must be **no separate decorative background** surrounding the frame.

The frame fills the entire canvas.

Any visible chroma-key region must use exactly:

**#00FF00 / RGB 0,255,0**

Do not create a darker or stylistically colored green background.

Do not use #00FF00 as a material or decorative color in the actual frame.

#00FF00 is reserved exclusively for removable chroma-key areas.

---

# 11. FRAME ARCHITECTURE

All decorative elements must be physically and visually part of the frame.

No floating decorations.

No decorative elements floating over future card content.

The frame may contain:

* outer structural layers
* inner borders
* thematic structures
* technical or decorative modules
* thematic details
* custom transitions around functional areas

The complete frame must feel like one coherent design system.

---

# 12. PRIORITY ORDER

When requirements conflict, follow this priority:

1. **CARD LAYOUT**
2. **Exact #00FF00 chroma areas**
3. **Full-bleed frame touching all four edges**
4. **Theme-specific visual identity**
5. **Frame quality and detail**
6. **Decorative complexity**

Never sacrifice a functional area or chroma-key boundary for decoration.

---

# 13. ORIGINAL DESIGN

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

# 14. FORMAT

Portrait orientation.

Aspect ratio:

**63:88**

Canvas:

**1024 × 1440 px**

---

# 15. OUTPUT

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

**#00FF00 is reserved exclusively for chroma-key areas and is not part of the frame color palette.**

## 3. Fonts

Recommend freely available fonts suitable for the THEME.

Briefly explain why they fit.

The fonts will be applied later by software.

**Do not render any text in the generated image.**

## 4. Image Prompt

Create a concise, precise **English image-generation prompt** using:

**Scene / Subject / Design Language / Frame Architecture / Materials / Thematic Details / Card Layout / Chroma Areas / Background / Composition / Constraints**

The image prompt must explicitly preserve:

* the exact CARD LAYOUT
* full-bleed frame
* zero outer margin
* frame touching all four canvas edges
* exact #00FF00 / RGB 0,255,0 functional areas
* completely empty chroma areas
* no text or placeholder text
* no additional functional areas
* clean chroma boundaries
* theme-specific design
* no generic fantasy ornamentation

After producing the four sections, **generate the image directly**.

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
