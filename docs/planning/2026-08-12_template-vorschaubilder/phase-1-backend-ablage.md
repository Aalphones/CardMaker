# Phase 1 — Ablage und Endpunkte im Backend

**Rating:** standard · **Status:** complete

Das Backend bekommt einen Platz für das Vorschaubild — für **Templates und Karten**: je zwei
Spalten, je ein Ablageordner, je ein Endpunkt zum Hochladen und einer zum Ausliefern. Das
Prüfen und Ablegen der Datei steckt in **einem** gemeinsamen Baustein, den beide Dienste
benutzen; nur das Schreiben in die jeweilige Tabelle unterscheidet sich.

## Kontext — was vorher zu lesen ist

- `docs/planning/2026-08-12_template-vorschaubilder/README.md` — der Kontrakt, verbindlich.
- `backend/src/Services/CardImageService.php` — **die Vorlage.** Prüfung der Datei (`finfo` +
  `getimagesize`), selbst erzeugter Dateiname, Aufräumen bei Fehlschlag, `removeFile()`.
  Der neue Dienst ist die abgespeckte Fassung davon: ein Bild pro Template, kein `layer_id`,
  nur PNG.
- `backend/src/Controllers/CardImageController.php` — Muster für Upload-Endpunkt
  (`$this->request->files()['file']`, `missingFileReason()`) und Datei-Ausgabe (`Response::file`).
- `backend/src/Repositories/TemplateRepository.php` — `allSummaries()` (Zeile 20),
  `formatSummary()` (Zeile 190), `format()` (Zeile 208), `COLUMNS`.
- `backend/src/Repositories/CardRepository.php` — die entsprechenden Stellen dort.
- `backend/src/Services/TemplateService.php` — `delete()` muss die Bilddatei mitnehmen.
- `backend/src/Services/CardService.php` — `delete()` und `duplicate()` ebenso; wie
  `CardImageService::duplicateForCard()` beim Duplizieren aufgerufen wird, ist dort das Muster.
- `backend/src/Migrations/M009CreateCardImages.php` — Stil einer Migration (Kommentar oben,
  `$pdo->exec` mit zusammengesetztem SQL). Migrationen werden per Verzeichnis-Scan gefunden
  (`MigrationRunner`), es gibt keine Registrierungsliste.
- `backend/public/index.php` — Zeilen 165–190 (Dienste bauen), 234–260 (Routen),
  290–300 (Controller-Bauplan).
- `docs/conventions/php.md`, `docs/decisions/017-kartenbilder-eigene-ablage.md`.

## Abnahmekriterien

Gelten jeweils für **beide** Sorten (`templates` und `cards`):

1. `POST /api/<sorte>/{id}/preview` nimmt ein PNG entgegen, legt es unter
   `backend/uploads/previews/<sorte>/` ab und antwortet `201 { previewUpdatedAt }`.
2. Ein zweiter Upload für denselben Datensatz ersetzt das Bild und löscht die alte Datei.
3. `GET /api/<sorte>/{id}/preview/file` liefert die Datei mit `Content-Type: image/png`,
   `404` wenn keine da ist.
4. Etwas anderes als PNG (JPEG, kaputte Datei, zu groß) wird mit `422` abgewiesen, ohne dass
   eine Datei liegen bleibt.
5. `GET /api/<sorte>` und `GET /api/<sorte>/{id}` tragen `previewUpdatedAt` (ISO oder `null`).
6. `DELETE /api/<sorte>/{id}` entfernt auch die Bilddatei.
7. `POST /api/cards/{id}/duplicate` kopiert das Vorschaubild unter neuem Dateinamen mit; die
   Kopie zeigt dasselbe Bild wie das Original.
8. Die Prüf- und Ablegelogik steht **einmal** im Code, nicht zweimal.
9. `php -l` läuft über alle geänderten Dateien fehlerfrei.

## Checkliste

### Datenbank

- [x] `backend/src/Migrations/M010AddPreviewImages.php` anlegen: zwei `ALTER TABLE`-Befehle,
      einer für `templates`, einer für `cards`, je
      `ADD COLUMN preview_file_name VARCHAR(191) NULL, ADD COLUMN preview_updated_at DATETIME NULL`.
      Kopfkommentar wie in `M009`: warum das Bild als Datei neben der Zeile liegt und nicht
      als Datenblock in der Spalte (Verweis auf ADR-021).

