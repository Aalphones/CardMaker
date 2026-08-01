# Phase 4 — Login & Zugriffstoken im Backend

**Rating:** heikel · **Status:** pending

Anmeldung, Absicherung aller Innen-Pfade und dauerhafte Zugriffstoken für Skripte. Heikel,
weil ein Fehler hier nicht auffällt, sondern die Tür offen lässt.

Durch ADR-008 ist diese Phase deutlich kleiner als ursprünglich geplant: Beide Tokenarten
sind Zufallswerte in der Datenbank, es gibt keine Signaturprüfung und keinen selbst
geschriebenen Kryptografie-Code. Der Unterschied zwischen Anmeldung und Zugriffstoken ist
eine Tabelle und ein Ablaufdatum, sonst nichts.

## Kontext lesen

- ADR-008 aus Phase 1 (Zufallstoken statt JWT), ADR-006 (keine Bibliotheken)
- `docs/conventions/php.md` — Fehlerantworten, Wire-Format
- README dieses Plans → Kontrakt, Abschnitt „Anmeldung"
- Phase 2: `src/Http/Request.php`, `Response.php`, `Support/Validator.php`, Aufbau des
  Einstiegspunkts
- Phase 3: Tabellen `users`, `sessions`, `personal_access_tokens`

## Abnahmekriterien

1. `POST /api/setup` legt bei leerer Nutzertabelle ein Konto an und antwortet `201`. Jeder
   weitere Aufruf antwortet `410` und legt nichts an.
2. `POST /api/auth/login` mit richtigen Daten liefert ein Token mit 30 Tagen Laufzeit; mit
   falschen Daten `401` und immer dieselbe Meldung, egal ob die E-Mail existiert.
3. `GET /api/auth/me` funktioniert mit Anmelde-Token und mit Zugriffstoken.
4. Jeder Pfad außer `/api/health`, `/api/setup`, `/api/auth/login` und `/api/migrate` liefert
   ohne gültiges Token `401`.
5. `POST /api/auth/logout` macht das verwendete Token sofort unbrauchbar — derselbe Aufruf
   ein zweites Mal liefert `401`.
6. Ein abgelaufenes Anmelde-Token wird abgewiesen. Prüfbar, ohne 30 Tage zu warten: den
   Ablaufzeitpunkt in phpMyAdmin in die Vergangenheit setzen.
7. Ein neu erzeugtes Zugriffstoken ist genau einmal im Klartext sichtbar; in der Datenbank
   steht nur der Hashwert.
8. Ein gelöschtes Zugriffstoken wird sofort abgewiesen.

## Aufgaben

### Ein Mechanismus für beide Tokenarten

- [ ] `src/Services/TokenService.php` — die gemeinsame Grundlage, damit Anmeldung und
      Zugriffstoken nicht zwei getrennte Wege durch den Code nehmen:
  - `generate(): string` — 32 Zufallsbytes über `random_bytes()`, als Hexzeichenkette.
    **Nicht** `rand()`, `mt_rand()` oder `uniqid()` — die sind vorhersagbar.
  - `hash(string $token): string` — `hash('sha256', $token)`. Kein Salz und keine
    Schlüsselstreckung nötig: der Wert ist bereits zufällig und lang, hier geht es nur darum,
    dass ein Datenbankleck nicht sofort gültige Token liefert.
  - Nachschlagen passiert **immer** über den Hashwert in der Abfrage — nie alle Zeilen holen
    und in PHP vergleichen.
- [ ] `src/Services/AuthService.php`:
  - `createInitialUser(string $email, string $password): array` — wirft, wenn schon ein Konto
    existiert. Passwort mit `password_hash($password, PASSWORD_DEFAULT)`.
  - `login(string $email, string $password): ?array` — prüft mit `password_verify()`. Bei
    unbekannter E-Mail trotzdem eine Vergleichsoperation gegen einen festen Blindwert
    ausführen, damit die Antwortzeit nicht verrät, ob das Konto existiert.
  - `startSession(int $userId): array` — erzeugt das Token, legt die Sitzung mit
    Ablaufzeitpunkt (+30 Tage) an, gibt `['token' => ..., 'expiresAt' => ...]` zurück.
    Räumt bei dieser Gelegenheit abgelaufene Sitzungen weg — es gibt keinen zeitgesteuerten
    Dienst auf geteiltem Hosting, also passiert das hier oder nie.
  - `endSession(string $token): void` — löscht die Zeile.
  - `resolveSession(string $token): ?array` — sucht über den Hashwert, prüft den
    Ablaufzeitpunkt **in der Abfrage** (`expires_at > NOW()`), aktualisiert `last_used_at`.
    Die Ablaufprüfung gehört in die Abfrage und nicht in PHP: sonst hängt sie an der
    Zeitzone des PHP-Prozesses, und die stimmt auf geteiltem Hosting selten mit der
    Datenbank überein.
