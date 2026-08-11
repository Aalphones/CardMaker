# Phase 1 — Entscheidungen und Datenmodell

**Rating:** heikel (legt Tabellen und Kontrakt für alle Folgephasen fest)

## Kontext — vorher lesen

- `README.md` dieses Plans — der Kontrakt ist verbindlich
- `docs/PROJECT.md` — Meilensteine, offene Frage zum Bildzuschnitt
- `docs/glossary.md` — Begriffe Template / Karteninstanz / Kartengruppe
- `docs/decisions/014-template-layout-als-datenblock.md` — Vorbild für „JSON statt
  eigener Tabelle"
- `docs/decisions/015-bildablage-und-dateiformate.md` — heutige Regeln für den Bildvorrat
- `backend/src/Migrations/M006CreateTemplates.php` — Aufbau einer Migration
- `backend/src/Validators/LayerValidator.php` — Vorbild für die Prüfung eines JSON-Blocks

## Abnahmekriterien

- Zwei Migrationen liegen vor und laufen lokal durch: `M007CreateCards`,
  `M008CreateCardImages`.
- Drei ADRs sind geschrieben: 017 (Ablage der Kartenbilder), 018 (Bildausschnitt in der
  Vorschau), 019 (Karteninhalt als Datenblock).
- `docs/models.md` beschreibt beide Tabellen vollständig.
- Kein Anwendungscode in dieser Phase — nur Schema, Entscheidungen, Doku.

## Tabellen

**`cards`** (`M007CreateCards`)

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primärschlüssel |
| `name` | VARCHAR(191) NOT NULL | Index |
| `template_id` | INT NOT NULL | Fremdschlüssel auf `templates`, `ON DELETE RESTRICT` |
| `card_group_id` | INT NULL | Fremdschlüssel auf `card_groups`, `ON DELETE SET NULL` |
| `values` | JSON NOT NULL | Feldschlüssel → Text |
| `icon_choices` | JSON NOT NULL | Ebenen-Id → Asset-Id |
| `text_overrides` | JSON NOT NULL | Feldschlüssel → `{font_size?, color?, bold?, italic?}` (zu den letzten beiden siehe README, Hinweis unter der Endpunkt-Tabelle) |
| `created_at` / `updated_at` | DATETIME | wie im Bestand |

`ON DELETE RESTRICT` beim Template ist Absicht: ein Template mit Karten darf nicht
verschwinden, sonst sind die Karten nicht mehr renderbar (`AGENTS.md`, Regel 1).
`SET NULL` bei der Gruppe ebenso: eine Gruppe ist nur eine Zuordnung, keine Klammer um
den Karteninhalt.

⚠️ `values` ist in MySQL ein reserviertes Wort — in jedem SQL mit Backticks schreiben.

**`card_images`** (`M008CreateCardImages`)

| Spalte | Typ | Anmerkung |
|---|---|---|
| `id` | INT AUTO_INCREMENT | |
| `card_id` | INT NOT NULL | Fremdschlüssel auf `cards`, `ON DELETE CASCADE` |
| `layer_id` | VARCHAR(64) NOT NULL | Id der Bildebene im Template |
| `file_name` | VARCHAR(191) NOT NULL | Zufallsname, wie beim Bildvorrat |
| `mime_type` | VARCHAR(64) NOT NULL | |
| `byte_size` | INT NOT NULL | |
| `width` / `height` | INT NOT NULL | Originalmaße |
| `offset_x` / `offset_y` | DECIMAL(8,2) NOT NULL DEFAULT 0 | Canvas-Einheiten |
| `scale` | DECIMAL(6,3) NOT NULL DEFAULT 1 | |
| `created_at` / `updated_at` | DATETIME | |

Eindeutiger Schlüssel auf (`card_id`, `layer_id`) — je Bildfläche höchstens ein Bild.

## Checkliste

- [ ] `backend/src/Migrations/M007CreateCards.php` nach dem Muster von `M006` anlegen.
- [ ] `backend/src/Migrations/M008CreateCardImages.php` anlegen.
- [ ] Beide Migrationen lokal ausführen (`POST /api/migrate`) und das Ergebnis in
      phpMyAdmin gegenlesen.
- [ ] `docs/decisions/017-kartenbilder-eigene-ablage.md`:
      Kontext (Kartenbilder sind Einmal-Inhalt, Rahmen und Icons sind wiederverwendbares
      Layout-Material) · Optionen (in den Bildvorrat `assets` mit aufnehmen / eigene
      Tabelle plus eigener Ordner) · Entscheidung (eigene Tabelle `card_images`, Ablage
      in `backend/uploads/cards/`, Löschen zusammen mit der Karte) · Folgen (der
      Bildvorrat bleibt überschaubar, dafür zwei Upload-Wege im Backend — bewusst in Kauf
      genommen).
- [ ] `docs/decisions/018-bildausschnitt-in-der-vorschau.md`:
      Kontext (offene Frage aus `docs/PROJECT.md`) · Optionen (eigener
      Zuschneide-Dialog / Zahlenfelder im Formular / Ziehen und Zoomen direkt in der
      Vorschau) · Entscheidung (direkt in der Vorschau, Technik wie beim Verschieben von
      Ebenen aus Meilenstein 2) · Folgen (kein zweiter Bildschirm, aber die Vorschau
      bekommt einen Bearbeitungszustand; das Bild wird nie beschnitten gespeichert,
      sondern immer im Original mit Verschiebung und Maßstab).
- [ ] `docs/decisions/019-karteninhalt-als-datenblock.md`:
      Werte, Icon-Wahl und Abweichungen liegen als JSON-Blöcke an der Karte statt in
      eigenen Tabellen — dieselbe Begründung wie ADR-014, geprüft wird im PHP-Prüfer.
- [ ] `docs/models.md` um beide Tabellen ergänzen (existiert die Datei nicht, hier
      anlegen — sie gehört laut Doku-Struktur ohnehin ins Projekt).
- [ ] `docs/PROJECT.md`: die offene Frage zum Bildzuschnitt entfernen und durch den
      Verweis auf ADR-018 ersetzen.
- [ ] `docs/glossary.md`: Begriffe „Kartenbild", „Feldschlüssel", „Abweichung"
      (Override) aufnehmen, falls noch nicht vorhanden.

## Report-Back
