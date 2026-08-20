# Datenmodell — CardMaker

Alle Tabellen der MySQL-Datenbank, in der Reihenfolge ihrer Migrationen
(`backend/src/Migrations/`). Der Migrationslauf findet die Dateien selbst, sortiert nach
Dateinamen — eine Registrierungsliste gibt es nicht.

Durchgängig: `id` ist `INT UNSIGNED AUTO_INCREMENT`, Zeitstempel sind `DATETIME` und werden
im Anwendungscode gesetzt, Zeichensatz ist `utf8mb4_unicode_ci`, Speicher-Engine InnoDB.

Nach außen werden Spaltennamen zu `camelCase` (`App\Support\WireFormat`) — `card_group_id`
heißt in der API `cardGroupId`.

## `users` (M001)

Genau ein Konto; angelegt vom Einrichtungsaufruf `POST /api/setup`, danach versiegelt.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `email` | VARCHAR(191) | eindeutig |
| `password_hash` | VARCHAR(255) | |
| `created_at` | DATETIME | |

## `sessions` (M002)

Angemeldete Sitzungen. Der Token liegt nur als Hashwert vor (ADR-008).

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `user_id` | INT UNSIGNED | → `users.id`, `ON DELETE CASCADE` |
| `token_hash` | CHAR(64) | eindeutig |
| `expires_at` | DATETIME | Index |
| `created_at` / `last_used_at` | DATETIME / NULL | |

## `personal_access_tokens` (M003)

Zugriffstoken für skripteten Zugriff (MCP). Kein Ablaufdatum, Löschen ist der einzige
Widerruf.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `user_id` | INT UNSIGNED | → `users.id`, `ON DELETE CASCADE` |
| `name` | VARCHAR(191) | Beschriftung |
| `token_hash` | CHAR(64) | eindeutig |
| `created_at` / `last_used_at` | DATETIME / NULL | |

## `card_groups` (M004)

Thematische Zuordnung für Karten. Bewusst ohne `user_id` — Mehrbenutzerbetrieb ist
Nicht-Ziel.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `name` | VARCHAR(191) | Index |
| `description` | TEXT NULL | |
| `created_at` / `updated_at` | DATETIME | |

## `assets` (M005, erweitert in M012)

Der Bildvorrat: Rahmen, Icons und Artwork, ausschließlich PNG, außerhalb des Webbereichs
abgelegt (ADR-015). Artwork ist eine reine Verwaltungsart — es gibt bisher keine Ebene, die
ein Artwork-Bild auf eine Karte zeichnet (ADR-027). Motivbilder von Karten liegen **nicht**
hier, sondern in `card_images` (ADR-017).

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `kind` | ENUM('frame','icon','artwork') | Index |
| `name` | VARCHAR(191) | Anzeigename, wie hochgeladen |
| `file_name` | VARCHAR(191) | selbst erzeugter Ablagename in `backend/uploads/` |
| `mime_type` | VARCHAR(64) | |
| `byte_size` | INT UNSIGNED | |
| `width` / `height` | INT UNSIGNED | Originalmaße |
| `created_at` / `updated_at` | DATETIME | |

## `templates` (M006)

Das Layout einer Karte. Die Ebenenliste liegt als ein Datenblock in `layers` statt in einer
Ebenentabelle (ADR-014); geprüft wird sie vollständig von `LayerValidator`.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `name` | VARCHAR(191) | Index |
| `description` | TEXT NULL | |
| `layers` | JSON | Array der Ebenen, Index 0 zuunterst = Zeichenreihenfolge |
| `preview_file_name` | VARCHAR(191) NULL | Zufallsname des Vorschaubilds (M010, ADR-021) |
| `preview_updated_at` | DATETIME NULL | `null` = es gibt noch kein Vorschaubild |
| `created_at` / `updated_at` | DATETIME | |

## `fonts` (M007)

Hochgeladene Schriftdateien. Der CSS-Name (`cmfont-<id>`) steht absichtlich nicht in der
Tabelle, er ergibt sich aus der Kennung (ADR-019).

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `name` | VARCHAR(191) | Beschriftung |
| `format` | VARCHAR(8) | `ttf` oder `woff2` |
| `file_name` | VARCHAR(255) | selbst erzeugter Ablagename |
| `byte_size` | INT UNSIGNED | |
| `created_at` / `updated_at` | DATETIME | |

## `cards` (M008)

