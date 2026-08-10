# Handoff: CardMaker — Sammelkarten-Editor (Templates, Karten, Druckprojekt)

## Overview
CardMaker is a German-language web app for a small publisher that designs and prints
collectible cards ("Sammelkarten"). It has two levels of authoring plus a print step:

1. **Templates** — a layer-based card layout editor (canvas, layer list, property panel).
   A template defines *where* things sit and which fields the card author later fills in.
2. **Cards** — instances of a template. The card author only fills the fields the template
   marked as `source: 'user'` (text, image slot, icon choice) and sees a live preview.
3. **Druckprojekt (print project)** — a cart of cards with quantities, laid out onto A4
   sheets 3x3, with cut-mark / bleed options, exportable as PNG or PDF.

Cards are grouped into **Kartengruppen**; groups are pure filters over the single global card
list, not containers. All UI copy is **German** and must stay German.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing the
intended look, structure and behavior. They are **not production code to copy**.
The task is to **recreate these designs inside the target codebase's own environment**
(React, Vue, Svelte, SwiftUI, …) using its established patterns, routing, state management and
component library. If no environment exists yet, pick the framework that best fits the project
(a React + TypeScript SPA is a natural fit) and implement the designs there.

The prototype is a single self-contained component file with an internal template dialect and a
logic class. Read it for **behavior, values and copy**; do not port its runtime.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, interaction states, copy
and keyboard shortcuts are final and come from the bound **Organic** design system. Recreate the
UI accurately, but map Organic tokens/classes onto the target codebase's own design-system
primitives where equivalents exist.

Asset content is placeholder: frames and rarity icons are named stubs (no real artwork ships),
and card images use a drag-and-drop image placeholder component.

---

## Screens / Views

Navigation model: one app shell (top bar + left sidebar). The **template editor** is a
full-screen overlay (`position: fixed; inset: 0; z-index: 50`) outside the shell.

### 1. Login
- **Purpose**: sign in. No real auth in the prototype — submit sets `loggedIn = true`.
- **Layout**: full viewport, centered card. Width `min(380px, 100%)`, padding `35.2px 26.4px`,
  gap `17.6px`, surface fill, `--shadow-md`.
- **Components**:
  - Round badge 56x56 (`border-radius: 50%`, fill `--color-accent-200`) with a 26x26
    card icon in `--color-accent-700`, stroke-width 2.75.
  - `h1` "CardMaker" — Caprasimo 30px. Sub "Sammelkarten anlegen & drucken" — muted.
  - Fields "E-Mail-Adresse" (type=email, prefilled `mira@waldlaeufer-verlag.de`) and
    "Passwort" (type=password), both pill inputs.
  - Primary full-width button "Anmelden".

### 2. App shell
- **Top bar** (`.nav`): surface background, 1px `--color-divider` bottom border.
  Brand "CardMaker" in `--color-accent` (Caprasimo), user e-mail muted 13px, right-aligned
  secondary button "Abmelden" with a 15x15 log-out icon.
- **Sidebar**: width 216px, padding 17.6px, gap 4.4px, surface, 1px right divider.
  Four links, each `display:flex; gap:8px; padding:8px 12px; border-radius:12px; font-size:14px`.
  Active: text `--color-accent-800` on `--color-accent-200`. Inactive: `--color-text`,
  transparent, hover `--color-neutral-200`.
  - Alle Karten · Kartengruppen · Templates · Druckprojekte
  - "Druckprojekte" carries a pill badge (min-width 20px, height 20px, radius 999px,
    background `--color-accent`, text `--color-bg`, 11px) with the total card quantity,
    shown only when the cart is non-empty.
- **Main**: `flex: 1`, padding 26.4px, scrolls independently. Content column max-width
  1180px (cards) / 1100px (groups, templates, print) / 1080px (card editor) / 32rem (group form).

### 3. Alle Karten (cards list)
- **Purpose**: find, open, duplicate, delete cards; add them to the print project.
- **Header**: `h1` "Alle Karten" + muted count line; right side a secondary view toggle
  ("Als Tabelle" / "Als Raster") and a primary "Neue Karte" (plus icon).
- **Filter row** (flex, wrap, gap 13.2px, align-items flex-end):
  - "Suchen" — search input, width 20rem, placeholder "Kartenname …"
  - "Template" — select, width 14rem, first option "Alle Templates"
  - "Sortierung" — select, width 12rem: Zuletzt geändert | Name A–Z | Kartengruppe