- [ ] `src/Services/AccessTokenService.php` — `create(int $userId, string $name): array`
      (Klartext genau einmal zurückgeben), `resolve(string $token): ?array` (ohne
      Ablaufprüfung), `list(int $userId): array`, `delete(int $userId, int $tokenId): bool`.

### Absicherung

- [ ] `src/Middleware/Auth.php`: liest die `Authorization`-Kopfzeile im Format
      `Bearer <token>`. Fragt **erst** die Sitzungen, **dann** die Zugriffstoken — beide sind
      64-stellige Hexzeichenketten und äußerlich nicht unterscheidbar, deshalb wird
      nacheinander nachgesehen statt geraten. Kein Treffer: Anfrage mit `401` und
      `{"error":"unauthorized"}` beenden, ohne Hinweis darauf, welche Prüfung fehlschlug.
- [ ] Im Einstiegspunkt eine **Positivliste** offener Pfade führen: `/api/health`,
      `/api/setup`, `/api/auth/login`, `/api/migrate` (eigener Token-Schutz),
      `OPTIONS`-Vorabanfragen. **Alles andere wird geprüft** — die Sperre ist die Vorgabe,
      nicht die Ausnahme. Ein neuer Pfad, den jemand einzutragen vergisst, ist damit
      geschlossen und nicht offen.
- [ ] Den ermittelten Nutzer und das verwendete Token über den Request zugänglich machen
      (`Request::setUser()`), nicht über eine globale Variable. Das Token wird für das
      Abmelden gebraucht.

### Controller

- [ ] `src/Controllers/SetupController.php` — `POST /api/setup`. Prüft zuerst, ob die
      Nutzertabelle leer ist; wenn nicht, `410` mit Code `already_initialized`. Prüfregeln:
      E-Mail formal gültig, Passwort mindestens 12 Zeichen.
- [ ] `src/Controllers/AuthController.php` — `POST /api/auth/login`, `POST /api/auth/logout`,
      `GET /api/auth/me`.
- [ ] `src/Controllers/TokenController.php` — `GET /api/tokens`, `POST /api/tokens`,
      `DELETE /api/tokens/{id}`. Beim Löschen prüfen, dass das Token dem angemeldeten Nutzer
      gehört, sonst `404` (nicht `403` — kein Hinweis auf fremde Kennungen).
- [ ] Prüfregeln über `Support/Validator.php` aus Phase 2, Fehlerantwort `422` mit Feldliste
      im Format aus dem Kontrakt.
- [ ] `src/Repositories/UserRepository.php`, `SessionRepository.php`,
      `AccessTokenRepository.php` — nur Abfragen, ausschließlich vorbereitete Anweisungen.
- [ ] Alle Pfade im Einstiegspunkt registrieren, Dienste an einer Stelle erzeugen und teilen
      (Regel „Composition Root").

### Von Hand prüfen (es gibt keine Tests)

Diese vier Fälle sind der Ersatz für die Testsuite. Ergebnisse ins Report-Back.

- [ ] Anmelden, dann mit demselben Token `/api/auth/me` abrufen → `200`.
- [ ] Abmelden, denselben Aufruf wiederholen → `401`.
- [ ] In phpMyAdmin `expires_at` der Sitzung in die Vergangenheit setzen, Aufruf wiederholen →
      `401`.
- [ ] Ein zufällig zusammengetipptes Token verwenden → `401`, und im Protokoll steht kein
      Fehler (ein ungültiges Token ist ein normaler Vorgang, kein Zwischenfall).

## Report-Back
