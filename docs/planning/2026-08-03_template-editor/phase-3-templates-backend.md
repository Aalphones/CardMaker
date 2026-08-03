# Phase 3 — Templates im Backend

**Rating:** standard · **Status:** umgesetzt, Serverprobe offen

Tabelle, fünf Pfade, und die vollständige Prüfung der Ebenenliste. Die Prüfung ist der
eigentliche Inhalt dieser Phase: Weil das Layout als ein Datenblock in einer Spalte liegt
(ADR-014), prüft die Datenbank nichts — sie ist die **einzige** Stelle, die kaputte Daten
abfängt.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → Abschnitte „Templates" und „Die fünf Ebenentypen".
  **Die Feldtabellen dort sind die Prüfregeln** — eins zu eins umsetzen, nichts dazuerfinden,
  nichts weglassen
- `docs/decisions/014-template-layout-als-datenblock.md` (aus Phase 1)
- `docs/conventions/php.md`
- `backend/src/Controllers/CardGroupController.php`, `.../Services/CardGroupService.php`,
  `.../Repositories/CardGroupRepository.php`, `.../Validators/CardGroupValidator.php`
- `backend/src/Migrations/M005CreateAssets.php` (aus Phase 2)
- `backend/src/Services/AssetService.php` (aus Phase 2) — bekommt hier die Löschsperre
- `backend/public/index.php`

## Abnahmekriterien

1. Die fünf Pfade aus dem Kontrakt antworten wie beschrieben.
2. `GET /api/templates` liefert **keine** Ebenendaten, nur `layerCount`.
3. Eine Ebenenliste mit einem unbekannten Typ, einem fehlenden Pflichtfeld, einem Wert
   außerhalb des erlaubten Bereichs oder einem doppelten Feldschlüssel wird mit `422`
   abgelehnt, und die Meldung sagt, welche Ebene und welches Feld.
4. Ein zweiter Rahmen in derselben Liste wird mit `422` abgelehnt.
5. Ein `assetId`, zu dem es kein Bild gibt, wird abgelehnt.
6. `DELETE /api/assets/{id}` liefert `409`, solange ein Template das Bild benutzt.

## Checkliste

- [x] **Migration `backend/src/Migrations/M006CreateTemplates.php`**:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`, `name VARCHAR(191) NOT NULL`,
      `description TEXT NULL`, `layers JSON NOT NULL`, `created_at DATETIME NOT NULL`,
      `updated_at DATETIME NOT NULL`, `INDEX idx_templates_name (name)`.
      Kommentar im Kopf: warum ein Datenblock statt einer Ebenentabelle (ADR-014).
- [x] **`backend/src/Validators/LayerValidator.php`** — eigene Datei, weil sie mehr Regeln
      trägt als alle bisherigen Validatoren zusammen. Öffentliche Methode
      `validateAll(mixed $layers): array` — gibt die geprüfte Liste zurück oder antwortet
      selbst mit `422`. Aufbau:
      - Muss ein Array sein (auch leer erlaubt), höchstens 100 Einträge.
      - Pro Eintrag: `id` (nicht leerer String, im Template eindeutig), `type` aus den fünf
        erlaubten Werten, `name` 1–80 Zeichen, `visible` als echter Boolescher Wert.
      - Danach je Typ die Felder aus der Tabelle im Plan-README. Zahlenbereiche hart prüfen
        (`opacity` 0–1, `rotation` −360–360, `strokeWidth` ≥ 0, `fontSize`/`minFontSize`
        4–200, `lineHeight` 0.5–3), Farbwerte gegen `/^#[0-9a-fA-F]{6}$/`.
      - Textebene zusätzlich: `key` gegen `/^[a-z][a-z0-9_]{0,39}$/`, **eindeutig über alle
        Textebenen des Templates**; `minFontSize <= fontSize`; `defaultText` höchstens 500
        Zeichen.
      - Höchstens **eine** Ebene vom Typ `frame`.
      - Fehlermeldungen im gewohnten `fields`-Format, Schlüssel als
        `layers.<index>.<feld>`, damit die Oberfläche später zeigen kann, wo es klemmt.
      - **Wire-Format beachten:** Die Schlüssel kommen bereits in `snake_case` an
        (`Request::camelToSnake` im Konstruktor). Der Validator arbeitet also mit
        `default_text`, `font_size`, `asset_id`, `choice_asset_ids`, `min_font_size`,
        `vertical_align`, `outline_color`, `outline_width`, `shadow_color`, `shadow_blur`,
        `shadow_offset_x`, `shadow_offset_y`, `corner_radius`, `auto_shrink` — und der
        Formatierer im Repository dreht es beim Antworten zurück. Das ist die
        fehleranfälligste Stelle dieser Phase.