### Repositories (gleiche Änderung zweimal — `TemplateRepository` und `CardRepository`)

- [x] `COLUMNS` um `preview_file_name`, `preview_updated_at` erweitern.
- [x] Die Listen-Abfrage (`allSummaries()` bzw. das Gegenstück in `CardRepository`):
      `preview_updated_at` mit in die `SELECT`-Liste. **`preview_file_name` bleibt der Liste
      fern** — der Dateiname wird beim Auflisten nicht gebraucht.
- [x] `formatSummary()` und `format()`: `previewUpdatedAt` ergänzen
      (`Timestamps::toIso()` wie bei `updatedAt`, `null` bleibt `null`).
      **`previewFileName` gehört nicht in die Antwort** — der Dateiname ist innere Ablage.
- [x] Neu: `findPreviewFileName(int $id): ?string` — `null`, wenn Datensatz fehlt oder kein
      Bild gesetzt ist.
- [x] Neu: `updatePreview(int $id, string $fileName): ?string` — setzt beide Spalten
      (`preview_updated_at` auf jetzt, wie die anderen Zeitstempel im Repository gesetzt
      werden) und liefert den neuen Zeitstempel als ISO-Text zurück, oder `null` bei
      unbekanntem Datensatz.
- [x] Neu: `clearPreview(int $id): void` — beide Spalten auf `NULL`.

### Gemeinsamer Ablage-Baustein

- [x] `backend/src/Services/PreviewImageStorage.php` — kennt **keine** Tabelle, nur den
      Ordner. Konstruktor `(string $directory, LoggerInterface $logger)`. Methoden:
      - `accept(array $file): string` — Prüfkette wie `CardImageService::upload()` +
        `readImage()`, aber **nur** `image/png` erlaubt: Upload-Fehlercode, `is_uploaded_file`,
        Größe gegen `UPLOAD_MAX_BYTES` (Voreinstellung 8 MB, Helfer `maxBytes()` von dort
        übernehmen), `finfo` **und** `getimagesize()`, Maße > 0. Legt die Datei unter einem
        selbst erzeugten Namen (`bin2hex(random_bytes(16)) . '.png'`) ab und gibt den Namen
        zurück. Wirft `PreviewImageUploadException`.
      - `locate(?string $fileName): ?array` — `['path' => …, 'mimeType' => 'image/png']`,
        `null` wenn kein Name oder die Datei fehlt. `basename()` als Rückversicherung wie in
        `CardImageService::absolutePath()`.
      - `remove(?string $fileName): void` — löscht, wenn vorhanden; ein Rest, der sich nicht
        löschen lässt, wird nur protokolliert (Muster `CardImageService::removeFile()`).
      - `copy(string $fileName): ?string` — kopiert unter neuem Namen, für das Duplizieren
        einer Karte; `null`, wenn die Quelldatei fehlt.
      - private `ensureDirectory()`.
- [x] `backend/src/Services/PreviewImageUploadException.php` — analog zu
      `CardImageUploadException`, Gründe: `REASON_MISSING_FILE`, `REASON_TOO_LARGE`,
      `REASON_UNSUPPORTED_FORMAT`, `REASON_STORAGE_FAILED`.

### Dienste und Endpunkte

- [x] `backend/src/Services/TemplatePreviewService.php` — Konstruktor
      `(TemplateRepository $templates, PreviewImageStorage $storage)`. Methoden `store()`,
      `locateFile()`, `delete()`, alle über die Kennung des Templates. Ablauf von `store()`:
      Datei annehmen → `updatePreview()` → **schlägt das fehl (unbekannte Kennung oder
      Datenbankfehler), die eben abgelegte Datei wieder entfernen** → alten Dateinamen
      (vorher gemerkt) erst jetzt löschen. Rückgabe `['previewUpdatedAt' => …]` oder `null`.
- [x] `backend/src/Services/CardPreviewService.php` — dasselbe gegen `CardRepository`, plus
      `duplicateFor(int $sourceCardId, int $targetCardId): void` (Datei kopieren, Spalten der
      Kopie setzen; fehlende Quelldatei wird still übersprungen).
