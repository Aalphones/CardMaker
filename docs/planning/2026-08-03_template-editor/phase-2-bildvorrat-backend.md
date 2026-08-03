# Phase 2 — Bildvorrat im Backend

**Rating:** heikel · **Status:** umgesetzt — Serverprobe offen (letzter Punkt der Checkliste)

Rahmen und Icons hochladen, ablegen, wieder ausliefern und löschen. Heikel, weil hier zum
ersten Mal Dateien vom Browser ins System kommen — und weil auf Strato erst der echte
Versuch zeigt, ob ein mehrere Megabyte großes Bild durch die Brücke passt.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → Abschnitt „Bildvorrat" (der Kontrakt)
- `docs/decisions/015-bildablage-und-dateiformate.md` (aus Phase 1)
- `docs/decisions/013-backend-ausserhalb-des-webbereichs.md` — warum `backend/` neben dem
  ausgelieferten Bereich liegt
- `docs/conventions/php.md` — besonders „Wire-Format" und „Composition Root"
- `backend/src/Controllers/CardGroupController.php`, `backend/src/Services/CardGroupService.php`,
  `backend/src/Repositories/CardGroupRepository.php`,
  `backend/src/Validators/CardGroupValidator.php` — das Muster, dem alles hier folgt
- `backend/src/Migrations/M004CreateCardGroups.php` — Muster für die Tabelle
- `backend/src/Http/Request.php` und `backend/src/Http/Response.php`
- `backend/public/index.php` — Wegweiser und Zusammenbau
- `backend/.htaccess` — die Rückfallebene, falls `backend/` doch im Webbereich landet
- `deploy.cmd`, Zeile mit `synchronize remote -delete -filemask=` — dort steht `uploads/`
  bereits als Ausnahme; das ist geprüft und muss nicht geändert werden

## Abnahmekriterien

1. `POST /api/assets` nimmt eine PNG-Datei entgegen, legt sie unter `backend/uploads/` ab
   und liefert den Datensatz zurück (`201`).
2. Alles außer PNG wird mit `422` und verständlicher Meldung abgelehnt — geprüft am
   tatsächlichen Dateiinhalt, nicht an der Endung.
3. Eine zu große Datei liefert `413` mit verständlicher Meldung, kein leerer Bildschirm.
4. `GET /api/assets` liefert die Liste, `?kind=frame` filtert.
5. `GET /api/assets/{id}/file` liefert das Bild mit `Content-Type: image/png`, nur mit
   gültiger Anmeldung.
6. `DELETE /api/assets/{id}` löscht Datensatz **und** Datei und liefert `204`.
7. Der Ablageordner ist von außen nicht direkt erreichbar.

## Checkliste

- [x] **Ablageordner anlegen** — `backend/uploads/.gitkeep` ins Git, die Bilder selbst nicht
      (`.gitignore` im Backend-Zweig entsprechend ergänzen: alles in `uploads/` außer
      `.gitkeep`).
- [x] **`backend/.htaccess` ergänzen** — `uploads` in die Sperrliste der `RewriteRule`
      aufnehmen (aktuell `^(src|storage|Migrations)/`). Das ist die Rückfallebene für den
      Fall, dass `backend/` doch im ausgelieferten Bereich liegt.
- [x] **Migration `backend/src/Migrations/M005CreateAssets.php`** nach dem Muster von
      `M004CreateCardGroups`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`, `kind ENUM('frame','icon') NOT NULL`,
      `name VARCHAR(191) NOT NULL`, `file_name VARCHAR(191) NOT NULL`,
      `mime_type VARCHAR(64) NOT NULL`, `byte_size INT UNSIGNED NOT NULL`,
      `width INT UNSIGNED NOT NULL`, `height INT UNSIGNED NOT NULL`,
      `created_at DATETIME NOT NULL`, `updated_at DATETIME NOT NULL`,
      `INDEX idx_assets_kind (kind)`, InnoDB/utf8mb4 wie gehabt.
- [x] **`backend/src/Http/Request.php` erweitern** — Methode
      `formField(string $key): ?string`, die aus `$_POST` liest und den Schlüssel nach
      `snake_case` wandelt. Grund als Kommentar: bei `multipart/form-data` ist
      `php://input` leer, `body()` liefert also nichts — die Felder stehen in `$_POST`.
      `files()` existiert bereits und bleibt unverändert.