Eine Karteninstanz: welches Template, welche Texte, welche Icon-Wahl, welche Abweichungen.
Nie ein fertiges Bild — die Karte bleibt jederzeit neu renderbar (`AGENTS.md`, Regel 1).
Die drei Sammlungen liegen als Datenblöcke an der Karte statt in Nebentabellen (ADR-020).

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `name` | VARCHAR(191) | Index |
| `template_id` | INT UNSIGNED | → `templates.id`, `ON DELETE RESTRICT` |
| `card_group_id` | INT UNSIGNED NULL | → `card_groups.id`, `ON DELETE SET NULL` |
| `values` | JSON | Feldschlüssel → Text |
| `icon_choices` | JSON | Ebenen-Id → `assets.id` |
| `text_overrides` | JSON | Feldschlüssel → `{font_size?, color?, bold?, italic?}` |
| `preview_file_name` | VARCHAR(191) NULL | Zufallsname des Vorschaubilds (M010, ADR-021) |
| `preview_updated_at` | DATETIME NULL | `null` = es gibt noch kein Vorschaubild |
| `created_at` / `updated_at` | DATETIME | |

Zu den Fremdschlüsseln: `RESTRICT` beim Template ist Absicht — ein Template mit Karten darf
nicht verschwinden, sonst sind die Karten nicht mehr renderbar. Bei der Kartengruppe dagegen
`SET NULL`, weil sie nur eine Zuordnung ist und kein Teil des Karteninhalts.

⚠️ `values` ist in MySQL ein reserviertes Wort — in jedem SQL mit Backticks schreiben.

Die Datenbank prüft an den drei JSON-Blöcken nichts. Verwaiste Werte (Feldschlüssel, den es
im Template nicht mehr gibt) bleiben stehen und werden nicht gezeichnet.

## `card_images` (M009)

Das Motivbild einer Karte, je Bildebene höchstens eines. Getrennt vom Bildvorrat, weil es
Einmal-Inhalt ist und mit der Karte verschwindet (ADR-017). Ablage in
`backend/uploads/cards/`, ausgeliefert über `GET /api/cards/{id}/images/{layerId}/file`.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `card_id` | INT UNSIGNED | → `cards.id`, `ON DELETE CASCADE` |
| `layer_id` | VARCHAR(64) | Id der Bildebene im Template-Datenblock |
| `file_name` | VARCHAR(191) | Zufallsname, wie beim Bildvorrat |
| `mime_type` | VARCHAR(64) | |
| `byte_size` | INT UNSIGNED | |
| `width` / `height` | INT UNSIGNED | Originalmaße der hochgeladenen Datei |
| `offset_x` / `offset_y` | DECIMAL(8,2), Standard 0 | Verschiebung in Canvas-Einheiten |
| `scale` | DECIMAL(6,3), Standard 1 | 1 = Bild füllt die kürzere Seite der Fläche |
| `created_at` / `updated_at` | DATETIME | |

Eindeutiger Schlüssel auf (`card_id`, `layer_id`).

Gespeichert wird immer die Originaldatei, nie ein beschnittenes Bild — der Ausschnitt ergibt
sich aus Verschiebung und Maßstab (ADR-018). `layer_id` zeigt in einen JSON-Block und ist
deshalb nicht per Fremdschlüssel absicherbar; verschwindet die Ebene aus dem Template, bleibt
die Zeile stehen und wird nicht gezeichnet.

## `print_projects` (M011)

Das Druckprojekt — der Warenkorb, in dem Karten fürs Drucken gesammelt werden. Die Tabelle
trägt **genau eine Zeile**; die App kennt nur ein Druckprojekt (ADR-024). Die Zeile entsteht
beim ersten Zugriff, kein Setup-Schritt legt sie an.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `cut_marks` | TINYINT(1), Standard 1 | Schnittmarken drucken |
| `bleed` | TINYINT(1), Standard 0 | Karten 2 mm größer drucken (Beschnitt) |
| `created_at` / `updated_at` | DATETIME | |

## `print_project_items` (M011)

Eine Position im Druckprojekt: welche Karte, wie viele Exemplare.

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT UNSIGNED | Primärschlüssel |
| `print_project_id` | INT UNSIGNED | → `print_projects.id`, `ON DELETE CASCADE` |
| `card_id` | INT UNSIGNED | → `cards.id`, `ON DELETE CASCADE` |
| `quantity` | SMALLINT UNSIGNED, Standard 1 | 1–99, geprüft im Validator |
| `sort_order` | INT, Standard 0 | Reihenfolge in der Positionsliste |
| `created_at` / `updated_at` | DATETIME | |

Eindeutiger Schlüssel auf (`print_project_id`, `card_id`): Eine Karte steht höchstens einmal
im Projekt — mehrere Exemplare zählt `quantity`, nicht mehrere Zeilen. Sonst würde derselbe
Kartenentwurf beim Export mehrfach gezeichnet.

Wird eine Karte gelöscht, verschwindet ihre Position im Druckprojekt mit.
