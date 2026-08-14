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

const ICONS_STILBLATT_PROMPT = `You are an expert **icon designer for premium collectible card games**.

Create a complete, cohesive set of game icons based on the following theme.

## CREATIVE DIRECTION

**Theme / Visual World:**
{THEME — e.g. "pirates and the open sea"}

**Icon Set:**
{LIST — e.g. "fire, water, earth, air, lightning, ice"}

Create exactly one icon for each item, in the exact order provided.

---

## 1. ICON SYSTEM

Before generating the image, establish a **single visual language** for the entire icon set.

Derive the following from the theme:

* silhouette language
* geometric language
* line and edge treatment
* material impression
* level of detail
* color palette
* lighting style
* degree of dimensionality

Every icon must clearly belong to the **same icon family**.

The icons should feel as though they were designed by the same artist, for the same game, at the same time.

Do not create each icon as an unrelated standalone illustration.

---

## 2. ICON DESIGN

Each icon must represent its assigned concept **immediately and unambiguously**.

Prioritize:

* strong, recognizable silhouette
* simple primary shapes
* clear negative space
* consistent visual weight
* consistent level of detail
* consistent perspective
* consistent rendering style

Use **fewer, larger shapes rather than fine internal details**.

The icons must remain recognizable when reduced to **very small display sizes, approximately thumbnail or fingernail size**.

Avoid:

* tiny decorative details
* unnecessary textures
* overly complex silhouettes
* excessive highlights
* fragile thin lines
* details that disappear when scaled down

### Optical Size

All icons must appear **visually equal in size**, not merely occupy the same mathematical bounding box.

Adjust the scale and visual mass of individual symbols where necessary.

For example, a compact symbol may need to be slightly larger than a thin or elongated symbol to achieve the same perceived visual weight.

Maintain consistent padding and visual breathing room around every icon.

---

## 3. GRID AND LAYOUT

Create **one single image containing a clean grid of {NUMBER} cells**.

Place the icons in exactly this order:

{LIST}

Rules:

* one icon per cell
* exact order must be preserved
* every icon centered within its cell
* equal spacing between cells
* equal visual padding around every icon
* consistent optical size
* consistent alignment
* no overlapping icons
* no clipped icons
* no icon touching the image edge

The grid exists only as a **layout structure**.

Do not draw visible grid lines, borders, separators, or cell outlines.

---

## 4. ICON RENDERING

All icons share:

* the same lighting direction
* the same light intensity
* the same shadow logic
* the same material treatment
* the same dimensionality
* the same edge treatment
* the same rendering quality

Use a unified lighting setup across the entire set.

If the chosen style uses shading or highlights, apply them consistently to every icon.

Do not make one icon glossy, another flat, and another metallic unless this difference is explicitly required by the concept.

---

## 5. BACKGROUND — CHROMA MAGENTA

The **entire background and every grid cell must be one single perfectly uniform chroma-magenta color**:

**#FF00FF**

This is a strict technical requirement.

The background must be:

* completely flat
* perfectly uniform
* matte
* texture-free
* shadow-free
* highlight-free
* glow-free
* gradient-free

There must be **no visible grid lines or cell boundaries**.

Use exactly **#FF00FF** throughout the entire background.

**Magenta must appear exclusively in the background.**

Do not use #FF00FF, or visually similar magenta, anywhere inside the icons.

Do not allow background-colored reflections, glow, rim lighting, transparency, or color spill to contaminate the icon artwork.

The icons must have clean, clearly defined edges against the magenta background.

---

## 6. CLEAN ICON REQUIREMENTS

Do not include:

* text
* letters
* numbers
* labels
* symbols unrelated to the requested concepts
* signatures
* watermarks
* logos
* frames
* circles
* badges
* medallions
* plaques
* decorative containers
* card borders

Each cell must contain **only the icon itself**.

---

## 7. QUALITY STANDARD

The final result should look like a **professionally designed icon sheet for a high-quality collectible card game**.

Prioritize:

1. recognizability
2. consistency across the icon set
3. optical balance
4. clean silhouettes
5. small-size legibility
6. technical separation from the chroma background
7. polished professional rendering

The icons should work both individually and as a visually coherent collection.

---

## 8. FORMAT

**Canvas:**
Square, 1024×1024 pixels.

Use the entire canvas efficiently while maintaining sufficient padding around the grid and each icon.

---

## OUTPUT

Before generating the image:

1. Briefly describe the **shared visual language** of the icon set in 2–4 sentences.
2. Provide the planned **color palette as HEX values**.
3. Provide a concise structured image specification using these headings:

   * **Scene**
   * **Icon System**
   * **Layout**
   * **Details**
   * **Background**
   * **Constraints**

Then **generate the image directly in this chat**.

Do not ask for confirmation unless required information is missing or genuinely ambiguous.
`;

