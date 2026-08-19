# Phase 2 — Datenmodell: Artwork als dritte Art + Umbenennen-Endpoint

**Tier:** mechanisch — jeder Baustein kopiert ein bestehendes Muster 1:1
(`fonts`-Umbenennen für den Endpunkt, `M0xx`-Migrationen für die Schema-Änderung).

## Kontext (lesen vor dem Start)

- `backend/src/Migrations/M005CreateAssets.php` — legt `assets.kind ENUM('frame','icon')` an.
  Migrationen werden nach Dateiname sortiert automatisch eingesammelt (`docs/models.md` Kopf).
  Höchste vorhandene: `M011CreatePrintProject.php` → neue Datei heißt `M012...`.
- **Vorbild für den Rename-Endpoint** (1:1 kopierbar, nur `assets` statt `fonts`):
  - `backend/src/Controllers/FontController.php::update()` (Zeile 62–74)
  - `backend/src/Services/FontService.php::rename()` (Zeile 79–84)
  - `backend/src/Repositories/FontRepository.php::updateName()` (Zeile 94–106)
  - `backend/src/Validators/FontValidator.php::validate()` (Zeile 22–31, dort heißt die
    Methode schon `validate()`, weil Fonts kein zweites Pflichtfeld haben — bei Assets bleibt
    der bestehende `validate()` für den Upload unangetastet, die neue Methode heißt
    `validateRename()`, weil `validate()` bereits `kind` verlangt)
- `backend/public/index.php` Zeile 257–260 — die Routen für `/api/assets`. Zeile 264 zeigt das
  PATCH-Muster für Fonts (`$routes->addRoute('PATCH', '/api/fonts/{id:\d+}', ...)`).
- `backend/src/Validators/AssetValidator.php` — `KINDS = ['frame', 'icon']` (Zeile 13),
  `validate()` prüft `name` inline mit `v::between(1, 191)` ohne eigene Konstante (anders als
  `FontValidator::NAME_MAX_LENGTH`).
- `backend/src/Services/MetaService.php` Zeile 84–86 — der `'assets'`-Block der Auskunft, hat
  bisher nur `kinds`.
- `docs/decisions/026-keine-vorschaubilder-ueber-mcp.md` ist die letzte ADR — die neue heißt
  `027-artwork-als-dritte-asset-art.md`.

## Design-Entscheidung (im User-Gespräch getroffen, hier nur noch umzusetzen)

Artwork ist eine **dritte Art im bestehenden Bildvorrat** (`assets.kind`), verwaltet exakt wie
Rahmen/Icons — kein neuer Layer-Typ, keine Verbindung zu `card_images`. Bewusst außen vor:
siehe README → „Bewusst außen vor".

## AK

1. `GET /api/assets?kind=artwork` liefert (anfangs leer) ohne Fehler.
2. `POST /api/assets` mit `kind=artwork` legt ein Asset an wie bei `frame`/`icon`.
3. `PATCH /api/assets/{id}` mit `{"name": "Neuer Name"}` benennt ein beliebiges Asset
   (unabhängig von `kind`) um, liefert das aktualisierte Objekt. Leerer/zu langer Name → 422
   mit Feldfehler `name`. Unbekannte Kennung → 404.
4. `GET /api/meta` → `assets.kinds` enthält `"artwork"`, `assets.nameMaxLength` ist `191`.

## Implementation

- [ ] `backend/src/Migrations/M012ExtendAssetKind.php` (neue Datei, Namensschema wie
      bestehende `M0xx...php`):
      ```php
      $pdo->exec("ALTER TABLE assets MODIFY kind ENUM('frame','icon','artwork') NOT NULL");
      ```
- [ ] `backend/src/Validators/AssetValidator.php`:
  - `KINDS` → `['frame', 'icon', 'artwork']`
  - neue Konstante `NAME_MAX_LENGTH = 191` (mirrors `FontValidator`), `validate()` auf diese
    Konstante umstellen statt der eingebetteten `191`
  - neue Methode `validateRename(array $body): array{name: string}` — identisch zu
    `FontValidator::validate()`, nur Klassenname/Kommentar angepasst
