# Bildvorrat-Erweiterung: Umbenennen, Artwork, Vorschau, Multiupload

**Ziel:** Rahmen und Icons lassen sich benennen und per MCP umbenennen, eine dritte
Bildvorrat-Art „Artwork" kommt dazu, Icons zeigen im Karteneditor ihr tatsächliches Bild statt
nur Text, und der Bildvorrat lässt sich mit mehreren Dateien auf einmal befüllen. Zwei dabei
gefundene Bugs blockieren das Fundament und werden zuerst behoben.

## Overview

| Phase | Thema | Tier | Status |
|---|---|---|---|
| [1](phase-1-bugfixes-icon-auswahl.md) | Bugfixes: Icon-Auswahl (422) + `list_assets` (MCP-Absturz) | mechanisch | complete |
| [2](phase-2-artwork-und-umbenennen-backend.md) | Datenmodell: Artwork als dritte Art + Umbenennen-Endpoint | mechanisch | complete |
| [3](phase-3-mcp-werkzeug-rename-asset.md) | MCP-Werkzeug `rename_asset` | mechanisch | complete |
| [4](phase-4-bildvorrat-seite.md) | Frontend: Bildvorrat-Seite (Umbenennen, Multiupload, Artwork) | standard | pending |
| [5](phase-5-icon-vorschau-karteneditor.md) | Frontend: Icon-Vorschau im Karteneditor | standard | pending |
| [6](phase-6-doku-und-abschluss.md) | Doku & Abschluss | mechanisch | pending |

## Kontrakt (cross-modul: Backend ↔ Frontend ↔ MCP)

**`assets.kind`** — ENUM erweitert um `'artwork'`: `'frame' | 'icon' | 'artwork'`. Gilt
gleichermaßen für `AssetValidator::KINDS` (Backend), `AssetKind` (Frontend-TS) und den
`kind`-Parameter der MCP-Werkzeuge `list_assets`/`rename_asset`.

**`PATCH /api/assets/{id}`** (neu) — Rumpf `{"name": string}` (1–191 Zeichen, wie
`AssetValidator::NAME_MAX_LENGTH`, neu benannt analog `FontValidator::NAME_MAX_LENGTH`).
Antwort: dasselbe Objekt wie `GET /api/assets` je Eintrag (`id, kind, name, mimeType,
byteSize, width, height, createdAt`). 404 wenn die Kennung nicht existiert, 422 bei leerem/zu
langem Namen. `kind` und die Datei selbst ändern sich über diese Route nicht — Vorbild ist
`PATCH /api/fonts/{id}` (`FontController::update`/`FontService::rename`).

**MCP `rename_asset(asset_id: int, name: str) -> dict`** — ruft `PATCH /api/assets/{id}`,
Muster wie `update_card_group`. Kein `invalidates_state` nötig — Assets stehen nicht im
MCP-Zustandsbild (`state_cache.py` kennt nur `cardGroups`/`templates`/`cards`).

**`icon_choices`-Schlüssel bleiben Layer-UUIDs** (unverändert, nur die Prüfung wird korrekt):
`CardValidator` validiert sie künftig gegen eine eigene, permissive Regel
(`ICON_LAYER_KEY_PATTERN`, nicht `KEY_PATTERN`), exponiert über `/api/meta` als
`cards.iconChoiceKeyPattern`. `meta.py` im MCP-Server übernimmt dieselbe Regel für
`_check_icon_choices` statt der bisherigen `valueKeyPattern`.

## Finale Abnahmekriterien (Gesamtergebnis)

1. Im Karteneditor ein Icon wählen und speichern → kein 422, die Karte speichert.
2. `list_assets()` per MCP liefert eine Liste ohne Pydantic-Fehler, für `kind=None`,
   `"frame"`, `"icon"` und `"artwork"`.
3. Ein Rahmen, ein Icon und ein Artwork-Bild lassen sich je einzeln umbenennen — über die
   Bildvorrat-Seite und per MCP (`rename_asset`).
4. Auf der Bildvorrat-Seite lassen sich mehrere PNG-Dateien in einem Rutsch hochladen (nicht
   nur eine).
5. Im Karteneditor zeigt jede Icon-Auswahl-Option ihr tatsächliches Vorschaubild, nicht nur
   den Namen.
6. Bestehende Rahmen-/Icon-Auswahl im Template-Editor (`asset-picker`) funktioniert
   unverändert weiter (Regressionscheck).

## Bewusst außen vor (Scope-Grenze)

- **Kein neuer Layer-Typ für Artwork.** Artwork ist eine dritte Art im Bildvorrat (verwaltbar,
  umbenennbar, hochladbar) — es gibt aktuell keine Karten-/Template-Funktion, die ein
  Artwork-Bild tatsächlich auf eine Karte zeichnet. Das wäre ein eigener Folgeplan (neuer
  Layer-Typ oder Referenz von `card_images` auf ein Artwork-Asset).
- **Kein Multiupload-Endpoint im Backend.** Mehrere Dateien gehen als Folge einzelner
  `POST /api/assets`-Aufrufe raus (eine Warteschlange im Frontend) — kein neuer
  Multipart-Batch-Endpoint. Grund: `POST /api/assets` ist bereits robust (Validierung,
  Fehlerbehandlung pro Datei), ein Batch-Endpoint müsste all das doppeln, für ein
  Einzelplatz-Werkzeug ohne Geschwindigkeitsdruck kein lohnender Zusatzaufwand.
- **Kein MCP-Werkzeug zum Hochladen von Assets.** Nur `rename_asset` ist neu — Hochladen bleibt
  Editor-Aufgabe (Datei-Auswahl braucht eine Oberfläche).

## Konfidenz-Ausweis

- **`meta.py::_check_icon_choices`** — nach der Umstellung auf `cards.iconChoiceKeyPattern`
  muss der Regex tatsächlich jede in der Praxis vorkommende Layer-UUID durchlassen. Check:
  nach Phase 1 einmal `describe_card_fields` auf einem echten Template aufrufen und die
  gelieferte `layerId` gegen das neue Muster in Python testen (`re.match`).
- **`AssetValidator::KINDS`-Erweiterung** — wirkt sich auch auf `LayerValidator`s
  `choice_asset_ids`-Prüfung aus (verweist die dort auf `AssetRepository::existingIds()`, die
  ist kind-agnostisch — sollte unberührt bleiben, aber in Phase 2 kurz gegenlesen).

Sonst keine wackligen Stellen — alle Backend-Änderungen kopieren 1:1 bestehende
`fonts`-Muster (Rename-Endpoint, Repository, Validator).
