# 012 — Composer und lokale PHP-Umgebung (löst ADR-006 teilweise ab)

**Status:** Akzeptiert (2026-08-01)

## Kontext

ADR-006 verzichtete auf Composer, weil auf der Entwicklungsmaschine kein PHP lag und ohne
Bau-Automatik niemand ein `vendor/` erzeugen konnte. Das war eine Folge der Umgebung, keine
Überzeugung. Die Umgebung hat sich geändert: PHP 8.5 und Composer liegen jetzt lokal
(portabel, ohne Administratorrechte, außerhalb des Projekts unter `.tools/`).

Damit fällt nicht nur die Begründung für den Verzicht weg — es kommt etwas hinzu, das
schwerer wiegt als jede Bibliothek: **Der Backend-Code lässt sich vor dem Hochladen
ausführen.** Vorher zeigte sich ein Tippfehler erst auf dem Server.

## Entscheidung

Composer wird benutzt. Fünf Bibliotheken ersetzen den handgeschriebenen Ersatz aus ADR-006:

| Vorher (Eigenbau) | Jetzt |
|---|---|
| `Support/Router.php` | `nikic/fast-route` |
| `Support/Env.php` | `vlucas/phpdotenv` |
| `Support/Logger.php` | `monolog/monolog` |
| `Support/Validator.php` | `respect/validation` |
| `Support/Autoloader.php` | Composer-Autoloader (PSR-4, `App\` → `backend/src/`) |

`firebase/php-jwt` ist ebenfalls installiert, wird aber **nicht** benutzt: ADR-008 (Zufallstoken
statt JWT) bleibt in Kraft. Seine Begründung stützte sich zwar auf ADR-006, trägt aber
eigenständig — sofortiges Abmelden und eine einzige Codebahn für beide Tokenarten. Ob die
Anmeldung auf JWT umgestellt wird, ist eine Entscheidung für die Auth-Phase, keine, die
durch einen Eintrag in der Paketliste passiert.

**Was aus ADR-006 bestehen bleibt:** keine Bau-Automatik, kein `.github/`, Hochladen per
Doppelklick auf `deploy.cmd`.

## Konsequenzen

- `backend/vendor/` liegt nicht im Git (`composer.lock` schon). Nach einem frischen Klon:
  `composer install --working-dir=backend`.
- `deploy.cmd` führt vor jedem Hochladen `composer install --no-dev --optimize-autoloader`
  aus und lädt `vendor/` mit. Ohne Composer-Pfad in `deploy.env` wird ein vorhandenes
  `vendor/` unverändert übertragen; fehlt beides, bricht das Skript ab.
- `composer.json` pinnt die Ziel-Laufzeit auf die Serverversion (`config.platform.php`),
  damit lokal nichts aufgelöst wird, was der Server nicht kann.
- **Falle mit Folgen:** phpdotenv schneidet einen **unquotierten** Wert am ersten `#` ab. Ein
  Datenbankpasswort mit Rautezeichen kam dadurch als Bruchstück auf dem Server an.
  `deploy.cmd` schreibt Werte deshalb in einfachen Anführungszeichen. Ein Wert mit einem
  einfachen Anführungszeichen darin geht nicht.
- Der eigene Autoloader ist weg: neue Klassen brauchen keinen Eintrag, aber nach einer
  Umbenennung von Namensräumen muss `composer dump-autoload` laufen.
