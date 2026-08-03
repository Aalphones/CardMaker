# Phase 3 — Datenbank-Schema & Migrations-Runner

**Rating:** standard · **Status:** complete

Ohne SSH auf dem Server müssen Schema-Änderungen über einen Web-Aufruf laufen. Diese Phase
baut den Mechanismus und die sechs Tabellen, die Meilenstein 1 braucht.

## Kontext lesen

- `docs/conventions/php.md` — besonders „Prepared Statements ausnahmslos"
- ADR-011 (keine Charakterverwaltung, Kartengruppen als reine Organisationseinheit) und
  ADR-008 (Zufallstoken statt JWT) aus Phase 1
- `src/Database/Connection.php`, `src/Support/Env.php` und `backend/public/index.php` aus
  Phase 2
- README dieses Plans → Kontrakt-Abschnitt

## Abnahmekriterien

1. `POST /api/migrate` mit korrektem `X-Migrate-Token` legt alle Tabellen an und antwortet
   mit der Liste der angewandten Schritte.
2. Ein zweiter Aufruf ändert nichts und antwortet mit einer leeren Liste.
3. Ohne oder mit falschem Token: `403`, kein Hinweis darauf, ob der Pfad überhaupt existiert.
4. `GET /api/health` meldet nach dem Durchlauf die Anzahl angewandter Schritte.
5. In phpMyAdmin sind alle vier Tabellen mit `utf8mb4_unicode_ci` sichtbar.

## Aufgaben

### Migrations-Runner

- [x] `src/Database/MigrationRunner.php`:
  - liest alle Dateien aus `src/Migrations/`, sortiert nach Dateinamen,
  - legt bei Bedarf die Verwaltungstabelle `migrations` an
    (`version VARCHAR(191) PRIMARY KEY`, `applied_at DATETIME NOT NULL`),
  - überspringt bereits eingetragene Versionen,
  - führt jede offene Migration aus und trägt sie **im selben Durchlauf** ein,
  - bricht beim ersten Fehler ab, gibt die bis dahin erfolgreichen Schritte und den Fehler
    zurück — kein stilles Weiterlaufen. Umgesetzt über `MigrationFailedException`
    (trägt `appliedVersions()` + `failedVersion()`), die der Controller loggt.
- [x] Migrationen sind Klassen im Namensraum `App\Migrations`, Datei- und Klassenname
      identisch, Muster `M001CreateUsers`. Jede besitzt genau eine Methode
      `public function up(PDO $pdo): void`. Kein Rückwärtsgang — auf einem
      Einzelnutzer-Werkzeug ist Wiederherstellen aus dem Backup der ehrlichere Weg als eine
      Rückwärts-Migration, die nie geprobt wurde.
- [x] `src/Controllers/MigrateController.php`: prüft `X-Migrate-Token` gegen die
      Konfiguration mit `hash_equals()`, ruft den Runner, antwortet `{ applied: [...] }`.
      Bekommt `Request` per Konstruktor gereicht (Wegweiser übergibt der Methode nur
      Pfad-Platzhalter, siehe Finding zu Phase 4 — gilt hier genauso).
- [x] Route `POST /api/migrate` im Einstiegspunkt eintragen.
- [x] `HealthController` um die Anzahl der Einträge in `migrations` erweitern. War bereits in
      Phase 2 vorgebaut (`countAppliedMigrations()`, fängt die fehlende Tabelle ab) — keine
      Änderung nötig.

### Migrationen

- [x] `M001CreateUsers` — Tabelle `users`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `email VARCHAR(191) NOT NULL UNIQUE`,
      `password_hash VARCHAR(255) NOT NULL`,
      `created_at DATETIME NOT NULL`.
- [x] `M002CreateSessions` — Tabelle `sessions` (Anmeldungen, siehe ADR-008):
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `user_id INT UNSIGNED NOT NULL` mit Fremdschlüssel auf `users(id)`, `ON DELETE CASCADE`,
      `token_hash CHAR(64) NOT NULL UNIQUE` (SHA-256 in Hexform),
      `expires_at DATETIME NOT NULL`,
      `created_at DATETIME NOT NULL`,
      `last_used_at DATETIME NULL`,
      Index auf `expires_at` — abgelaufene Sitzungen werden beim Anmelden mit aufgeräumt, es
      gibt keinen zeitgesteuerten Dienst auf geteiltem Hosting.