- [x] **`backend/src/Validators/TemplateValidator.php`** — `validate()` und
      `validateForUpdate()` nach dem Muster von `CardGroupValidator` für `name` (1–191) und
      `description` (optional, max. 2000). Bei `layers` im Rumpf an `LayerValidator`
      weiterreichen.
- [x] **`backend/src/Repositories/TemplateRepository.php`** — `allSummaries()` (ohne
      `layers`, dafür `JSON_LENGTH(layers) AS layer_count`), `find(int)`, `insert(...)`,
      `update(...)`, `delete(int)`, `allLayerBlobs(): array<string>` für die Löschsperre.
      `layers` beim Lesen mit `json_decode(..., true)`, beim Schreiben mit `json_encode`.
      `formatTemplate()` wandelt nach camelCase — **auch innerhalb der Ebenen**, rekursiv.
- [x] **`backend/src/Services/TemplateService.php`** — `list()`, `find()`, `create()`,
      `update()`, `delete()`. Beim Anlegen ist `layers` immer `[]`; Ebenen kommen nur über
      `update()`. Zusätzlich: vor dem Speichern prüfen, dass jedes im Layout genannte
      `asset_id` (auch die in `choice_asset_ids`) wirklich existiert — sonst `422` mit
      Klartext. Dafür eine Methode am `AssetRepository` ergänzen: `existingIds(array $ids)`.
- [x] **`backend/src/Controllers/TemplateController.php`** — `index`, `show`, `create`,
      `update`, `destroy`, dünn wie `CardGroupController`.
- [x] **Löschsperre für Bilder nachrüsten** — `AssetService::delete()` fragt vorher beim
      `TemplateRepository` nach: Steckt die Nummer in irgendeinem Layout, dann `409` mit
      `Response::ERROR_CONFLICT` und der Meldung, dass das Bild noch in einem Template
      benutzt wird. **Umsetzung bewusst in PHP, nicht in SQL:** Alle Layout-Blöcke laden und
      durchsehen. Die JSON-Suchfunktionen von MySQL unterscheiden Zahl und Zeichenkette
      unzuverlässig, und bei der Menge an Templates eines Einzelplatz-Werkzeugs ist die
      Ersparnis null. Kommentar an der Stelle, warum das so ist.
- [x] **`backend/public/index.php` verdrahten** — `TemplateService` als geteilte Variable
      (auch der `AssetService` braucht das `TemplateRepository`, also Reihenfolge beachten:
      Repository zuerst, dann beide Dienste), Controller in `$makeController`, fünf Routen
      eintragen: `GET/POST /api/templates`, `GET/PATCH/DELETE /api/templates/{id:\d+}`.
      Nicht in die Positivliste der offenen Pfade.