const ICONS_EINZELN_PROMPT = `Create the icon **"{NAME}"** from the previously defined icon set as a **single standalone image**.

Use the existing **style sheet / icon set as the authoritative visual reference**.

## STYLE CONSISTENCY

The new icon must match the established icon system **exactly**.

Preserve without modification:

* overall shape language
* silhouette design
* line weight
* edge treatment
* geometric language
* level of detail
* material appearance
* dimensionality
* color palette
* lighting direction
* lighting intensity
* shading style
* highlight style
* visual weight
* overall rendering quality

**Do not reinterpret or redesign the established style.**

The only intentional changes are:

1. Generate only the single icon **"{NAME}"**.
2. Use a standalone 1024×1024 canvas.

The new icon must look as though it was taken directly from the original icon sheet and exported as an individual asset.

---

## ICON COMPOSITION

* Place the icon exactly in the center of the canvas.
* The icon should occupy approximately **80% of the available image area**.
* Scale the icon according to its **optical visual weight**, not merely its mathematical bounding box.
* Keep the complete silhouette visible.
* Do not crop, clip, or cut off any part of the icon.
* Maintain balanced breathing room on all four sides.
* Keep the icon vertically and horizontally centered.

Do not add any additional objects or decorative elements.

---

## BACKGROUND

The entire background must be a **single, perfectly uniform chroma-magenta color**:

**#FF00FF**

The background must be:

* completely flat
* perfectly uniform
* matte
* texture-free
* shadow-free
* highlight-free
* glow-free
* gradient-free

Use exactly **#FF00FF** throughout the entire background.

**Magenta must appear exclusively in the background and nowhere inside the icon.**

Do not add:

* color spill
* magenta rim lighting
* reflections
* transparency
* shadows cast onto the background
* glow around the icon
* atmospheric effects

The boundary between icon and background must be clean and clearly defined.

---

## CLEAN OUTPUT

The image must contain only:

**1. The requested icon "{NAME}"**
**2. The uniform #FF00FF background**

Do not include:

* text
* letters
* numbers
* labels
* signatures
* watermarks
* logos
* frames
* borders
* circles
* badges
* plaques
* decorative elements
* additional symbols
* other objects

---

## FORMAT

**Canvas:** 1024×1024 pixels, square.

Generate the image directly in this chat.

Do not change the established icon style, palette, lighting, or visual language.
`;