- [ ] `backend/src/Repositories/AssetRepository.php`: neue Methode `updateName(int $id, string
      $name): ?array` — 1:1 `FontRepository::updateName()`, Tabelle `assets` statt `fonts`.
- [ ] `backend/src/Services/AssetService.php`: neue Methode `rename(int $id, string $name):
      ?array` — 1:1 `FontService::rename()`, liefert `AssetRepository::format($row)`.
- [ ] `backend/src/Controllers/AssetController.php`: neue Methode `update(string $id): void` —
      1:1 `FontController::update()` (`AssetValidator::validateRename()` statt
      `FontValidator::validate()`, `$this->assets->rename(...)`, `$this->notFound()` bei
      `null`).
- [ ] `backend/public/index.php`: nach Zeile 260 (`DELETE /api/assets/{id}`) einfügen:
      `$routes->addRoute('PATCH', '/api/assets/{id:\d+}', [AssetController::class,
      'update']);`
- [ ] `backend/src/Services/MetaService.php`: `'assets'`-Block →
      `['kinds' => AssetValidator::KINDS, 'nameMaxLength' => AssetValidator::NAME_MAX_LENGTH]`.
- [ ] **Gegenlesen (Konfidenz-Ausweis-Punkt):** `LayerValidator`s Prüfung von
      `choice_asset_ids` (Icon-Ebenen) und `asset_id` (Rahmen-Ebenen) läuft über
      `AssetRepository::existingIds()` — kind-agnostisch, prüft nur Existenz der Kennung.
      Bestätigen, dass ein `artwork`-Asset dort **nicht versehentlich** als gültige
      Icon-/Rahmen-Wahl durchgeht, obwohl es das nicht sein soll (im Zweifel: `LayerValidator`
      an der Stelle, wo `choice_asset_ids`/`asset_id` geprüft werden, zusätzlich gegen
      `kind IN ('icon')` bzw. `kind IN ('frame')` filtern, nicht nur Existenz). Kurzer Blick in
      `backend/src/Validators/LayerValidator.php`, Suche nach `existingIds` reicht.
- [ ] ADR: `docs/decisions/027-artwork-als-dritte-asset-art.md` — Kontext (Nutzer wollte
      Artwork-Bilder verwalten wie Icons/Rahmen), Optionen (dritte `kind`-Ausprägung vs. neue
      Tabelle vs. Wiederverwendung `card_images`), Entscheidung (dritte `kind`-Ausprägung, da
      identisches Verhalten zu Rahmen/Icon — kein neuer Layer-Typ nötig), Konsequenzen (kein
      Rendering-Pfad für Artwork bisher, Folgeplan nötig falls das gewünscht wird).

## Manuelle Abnahme-Checkliste

**Zuerst (Wackelstelle):**
- [ ] Ein Template mit Icon-Ebene öffnen, ein `artwork`-Asset hochladen, prüfen dass es in der
      Icon-Auswahl des Template-Editors **nicht** auftaucht (Regressionscheck für den
      Gegenlese-Punkt oben).

**Dann:**
- [ ] `POST /api/assets` mit `kind=artwork` + PNG → 201, Eintrag erscheint in
      `GET /api/assets?kind=artwork`.
- [ ] `PATCH /api/assets/{id}` mit gültigem Namen → 200, neuer Name in der Antwort.
- [ ] `PATCH /api/assets/{id}` mit leerem Namen → 422, Feld `name` in `fields`.
- [ ] `PATCH /api/assets/999999` (nicht existent) → 404.
- [ ] `GET /api/meta` → `assets.nameMaxLength === 191`, `assets.kinds` enthält alle drei.

## Doc-Updates

- [ ] `docs/models.md` → `assets`-Tabelle: `kind` ENUM-Werte um `artwork` ergänzen.
- [ ] `docs/routes.md` → Bildvorrat-Abschnitt: `PATCH /api/assets/{id}` Zeile ergänzen.

## Report-Back

(wird beim Umsetzen ausgefüllt)