- **Group chips**: pill buttons ("Alle" + one per group + "Ohne Gruppe") each with a muted
  count. Selected = accent fill; others outline.
- **Grid view**: `repeat(auto-fill, minmax(11rem, 1fr))`, gap 17.6px.
  Card = `.card .elev-sm`, padding 8.8px, gap 8.8px.
  - Thumb: full width, `aspect-ratio: 630/880`, radius 10px, overflow hidden,
    background `--color-neutral-200`; renders the template's layers scaled down.
  - Name: Caprasimo 15px / line-height 1.2. Meta: 11px muted "Gruppe · Template".
  - Footer: rarity `.tag` + three icon buttons (add-to-print 15px, duplicate 14px,
    delete 14px in `--color-accent-700`). Icon buttons: transparent, padding 6px,
    radius 8px, hover `--color-neutral-200`.
- **Table view**: `.table` — Karte | Kartengruppe | Template | Seltenheit | Geändert | actions
  (ghost buttons).
- **Empty result**: muted line "Keine Karte passt zu Suche und Filter."

### 4. Kartengruppen
- `h1` "Kartengruppen" + muted "Gruppen sind Filter auf der Gesamtliste aller Karten."
  Primary "Neue Kartengruppe".
- Grid `repeat(auto-fill, minmax(17rem, 1fr))`, gap 17.6px. Each `.card .elev-sm`:
  `.card-title` name, `.card-body` description, `.card-meta` "N Karten anzeigen →"
  (jumps to the cards list pre-filtered to that group), plus right-aligned ghost buttons
  "Bearbeiten" / "Löschen" (delete in `--color-accent-700`).
- Empty state: card, padding 35.2px, muted paragraph max-width 36rem + primary CTA.

### 5. Kartengruppe anlegen/bearbeiten
Max-width 32rem. `h1` = "Neue Kartengruppe" or "Kartengruppe bearbeiten".
Fields "Name" (text) and "Beschreibung (optional)" (textarea rows=4, resize vertical).
Actions right-aligned: secondary "Abbrechen", primary "Speichern".

### 6. Templates (list)
`h1` "Templates" + primary "Neues Template". Search field max-width 22rem
(placeholder "Nach Name suchen …"). Grid `repeat(auto-fill, minmax(17rem, 1fr))`.
Each card is a link: `.card-kicker` "N Layer · M Karten", `.card-title` name,
`.card-body` description, `.card-meta` "geändert <relative date>". Opens the editor.

### 7. Template-Editor (full-screen overlay)
- **Top bar**: height 56px, surface, bottom divider, padding 0 13.2px, gap 13.2px.
  - Ghost "Templates" (arrow-left) closes the editor.
  - Inline-editable template name: Caprasimo 20px, transparent border/background,
    padding 4px 8px, radius 10px, width 20rem.
  - Dirty indicator, muted 12px.
  - Spacer, then undo/redo icon buttons (17x17, opacity 0.35 when unavailable),
    secondary "Karte erstellen", primary save button (disabled when not dirty).
- **Left panel** (width 250px, surface, right divider):
  - "Element hinzufügen" secondary block button opening an absolutely-positioned
    `.card .elev-lg` menu (`top: calc(100% - 2px)`, left/right 8px, z-index 30, padding 6px)
    with glyph + label + shortcut hint: Text (T), Bildfläche (I), Icon (K), Rechteck (R),
    Kreis (O), Linie (L), Rahmen (F). "Rahmen" is disabled if a frame layer already exists.
  - **Layer list** (scrolls, padding 6px, gap 2px), topmost = frontmost. Each row: eye toggle
    (15x15, muted when hidden), 7px type dot, name (13px, ellipsis; double-click renames
    inline — 1px accent border, radius 6px), type label 10px muted. Selected row background
    `--color-accent-200`.
  - **Footer**: four ghost buttons `flex:1` — ↑ (nach vorn), ↓ (nach hinten), "Kopie",
    "Löschen" (`--color-accent-700`); disabled without a selection.