const ARTWORK_STICHWORTE_PROMPT = `You are an expert in **premium collectible card artwork and visual composition**.

Create a polished, professional image based on the following creative direction.

## CREATIVE DIRECTION

**Subject:**
{KEYWORDS — e.g. "red fox, autumn forest, alert, evening light"}

**Mood:**
{MOOD — e.g. "warm and heroic" | "dark and quiet"}

**Art Style:**
{STYLE — e.g. "painterly illustration with subtle cel shading, clean linework, warm saturated colors"}

---

## SCENE AND ENVIRONMENT

Create a complete, visually intentional scene around the main subject.

**Background / Environment:**
{BACKGROUND — e.g. "an atmospheric autumn forest at dusk with warm foliage, distant trees, subtle mist, and depth between foreground and background"}

The background should feel **specific to the scene**, not generic.

Avoid simple gradients, empty backgrounds, or purely decorative color fields unless explicitly requested.

Build a convincing environment using appropriate:

* foreground elements
* midground elements
* background elements
* atmospheric depth
* environmental details
* textures and shapes
* perspective

The environment should support the subject and mood without becoming a competing focal point.

---

## MAIN SUBJECT

Create **exactly one dominant main subject**.

* The main subject is the clear visual focus.
* Place it approximately in the center unless the composition requires a slightly different position.
* It should occupy a large portion of the image.
* Keep the subject clearly readable at collectible-card size.
* Preserve the important characteristics described in the creative direction.
* Do not add additional characters, creatures, or competing focal subjects.

---

## COMPOSITION

Compose the image specifically for later use inside a **collectible card template**.

* Keep a comfortable, relatively quiet margin around the subject on all four sides.
* Leave enough surrounding space to allow later cropping, repositioning, and zooming.
* Do not place important parts of the subject directly against the image edges.
* Avoid cutting off ears, heads, hands, limbs, tails, weapons, or other important features.
* The primary visual focus should remain in the **{FOCAL AREA: "upper half" | "center"}**.
* The lower portion of the card will later contain text, so avoid placing critical visual information in the lower area.
* Maintain a strong and readable silhouette.
* Use depth and perspective to create a polished, cinematic composition.

The composition should feel intentional rather than like a centered object placed on a background.

---

## LIGHTING

**Lighting:**
{LIGHTING — source, direction, character, color temperature}

Apply the lighting consistently to the entire scene.

The main subject, environment, shadows, highlights, and atmospheric effects must share the same lighting logic.

Use light to reinforce:

* the mood
* the focal point
* depth
* subject separation
* the overall color harmony

---

## ART DIRECTION

Follow the specified art style consistently across the entire image.

Prioritize:

* professional collectible-card quality
* strong composition
* clear visual hierarchy
* coherent color palette
* detailed but controlled rendering
* atmospheric depth
* polished edges and materials
* consistent perspective
* consistent lighting

Do not introduce unrelated visual styles or random decorative effects.

---

## CLEAN IMAGE REQUIREMENTS

The artwork itself must contain **no**:

* text
* captions
* letters
* numbers
* logos
* signatures
* watermarks
* UI elements
* card borders
* card frames

Keep the entire image clean so it can be placed directly into a card template.

---

## FORMAT

**Canvas:**
{FORMAT: "Portrait 63:88, generate at 1024×1440" | "Square, generate at 1024×1024"}

The specified format is the **artwork canvas**, not a complete card design.

---

## OUTPUT

First, give a concise explanation in **2–3 sentences** describing how you will interpret the subject, environment, mood, and composition.

Then provide a concise structured summary with these headings:

* **Scene**
* **Subject**
* **Style**
* **Light**
* **Composition**
* **Constraints**

Immediately after that, **generate the image in this chat**.

Do not ask for confirmation unless a required placeholder is missing or genuinely ambiguous.
`;