- [x] **`backend/src/Http/Response.php` erweitern** — Konstante
      `ERROR_CONFLICT = 'conflict'` (für Phase 3) und Methode
      `file(string $absolutePath, string $mimeType): void`: setzt `Content-Type`,
      `Content-Length`, `X-Content-Type-Options: nosniff`,
      `Cache-Control: private, max-age=86400`, gibt die Datei mit `readfile()` aus und
      beendet. Keine `Content-Disposition`-Kopfzeile mit Dateinamen aus Nutzereingabe.
- [x] **`backend/src/Validators/AssetValidator.php`** — prüft die Felder der Hochladung:
      `kind` muss `frame` oder `icon` sein, `name` 1–191 Zeichen. Fehler im gewohnten
      `fields`-Format.
- [x] **`backend/src/Repositories/AssetRepository.php`** — `all(?string $kind)`, `find(int)`,
      `insert(...)`, `delete(int)`. Prepared Statements, Zeitstempel per `UTC_TIMESTAMP()`,
      `formatAsset()` wandelt nach camelCase (Muster: `CardGroupRepository`).
- [x] **`backend/src/Services/AssetService.php`** — die eigentliche Arbeit:
      - Grenze aus `$_ENV['UPLOAD_MAX_BYTES']` lesen, Rückfall 8388608.
      - PHP-Uploadfehler auswerten (`UPLOAD_ERR_INI_SIZE`/`UPLOAD_ERR_FORM_SIZE` → `413`,
        alles andere Unerwartete → `500` mit Protokolleintrag).
      - **Dateityp am Inhalt prüfen**, nicht an der Endung: `finfo_file` muss `image/png`
        liefern **und** `getimagesize()` muss `IMAGETYPE_PNG` melden. Beides, weil das eine
        den Anfang der Datei liest und das andere die Bildstruktur.
      - Zielnamen selbst erzeugen: `bin2hex(random_bytes(16)) . '.png'`. **Niemals** den vom
        Browser gelieferten Dateinamen übernehmen.
      - `move_uploaded_file()` in `backend/uploads/`, danach Datensatz schreiben. Schlägt das
        Schreiben in die Datenbank fehl, die Datei wieder entfernen.
      - `delete(int $id)`: Datensatz lesen, Datei entfernen, Datensatz löschen. Fehlt die
        Datei bereits, ist das kein Fehler.
      - `absolutePath(array $asset): string` für die Auslieferung.
- [x] **`backend/src/Controllers/AssetController.php`** — dünn, nach dem Muster von
      `CardGroupController`: `index()` (mit `?kind`), `create()`, `file(string $id)`,
      `destroy(string $id)`. `file()` antwortet `404`, wenn Datensatz oder Datei fehlen.
- [x] **`backend/public/index.php` verdrahten** — `AssetService` als geteilte Variable
      neben den bestehenden Diensten anlegen (Regel „Composition Root" in
      `docs/conventions/php.md`), Controller in `$makeController` ergänzen, vier Routen
      eintragen: `GET /api/assets`, `POST /api/assets`, `GET /api/assets/{id:\d+}/file`,
      `DELETE /api/assets/{id:\d+}`. **Nicht** in die Positivliste der offenen Pfade
      aufnehmen — Bilder sind anmeldepflichtig.
- [x] **Löschsperre vertagt** — dass ein noch benutztes Bild nicht gelöscht werden darf
      (`409`), kommt in Phase 3. Die Templates-Tabelle existiert hier noch nicht. In dieser
      Phase liefert `DELETE` immer `204`.
