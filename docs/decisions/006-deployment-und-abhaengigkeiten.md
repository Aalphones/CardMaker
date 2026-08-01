# 006 — Kein Composer, keine Bau-Automatik, Hochladen per Skript

**Status:** Teilweise abgelöst durch [ADR-012](012-composer-und-lokale-php-umgebung.md)
(2026-08-01) — der Composer-Verzicht ist hinfällig, seit PHP und Composer lokal verfügbar
sind. Bestehen bleibt: keine Bau-Automatik, kein `.github/`, Hochladen per Skript.

## Kontext

Auf der Entwicklungsmaschine gibt es weder PHP noch Composer noch MySQL noch Docker, und es
soll bewusst keine Bau-Automatik geben (kein GitHub-Actions-Durchlauf, keine Prüfung beim
Hochladen). Damit kann kein `vendor/`-Verzeichnis entstehen — weder lokal noch auf einem
Bau-Rechner, den es nicht gibt.

## Optionen

- (a) PHP und Composer lokal installieren, `vendor/` normal pflegen.
- (b) `vendor/` von einem externen Bau-Durchlauf (z.B. GitHub Actions) erzeugen und
  mit hochladen lassen.
- (c) Backend ohne Composer-Abhängigkeiten schreiben — die paar wirklich gebrauchten
  Codezeilen selbst schreiben statt Bibliotheken einzubinden.

## Entscheidung

**(c).** Die fünf ursprünglich vorgesehenen Bibliotheken werden ersetzt durch rund 200
Zeilen eigenen Code unter `backend/src/Support/`:

| Vorgesehen war | Ersatz |
|---|---|
| `nikic/fast-route` | Eigener Wegweiser über Pfadsegmente, rund 50 Zeilen — bei etwa 15 Pfaden braucht es keinen Regelwerk-Übersetzer |
| `vlucas/phpdotenv` | Eigener Leser für die Konfigurationsdatei, rund 20 Zeilen |
| `monolog/monolog` | `error_log()` in eine Datei, rund 10 Zeilen |
| `respect/validation` | Eigene Prüfhelfer, rund 60 Zeilen |
| `firebase/php-jwt` | **Entfällt ersatzlos** — siehe ADR-008, es gibt keine JWT mehr |

**Ausdrücklich festgehalten: Nichts Kryptografisches wird selbst gebaut.** Der einzige
Grund, warum der Verzicht auf `firebase/php-jwt` vertretbar ist, ist der Wegfall von JWT als
solchem (ADR-008) — nicht die Bereitschaft, Signaturprüfung selbst zu schreiben. Ein
selbstgeschriebener Token-Prüfer wäre die falsche Sparsamkeit gewesen.

Hochladen: ein Windows-Skript `deploy.cmd` im Projektstamm, Zugangsdaten in `deploy.env`
(nicht im Git). Kein GitHub-Actions-Durchlauf, `.github/` wird entfernt.

## Konsequenzen

- Jede Backend-Änderung braucht einen Hochlade-Lauf; es gibt keine automatische Prüfung vor
  dem Hochladen — ein Tippfehler zeigt sich erst nach dem Deploy.
- Kommt später doch eine Bibliothek dazu (z.B. weil Composer irgendwann verfügbar wird), ist
  das eine echte Entscheidung mit eigenem ADR, kein Nebenbei-Hinzufügen.
- `backend/composer.json` existiert nicht — die CI-Prüfung „existiert `backend/composer.json`"
  entfällt damit ohnehin (siehe auch: `.github/` wird komplett entfernt).