const ARTWORK_REFERENZ_PROMPT = `You are an expert in **collectible card image creation, professional photography, digital compositing, and illustrated card artwork**.

I will attach one or more reference images.

## 1. DETERMINE THE VISUAL MODE FIRST

Before generating the image, determine whether the main subject should be **photorealistic or illustrated**.

### If the main subject is a real person or I provide a photo of a person:

**Keep the person photorealistic.**

Do NOT turn the person into:

* a drawing
* a painting
* an illustration
* a comic character
* an anime character
* a stylized artwork
* a 3D render

Preserve the person's **identity, facial features, skin texture, hair, body proportions, and natural physical details**.

The result should look like a **professional photograph or cinematic professional photoshoot**, not like an artwork based on a photograph.

You may creatively redesign the **environment, lighting, atmosphere, composition, and background**, while keeping the person itself convincingly photographic.

### If the main subject is an animal, creature, object, fantasy character, or other non-human subject:

Use the requested **illustration or artwork style**.

The visual style may influence:

* rendering technique
* line work
* color palette
* lighting
* texture
* atmosphere
* level of detail

Do not automatically apply an illustration style to a photographic subject.

**When uncertain, prefer photorealism for real people.**

---

## 2. REFERENCE IMAGES

Image 1 — {ROLE, e.g. "Subject Reference"}:
Use it for {WHAT TO TAKE, e.g. "body shape, fur pattern, and coloration"}.

Image 2 — {ROLE, e.g. "Style Reference"}:
Use it only for {WHAT TO TAKE, e.g. "color palette, lighting, rendering style, and overall visual mood"}.
Do NOT copy its subject matter or composition.

{Add additional references in the same format — maximum three references whenever possible.}

### Do NOT copy:

{WHAT NOT TO TAKE, e.g. "pose, framing, background, and camera angle from Image 1"}

### New creative direction:

{CHANGE, e.g. "The creature is standing upright and looking to the left. The scene takes place in an atmospheric autumn forest at sunset."}

---

## 3. MAIN SUBJECT

Create **one clearly identifiable main subject**.

* Keep the main subject visually dominant.
* Place it approximately in the center unless the creative direction specifies otherwise.
* The subject should occupy most of the image.
* Preserve important recognizable characteristics from the reference.
* Keep the visual hierarchy clear.
* Do not add unnecessary secondary characters or competing focal points.

For people, maintain **realistic photographic anatomy, skin, hair, facial structure, and proportions**.

---

## 4. BACKGROUND AND ENVIRONMENT

The background must be a **fully designed environment**, not a simple gradient.

Do NOT use:

* a plain color background
* a simple gradient
* an empty studio backdrop
* an obviously generic background
* an unmotivated blur
* random decorative elements

Instead, create a background that is **specifically appropriate to the subject and scene**.

The environment should:

* support the story and character of the main subject
* match the requested setting
* have convincing depth and spatial structure
* contain meaningful environmental details
* use appropriate foreground, midground, and background elements
* have coherent lighting and shadows
* complement the subject without competing with it
* feel intentionally designed for a premium collectible card

For a person, the environment should look like a **professional photographic location, cinematic set, or believable real-world environment**.

The background may be creatively generated or substantially redesigned, but its **perspective, lighting, shadows, reflections, depth of field, and color temperature must remain physically and visually consistent with the subject**.

Keep the background slightly less visually dominant than the main subject so the subject remains the clear focal point.

---

## 5. COMPOSITION

Design the image specifically for use as a **collectible card illustration**.

* One dominant main subject.
* Strong central visual hierarchy.
* Leave enough breathing room around the subject for later cropping, repositioning, and zooming.
* Keep the primary visual focus in the **{FOCAL AREA}**.
* The lower portion of the image will later be partially covered by card text, so avoid placing critical facial features, hands, objects, or important environmental details there.
* Maintain a convincing sense of depth.
* Use a deliberate camera angle and perspective.
* Keep lighting consistent across the entire scene.

---

## 6. VISUAL QUALITY

Create a **premium, professionally composed collectible card image**.

### For photographic subjects:

Aim for:

* professional photography
* realistic skin and hair
* natural facial detail
* realistic materials and textures
* physically believable lighting
* cinematic but credible depth of field
* realistic shadows and reflections
* high-end editorial or cinematic photography

Avoid:

* plastic-looking skin
* excessive beauty retouching
* artificial facial features
* painterly textures
* illustration-like edges
* cartoon aesthetics
* obvious AI-art artifacts

### For illustrated subjects:

Aim for:

* high-end collectible card artwork
* sophisticated composition
* strong visual storytelling
* detailed rendering
* coherent lighting
* atmospheric depth
* deliberate color design
* polished professional finish

---

## 7. CLEAN IMAGE REQUIREMENTS

Do not include:

* text
* captions
* letters
* numbers
* logos
* signatures
* watermarks
* UI elements
* borders
* card frames

The entire image area must remain clean and usable as the artwork itself.

---

## 8. OUTPUT FORMAT

{FORMAT}

Before generating the image, briefly explain in **exactly two sentences**:

1. Which elements you are taking from each reference image.
2. Whether you are using **photorealistic photography or illustrated artwork**, and why.

Then generate the image according to all instructions above.
`;

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
