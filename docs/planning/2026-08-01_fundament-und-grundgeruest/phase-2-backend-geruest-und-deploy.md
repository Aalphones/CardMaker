# Phase 2 — Backend-Gerüst & Deploy-Skript

**Rating:** heikel · **Status:** pending

Das minimale PHP-Grundgerüst ohne eine einzige fremde Bibliothek, plus das Windows-Skript,
das es per Doppelklick auf den Server schiebt. Am Ende antwortet `/api/health` auf der
Strato-Subdomain.

## Kontext lesen

- ADR-006 aus Phase 1 (kein Composer, kein Bau-Durchlauf, Hochladen per Skript)
- `docs/conventions/php.md` — besonders „Composition Root" und „Wire-Format"
- `docs/conventions/stack.md` → Projektstruktur
- `docs/code-map.md` → Backend-Layout
- `.gitignore` — wird ergänzt

## Voraussetzungen (vom Nutzer, blockierend)

1. Strato-Subdomain für die API zeigt auf ein eigenes Verzeichnis.
2. MySQL-Datenbank angelegt, Zugangsdaten notiert.
3. WinSCP portable entpackt, Pfad bekannt.

Steht etwas davon aus: Code trotzdem fertig bauen, Hochladen aussetzen, im Report-Back
festhalten.

## Abnahmekriterien

1. `GET https://<api-subdomain>/api/health` liefert
   `{ "status": "ok", "phpVersion": "...", "dbConnected": true, "migrationsApplied": 0 }`.
2. Ein unbekannter Pfad liefert `404` als JSON — keine PHP-Fehlerseite, kein Pfad aus dem
   Dateisystem, keine Fehlermeldung mit Dateinamen.
3. Ein Aufruf aus dem Browser von `http://localhost:4200` wird nicht von der Herkunftssperre
   blockiert; eine fremde Herkunft schon.
4. Die Konfigurationsdatei mit den Zugangsdaten ist **nicht** über die Web-Adresse abrufbar —
   direkt ausprobieren, muss `403` oder `404` liefern.
5. Doppelklick auf `deploy.cmd` lädt hoch und meldet am Ende deutlich Erfolg oder Fehler; das
   Fenster bleibt offen.
6. Ein zweiter Lauf tastet den Bilder-Ordner auf dem Server nicht an.
7. `deploy.env` liegt nicht im Git.

## Aufgaben

### Grundstruktur

- [ ] Verzeichnisse anlegen: `backend/src/{Controllers,Services,Repositories,Validators,Database,Migrations,Middleware,Http,Support}`,
      `backend/public/`, `backend/storage/logs/`.
- [ ] `backend/.gitignore` bzw. Projektstamm-`.gitignore` ergänzen um `backend/.env`,
      `backend/storage/logs/*`, `backend/public/uploads/*`, `deploy.env`.
      **Vor dem Ergänzen prüfen, was schon abgedeckt ist** — die vorhandene Datei ist
      umfangreich.
- [ ] `backend/.env.example` mit allen Schlüsseln anlegen, ohne Werte:
      `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `MIGRATE_TOKEN`, `CORS_ORIGINS`,
      `PUBLIC_BASE_URL`, `UPLOAD_MAX_BYTES`.

### Eigene Grundbausteine (`src/Support/`)

Alles, was sonst Composer geliefert hätte. Klein halten, keine Rahmenwerk-Ambitionen.

- [ ] `Autoloader.php` — `spl_autoload_register`, bildet `App\Foo\Bar` auf
      `src/Foo/Bar.php` ab. Kein Zwischenspeicher, kein Suchen in mehreren Wurzeln.
- [ ] `Env.php` — liest `backend/.env` zeilenweise: Kommentarzeilen mit `#` und Leerzeilen
      überspringen, am ersten `=` trennen, umschließende Anführungszeichen entfernen, Werte in
      ein statisches Feld legen. `Env::get(string $key, ?string $default = null): ?string`,
      `Env::require(string $key): string` (wirft, wenn nicht gesetzt). Kein Schreiben in
      `$_ENV` oder `putenv` — die Werte bleiben in der Klasse.
- [ ] `Router.php` — Pfade werden mit `add(string $method, string $path, array $handler)`
      registriert, `$path` darf Platzhalter der Form `{id}` enthalten. Die Auflösung
      zerlegt den angefragten Pfad an `/` und vergleicht Segment für Segment; Platzhalter
      passen auf jedes Segment und landen als Parameter im Ergebnis. Rückgabe: Treffer mit
      Handler und Parametern, `METHOD_NOT_ALLOWED` (Pfad passt, Methode nicht) oder
      `NOT_FOUND`. Bewusst kein Regelwerk-Übersetzer — bei rund 15 Pfaden ist
      Segmentvergleich schneller zu lesen und unmöglich falsch zu verstehen.