- [x] `backend/src/Controllers/TemplatePreviewController.php` und
      `backend/src/Controllers/CardPreviewController.php`, je mit `upload(string $id)` und
      `file(string $id)`; Muster `CardImageController` inklusive `missingFileReason()`.
      Fehlertexte auf Deutsch und ohne Fachjargon.
- [x] `TemplateService::delete()`: Bild entfernen — **erst nach** der 409-Prüfung auf
      benutzende Karten, sonst ist das Bild weg, obwohl das Template bleibt.
- [x] `CardService::delete()`: Bild entfernen, dort wo schon
      `CardImageService::deleteAllForCard()` gerufen wird.
- [x] `CardService::duplicate()`: `CardPreviewService::duplicateFor()` rufen, direkt neben dem
      bestehenden Aufruf für die Kartenbilder.
- [x] `backend/public/index.php`: zwei `PreviewImageStorage` bauen
      (`$backendRoot . '/uploads/previews/templates'` und `…/cards`), die beiden Dienste, die
      beiden Controller in den Bauplan, vier Routen ergänzen
      (`POST`/`GET` je Sorte, Muster der bestehenden Karten-Bild-Routen).
- [x] `backend/uploads/.gitignore` prüfen: die neuen Unterordner dürfen nicht mitcommittet
      werden (so wie `uploads/cards/` behandelt wird).

### Doku

- [x] `docs/decisions/021-vorschaubilder.md` — Kontext (Listen zeigten nur Metadaten),
      Optionen (live rendern vs. Bild speichern), Entscheidung (Bild beim Speichern, für
      Templates **und** Karten; Begründung: Listen bleiben leicht, unabhängig von der Zahl der
      Einträge — bei Karten war die Alternative eine Konva-Bühne pro Kachel), Konsequenzen
      (Bild kann veralten, wenn jemand die Datenbank direkt ändert; Speicherplatz; Editoren
      brauchen einen Export-Weg; wer nie speichert, hat kein Bild).
- [x] `docs/models.md` — die neuen Spalten an `templates` und `cards`.
- [x] `docs/routes.md` — die vier neuen Endpunkte, inkl. `previewUpdatedAt` an den bestehenden
      Template- und Karten-Antworten.
- [x] `docs/code-map.md` — Zeilen `templates` und `cards` um die Vorschau-Ablage ergänzen.
- [x] `STATE.md` — Phase 1 abgehakt, nächster Schritt Phase 2.

## Report-Back

Alle Bausteine gebaut wie geplant, keine Abweichungen vom Kontrakt.

- **`backend/uploads/.gitignore` geprüft, nicht geändert:** es gibt keine solche Datei — das
  Wurzel-`.gitignore` hat schon `backend/uploads/*` mit Ausnahme `.gitkeep`. Ein Muster, das
  einen Ordner trifft, ignoriert ihn samt Inhalt; `uploads/previews/templates/` und
  `uploads/previews/cards/` sind damit schon abgedeckt, ohne dass etwas dazukommen musste.
- **`CardService::duplicate()` hatte eine Falle:** `$created` (die neu angelegte Zeile) wurde
  vor dem Kopieren des Vorschaubilds gelesen — `CardPreviewService::duplicateFor()` setzt die
  Vorschau-Spalten aber erst danach. Ohne erneutes Nachladen hätte die Antwort auf
  `POST /api/cards/{id}/duplicate` ein `previewUpdatedAt: null` gezeigt, obwohl die Kopie
  gerade ein Bild bekommen hat. Behoben: nach beiden Duplizier-Aufrufen wird die Zeile frisch
  geladen, bevor sie formatiert wird.
- **Nicht live geprüft:** wie im Karteneditor-Plan vermerkt, gibt es noch keine lokale
  Datenbank — `M008`/`M009`/`M010` sind nur `php -l`-geprüft, nie gegen Strato gelaufen. Das
  gilt jetzt auch für alle vier neuen Endpunkte. Gehört in die Smoke-Checkliste am Plan-Ende
  bzw. in den geplanten Deploy-Lauf (siehe `STATE.md`).