- **Canvas stage**: `flex:1`, background `--color-neutral-800` (#474238), overflow hidden.
  Card artboard 630x880 design px, centered, scaled by the current zoom. The selected layer
  shows a selection box with 4 corner resize handles.
  - Bottom-left zoom pill (radius 999px, surface, `--shadow-md`): −, zoom label
    (click = Einpassen), +, "?" (shortcuts dialog).
  - Bottom-right status pill (radius 999px, 11px) with cursor position / hint.
- **Right panel "Eigenschaften"** (width 308px, surface, left divider, scrolls). Sticky 11px
  uppercase heading, letter-spacing .09em, `--color-accent-700`.
  - No selection: muted 13px hint.
  - With selection: dot + layer name (Caprasimo 16px), then type-specific fields:
    - **Geometry** (all but frame): Position X/Y, Breite/Höhe (number inputs in pairs).
    - **Text**: Text (textarea), checkbox "Wird pro Karte ausgefüllt" (user/static source),
      Schrift (font select + size number, 72px wide), Farbe (36x36 color swatch + hex input),
      Ausrichtung (`.seg`: Links | Mitte | Rechts).
    - **Shape**: Füllfarbe (swatch + hex, empty = transparent), Rahmen Farbe / Stärke.
    - **Image**: muted note — the picture comes from the card; the template only sets the area.
    - **Icon**: checkbox "Wird pro Karte gewählt"; static → asset-picker button;
      user → "Auswahl verwalten (N)" + chosen assets as `.tag.tag-accent-2` chips.
    - **Frame**: muted note (frame always covers the whole canvas) + asset-picker button.
    - **Advanced disclosure** (`--color-accent-700`, 13px): Deckkraft (range 0–1 step .05,
      `accent-color: var(--color-accent)`), Rotation (°), Eckradius (rect only), and for text:
      Feldschlüssel, Vertikale Ausrichtung (Oben|Mitte|Unten segmented), Mindestgröße /
      Zeilenabstand, Umrandung Farbe/Stärke, Schatten Farbe/Unschärfe, checkbox "Auto-Shrink".
- **Asset-Picker dialog** (`.dialog-backdrop` + `.dialog`): title, rows with a 34x34 radius-8
  `--color-accent-200` swatch, name, and an accent check icon when chosen; plus a
  drag-and-drop upload slot ("Neues PNG hochladen", height 80px); action "Fertig".
  Multi-select for per-card icon choices, single-select for frames and static icons.
- **Shortcuts dialog**: two-column grid (`1fr 1fr`, gap 6px 17.6px) of action + `kbd`
  (11px, padding 2px 7px, radius 6px, `--color-neutral-200`, 1px divider border).

### 8. Karten-Editor (card instance)
- Muted "Zurück" link with arrow-left, then `h1` (card name or "Neue Karte").
- Layout `grid-template-columns: 1fr 300px`, gap 26.4px, `align-items: start`.
- **Left form** (gap 17.6px): "Kartenname"; "Template" select; one drag-and-drop image slot
  per image layer (height 170px, radius 12, placeholder "Bild ablegen"); one block per user
  text layer (textarea rows=3 + "Größe" number 72px + "Farbe" swatch 32x32); one block per
  user icon layer rendering its allowed assets as clickable `.tag` chips (chosen chip = accent
  tag with accent border); "Kartengruppe" select ("Keine" + groups).
  Actions right-aligned: secondary "Abbrechen", primary "Karte speichern".
- **Right column** (sticky, top 0): muted 12px "Live-Vorschau" + a 280x391 preview
  (radius 8px, `--shadow-lg`, surface background) rendering the template layers with the
  current field values.

### 9. Druckprojekt
- `h1` "Druckprojekt" + muted summary. Right: secondary "PNG exportieren",
  primary "Als PDF drucken"; both disabled when the cart is empty.
- Empty state: card with muted paragraph and primary "Zu allen Karten".
- Filled: `grid-template-columns: 340px 1fr`, gap 26.4px.
  - **Left column**
    - Card "IM DRUCKPROJEKT" (h3 13px uppercase, letter-spacing .08em, `--color-accent-700`).
      Rows: name (14px, `flex:1`), quantity stepper — two 26x26 circular buttons (1px divider
      border, transparent) with the count between them (min-width 24px, centered) — then an
      X remove button in `--color-accent-700`. Ghost "Alles entfernen" at the bottom.
    - Card "DRUCKOPTIONEN": checkboxes (`.radio` + `.dot`) "Schnittmarken" (default on) and
      "Beschnitt" (default off).
  - **Right column**: one sheet per page, label muted 12px. Sheet: width 420px,
    `aspect-ratio: 210/297`, white, radius 4px, `--shadow-lg`, padding 24px,
    `grid: repeat(3,1fr) / repeat(3,1fr)`, gap 8px → 9 slots. Filled slots render the card
    preview; empty slots are `--color-neutral-100`. With "Schnittmarken" on, slots carry a
    dashed 1px divider border.

---

## Interactions & Behavior

### Navigation
- Sidebar switches `section` (cards | groups | templates | print) and resets `view` to list.
- Card thumbnail / name → card editor for that card; "Neue Karte" → empty card editor.
- Template card → full-screen template editor.
- Group "N Karten anzeigen →" → cards list with that group chip pre-selected.

### Cards list
- Search filters by card name (case-insensitive substring), ANDed with the template select and
  the group chip. Sorting: recent (as stored) | name A–Z (localeCompare, de) | group name.
- View toggle switches grid/table; the label flips between "Als Tabelle" / "Als Raster".
- Add-to-print increments that card's quantity (adds with qty 1 if absent); the button's
  tooltip/label reflects the state and turns `--color-accent` once the card is in the cart.
- Duplicate appends a "… (Kopie)" at the top of the list; delete removes the card and any cart
  rows referencing it.

### Template editor
- **Selection**: click a layer on canvas or in the list; click empty canvas or press V/Esc to
  deselect. Frame layers cannot be moved or resized.
- **Drag** a layer to move; drag a corner handle to resize. Both snap to the `snapGrid` prop
  (default 5 design px; 1 = off) and push one history entry per gesture.
- **Pan**: space+drag or middle mouse. **Zoom**: wheel, the ± buttons, or shortcuts;
  "Einpassen" recomputes a fit scale from the measured stage size (ResizeObserver) minus 96px.
- **Undo/redo**: past/future stacks of layer snapshots; every mutating action pushes.
- **Rename**: double-click a layer row or F2; Enter commits, Esc cancels, blur commits.
- **Dirty tracking**: any mutation sets `dirty`; the save button is disabled when clean and its
  label reflects the state.
- **Escape ladder**: closes the shortcuts dialog → the asset picker → deselects → leaves editor.
- Keyboard handling is suppressed while typing in input/textarea/select (except Cmd+S); Esc
  blurs the field instead.

### Keyboard shortcuts (editor only)
| Action | Keys |
| --- | --- |
| Auswahl aufheben | V / Esc |
| Text / Bildfläche | T / I |
| Icon / Rahmen | K / F |
| Rechteck / Kreis / Linie | R / O / L |
| Verschieben (1px / 10px) | Pfeiltasten / Shift+Pfeiltasten |
| Nach vorn / hinten | ] / [ |
| Duplizieren | Cmd/Ctrl+D |
| Löschen | Entf / Backspace |
| Sichtbarkeit | H |
| Umbenennen | F2 |
| Speichern | Cmd/Ctrl+S |
| Rückgängig / Wiederherstellen | Cmd/Ctrl+Z / Shift+Cmd/Ctrl+Z |
| Zoom | + / − , Cmd+0 (einpassen), Cmd+1 (100%) |
| Ansicht verschieben | Space + Ziehen / Mittlere Maustaste |
| Tastenkürzel | ? |

### Print project
- Quantity steppers clamp at 1 (decrement below 1 removes the row); "Alles entfernen" clears.
- Sheets are computed by expanding each cart row into `qty` copies and chunking by 9.
- Export buttons are visual only in the prototype — wire them to the real PNG/PDF pipeline.

### Text rendering rules (preview and print share them)
- A text layer renders `values[key]` when `source === 'user'` and a value exists, else
  `defaultText`.
- `autoShrink`: reduce the font size toward `minFontSize` until the text fits its box.
- `align` (left|center|right) and `verticalAlign` (top|middle|bottom) position inside the box.
- `outlineColor`/`outlineWidth` → text stroke; `shadowColor`/`shadowBlur` → text shadow;
  `lineHeight` multiplies the font size; `opacity` applies per layer.
- Previews scale the 630x880 artboard with a CSS transform, so layer values stay in design
  units at every size (grid thumb, 280x391 live preview, print slot).

### Interaction states (from the design system — do not restyle per screen)
- Hover: one accent-ramp step, or a `--color-neutral-200` tint for ghost surfaces.
- Pressed: `--color-accent-600` on light grounds.
- Focus: `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`
- Disabled: opacity 0.45.
- Selects need a custom chevron (see Assets) because native appearance is removed.

## State Management
Prototype state (one component; split into stores/routes as the target codebase prefers):

- **Session**: `loggedIn`, `email`, `password`.
- **Routing**: `section` ('cards'|'groups'|'templates'|'print'), `view`
  ('list'|'editor'|'form'|'card'). The template editor is `section=templates, view=editor`.
- **Data**: `groups[]`, `cards[]`, `templatesData[]` (each with `layers[]`),
  `printCart[]` (`{cardId, qty}`).
- **Cards list UI**: `cardSearch`, `cardGroupFilter`, `cardTemplateFilter`, `cardSort`,
  `cardsView`.
- **Group form**: `editingGroupId`, `groupNameInput`, `groupDescInput`.
- **Template editor**: `activeTemplateId`, `templateNameInput`, `selectedLayerId`, `dirty`,
  `renamingLayerId`, `renameValue`, `assetPicker {open, multi}`, `addMenuOpen`,
  `advancedOpen`, `shortcutsOpen`, `history {past[], future[]}`, `stageSize`,
  `zoomMode` ('fit'|'manual'), `zoomValue`, `pan {x,y}`, `spaceDown`, `cursorPos`.
- **Card editor**: `editingCardId`, `cardNameInput`, `selectedGroupId`, `cardValues`,
  `cardFontOverrides`, `cardColorOverrides`, `cardIconChoices`.
- **Print**: `cutMarks` (true), `bleed` (false).

### Data model
```ts
type Group = { id: string; name: string; description: string };

type Card = {
  id: string; name: string; groupId: string | null; templateId: string;
  rarity: 'Gewöhnlich' | 'Selten' | 'Episch' | 'Legendär';
  updatedAt: string;                       // relative label in the prototype
  values: Record<string, string>;          // keyed by text-layer `key`
  iconChoices: Record<string, number>;     // layerId -> assetId
};

type Template = {
  id: string; name: string; description: string; updatedAt: string; layers: Layer[];
};

type LayerBase = {
  id: string; type: 'text'|'image'|'icon'|'shape'|'frame'; name: string; visible: boolean;
  x: number; y: number; width: number; height: number; rotation: number; opacity: number;
};

// text
{ key: string; source: 'user'|'static'; defaultText: string;
  fontFamily: string; fontSize: number; minFontSize: number; color: string;
  align: 'left'|'center'|'right'; verticalAlign: 'top'|'middle'|'bottom';
  lineHeight: number; outlineColor: string|null; outlineWidth: number;
  shadowColor: string|null; shadowBlur: number; autoShrink: boolean }
// shape
{ shape: 'rect'|'circle'|'line'; fill: string|null; stroke: string|null;
  strokeWidth: number; cornerRadius: number }
// icon
{ source: 'user'|'static'; assetId: number|null; choiceAssetIds: number[] }
// frame — no geometry; always the full canvas
{ assetId: number }
```

Card artboard: **630 x 880** design px (`CARD_W` / `CARD_H`) — a 63x88 mm card.

Fonts offered for card text (inside the card, independent of the UI font):
Arial, Verdana, Trebuchet MS, Georgia, Times New Roman, Courier New, Impact.

Rarity → tag mapping: Gewöhnlich → `.tag-neutral`, Selten → `.tag-accent-2`,
Episch → `.tag-accent`, Legendär → `.tag-outline`.

Seed data in the prototype: 3 groups (Waldläufer-Chronik, Drachenzunft, Verlorene Artefakte),
12 cards (two without a group), 3 templates (Heldenkarte Klassisch, Kreaturenkarte,
Gegenstandskarte), and a pre-filled cart. Treat it as fixture data, not content.

### Data fetching (for the real implementation)
Nothing is persisted in the prototype. The real app needs CRUD for groups, templates (with
layers), cards (with values and uploaded images), asset uploads (frames/icons as PNG), and a
print/export path (server render or client-side renderer) for PNG and PDF sheets.

## Design Tokens (Organic design system)
Take these from `design-system/styles.css` in this bundle — don't hard-code hexes if the target
codebase already carries equivalent tokens.

- **Core**: bg `#f5ead8`, surface `#ebddc5`, text `#201e1d`, accent `#c67139`,
  accent-2 (sage) `#7a8a5e`, divider `color-mix(in srgb, #201e1d 16%, transparent)`.
- **Neutral 100→900**: `#f9f4ed #eee7db #dcd3c4 #c0b6a5 #a19786 #82796a #645c50 #474238 #2e2b25`
- **Accent 100→900**: `#fff2eb #ffe1d0 #ffc6a5 #f6a06b #d67f48 #b2622d #8c491a #643312 #402310`
- **Accent-2 100→900**: `#f0fae1 #e1eecc #ccdbb2 #aebf92 #8fa073 #728157 #56633f #3d472b #272e1b`
- **Type**: headings **Caprasimo** 400 (`--font-heading`), body **Figtree** 400/600/700
  (`--font-body`); both from Google Fonts.
- **Spacing** (density 1.10x): `--space-1` 4.4 · `-2` 8.8 · `-3` 13.2 · `-4` 17.6 ·
  `-6` 26.4 · `-8` 35.2 px.
- **Radii**: sm 8, md 16, lg 28 px; buttons and inputs are pills (`999px`).
- **Shadows**: sm `0 1px 2px rgba(46,43,37,.14)`, md `0 3px 10px rgba(46,43,37,.16)`,
  lg `0 12px 32px rgba(46,43,37,.22)`.
- **Icons**: Lucide, stroke-width **2.75**; 14–17px in the UI, 26px in the login badge.
- **Classes used**: `.btn` + `.btn-primary/-secondary/-ghost/-block`, `.tag` +
  `.tag-accent/-accent-2/-neutral/-outline`, `.field`+`label`+`.input`, `.radio`+`.dot`,
  `.seg`+`.seg-opt`, `.card` + `.card-kicker/-title/-body/-meta`, `.elev-sm/-md/-lg`,
  `.nav`+`.nav-brand`, `.table`, `.dialog-backdrop`+`.dialog`+`.dialog-title/-body/-actions`.

### Local additions on top of the design system
- `select.input`: `appearance: none` + an inline-SVG chevron background —
  `width=12 height=8`, stroke `#201e1d` at 1.9, `background-size: 12px 8px`, positioned
  `right 14px center`, `padding-right: 36px`. The SVG **must** carry explicit width/height;
  a viewBox-only data URI is dropped by some browsers.
- `.cm-hit` — hover tint for bare icon buttons.
- `.cm-row` — hover row for the layer list and add menu.
- `.cm-scroll` — thin themed scrollbars for the panels.
- `[data-inputs="soft|crisp|line|pill"]` — input-shape variant switch (see below).

## Tweakable props (prototype-only knobs)
Not product features — they existed so the designer could compare variants. Decide before
implementing whether any should survive.
- `inputShape`: soft (default) | crisp | line | pill — input/select radius + padding variant.
- `showEmptyStates`: boolean — renders every list empty to check empty states.
- `snapGrid`: int 1–40 (default 5) — canvas snapping step in design px. Worth keeping.

## Assets
- **No real artwork ships with this design.** Frames and icons are named stubs:
  frames — Waldrahmen, Klassischer Goldrahmen, Dunkler Kreatur-Rahmen (ids 1–3);
  rarity icons — Gewöhnlich / Selten / Episch / Legendär (ids 10–13). Frames render as a
  tinted border placeholder, icons as a tinted rounded square. Replace with real PNGs.
- Card portraits use `image-slot.js` (bundled), a drag-and-drop placeholder. Replace with the
  target codebase's real upload/crop control.
- UI icons are inline Lucide SVG paths at stroke-width 2.75.
- Fonts load from Google Fonts via the `@import` at the top of `styles.css`.

## Files
| File | What it is |
| --- | --- |
| `CardMaker.dc.html` | The full prototype — all screens, all behavior. Primary reference. |
| `CardMaker v1.dc.html` | Earlier iteration, kept for history. Ignore unless comparing. |
| `support.js` | Runtime the two prototype files need to open in a browser. Not for porting. |
| `image-slot.js` | The drag-and-drop image placeholder used by the card editor and asset picker. |
| `design-system/styles.css` | Organic tokens + component classes — source of truth for all values. |
| `design-system/readme.md` | How the Organic system is meant to be used (direction, do/don't). |
| `design-system/_ds_bundle.js` | The system's component bundle, as loaded by the prototype. |

To view the prototype, open `CardMaker.dc.html` in a browser; the stylesheet and bundle paths
are rewritten to `design-system/` in this bundle.