- [ ] `Validator.php` — Prüfhelfer als statische Methoden, jede gibt eine Fehlermeldung oder
      `null` zurück: `required`, `string(min, max)`, `email`, `integer(min, max)`,
      `inList(array)`, `flatStringMap(maxEntries, maxKeyLength, maxValueLength)`.
      Dazu `Validator::check(array $data, array $rules): array` — liefert die Feldfehler im
      Format aus dem Kontrakt.
- [ ] `Logger.php` — `error(string $message, array $context = [])` und `warning(...)`.
      Schreibt Zeitstempel, Stufe, Meldung und den Kontext als JSON in
      `storage/logs/app.log`. **Niemals** den Inhalt von `.env`, Passwörter oder Token
      protokollieren; eine Notiz dazu als Kommentar in der Datei.

### HTTP-Schicht

- [ ] `src/Http/Request.php` — Methode, Pfad, Kopfzeilen, JSON-Rumpf, Dateien. Wandelt
      eingehende JSON-Schlüssel im Konstruktor nach snake_case (`camelToSnake()`), wie in
      `docs/conventions/php.md` festgelegt. Bietet `header()`, `body()`, `query()`,
      `files()`, `setUser()`, `user()`.
- [ ] `src/Http/Response.php` — `json(array $data, int $status = 200): void`,
      `noContent(): void`, `error(string $code, string $message, int $status, array $fields = []): void`.
      Setzt immer `Content-Type: application/json`, beendet danach.
- [ ] `src/Middleware/Cors.php` — erlaubte Herkünfte aus der Konfiguration, setzt bei Treffer
      die Freigabe-Kopfzeilen, beantwortet Vorab-Anfragen (`OPTIONS`) mit `204`. Erlaubte
      Kopfzeilen: `Content-Type`, `Authorization`, `X-Migrate-Token`. Erlaubte Methoden:
      `GET, POST, PATCH, DELETE, OPTIONS`.
- [ ] `src/Database/Connection.php` — PDO als geteilte Instanz, Fehlermodus „Ausnahme",
      `ATTR_EMULATE_PREPARES = false`, Zeichensatz `utf8mb4`. Schlägt der Verbindungsaufbau
      fehl, wirft die Klasse; der Einstiegspunkt übersetzt das in `500` mit Code
      `server_error` — Zugangsdaten dürfen nie in einer Antwort landen.
- [ ] `src/Controllers/HealthController.php` — Status, PHP-Version, Datenbank erreichbar,
      Anzahl angewandter Schema-Schritte (0, solange die Verwaltungstabelle fehlt — kein
      Fehler). Ohne Anmeldung erreichbar.

### Einstiegspunkt

