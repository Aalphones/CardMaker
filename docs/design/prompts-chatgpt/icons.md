# Icons — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Icons sind in CardMaker der **IconLayer** — kleine Grafiken, die das Template
zur Auswahl anbietet (Element, Seltenheit, Typ, Symbolwert). Auf der gedruckten
Karte sind sie oft nur wenige Millimeter groß. **Das ist die eigentliche
Schwierigkeit:** ein Icon, das am Bildschirm in 1024 px prächtig aussieht, ist
bei 8 mm ein grauer Fleck. Deshalb verlangt der Prompt kräftige Silhouette und
wenige Details.

Ziel: **512×512 PNG mit Alphakanal** je Icon. Zwei Runden — erst Stil
festlegen, dann sauber ausproduzieren.

---

## Runde 1 — Stilblatt (ein Bild, alle Icons)

```
You are an expert **icon designer for premium collectible card games**.

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
```

---

## Runde 2 — jedes Icon einzeln in voller Auflösung

Aus dem Stilblatt geschnittene Icons haben bei einem 3×3-Raster nur ~340 px —
unter der Empfehlung von 512 px (ADR-015), also beim Vergrößern unscharf.
Deshalb jedes gewählte Icon nochmal einzeln, im selben Chat:

```
Create the icon **"{NAME}"** from the previously defined icon set as a **single standalone image**.

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

```

---

## Danach

1. Freistellen (Magenta ist bei bunten Symbolen der verträglichere Chroma-Wert
   als Grün — Grün steckt in Blattwerk, Gift, Edelsteinen).
2. Auf **512×512** verkleinern, als PNG mit Alphakanal speichern.
3. Prüfen, ob das Icon in der Kartenvorschau bei tatsächlicher Größe noch
   erkennbar ist — nicht am 100-%-Zoom entscheiden.
