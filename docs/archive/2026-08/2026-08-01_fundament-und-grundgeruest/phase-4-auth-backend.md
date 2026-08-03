# Phase 4 — Login & Zugriffstoken im Backend

**Rating:** heikel · **Status:** complete (bis auf AK 6 — siehe Report-Back unten)

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

- [x] `src/Services/TokenService.php` — die gemeinsame Grundlage, damit Anmeldung und
      Zugriffstoken nicht zwei getrennte Wege durch den Code nehmen:
  - `generate(): string` — 32 Zufallsbytes über `random_bytes()`, als Hexzeichenkette.
    **Nicht** `rand()`, `mt_rand()` oder `uniqid()` — die sind vorhersagbar.
  - `hash(string $token): string` — `hash('sha256', $token)`. Kein Salz und keine
    Schlüsselstreckung nötig: der Wert ist bereits zufällig und lang, hier geht es nur darum,
    dass ein Datenbankleck nicht sofort gültige Token liefert.
  - Nachschlagen passiert **immer** über den Hashwert in der Abfrage — nie alle Zeilen holen
    und in PHP vergleichen.
- [x] `src/Services/AuthService.php`:
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
- [x] `src/Services/AccessTokenService.php` — `create(int $userId, string $name): array`
      (Klartext genau einmal zurückgeben), `resolve(string $token): ?array` (ohne
      Ablaufprüfung), `list(int $userId): array`, `delete(int $userId, int $tokenId): bool`.

### Absicherung

- [x] `src/Middleware/Auth.php`: liest die `Authorization`-Kopfzeile im Format
      `Bearer <token>`. Fragt **erst** die Sitzungen, **dann** die Zugriffstoken — beide sind
      64-stellige Hexzeichenketten und äußerlich nicht unterscheidbar, deshalb wird
      nacheinander nachgesehen statt geraten. Kein Treffer: Anfrage mit `401` und
      `{"error":"unauthorized"}` beenden, ohne Hinweis darauf, welche Prüfung fehlschlug.
- [x] Im Einstiegspunkt eine **Positivliste** offener Pfade führen: `/api/health`,
      `/api/setup`, `/api/auth/login`, `/api/migrate` (eigener Token-Schutz),
      `OPTIONS`-Vorabanfragen. **Alles andere wird geprüft** — die Sperre ist die Vorgabe,
      nicht die Ausnahme. Ein neuer Pfad, den jemand einzutragen vergisst, ist damit
      geschlossen und nicht offen.
- [x] Den ermittelten Nutzer und das verwendete Token über den Request zugänglich machen
      (`Request::setUser()`), nicht über eine globale Variable. Das Token wird für das
      Abmelden gebraucht.

### Controller

- [x] `src/Controllers/SetupController.php` — `POST /api/setup`. Prüft zuerst, ob die
      Nutzertabelle leer ist; wenn nicht, `410` mit Code `already_initialized`. Prüfregeln:
      E-Mail formal gültig, Passwort mindestens 12 Zeichen.
- [x] `src/Controllers/AuthController.php` — `POST /api/auth/login`, `POST /api/auth/logout`,
      `GET /api/auth/me`.
- [x] `src/Controllers/TokenController.php` — `GET /api/tokens`, `POST /api/tokens`,
      `DELETE /api/tokens/{id}`. Beim Löschen prüfen, dass das Token dem angemeldeten Nutzer
      gehört, sonst `404` (nicht `403` — kein Hinweis auf fremde Kennungen).
- [x] Prüfregeln über `respect/validation` (nicht das gestrichene `Support/Validator.php`,
      siehe ADR-012) in `src/Validators/`, Fehlerantwort `422` mit Feldliste im Format aus
      dem Kontrakt.
- [x] `src/Repositories/UserRepository.php`, `SessionRepository.php`,
      `AccessTokenRepository.php` — nur Abfragen, ausschließlich vorbereitete Anweisungen.