- [ ] `backend/public/index.php` als einzige Eintrittsstelle:
  - Autoloader einbinden, Konfiguration laden (Datei liegt eine Ebene über `public/`),
  - Fehleranzeige aus (`display_errors = 0`), eigener Fehler- und Ausnahmebehandler, der über
    `Logger` schreibt und `500` mit Code `server_error` antwortet — **nie** den Text der
    Ausnahme nach außen geben,
  - Herkunftssperre ausführen,
  - Pfade registrieren, auflösen, `NOT_FOUND` → `404` JSON, `METHOD_NOT_ALLOWED` → `405`
    JSON,
  - Controller über eine `$makeController`-Closure erzeugen; geteilte Dienste als
    Top-Level-Variable und per `use` hineinreichen (Regel „Composition Root").
- [ ] `backend/public/.htaccess`: alles, was nicht auf eine existierende Datei zeigt, auf
      `index.php` umschreiben. `Options -Indexes`.
- [ ] `backend/.htaccess` (eine Ebene darüber, greift nur falls die Web-Wurzel **nicht** auf
      `public/` gelegt werden kann): verweigert Zugriff auf `.env`, `src/`, `storage/`.

### Serverauskunft — die offenen Fragen klären

- [ ] `backend/public/diag.php`: gibt PHP-Version, geladene Erweiterungen (`pdo_mysql`, `gd`,
      `imagick`, `fileinfo`, `mbstring`) sowie `upload_max_filesize`, `post_max_size`,
      `memory_limit`, `max_execution_time` als JSON aus. Nur mit korrektem `X-Migrate-Token`
      abrufbar.
- [ ] Nach dem ersten Hochladen einmal abrufen, Ergebnis **wörtlich** ins Report-Back und in
      `FINDINGS.md` schreiben.
- [ ] Folgerungen ziehen und notieren:
  - PHP-Version unter 8.5 → Versionsangaben in `docs/conventions/php.md`,
    `docs/conventions/stack.md` und `docs/PROJECT.md` angleichen; unter 8.2 zusätzlich
    prüfen, ob verwendete Sprachmittel noch tragen.
  - Weder `gd` noch `imagick` vorhanden → Phase 8 nimmt die Maße vom Browser.
  - `upload_max_filesize` unter 10 MB → in Phase 8 der tatsächliche Wert, kein Wunschwert.
- [ ] `diag.php` bleibt bestehen — sie ist ohne SSH die einzige Möglichkeit, auf den Server zu
      schauen.

### Deploy-Skript

- [ ] `deploy.env.example` im Projektstamm anlegen, dokumentiert alle Werte:

  ```
  WINSCP_PATH=C:\Tools\WinSCP\WinSCP.com
  SFTP_PROTOCOL=sftp
  SFTP_HOST=
  SFTP_USER=
  SFTP_PASSWORD=
  SFTP_HOSTKEY=
  REMOTE_API_PATH=/api/
  REMOTE_APP_PATH=/
  DB_HOST=
  DB_NAME=
  DB_USER=
  DB_PASSWORD=
  MIGRATE_TOKEN=
  CORS_ORIGINS=http://localhost:4200
  PUBLIC_BASE_URL=
  UPLOAD_MAX_BYTES=
  ```

- [ ] `deploy.cmd` im Projektstamm, per Doppelklick lauffähig. Ablauf:
  1. `@echo off`, Zeichensatz auf UTF-8 (`chcp 65001`), Titel setzen.
  2. Prüfen, ob `deploy.env` existiert — sonst Klartextmeldung („Kopiere `deploy.env.example`
     nach `deploy.env` und trage deine Zugangsdaten ein"), `pause`, beenden.
  3. `deploy.env` einlesen (`for /f "usebackq tokens=1,* delims== eol=#"`), Werte als
     Umgebungsvariablen setzen. Erst `setlocal enabledelayedexpansion`, damit Werte mit
     Sonderzeichen nicht zerfallen.
  4. Fehlende Pflichtwerte prüfen und einzeln benennen — nicht pauschal „Konfiguration
     unvollständig".
  5. `backend\.env` aus den Werten schreiben (Datenbank, Token, Herkünfte, Basisadresse,
     Upload-Grenze). Damit gibt es genau **einen** Ort für Geheimnisse, und die Serverdatei
     kann nie veralten.
  6. Frontend bauen, wenn `frontend\package.json` existiert:
     `call npm --prefix frontend run build`. Bei Fehler abbrechen, `pause`, beenden —
     **nicht** einen kaputten Stand hochladen.
  7. WinSCP-Skriptdatei erzeugen und ausführen (siehe unten).
  8. Rückgabewert prüfen, Erfolg oder Fehler deutlich melden, `pause`.
- [ ] Der WinSCP-Teil, zwei Abgleiche:
  - Verbindung: `open %SFTP_PROTOCOL%://%SFTP_USER%:%SFTP_PASSWORD%@%SFTP_HOST%/ -hostkey="%SFTP_HOSTKEY%"`.
    Beim ersten Lauf ist der Fingerabdruck unbekannt — dann WinSCP einmal von Hand starten,
    verbinden, den angezeigten Fingerabdruck in `deploy.env` eintragen. Diesen Schritt in
    `README.md` beschreiben. **Kein `-hostkey=*`** in der ausgelieferten Fassung: das
    akzeptiert jeden Server, der sich für den richtigen ausgibt.
  - Backend: `synchronize remote backend %REMOTE_API_PATH% -delete -filemask="|uploads/;.env.example;storage/logs/"`.
    Der Ausschluss von `uploads/` ist **zwingend** — ohne ihn löscht `-delete` beim nächsten
    Lauf alle hochgeladenen Bilder.
  - Frontend: `synchronize remote frontend\dist\frontend\browser %REMOTE_APP_PATH% -delete`.
    Den tatsächlichen Ausgabepfad nach Phase 5 prüfen und hier eintragen — Angular hat ihn
    über die Versionen mehrfach geändert.
- [ ] `deploy.cmd` mit einem Aufrufwert versehen: ohne Argument beides, mit `backend` nur das
      Backend, mit `frontend` nur das Frontend. Das spart im Alltag die halbe Wartezeit. Am
      Kopf der Datei ein Kommentar mit diesen drei Varianten.
- [ ] Nur FTP statt SFTP verfügbar: `SFTP_PROTOCOL=ftp` setzen und die Fingerabdruck-Angabe
      weglassen — das Skript muss diesen Fall abfangen, statt eine leere Angabe an WinSCP zu
      reichen. Ein Satz dazu in `deploy.env.example`.

### Erster Rauchtest

- [ ] Nach dem ersten erfolgreichen Hochladen `/api/health` abrufen. `dbConnected` muss `true`
      sein — ist es das nicht, liegt es an den Datenbankwerten, nicht am Code.
- [ ] `https://<api>/.env` und `https://<api>/src/Http/Request.php` direkt aufrufen. Beide
      müssen abgewiesen werden. Gelingt einer, ist die Web-Wurzel falsch gesetzt — dann greift
      `backend/.htaccess`, und das gehört ins Report-Back.
- [ ] `deploy.cmd` ein zweites Mal laufen lassen und prüfen, dass es schnell durchläuft (nur
      Geändertes) und nichts kaputt macht.

## Report-Back
