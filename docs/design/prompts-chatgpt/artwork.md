# Artwork — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Das Artwork ist das **Kartenbild** einer Karteninstanz. CardMaker speichert
immer das Original plus Verschiebung und Maßstab und schneidet nie zu
(ADR-018) — du ziehst und zoomst später direkt in der Vorschau. Zwei
Konsequenzen für den Prompt:

- **Luft rundum lassen.** Ein randlos angeschnittenes Motiv lässt sich nicht
  mehr passend schieben.
- **Motivmitte dorthin, wo der Rahmen die Bildfläche freilässt** — bei einer
  Karte mit Textbox unten also in die obere Hälfte.

Ziel: **PNG, lange Kante ≥ 1024 px**, deckend — kein Freistellen nötig.

---

## Variante A — nur Stichworte

```
You are an expert in **premium collectible card artwork and visual composition**.

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

```

---

## Variante B — mit Referenzbild(ern)

Bilder anhängen und **jedes per Index benennen** — das ist der Punkt, an dem
die meisten Referenz-Prompts scheitern: ChatGPT muss wissen, *was* es aus
welchem Bild zieht, sonst mischt es alles.

```
You are an expert in **collectible card image creation, professional photography, digital compositing, and illustrated card artwork**.

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

```

---

## Danach

- **Nachschärfen:** eine Änderung pro Runde, und dazusagen, was bleibt —
  „Behalte Pose, Beleuchtung und Farbpalette exakt bei, ändere nur den
  Hintergrund zu …". Ohne diesen Halbsatz driftet das ganze Bild mit.
- Kein Freistellen nötig, das Artwork ist deckend. Als PNG speichern, in
  CardMaker in die Bildfläche hochladen und dort schieben/zoomen.
- Gegenprüfen: Schneidet nach dem Zoomen etwas Wesentliches an? Dann in der
  nächsten Runde mehr Rand anfordern, nicht das Motiv verkleinern.
