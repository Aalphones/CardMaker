# Phase 1 — Bugfixes: Icon-Auswahl (422) + `list_assets` (MCP-Absturz)

**Tier:** mechanisch — beide Fehler sind verstanden, die Korrektur ist eine gezielte
Ein-Datei- bzw. Wenig-Datei-Änderung ohne offene Entscheidung.

## Kontext (lesen vor dem Start)

- `backend/src/Validators/CardValidator.php` — `validatedIconChoices()` (Zeile ~204–233)
  prüft jeden Schlüssel von `icon_choices` mit `preg_match(self::KEY_PATTERN, $key)`.
  `KEY_PATTERN = '/^[a-z][a-z0-9_]{0,39}$/'` ist für **Feldschlüssel** gedacht (z. B. `"nr"`,
  `"beschreibung"` — die `key`-Eigenschaft einer Textebene). Icon-Ebenen haben aber gar kein
  eigenes `key`-Feld: `icon_choices` wird mit der rohen Layer-`id` (Konva-UUID, z. B.
  `a36520e5-2edf-4c86-a65f-255e7d3aea4e`) als Schlüssel befüllt — das steht auch explizit in
  `docs/models.md` unter `cards.icon_choices`: „Ebenen-Id → assets.id". Eine UUID mit
  Bindestrichen erfüllt `KEY_PATTERN` nie → jede Icon-Auswahl scheitert mit 422
  („Die Angaben sind unvollständig oder falsch.").
- `backend/src/Validators/LayerValidator.php` Zeile 147: Layer-`id` wird nur als
  `requiredString` geprüft (irgendein nichtleerer String, keine Muster-Einschränkung) — das
  bestätigt, dass Layer-IDs bewusst frei sind, nicht dem Feldschlüssel-Muster unterliegen.
- `frontend/src/app/shared/canvas/rendering/layer.ts` Zeile 134: `crypto.randomUUID()` erzeugt
  jede Layer-`id` — Format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, Kleinbuchstaben-Hex +
  Bindestriche.
- `mcp/cardmaker_mcp/meta.py` Funktion `_check_icon_choices()` (Zeile ~107–118) prüft
  clientseitig **denselben** `key_pattern`, der aus `meta["cards"]["valueKeyPattern"]` kommt —
  derselbe Fehler auf der MCP-Seite, noch bevor die Anfrage rausgeht.
- `backend/src/Services/MetaService.php` Zeile 63–79: der `cards`-Block der Auskunft — hier
  kommt eine neue Regel dazu.
- `mcp/cardmaker_mcp/server.py` Zeile 179–185: `list_assets()` ist als `-> list[dict]`
  deklariert, gibt aber `get_client().get_assets(kind)` unverändert zurück.
- `mcp/cardmaker_mcp/client.py` Zeile 184–188: `get_assets()` liefert die rohe Backend-Antwort
  `{"items": [...]}` (`backend/src/Controllers/AssetController.php::index()` Zeile 21–26 packt
  jede Liste in `{"items": ...}`). Der MCP-SDK-Rückgabetyp-Check schlägt deshalb fehl, sobald
  ein Aufrufer `list_assets` wirklich benutzt (reproduziert: zwei Aufrufe in dieser Session,
  identischer Pydantic-Fehler `Input should be a valid list … input_type=dict`).

## AK

1. Im Karteneditor (`/cards/:id`) ein Icon-Feld auswählen, „Speichern" klicken → die Karte
   speichert ohne 422, `icon_choices` steht anschließend korrekt in der Antwort.
2. `describe_card_fields` liefert weiterhin dieselben `layerId`-Werte (UUIDs) — das Format der
   Icon-Felder ändert sich nicht, nur die Prüfung dahinter.
3. `list_assets()` (MCP) liefert für `kind=None`, `"frame"`, `"icon"` je eine Python-Liste von
   Dicts, kein Pydantic-Fehler.
4. `meta.py::_check_icon_choices` benutzt das neue `cards.iconChoiceKeyPattern` statt
   `valueKeyPattern` — ein `create_card`/`update_card`-Aufruf mit einer echten Layer-UUID als
   `icon_choices`-Schlüssel scheitert clientseitig nicht mehr.

## Implementation

- [x] `backend/src/Validators/CardValidator.php`: neue Konstante
      `ICON_CHOICE_KEY_PATTERN = '/^.{1,191}$/'` (permissiv — nichtleer, ≤191 Zeichen, wie
      jede andere Kennungsspalte in diesem Projekt; UUIDs mit 36 Zeichen passen mühelos).
      `validatedIconChoices()`: `preg_match(self::KEY_PATTERN, $key)` →
      `preg_match(self::ICON_CHOICE_KEY_PATTERN, $key)` ersetzen (zwei Fundstellen:
      `validate()`-Pfad und `validateForUpdate()`-Pfad laufen beide durch dieselbe private
      Methode, also nur eine Änderung nötig).
- [x] `backend/src/Services/MetaService.php`: im `'cards'`-Block (Zeile ~63–79) neuen Eintrag
      `'iconChoiceKeyPattern' => CardValidator::ICON_CHOICE_KEY_PATTERN,` ergänzen (neben
      `valueKeyPattern`, nicht ersetzen — `values`/`textOverrides` behalten das strenge
      Feldschlüssel-Muster).
- [x] `mcp/cardmaker_mcp/meta.py`: `validate_card_payload()` — dort wo `_check_icon_choices`
      aufgerufen wird (Zeile ~66–67), einen zweiten kompilierten Pattern aus
      `rules.get("iconChoiceKeyPattern")` bauen und an `_check_icon_choices` durchreichen
      (Signatur bekommt einen zweiten Pattern-Parameter statt des bisherigen gemeinsamen
      `key_pattern`). Fällt `iconChoiceKeyPattern` in der Auskunft, weil ein Aufrufer gegen ein
      älteres Backend spricht: mit dem bisherigen `key_pattern` weiterlaufen (kein harter
      Fehler) — kleiner Rückfall, kein neuer Fehlerpfad.
- [x] `mcp/cardmaker_mcp/server.py` Zeile 179–185: `list_assets()` →
      `return get_client().get_assets(kind).get("items", [])` (die Backend-Antwort ist immer
      `{"items": [...]}`, siehe `AssetController::index()`).
- [x] `mcp/cardmaker_mcp/client.py` Zeile 184–188: Kommentar/Type-Hint von `get_assets()`
      korrigieren — die Methode liefert weiterhin die **rohe** Antwort (`dict` mit `items`),
      der Docstring/Type-Hint `-> list` ist irreführend; auf `-> dict` ändern, Aufrufer
      (`server.py::list_assets`) zieht `["items"]` selbst. Nicht die Methode selbst ändern,
      um das Symmetriemuster mit `get_card_groups()`/`get_templates()`/`get_cards()`
      (dieselbe Rohantwort, konsumiert über `state_cache.py`) nicht zu brechen.

## Manuelle Abnahme-Checkliste (private — kein automatisierter Test)

**Zuerst prüfen (Wackelstelle aus dem Konfidenz-Ausweis):**
- [x] Offline bestätigt (`php -r`): echte `layerId` aus `describe_card_fields(8)`
      (`a36520e5-2edf-4c86-a65f-255e7d3aea4e`) — altes `KEY_PATTERN` lehnt ab (0), neues
      `ICON_CHOICE_KEY_PATTERN` lässt durch (1). Python-Seite (`meta._check_icon_choices` mit
      dem neuen Pattern) ebenso ohne Exception bestätigt.

**Dann — braucht ein Deploy des Backends, noch nicht möglich aus dieser Session heraus:**
- [ ] Karteneditor: Icon wählen → Speichern → kein 422, Netzwerk-Tab zeigt 200/201.
- [ ] Dieselbe Karte per MCP `get_card` lesen → `iconChoices` enthält den gewählten Eintrag.
- [ ] MCP `list_assets()` ohne Argument, mit `kind="frame"`, mit `kind="icon"` aufrufen — je
      eine Liste, kein Fehler.
- [ ] MCP `create_card`/`update_card` mit einer echten `icon_choices`-UUID als Schlüssel
      aufrufen — kein clientseitiger `ValueError` aus `meta.py` mehr.

## Doc-Updates

- [ ] Keine — `docs/models.md`s Beschreibung von `icon_choices` („Ebenen-Id → assets.id")
      stimmt bereits, das war ja die Richtschnur für den Fix.

## Report-Back

Beide Fixes wie geplant umgesetzt, alle Implementation-Punkte erledigt. Root Causes offline
bestätigt (`php -r` gegen echte UUID aus `describe_card_fields(8)`, Python-Simulation von
`meta._check_icon_choices`), PHP- und Python-Syntax geprüft (`php -l`, `ast.parse`).

**Nicht ausführbar aus dieser Session:** Die „Dann"-Laufzeitchecks brauchen ein Deploy des
Backends (`deploy.cmd`, Zugangsdaten in `deploy.env`) — der MCP-Server spricht mit dem
Live-Backend auf Strato (`CM_BASE`-Default), nicht mit dem lokal geänderten PHP. Diese Session
deployt nicht eigenmächtig (Zugangsdaten-Aktion auf geteiltem Produktivsystem). Sobald deployt:
die vier „Dann"-Punkte einmal durchklicken/aufrufen, dann Häkchen hier nachziehen.

**Kein Nachbar-Bug gefunden.**
