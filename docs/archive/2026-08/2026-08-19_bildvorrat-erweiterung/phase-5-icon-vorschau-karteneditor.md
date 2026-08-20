# Phase 5 — Frontend: Icon-Vorschau im Karteneditor

**Tier:** standard — Muster ist im Bestand vorhanden (`asset-picker`), Übertragung auf eine
zweite Stelle.

**Unabhängig von Phase 2–4** — braucht nur Phase 1 (damit Icon-Auswahl überhaupt speicherbar
ist, sonst lässt sich das Ergebnis nicht sinnvoll abnehmen).

## Kontext (lesen vor dem Start)

- `frontend/src/app/features/cards/card-editor/card-editor.html` Zeile 147–171 — die
  Icon-Radiogruppe: jede Option ist ein `<button class="tag" role="radio">` mit reinem Text
  (`{{ iconAssetsById().get(assetId)?.name ?? 'Bild ' + assetId }}`), Zeile 168.
- `frontend/src/app/features/cards/card-editor/card-editor.ts` Zeile 242–270 —
  `iconAssetsById` ist ein `computed()`, das aus `fields().icons` + `AssetsFacade.all()` eine
  `Map<number, Asset>` baut (liefert `name`, aber lädt keine Bilddaten).
- `frontend/src/app/features/templates/template-editor/asset-picker/asset-picker.ts` Zeile
  25–44 — **exaktes Vorbild**: `AssetImageLoader` injiziert, `effect()` lädt für jedes
  sichtbare Asset das Bild (`this.imageLoader.load(asset.id)`), `thumbUrl(id)` liest
  `this.imageLoader.images().get(id)?.src ?? null`.
- `frontend/src/app/shared/canvas/asset-image-loader.ts` — `load(assetId)` ist idempotent
  (`BlobImageCache` merkt sich bereits geladene/laufende Anfragen, siehe Klassenkommentar) —
  mehrfaches Aufrufen für dasselbe Asset ist unproblematisch, kein eigenes Caching im
  Karteneditor nötig.
- `frontend/src/styles/_bausteine.scss` Zeile 292–304 — `.tag` ist `display: inline-flex`,
  ein `<img>` vor dem Text ordnet sich automatisch ein; nur eine Thumbnail-Größenklasse fehlt.

## AK

1. Jede Icon-Auswahl-Option im Karteneditor zeigt links ein kleines Vorschaubild des
   tatsächlichen Icons, rechts weiterhin den Namen (nicht nur Text wie bisher).
2. Fehlt ein Bild (noch nicht geladen oder Ladefehler) → Platzhalter statt kaputtem `<img>`
   (analog `asset-picker.html` Zeile 15–19: `@if (thumbUrl(id); as url) { <img ...> } @else {
   <span class="...placeholder"></span> }`).
3. Auswahl per Klick und per Pfeiltasten (`onIconKeydown`) funktioniert unverändert — diese
   Phase ändert nur die Darstellung, keine Auswahl-Logik.

## Implementation

- [x] `frontend/src/app/features/cards/card-editor/card-editor.ts`:
  - `AssetImageLoader` importieren und injizieren (wie in `asset-picker.ts` Zeile 4, 25).
  - Neuer `effect()` im Konstruktor (neben bestehenden Effects): iteriert über
    `this.fields().icons` und deren `choiceAssetIds`, ruft für jede Kennung
    `this.imageLoader.load(assetId)` — Muster 1:1 aus `asset-picker.ts` Zeile 42–44, nur über
    `icon.choiceAssetIds` statt `items()` iteriert (verschachtelte Schleife: für jedes
    `icon`-Feld, für jede `choiceAssetIds`-Kennung).
  - Neue Methode `protected iconThumbUrl(assetId: number): string | null { return
    this.imageLoader.images().get(assetId)?.src ?? null; }` (1:1 `asset-picker.ts` Zeile
    61–63, `thumbUrl` → `iconThumbUrl` umbenannt, um nicht mit einem eventuell gleichnamigen
    Kartenbild-Vorschau-Namen zu kollidieren — prüfen, ob `card-editor.ts` bereits ein
    `thumbUrl` kennt, dann diesen Namen beibehalten).
