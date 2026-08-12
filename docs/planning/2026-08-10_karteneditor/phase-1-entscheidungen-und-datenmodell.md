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

- Zwei Migrationen liegen vor und laufen durch: `M008CreateCards`, `M009CreateCardImages`.
- Drei ADRs sind geschrieben: 017 (Ablage der Kartenbilder), 018 (Bildausschnitt in der
  Vorschau), 020 (Karteninhalt als Datenblock).

> **Nummern verschoben (2026-08-12).** Der Plan entstand vor dem Schriften-Plan, der
> inzwischen `M007CreateFonts` und ADR-019 belegt hat. Die Migrationen heißen deshalb
> `M008`/`M009` statt `M007`/`M008`, der Datenblock-ADR trägt die 020 statt der 019.
> Inhaltlich ändert das nichts.
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

- [x] `backend/src/Migrations/M008CreateCards.php` nach dem Muster von `M006` anlegen.
- [x] `backend/src/Migrations/M009CreateCardImages.php` anlegen.
- [ ] Beide Migrationen ausführen (`POST /api/migrate`) und das Ergebnis in
      phpMyAdmin gegenlesen. **Offen — braucht Sascha:** es gibt keine lokale MySQL-Instanz
      auf diesem Rechner, der Lauf geht nur über `deploy.cmd` gegen den Strato-Server. Das
      ist ein Deploy auf die echte Anwendung und wird nicht ungefragt angestoßen.
- [x] `docs/decisions/017-kartenbilder-eigene-ablage.md`:
      Kontext (Kartenbilder sind Einmal-Inhalt, Rahmen und Icons sind wiederverwendbares
      Layout-Material) · Optionen (in den Bildvorrat `assets` mit aufnehmen / eigene
      Tabelle plus eigener Ordner) · Entscheidung (eigene Tabelle `card_images`, Ablage
      in `backend/uploads/cards/`, Löschen zusammen mit der Karte) · Folgen (der
      Bildvorrat bleibt überschaubar, dafür zwei Upload-Wege im Backend — bewusst in Kauf
      genommen).
- [x] `docs/decisions/018-bildausschnitt-in-der-vorschau.md`:
      Kontext (offene Frage aus `docs/PROJECT.md`) · Optionen (eigener
      Zuschneide-Dialog / Zahlenfelder im Formular / Ziehen und Zoomen direkt in der
      Vorschau) · Entscheidung (direkt in der Vorschau, Technik wie beim Verschieben von
      Ebenen aus Meilenstein 2) · Folgen (kein zweiter Bildschirm, aber die Vorschau
      bekommt einen Bearbeitungszustand; das Bild wird nie beschnitten gespeichert,
      sondern immer im Original mit Verschiebung und Maßstab).
- [x] `docs/decisions/020-karteninhalt-als-datenblock.md`:
      Werte, Icon-Wahl und Abweichungen liegen als JSON-Blöcke an der Karte statt in
      eigenen Tabellen — dieselbe Begründung wie ADR-014, geprüft wird im PHP-Prüfer.
- [x] `docs/models.md` angelegt — mit **allen** Tabellen, nicht nur den zwei neuen. Eine
      Datei namens „Datenmodell", die sieben von neun Tabellen verschweigt, wäre schlimmer
      als keine.
- [x] `docs/PROJECT.md`: die offene Frage zum Bildzuschnitt entfernt, Verweis auf ADR-018.
- [x] `docs/glossary.md`: „Kartenbild" und „Abweichung" ergänzt. „Feldschlüssel" stand
      bereits drin.
- [x] `docs/decisions/README.md`: 017, 018, 020 in die Tabelle eingetragen.
- [x] `AGENTS.md`: Zeiger auf `docs/models.md` im Abschnitt „Wo du mehr findest".

## Report-Back

**Stand: fertig bis auf den Migrationslauf.** Beide Migrationsdateien sind angelegt und
syntaktisch geprüft (`php -l`); der `MigrationRunner` findet sie von selbst über den
Dateinamen, es gibt keine Registrierungsliste zu pflegen. Kein Anwendungscode, wie im Plan
vorgesehen.

Abweichungen vom Plan:

- Nummern verschoben (siehe Kasten oben): `M008`/`M009`, ADR-020.
- Die Schlüsselspalten sind `INT UNSIGNED` statt `INT` wie in der Plantabelle. Ein
  Fremdschlüssel muss im Typ zur Zielspalte passen, und der ganze Bestand nutzt
  `INT UNSIGNED` — mit `INT` wäre die Migration am Fremdschlüssel gescheitert.
- `docs/models.md` deckt alle Tabellen ab, nicht nur die zwei neuen.

Offen: `POST /api/migrate`. Auf diesem Rechner gibt es kein MySQL (PHP 8.3 ist da, `mysql`
nicht), der Lauf geht nur über `deploy.cmd` gegen Strato — also gegen die echte Anwendung.
Braucht Saschas Freigabe, siehe Checkliste.