- [x] **Doc-Update `docs/code-map.md`** — Feature-Zeile `assets` in die Tabelle der
      Feature-Ordner aufnehmen (Kurzbeschreibung: „Bildvorrat — hochgeladene Rahmen- und
      Icon-Dateien, hinter der Anmeldung ausgeliefert"), und `backend/uploads/` im
      Backend-Layout ergänzen.
- [ ] **Hochladen und am Server prüfen** — Doppelklick auf `deploy.cmd`, danach
      `POST /api/migrate` auslösen, dann ein echtes PNG von 4–5 MB gegen die Serveradresse
      hochladen. **Das ist der Check aus dem Konfidenz-Ausweis** — Ergebnis (Erfolg,
      Grenze, Fehlermeldung) unten in „Report-Back" festhalten.

## Report-Back

**Stand:** Der Bildvorrat ist gebaut und syntaktisch geprüft (`php -l` über alle berührten
Dateien). Was fehlt, ist die Probe gegen den echten Server — siehe unten.

### Neue Dateien

`M005CreateAssets`, `AssetValidator`, `AssetRepository`, `AssetService`,
`AssetUploadException`, `AssetController` sowie der Ablageordner `backend/uploads/` mit
`.gitkeep`. Erweitert: `Request` (`formField()`), `Response` (`file()`, `ERROR_CONFLICT`),
`backend/public/index.php` (Dienst, Controller, vier Routen), `backend/.htaccess`,
`.gitignore`, `docs/code-map.md`.

### Belegter Befund zur Dateiprüfung

Lokal gegen drei Dateien geprüft (PHP 8.3, Wegwerfskript im Zwischenspeicher, nicht
eingecheckt): reiner Text mit `.png`-Endung, eine Datei mit echtem PNG-Kopf und Müll
dahinter, ein gültiges PNG.

| Datei | `finfo` | `getimagesize()` |
|---|---|---|
| Text mit `.png`-Endung | `text/plain` → abgelehnt | erkennt kein Bild |
| PNG-Kopf + 32 Nullbytes | `application/octet-stream` → abgelehnt | **meldet „gültiges PNG"** |
| echtes PNG | `image/png` | erkennt PNG |

Die Doppelprüfung ist damit keine Vorsicht, sondern trägt: `getimagesize()` allein hätte die
gefälschte Datei durchgelassen. Umgekehrt kann `getimagesize()` bei einer abgeschnittenen
Datei den Kopf noch lesen und `0 × 0` melden — deshalb zusätzlich zum Plan eine Prüfung auf
Kantenlänge ≥ 1, sonst läge im Editor eine unsichtbare Fläche.

### Abweichungen vom Plan

- **`AssetRepository::format()` statt `formatAsset()`** — der Plan nennt den zweiten Namen,
  das Muster `CardGroupRepository` den ersten. Muster gewinnt.
- **`AssetUploadException` zusätzlich** — nicht im Plan. Der Dienst darf nach Konvention kein
  HTTP kennen, muss aber vier verschiedene Fehlausgänge unterscheiden. Die Ausnahme trägt den
  Grund, der Controller macht den Statuscode daraus.
- **Prüfung des Listenfilters** (`?kind=`) zusätzlich: unbekannter Wert → `422` statt stiller
  leerer Liste.
- **`.gitignore` korrigiert** — dort stand noch `backend/public/uploads/` aus Meilenstein 1,
  also der Ort, den ADR-015 gerade verworfen hat. Jetzt `backend/uploads/`.
- **Nicht löschbare Datei blockiert den Datensatz nicht**: schlägt `unlink()` fehl, wird das
  protokolliert und der Datensatz trotzdem gelöscht. Eine verwaiste Datei ist Ballast, ein
  unlöschbarer Eintrag wäre ein Defekt.

### Offen — braucht den Server

Der letzte Punkt der Checkliste (Konfidenz-Ausweis: kommt ein 5-MB-PNG durch die Brücke?)
ist **nicht** erledigt. Er braucht einen Doppelklick auf `deploy.cmd` und eine angemeldete
Hochladung gegen die Serveradresse. Ablauf:

1. `deploy.cmd` doppelklicken.
2. `POST /api/migrate` auslösen (legt die Tabelle `assets` an).
3. Anmelden, dann ein PNG von 4–5 MB an `POST /api/assets` schicken
   (`multipart/form-data`, Felder `file`, `kind=frame`, `name=Testrahmen`).
4. Ergebnis hier eintragen: kam `201`? Bei Abbruch: welcher Status, welche Meldung?

Erwartete Stolperstelle: nicht die eigene Grenze (`UPLOAD_MAX_BYTES`, 8 MB), sondern
`post_max_size`/`upload_max_filesize` der Serverumgebung. Liegt eine davon unter 5 MB,
verwirft PHP die Anfrage komplett — dafür ist die Sonderbehandlung in
`AssetController::missingFileReason()` gebaut, die daraus ein `413` mit Klartext macht
statt eines leeren Bildschirms. Genau die will dieser Versuch sehen.