- [x] **Doc-Update `docs/code-map.md`** — `templates` in der Feature-Tabelle präzisieren
      (bisher „Template-Editor: Layer-System, Konva-Canvas, Live-Vorschau"), Ergänzung um
      den Hinweis, dass das Layout als ein Datenblock in `templates.layers` liegt.
- [ ] **Hochladen und durchspielen** — `deploy.cmd`, dann `POST /api/migrate`, dann mit
      einem Zugriffstoken von Hand: Template anlegen, eine Ebenenliste mit einem absichtlich
      falschen Wert schicken (erwartet `422` mit sprechendem Feldnamen), dann eine gültige
      Liste (erwartet `200`), dann ein benutztes Bild löschen wollen (erwartet `409`).
      **Noch offen** — braucht ein Zugriffstoken vom Server, dasselbe offene Ende wie bei
      Phase 2 (siehe dortiges Report-Back). Lokal stattdessen durch drei Wegwerf-Skripte
      geprüft (siehe Report-Back unten).

## Report-Back

**Umgesetzt wie im Plan beschrieben**, ein Fund unterwegs:

- 🔴 **Echter Bug beim Bauen gefunden und gefixt:** In `LayerValidator::stringInRange()` stand
  ursprünglich `"Bitte einen Text mit $min–$max Zeichen angeben."` — der Gedankenstrich klebt
  direkt am Variablennamen, und PHP liest Bytes ≥ 0x80 (jeder UTF-8-Mehrbyte-Buchstabe zählt
  dazu) als gültige Bezeichner-Zeichen. `$min–` wurde also als eine einzige, nicht existierende
  Variable geparst — Ergebnis: die Meldung verschluckte die Minimalgrenze und lieferte
  „Bitte einen Text mit 80 Zeichen angeben." statt „…mit 1–80 Zeichen…". Gefangen durch den
  Testlauf unten (Szenario „missing_field"), behoben mit `{$min}–{$max}` (geschweifte Klammern
  beenden den Bezeichner explizit). Einzige weitere Stelle mit `–` im Datei ist ein reiner
  String ohne Interpolation, also unbetroffen.
- **Wire-Format-Detail, das im Plan nicht explizit stand:** Die `fields`-Schlüssel der
  Fehlerantwort (`layers.<index>.<feld>`) unterliegen derselben Wire-Format-Grenze wie die
  Nutzdaten (`docs/conventions/php.md` Regel 3) — sie dürfen also nach außen kein snake_case
  zeigen. Dafür `App\Support\WireFormat::snakeToCamel()` ergänzt (kleine, schichtfreie
  Helferklasse, symmetrisch zu `Request::camelToSnake()`) und sowohl in `LayerValidator`
  (Feldnamen der Fehlermeldungen) als auch in `TemplateRepository::format()` (Ebenen beim
  Antworten) eingesetzt.
- **Asset-Referenzprüfung** liegt in `TemplateService`, nicht im Validator — der Validator hat
  keinen Datenbankzugriff (Schichtentrennung, `docs/conventions/php.md`).

**Lokal geprüft** (drei Wegwerf-PHP-Skripte, `php -l` auf allen geänderten Dateien plus
gezielte Läufe gegen `LayerValidator`/`TemplateRepository`, ohne Datenbank):

- Ein Template mit je einer Ebene aller fünf Typen (inkl. `shape: line`, `icon` mit
  `choice_asset_ids`) validiert fehlerfrei.
- Sechs Fehlerfälle einzeln geprüft: unbekannter Ebenentyp, fehlendes Pflichtfeld,
  Wert außerhalb des erlaubten Bereichs, doppelter Textschlüssel, zweiter Rahmen,
  `minFontSize > fontSize` — jeder liefert `422` mit dem erwarteten, camelCase benannten
  Feld.
- `TemplateRepository::format()` gegen eine Beispielzeile mit Text- und Linien-Ebene geprüft:
  rekursive snake→camel-Wandlung stimmt, auch bei verschachtelten Werten wie `points`.
- **Nicht geprüft:** `TemplateValidator` end-to-end über den echten Composer-Autoloader (lokale
  PHP-Version ist 8.3, das Projekt ist auf 8.5 gepinnt — `composer`s Plattform-Prüfung
  blockiert den Autoloader lokal). Die Namens-/Beschreibungslogik ist aber eine wörtliche
  Kopie des bereits produktiven `CardGroupValidator`-Musters, das Risiko liegt darin gering.
  Die eigentliche Neuigkeit dieser Phase — `LayerValidator` — wurde direkt getestet.
- **Nicht geprüft (braucht den Server):** Migration `M006` tatsächlich ausführen, Löschsperre
  gegen echte Datenbank, 5-MB-Upload-Frage aus Phase 2. Das ist der letzte Checklistenpunkt
  oben.
