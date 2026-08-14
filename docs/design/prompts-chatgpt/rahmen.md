# Rahmen — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Der Rahmen ist in CardMaker der **FrameLayer**: genau einer pro Template,
vollflächig, nicht verschiebbar, nicht skalierbar. Er liegt über Bild, Formen
und Icons und unter dem Text. Entscheidend ist deshalb nicht nur, wie schön er
ist, sondern **wo er Platz lässt** — Bildfläche, Titel, Textbox und
Werte-Felder werden später als eigene Ebenen daraufgelegt.

Drei Platzhalter sind zu füllen: `{THEMA}`, `{KARTENLAYOUT}` — jeder spätere
Inhaltsbereich mit Position und ungefährer Größe — und optional
`{ZUSATZVORGABEN}`. Das Kartenlayout ist verbindlich: Bereiche, die dort nicht
stehen, darf der Rahmen nicht erfinden.

Ziel: **630×880 PNG mit Alphakanal**. Erzeugt wird in 1024×1440, danach
freigestellt und verkleinert.

---

## Der Prompt

```
You are an expert Art Director for premium trading cards, collectible cards, and card games.

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

Do not ask for confirmation.
```

---

## Danach

1. Grünfläche freistellen (Farbbereich/Zauberstab oder `rembg`).
2. Ränder auf Grünsaum prüfen — Chroma-Grün blutet gern in helle Ornamente
   (Gold, Holz). Fällt das auf, nächste Runde mit **Chroma-Magenta (#FF00FF)**.
3. Auf **630×880** verkleinern, als PNG mit Alphakanal speichern.
4. In CardMaker als Rahmen hochladen und gegen ein Testbild und echte Texte
   prüfen: Passt die Bildfläche? Bleibt der Titel lesbar?
