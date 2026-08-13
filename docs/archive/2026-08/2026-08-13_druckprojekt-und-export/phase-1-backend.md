# Phase 1 — Backend: Druckprojekt speichern

Rating: **standard**

## Kontext (vorher lesen)

- `docs/conventions/php.md` — Schichten, Wire-Format, Fehlerantworten
- `backend/src/Controllers/CardGroupController.php` + `Services/CardGroupService.php` +
  `Repositories/CardGroupRepository.php` + `Validators/CardGroupValidator.php` — das Muster,
  dem diese Phase 1:1 folgt
- `backend/src/Migrations/M009CreateCardImages.php` — Muster für eine Migration mit
  Fremdschlüssel
- `backend/public/index.php` — Routen-Registrierung
- `docs/models.md`, `docs/routes.md` — nachzuziehen

## Abnahmekriterien

- Migration `M011CreatePrintProject` legt zwei Tabellen an, der Migrationslauf über
  `POST /api/migrate` geht durch.
- Alle sechs Endpunkte aus der Kontrakt-Sektion der README antworten wie dort beschrieben.
- Wird eine Karte gelöscht, verschwindet ihre Position im Druckprojekt mit
  (`ON DELETE CASCADE`).
- `POST /api/print-project/items` mit einer schon enthaltenen `cardId` erhöht die Anzahl und
  antwortet mit 200; eine neue Karte kommt mit 201.
- `GET /api/print-project` liefert auch dann eine gültige Antwort, wenn noch nie etwas
  gespeichert wurde (leere Positionsliste, Optionen `cutMarks: true`, `bleed: false`).

## Checkliste

- [x] `backend/src/Migrations/M011CreatePrintProject.php`:
  - Tabelle `print_projects`: `id`, `cut_marks TINYINT(1) NOT NULL DEFAULT 1`,
    `bleed TINYINT(1) NOT NULL DEFAULT 0`, `created_at`, `updated_at`. Kommentar im Kopf:
    genau eine Zeile, weil es genau ein Druckprojekt gibt (ADR-024) — die Tabelle existiert,
    damit später mehrere möglich sind, ohne die Ablage umzubauen.
  - Tabelle `print_project_items`: `id`, `print_project_id INT UNSIGNED` →
    `print_projects.id` `ON DELETE CASCADE`, `card_id INT UNSIGNED` → `cards.id`
    `ON DELETE CASCADE`, `quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1`,
    `sort_order INT NOT NULL DEFAULT 0`, `created_at`, `updated_at`,
    `UNIQUE KEY uq_print_project_items_card (print_project_id, card_id)`.
- [x] `backend/src/Repositories/PrintProjectRepository.php` — `findOrCreateProject()` (legt die
      eine Zeile beim ersten Zugriff an), `updateOptions()`, `listItems()` (Verbund mit `cards`
      für `name` und `preview_updated_at`, sortiert nach `sort_order, id`), `findItemByCard()`,
      `insertItem()`, `updateQuantity()`, `deleteItem()`, `deleteAllItems()`.
- [x] `backend/src/Validators/PrintProjectValidator.php` — `validateOptions()` (beide Felder
      Pflicht, Wahrheitswerte), `validateNewItem()` (`cardId` Pflicht, ganze Zahl > 0;
      `quantity` optional, 1–99), `validateQuantity()` (Pflicht, 1–99).
- [x] `backend/src/Services/PrintProjectService.php` — `get()`, `setOptions()`, `addItem()`
      (vorhandene Position → Anzahl +1, gedeckelt bei 99; Rückgabe zusätzlich, ob sie neu war),
      `setQuantity()`, `removeItem()`, `clear()`. Prüft, dass die `cardId` existiert — sonst
      Fehler `422` mit `fields.cardId`.
- [x] `backend/src/Controllers/PrintProjectController.php` — dünn, wie `CardGroupController`;
      `addItem` gibt 201 oder 200 je nach Rückmeldung des Service.
- [x] Routen in `backend/public/index.php` registrieren (Reihenfolge beachten:
      `DELETE /api/print-project/items` vor `DELETE /api/print-project/items/{id}`).
- [x] `docs/models.md`: zwei Tabellen-Abschnitte ergänzen (Muster der bestehenden).
- [x] `docs/routes.md`: Abschnitt „Druckprojekt (`/api/print-project`)" ergänzen.
- [x] `docs/decisions/024-ein-druckprojekt-statt-vieler.md` schreiben: Kontext (Konzept sagt
      „Druckprojekte", Design zeigt einen Warenkorb), betrachtete Optionen (mehrere benannte
      Projekte / ein Warenkorb im Backend / Warenkorb nur im Browser), Entscheidung, Folgen
      (die Ablage trägt schon einen Projekt-Schlüssel, eine spätere Erweiterung kostet nur
      Oberfläche).

## Report-Back

**Status: complete (2026-08-13).**

Gebaut wie geplant, ohne Abweichung vom Kontrakt. Zwei Punkte, die der Plan offen ließ:

- Die `sort_order` einer neuen Position ist `MAX(sort_order) + 1` innerhalb des Projekts,
  vergeben in derselben Anweisung wie das Einfügen — keine Vorab-Abfrage.
- Beim „schon drin → +1" wird die Anzahl bei 99 **gedeckelt** statt abgewiesen. Der Validator
  weist nur ab, wenn eine Anzahl außerhalb 1–99 ausdrücklich gesetzt wird.

**Nicht geprüft:** Migrationslauf und die sechs Endpunkte konnten lokal nicht laufen — das
örtliche PHP ist 8.3, `vendor/` ist gegen 8.5 gebaut (`composer.json` → platform), und das
Backend lebt auf Strato. Belegt ist nur die Syntax: `php -l` über alle berührten Dateien,
sauber. Der erste echte Beleg ist der nächste Deploy mit `POST /api/migrate`.