- [x] Alle Pfade im Einstiegspunkt registrieren, Dienste an einer Stelle erzeugen und teilen
      (Regel „Composition Root").

### Von Hand prüfen (es gibt keine Tests)

Diese vier Fälle sind der Ersatz für die Testsuite. Ergebnisse ins Report-Back.

- [x] Anmelden, dann mit demselben Token `/api/auth/me` abrufen → `200`.
- [x] Abmelden, denselben Aufruf wiederholen → `401`.
- [ ] In phpMyAdmin `expires_at` der Sitzung in die Vergangenheit setzen, Aufruf wiederholen →
      `401`. **Offen** — geht nur von Saschas Hand, siehe unten.
- [x] Ein zufällig zusammengetipptes Token verwenden → `401`, und im Protokoll steht kein
      Fehler (ein ungültiges Token ist ein normaler Vorgang, kein Zwischenfall).

## Report-Back

### Was gebaut wurde

Anmeldung, Sperre und Zugriffstoken stehen im Code. Neu: `Services/TokenService.php`,
`AuthService.php`, `AccessTokenService.php`, `AccountAlreadyExistsException.php`,
`Repositories/UserRepository.php`, `SessionRepository.php`, `AccessTokenRepository.php`,
`Middleware/Auth.php`, `Controllers/SetupController.php`, `AuthController.php`,
`TokenController.php`, `Validators/SetupValidator.php`, `LoginValidator.php`,
`AccessTokenValidator.php`, `Support/Timestamps.php`. Geändert: `Http/Request.php`
(verwendetes Token merken), `Http/Response.php` (Code `already_initialized`),
`public/index.php` (Pfade, Dienste, Sperre).

### Vor Ort geprüft (lokales PHP 8.5.9, ohne Datenbank)

`php -l` über alle Dateien sauber. Eine Probe hat geprüft: alle Klassen laden, Token sind
64 Hexzeichen und bei jedem Aufruf verschieden, der Hashwert ist stabil, Zeitstempel werden
korrekt zu ISO-8601, die drei Prüfregelsätze liefern getrimmte Werte, und das Lesen der
`Authorization`-Kopfzeile trifft alle Fälle (Groß-/Kleinschreibung, fehlend, falsches
Schema, leer, umgeleitet über `REDIRECT_HTTP_AUTHORIZATION`).

**Was damit ausdrücklich nicht geprüft ist:** jede Zeile SQL. Lokal gibt es keine
Datenbank — `UTC_TIMESTAMP()`, die Verknüpfungen und `DATE_ADD` sind ungetestet, bis das
Backend oben liegt.

### Abweichungen vom Plan

- **Abmelden mit einem Zugriffstoken wird abgewiesen (`403`)**, statt das Token zu löschen.
  Sonst nähme ein Klick in der Oberfläche einem laufenden Skript den Zugang. Widerruf eines
  Zugriffstokens geht über `DELETE /api/tokens/{id}`.
- **Alle Zeitstempel laufen über `UTC_TIMESTAMP()`** statt `NOW()`, Ausgabe als ISO-8601 mit
  `Z`. Grund und Regel stehen jetzt in `docs/conventions/php.md`. Betrifft Phase 7.
- **Die Sitzungslaufzeit steht als ganze Zahl im SQL**, nicht als Platzhalter: MySQL nimmt
  für `INTERVAL <n> DAY` je nach Version keinen Platzhalter an. Der Wert kommt aus einer
  Konstante, nie aus einer Anfrage.
- **Die Sperre greift vor dem Wegweiser.** Ein unbekannter Pfad ohne Token antwortet
  deshalb `401` und nicht `404` — er verrät nicht mehr, ob es ihn gibt.
- **`POST /api/setup` liefert `{ user: { id, email } }`** zu seiner `201`, `POST /api/tokens`
  antwortet mit `201`. Der Kontrakt ließ beides offen.
- **`DELETE /api/tokens/{id}` nimmt nur Ziffern.** Alles andere ist `404` aus dem Wegweiser.

### Am Server geprüft (ohne Konto)

Backend hochgeladen, elf Aufrufe gegen `https://quantum-canvas.de/api`:

| Aufruf | Erwartet | Bekommen |
|---|---|---|
| `GET /health` | `200`, Datenbank verbunden | `200`, PHP 8.5.7, `dbConnected: true`, 4 Schema-Schritte |
| `GET /auth/me` ohne Token | `401` | `401 unauthorized` |
| `GET /tokens` ohne Token | `401` | `401 unauthorized` |
| `GET /gibtesnicht` ohne Token | `401` (nicht `404`) | `401 unauthorized` |
| `GET /auth/me` mit erfundenem 64-Zeichen-Token | `401` | `401 unauthorized` |
| `GET /auth/me` mit `Basic`-Kopfzeile | `401` | `401 unauthorized` |
| `POST /auth/login`, unbekannte E-Mail | `401`, neutrale Meldung | `401`, „E-Mail-Adresse oder Passwort stimmt nicht." |
| `POST /auth/login`, leerer Rumpf | `422` mit Feldliste | `422`, beide Felder benannt |
| `POST /setup`, unbrauchbare Angaben | `422`, legt nichts an | `422`, beide Felder benannt |
| `POST /auth/logout` ohne Token | `401` | `401 unauthorized` |
| `DELETE /health` | `405` | `405 method_not_allowed` |

Damit ist auch die zuvor ungeprüfte SQL erstmals wirklich gelaufen: Das erfundene Token
lief durch beide Abfragen (Sitzungen samt `expires_at > UTC_TIMESTAMP()`, dann Zugriffstoken,
je mit Verknüpfung auf `users`) und kam als sauberes `401` zurück statt als `500`.

### Am Server geprüft (mit Konto)

Konto angelegt (Kennung 1), danach siebzehn Aufrufe:

| Aufruf | Erwartet | Bekommen |
|---|---|---|
| `POST /setup` | `201` mit Kennung | `201`, `{ user: { id: 1, email } }` |
| `POST /setup` erneut | `410`, legt nichts an | `410 already_initialized` |
| `POST /auth/login` richtig | `200` mit Token, 30 Tage | `200`, Token, `expiresAt` genau 30 Tage später |
| `POST /auth/login` falsches Passwort | `401`, gleiche Meldung wie bei unbekannter E-Mail | wortgleich |
| `GET /auth/me` mit Anmelde-Token | `200` | `200` mit Nutzer |
| `POST /tokens` | `201`, Klartext genau einmal | `201` mit `token` im Klartext |
| `GET /tokens` | Liste **ohne** Klartext | `id`, `name`, `createdAt`, `lastUsedAt: null` |
| `POST /tokens` mit leerem Namen | `422` | `422` mit Feldangabe |
| `GET /auth/me` mit Zugriffstoken | `200` | `200` mit Nutzer |
| `POST /auth/logout` mit Zugriffstoken | `403` (bewusste Abweichung) | `403 forbidden` |
| `GET /tokens` danach | `lastUsedAt` gesetzt | gesetzt, 13 Sekunden nach dem Anlegen |
| `DELETE /tokens/999` | `404`, kein Hinweis auf fremde Kennungen | `404 not_found` |
| `DELETE /tokens/1` | `204` | `204` |
| `GET /auth/me` mit gelöschtem Zugriffstoken | `401` | `401 unauthorized` |
| `POST /auth/logout` mit Anmelde-Token | `204` | `204` |
| `POST /auth/logout` erneut | `401` | `401 unauthorized` |
| `GET /auth/me` nach dem Abmelden | `401` | `401 unauthorized` |

**Protokolldatei vom Server geholt und angesehen:** letzter Eintrag von 13:11 Uhr, aus den
Datenbank-Nöten früherer Phasen. Die Anmeldeproben liefen ab 14:25 — kein einziger neuer
Eintrag. Ungültige Token sind damit belegt das, was sie sein sollen: ein normaler Vorgang.

Aufgeräumt: Das Probe-Zugriffstoken ist gelöscht, die Sitzung abgemeldet, die
Zwischendateien mit den Zugangsdaten entfernt. Es bleibt genau das Konto.

### Einziger offener Punkt: abgelaufene Sitzung (AK 6)

Braucht einen Griff in die Datenbank, den nur Sascha tun kann — Strato lässt keine
Datenbankverbindung von außen zu (nachgemessen: Zeitüberschreitung). Anleitung:

1. In phpMyAdmin anmelden, `POST /api/auth/login` einmal ausführen, Token merken.
2. In Tabelle `sessions` bei der neuen Zeile `expires_at` auf ein Datum in der
   Vergangenheit setzen (die Spalte ist UTC).
3. `GET /api/auth/me` mit diesem Token → muss `401` liefern.
