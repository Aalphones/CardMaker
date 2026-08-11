# Phase 1 — Ablage im Backend

Eine Schriftdatei kommt an, wird geprüft, landet auf der Platte und in der Datenbank. Nur
Backend, noch nichts sichtbar.

## Vorher lesen

- `README.md` dieses Plans — vor allem „Die zwei Entscheidungen" und die Kontrakt-Tabelle
- `backend/src/Services/AssetService.php` — **das Vorbild**: Prüfen, Ablegen, Löschschutz.
  Diese Phase ist zu großen Teilen dasselbe Muster mit anderer Dateiart
- `backend/src/Validators/AssetValidator.php`, `backend/src/Controllers/AssetController.php`,
  `backend/src/Repositories/AssetRepository.php` — dieselben drei Rollen entstehen für Schriften
- `backend/src/Migrations/M005CreateAssets.php` — Vorlage für die neue Migration
- `backend/public/index.php` (Routen-Abschnitt um Zeile 187) — dort kommen die vier neuen Wege dazu
- `docs/conventions/php.md`, `docs/decisions/015-bildablage-und-dateiformate.md`

## Abnahmekriterien

- `POST /api/fonts` mit einer echten `.woff2`/`.ttf`/`.otf` legt Datei und Datensatz an und
  antwortet mit dem Eintrag inklusive `family` = `cmfont-<id>`.
- Eine Datei, deren erste vier Bytes keiner der erlaubten Schriftarten entsprechen, wird mit
  422 und klarer Meldung abgelehnt — **auch** wenn die Dateiendung stimmt.
- Eine Datei über 2 MB wird mit 422 abgelehnt.
- `GET /api/fonts/{id}/file` liefert die Datei mit passendem Inhaltstyp, nur angemeldet.
- `DELETE` auf eine Schrift, die in einem Template benutzt wird, antwortet 409 mit dem
  Templatenamen in der Meldung.
- Ohne Anmeldung liefert jeder der Wege 401.

## Checkliste

- [x] Migration `M007CreateFonts.php`: Tabelle `fonts` mit `id`, `name` (VARCHAR 191),
      `format` (VARCHAR 8), `file_name` (VARCHAR 255), `byte_size` (INT), `created_at`.
      Kein Fremdschlüssel auf Nutzer — die Bildablage kennt auch keinen (gemeinsamer Vorrat).
- [x] `FontRepository.php` nach dem Muster von `AssetRepository` — inklusive `format()`, das
      `family` als `'cmfont-' . $id` **berechnet** und mit ausgibt (steht nicht in der Tabelle;
      es gibt keine zweite Wahrheit über den Namen).
- [x] `FontValidator.php`: `name` 1–191 Zeichen. Die Dateiprüfung gehört **nicht** hierher,
      sondern in den Service (sie liest die Datei).
- [x] `FontService.php` nach dem Muster von `AssetService`:
      - erlaubte Dateien über die ersten vier Bytes bestimmen — `wOF2` → `woff2`,
        `\x00\x01\x00\x00` oder `true` → `ttf`, `OTTO` → `otf`. Kein Treffer → Ablehnung.
        Die Dateiendung wird nur für die Fehlermeldung benutzt, nie zur Entscheidung.
      - Obergrenze 2 MB als Konstante `MAX_BYTES` im Service.
      - Ablage in `backend/uploads/fonts/` (Ordner beim ersten Hochladen anlegen),
        Dateiname `<id>.<format>` — nie der vom Nutzer gelieferte Name.
      - `delete()` mit Löschschutz analog `AssetService::isUsedByTemplate()`, nur sucht es
        `cmfont-<id>` im Feld `font_family` der Ebenen statt einer Bildnummer.
- [x] `FontController.php`: `index`, `create`, `file`, `update`, `destroy` — dünn, wie
      `AssetController`.
- [x] Die fünf Routen in `backend/public/index.php` eintragen, im selben Abschnitt wie
      `/api/assets`, hinter der Anmelde-Middleware.
- [x] `backend/uploads/fonts/` von Git und vom Hochlade-Skript ausnehmen — geprüft: die
      bestehenden Regeln decken es ab (`.gitignore` sperrt `backend/uploads/*`, `deploy.cmd`
      nimmt `uploads/` per Dateimaske vom Abgleich aus). Nichts zu ändern.
- [x] Doku: `docs/code-map.md` (Feature-Zeile `fonts` + Ablageordner). `docs/models.md` und
      `docs/routes.md` gibt es in diesem Projekt nicht — nicht für eine Tabelle neu erfunden.

## Bericht

**Status: fertig.**

Neu: `M007CreateFonts.php`, `FontRepository.php`, `FontValidator.php`, `FontService.php`,
`FontUploadException.php`, `FontController.php`. Geändert: `backend/public/index.php`
(Verdrahtung + fünf Routen), `TemplateRepository::allLayerBlobsWithName()` für die
Löschsperre mit Templatenamen, `docs/code-map.md`.

Abweichungen vom Vorbild `assets`:

- **Zu groß ist 422, nicht 413.** Die Bildablage antwortet auf eine zu große Datei mit 413;
  die Abnahmekriterien dieser Phase verlangen für Schriften ausdrücklich 422. Der Plan
  gewinnt, aber die beiden Wege beantworten denselben Fall damit unterschiedlich.
- **Zweistufiges Ablegen.** Der Ablagename ist `<Kennung>.<Format>`, die Kennung vergibt aber
  erst die Datenbank. Deshalb erst der Datensatz (ohne Ablagename), dann die Datei, dann der
  Name nach. Scheitert einer der Schritte, wird beides wieder entfernt — ein Eintrag ohne
  Datei wäre eine Schrift, die in der Liste steht und beim Laden still scheitert.
- **Sammlungen (`ttcf`) sind nicht erlaubt** — sie enthalten mehrere Schriften und wären im
  Browser nicht eindeutig ladbar.

Nicht geprüft: kein Lauf gegen eine echte Datenbank oder einen echten Upload — nur die
PHP-Syntaxprüfung ist durch. Die Wege sind erstmals in Phase 4 an der Oberfläche zu sehen.
