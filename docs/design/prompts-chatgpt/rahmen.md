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