- [x] `frontend/src/app/features/cards/card-editor/card-editor.html` Zeile 157–169: Button-
      Inhalt um das Thumbnail ergänzen:
      ```html
      @if (iconThumbUrl(assetId); as url) {
        <img class="card-editor__icon-thumb" [src]="url" alt="" />
      } @else {
        <span class="card-editor__icon-thumb card-editor__icon-thumb--placeholder"></span>
      }
      {{ iconAssetsById().get(assetId)?.name ?? 'Bild ' + assetId }}
      ```
      (`alt=""` — der sichtbare Name daneben ist bereits die zugängliche Beschriftung, ein
      zweiter Alt-Text wäre doppelte Ansage für Screenreader; die Radiogruppe hat schon
      `aria-labelledby`).
- [x] `frontend/src/app/features/cards/card-editor/card-editor.scss`: neue Klasse
      `.card-editor__icon-thumb` — `width: 20px; height: 20px; border-radius:
      var(--radius-sm); object-fit: contain; margin-right: var(--space-xs);` (Werte an
      bestehende Tokens aus `docs/design/handoff-organic/design-system/styles.css` angleichen,
      nicht neu erfinden), `&--placeholder { background: var(--color-neutral-200); }` (oder
      den in `asset-picker.scss` benutzten Platzhalter-Farbwert übernehmen, damit beide
      Stellen gleich aussehen).

## Manuelle Abnahme-Checkliste

**Zuerst (Wackelstelle — Ladezustand):**
- [ ] Ein Template mit vielen Icon-Optionen (≥10) öffnen — alle Thumbnails laden sichtbar
      nach, kein hängender Platzhalter, keine Konsolenfehler.

**Dann:**
- [ ] Icon per Klick wählen → Auswahl-Rand (`tag--accent`) sitzt weiterhin korrekt um Bild+Text.
- [ ] Pfeiltasten-Navigation (`onIconKeydown`) funktioniert weiterhin, Fokus bleibt sichtbar.
- [ ] Mobile/schmale Breite (falls die Fußleiste responsiv umbricht) — Thumbnails brechen nicht
      aus dem Tag heraus.

## Doc-Updates

- [x] `docs/code-map.md` → Absatz zu `card-editor/` (Zeile 66–78): „Icon-Auswahl als Tags"
      auf „Icon-Auswahl als Tags mit Vorschaubild" präzisieren.

## Report-Back

**Status:** complete (Code). Lint grün, Build grün. Manuelle Abnahme steht aus.

**Geändert:**
- `card-editor.ts`: `AssetImageLoader` als `assetImages` injiziert, neuer `effect()` lädt für
  jedes Icon-Feld alle `choiceAssetIds`, neue Methode `iconThumbUrl(assetId)`.
- `card-editor.html`: Icon-Tag zeigt Vorschaubild bzw. Platzhalter vor dem Namen, `alt=""`.
- `card-editor.scss`: `.card-editor__icon-thumb` (1,25 rem, `object-fit: contain`).
- `docs/code-map.md`: Beschreibung der Icon-Auswahl präzisiert.

**Abweichung vom Plan:** Bild und Platzhalter teilen sich **eine** Klasse statt Klasse +
`--placeholder`-Modifier. Grund: Der getönte Untergrund (`--color-accent-200`) soll in beiden
Zuständen stehen — genau so macht es `asset-picker.scss` (`&__thumb, &__thumb-placeholder`
mit identischem Regelblock). Ein Modifier hätte hier nichts unterschieden.

**Kein neues Caching** im Karteneditor: `AssetImageLoader.load()` ist idempotent
(`BlobImageCache`), der Effect darf beliebig oft laufen.