- [x] `M003CreatePersonalAccessTokens` — Tabelle `personal_access_tokens`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `user_id INT UNSIGNED NOT NULL` mit Fremdschlüssel auf `users(id)`, `ON DELETE CASCADE`,
      `name VARCHAR(191) NOT NULL`,
      `token_hash CHAR(64) NOT NULL UNIQUE` (SHA-256 in Hexform),
      `created_at DATETIME NOT NULL`,
      `last_used_at DATETIME NULL`.
- [x] `M004CreateCardGroups` — Tabelle `card_groups`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `name VARCHAR(191) NOT NULL`,
      `description TEXT NULL`,
      `created_at DATETIME NOT NULL`, `updated_at DATETIME NOT NULL`,
      Index auf `name`.
- [x] Alle Tabellen mit `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.

### Bewusst weggelassen

- [x] Keine Spalte `user_id` auf `card_groups`. Mehrbenutzerbetrieb ist erklärtes Nicht-Ziel
      (`docs/PROJECT.md`); eine Zuordnungsspalte, die überall mitgeschleppt und nie
      ausgewertet wird, ist Ballast. Diesen Satz als Kommentar in `M004CreateCardGroups`
      hinterlegen, damit später niemand rätselt, ob sie vergessen wurde.
- [x] Keine Tabelle `characters` — ADR-011 hat die Charakterverwaltung ersatzlos gestrichen,
      Karten speichern ihre Textfeldwerte später direkt.
- [x] Keine Tabelle `images` — ein Bild gehört ab dem Karteneditor-Plan (Meilenstein 3) direkt
      zur Karteninstanz, es gibt keine eigenständige Bild-Bibliothek (ADR-011).
- [x] Keine Tabellen für Templates, Karteninstanzen oder Druckprojekte. Deren Aufbau hängt an
      Entscheidungen, die erst der Template-Editor-Plan trifft.

## Report-Back

**Stand: abgeschlossen.** Backend hochgeladen, `POST /api/migrate` gegen die echte
Strato-Datenbank ausgeführt:

```
403  ohne/mit falschem Token   {"error":"forbidden","message":"Zugriff verweigert."}
200  erster Lauf               {"applied":["M001CreateUsers","M002CreateSessions","M003CreatePersonalAccessTokens","M004CreateCardGroups"]}
200  zweiter Lauf               {"applied":[]}
GET /api/health danach:        {"status":"ok","phpVersion":"8.5.7","dbConnected":true,"migrationsApplied":4}
```

Alle fünf Abnahmekriterien der Phase erfüllt. Kriterium 5 (Tabellen in phpMyAdmin mit
`utf8mb4_unicode_ci` sichtbar) nicht selbst nachgeschaut — kein DB-Zugriff von hier aus,
im Code aber an jeder der vier `CREATE TABLE`-Anweisungen fest verdrahtet. Gehört in den
Abnahme-Rundgang am Plan-Ende.

### Was geprüft wurde, und wie

- `php -l` über alle acht neuen/geänderten Dateien — fehlerfrei.
- Lokal (PHP-Bordserver): 403 auf fehlenden/falschen Token bestätigt. `dbConnected: false`
  lokal ist erwartet — die Strato-Datenbank ist von der Entwicklungsmaschine aus nicht
  erreichbar (geteiltes Hosting, kein Zugriff außerhalb des Servers selbst).
- Am echten Server: siehe Tabelle oben — Token-Schutz, Migrationslauf, Idempotenz und die
  Zählung in `/api/health` sind damit alle scharf getestet, nicht nur lokal simuliert.

### Abweichung vom Plan

`Request` wird `MigrateController` per Konstruktor gereicht statt als Methodenparameter —
der Wegweiser in `index.php` übergibt der aufgerufenen Methode nur die Pfad-Platzhalter aus
der Route (`array_values($route[2])`), nicht das Request-Objekt. Das stand als Finding für
Phase 4 in `FINDINGS.md`, betrifft aber jeden Controller, der die Anfrage braucht — also
auch diesen hier. Ohne die Änderung hätte `MigrateController::run()` nie an den
`X-Migrate-Token`-Header herangekommen.
