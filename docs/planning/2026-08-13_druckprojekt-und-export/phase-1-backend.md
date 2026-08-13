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

- [ ] `backend/src/Migrations/M011CreatePrintProject.php`:
  - Tabelle `print_projects`: `id`, `cut_marks TINYINT(1) NOT NULL DEFAULT 1`,
    `bleed TINYINT(1) NOT NULL DEFAULT 0`, `created_at`, `updated_at`. Kommentar im Kopf:
    genau eine Zeile, weil es genau ein Druckprojekt gibt (ADR-024) — die Tabelle existiert,
    damit später mehrere möglich sind, ohne die Ablage umzubauen.
  - Tabelle `print_project_items`: `id`, `print_project_id INT UNSIGNED` →
    `print_projects.id` `ON DELETE CASCADE`, `card_id INT UNSIGNED` → `cards.id`
    `ON DELETE CASCADE`, `quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1`,
    `sort_order INT NOT NULL DEFAULT 0`, `created_at`, `updated_at`,
    `UNIQUE KEY uq_print_project_items_card (print_project_id, card_id)`.
- [ ] `backend/src/Repositories/PrintProjectRepository.php` — `findOrCreateProject()` (legt die
      eine Zeile beim ersten Zugriff an), `updateOptions()`, `listItems()` (Verbund mit `cards`
      für `name` und `preview_updated_at`, sortiert nach `sort_order, id`), `findItemByCard()`,
      `insertItem()`, `updateQuantity()`, `deleteItem()`, `deleteAllItems()`.
- [ ] `backend/src/Validators/PrintProjectValidator.php` — `validateOptions()` (beide Felder
      Pflicht, Wahrheitswerte), `validateNewItem()` (`cardId` Pflicht, ganze Zahl > 0;
      `quantity` optional, 1–99), `validateQuantity()` (Pflicht, 1–99).
- [ ] `backend/src/Services/PrintProjectService.php` — `get()`, `setOptions()`, `addItem()`
      (vorhandene Position → Anzahl +1, gedeckelt bei 99; Rückgabe zusätzlich, ob sie neu war),
      `setQuantity()`, `removeItem()`, `clear()`. Prüft, dass die `cardId` existiert — sonst
      Fehler `422` mit `fields.cardId`.
- [ ] `backend/src/Controllers/PrintProjectController.php` — dünn, wie `CardGroupController`;
      `addItem` gibt 201 oder 200 je nach Rückmeldung des Service.
- [ ] Routen in `backend/public/index.php` registrieren (Reihenfolge beachten:
      `DELETE /api/print-project/items` vor `DELETE /api/print-project/items/{id}`).
- [ ] `docs/models.md`: zwei Tabellen-Abschnitte ergänzen (Muster der bestehenden).
- [ ] `docs/routes.md`: Abschnitt „Druckprojekt (`/api/print-project`)" ergänzen.
- [ ] `docs/decisions/024-ein-druckprojekt-statt-vieler.md` schreiben: Kontext (Konzept sagt
      „Druckprojekte", Design zeigt einen Warenkorb), betrachtete Optionen (mehrere benannte
      Projekte / ein Warenkorb im Backend / Warenkorb nur im Browser), Entscheidung, Folgen
      (die Ablage trägt schon einen Projekt-Schlüssel, eine spätere Erweiterung kostet nur
      Oberfläche).

## Report-Back

_(beim Abschluss der Phase füllen)_
