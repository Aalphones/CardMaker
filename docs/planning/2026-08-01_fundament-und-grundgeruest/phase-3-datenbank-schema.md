# Phase 3 — Datenbank-Schema & Migrations-Runner

**Rating:** standard · **Status:** pending

Ohne SSH auf dem Server müssen Schema-Änderungen über einen Web-Aufruf laufen. Diese Phase
baut den Mechanismus und die sechs Tabellen, die Meilenstein 1 braucht.

## Kontext lesen

- `docs/conventions/php.md` — besonders „Prepared Statements ausnahmslos"
- ADR-007 (frei benannte Charakter-Attribute) und ADR-008 (Zufallstoken statt JWT) aus Phase 1
- `src/Database/Connection.php`, `src/Support/Env.php` und `backend/public/index.php` aus
  Phase 2
- README dieses Plans → Kontrakt-Abschnitt

## Abnahmekriterien

1. `POST /api/migrate` mit korrektem `X-Migrate-Token` legt alle Tabellen an und antwortet
   mit der Liste der angewandten Schritte.
2. Ein zweiter Aufruf ändert nichts und antwortet mit einer leeren Liste.
3. Ohne oder mit falschem Token: `403`, kein Hinweis darauf, ob der Pfad überhaupt existiert.
4. `GET /api/health` meldet nach dem Durchlauf die Anzahl angewandter Schritte.
5. In phpMyAdmin sind alle sechs Tabellen mit `utf8mb4_unicode_ci` sichtbar.

## Aufgaben

### Migrations-Runner

- [ ] `src/Database/MigrationRunner.php`:
  - liest alle Dateien aus `src/Migrations/`, sortiert nach Dateinamen,
  - legt bei Bedarf die Verwaltungstabelle `migrations` an
    (`version VARCHAR(191) PRIMARY KEY`, `applied_at DATETIME NOT NULL`),
  - überspringt bereits eingetragene Versionen,
  - führt jede offene Migration aus und trägt sie **im selben Durchlauf** ein,
  - bricht beim ersten Fehler ab, gibt die bis dahin erfolgreichen Schritte und den Fehler
    zurück — kein stilles Weiterlaufen.
- [ ] Migrationen sind Klassen im Namensraum `App\Migrations`, Datei- und Klassenname
      identisch, Muster `M001CreateUsers`. Jede besitzt genau eine Methode
      `public function up(PDO $pdo): void`. Kein Rückwärtsgang — auf einem
      Einzelnutzer-Werkzeug ist Wiederherstellen aus dem Backup der ehrlichere Weg als eine
      Rückwärts-Migration, die nie geprobt wurde.
- [ ] `src/Controllers/MigrateController.php`: prüft `X-Migrate-Token` gegen die
      Konfiguration mit `hash_equals()`, ruft den Runner, antwortet `{ applied: [...] }`.
- [ ] Route `POST /api/migrate` im Einstiegspunkt eintragen.
- [ ] `HealthController` um die Anzahl der Einträge in `migrations` erweitern.

### Migrationen

- [ ] `M001CreateUsers` — Tabelle `users`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `email VARCHAR(191) NOT NULL UNIQUE`,
      `password_hash VARCHAR(255) NOT NULL`,
      `created_at DATETIME NOT NULL`.
- [ ] `M002CreateSessions` — Tabelle `sessions` (Anmeldungen, siehe ADR-008):
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `user_id INT UNSIGNED NOT NULL` mit Fremdschlüssel auf `users(id)`, `ON DELETE CASCADE`,
      `token_hash CHAR(64) NOT NULL UNIQUE` (SHA-256 in Hexform),
      `expires_at DATETIME NOT NULL`,
      `created_at DATETIME NOT NULL`,
      `last_used_at DATETIME NULL`,
      Index auf `expires_at` — abgelaufene Sitzungen werden beim Anmelden mit aufgeräumt, es
      gibt keinen zeitgesteuerten Dienst auf geteiltem Hosting.
- [ ] `M003CreatePersonalAccessTokens` — Tabelle `personal_access_tokens`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `user_id INT UNSIGNED NOT NULL` mit Fremdschlüssel auf `users(id)`, `ON DELETE CASCADE`,
      `name VARCHAR(191) NOT NULL`,
      `token_hash CHAR(64) NOT NULL UNIQUE` (SHA-256 in Hexform),
      `created_at DATETIME NOT NULL`,
      `last_used_at DATETIME NULL`.
- [ ] `M004CreateCharacters` — Tabelle `characters`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `name VARCHAR(191) NOT NULL`,
      `description TEXT NULL`,
      `attributes JSON NOT NULL` (Vorgabe `{}`),
      `created_at DATETIME NOT NULL`, `updated_at DATETIME NOT NULL`,
      Index auf `name`.
- [ ] `M005CreateImages` — Tabelle `images`:
      `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`,
      `character_id INT UNSIGNED NULL` mit Fremdschlüssel auf `characters(id)`,
      `ON DELETE CASCADE`,
      `label VARCHAR(191) NULL`,
      `filename VARCHAR(191) NOT NULL UNIQUE` (Dateiname auf der Platte, nicht der
      Originalname),
      `original_name VARCHAR(255) NULL`,
      `mime_type VARCHAR(64) NOT NULL`,
      `width INT UNSIGNED NOT NULL`, `height INT UNSIGNED NOT NULL`,
      `bytes INT UNSIGNED NOT NULL`,
      `created_at DATETIME NOT NULL`,
      Index auf `character_id`.
- [ ] Alle Tabellen mit `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.

### Bewusst weggelassen

- [ ] Keine Spalte `user_id` auf `characters` und `images`. Mehrbenutzerbetrieb ist erklärtes
      Nicht-Ziel (`docs/PROJECT.md`); eine Zuordnungsspalte, die überall mitgeschleppt und nie
      ausgewertet wird, ist Ballast. Diesen Satz als Kommentar in `M004CreateCharacters`
      hinterlegen, damit später niemand rätselt, ob sie vergessen wurde.
- [ ] Keine Tabellen für Templates, Karteninstanzen oder Druckprojekte. Deren Aufbau hängt an
      Entscheidungen, die erst der Template-Editor-Plan trifft.

## Report-Back
