# 008 — Zufallstoken in der Datenbank statt JWT (löst ADR-004 ab)

**Status:** Akzeptiert (2026-08-01)

## Kontext

ADR-004 sah JWT-Sessions für den Browser und dauerhafte Personal Access Tokens für
skripteten Zugriff vor — zwei Verfahren nebeneinander. Mit dem Wegfall von Composer
(ADR-006) gäbe es für JWT keine geprüfte Bibliothek mehr im Backend, und eine selbst
geschriebene Signaturprüfung ist genau die Art Sparsamkeit, die man später bereut —
Kryptografie wird in diesem Projekt nicht selbst gebaut (siehe ADR-006).

## Optionen

- (a) JWT-Bibliothek trotzdem einbinden und `vendor/` von Hand pflegen (bricht ADR-006).
- (b) JWT-Signaturprüfung selbst implementieren.
- (c) Beide Tokenarten (Browser-Session und Personal Access Token) als Zufallswerte in der
  Datenbank, kein JWT mehr.

## Entscheidung

**(c).** Anmeldung erzeugt 32 Zufallsbytes; gespeichert wird nur der SHA-256-Hashwert davon,
in der Tabelle `sessions` samt Ablaufzeitpunkt. Zugriffstoken für Skripte (`mcp/`, künftige
Automatisierung) funktionieren identisch, nur ohne Ablauf, in `personal_access_tokens`.

## Konsequenzen

- **Vorteil:** eine einzige Codebahn für beide Tokenarten statt zweier; keine Kryptografie im
  eigenen Code (nur Zufallsgenerierung + Hashing, beides PHP-Bordmittel); Abmelden wirkt
  sofort — bei JWT prinzipbedingt nicht möglich, ohne eine Sperrliste zu pflegen.
- **Preis:** eine Datenbankabfrage pro authentifizierter Anfrage. Bei einem
  Einzelnutzer-Werkzeug ohne nennenswerte Last irrelevant.
- Laufzeit einer Browser-Session: 30 Tage, Ablage im `localStorage`. Bei einer
  Frontend-Skriptlücke wäre das Token auslesbar — für ein Werkzeug ohne fremde Inhalte
  akzeptiert, bei einem hypothetischen Mehrbenutzerbetrieb zu revidieren.
- Kein Passwort-Zurücksetzen-Flow; Wiederherstellung über direkten Zugriff auf die
  Datenbank (phpMyAdmin).
- `docs/decisions/004-jwt-plus-pat-auth.md` trägt ab jetzt den Status „Abgelöst durch
  ADR-008 (2026-08-01)" — die Datei bleibt bestehen, eine abgelöste Entscheidung ist Teil
  der Geschichte, nicht zu löschen.
