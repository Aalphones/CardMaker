# CardMaker

Ein reines Werkzeug zum Erstellen von Sammelkarten — keine Charakterverwaltung: Templates
definieren das Layout einer Karte (Rahmen, Layer, Positionen, Datenquellen),
Karteninstanzen füllen ein Template mit einem Bild und direkt eingegebenen Texten (per
Formular oder über Claude via MCP), Kartengruppen organisieren gespeicherte Karten
thematisch (z. B. eine „Spiderman-Serie"), Druckprojekte sammeln Karten und exportieren sie
als druckfertige Bögen (DIN A4, 3×3 Karten, PDF/PNG).

Die Trennung von Layout und Inhalt bedeutet: Templates bleiben unverändert, Karten sind
jederzeit neu renderbar, und das System ist nicht auf einen bestimmten Kartentyp beschränkt.

Vollständiger Projekt-Kontext, Scope und Architektur: [`AGENTS.md`](AGENTS.md) →
[`docs/PROJECT.md`](docs/PROJECT.md).

## Stack

Angular 22 + NgRx + Konva.js + Semantic CSS (Frontend) · PHP 8.5 + MySQL, kein Composer
(Backend, Strato Shared Hosting) · Python + MCP SDK (lokaler Assistant-Tool-Server).

## Quickstart

Das Backend läuft nicht lokal — es gibt auf diesem Rechner weder PHP noch MySQL
(siehe [ADR-006](docs/decisions/006-deployment-und-abhaengigkeiten.md)). Jede
Backend-Änderung geht per Doppelklick auf den Server.

### Einmalig einrichten

1. Auf Strato eine Subdomain für die API anlegen, deren Web-Wurzel auf `backend/public/`
   zeigt, dazu eine MySQL-Datenbank.
2. [WinSCP](https://winscp.net) als portables Paket entpacken (keine Installation, keine
   Administratorrechte). Gebraucht wird die Konsolen-Fassung `WinSCP.com`.
3. `deploy.env.example` nach `deploy.env` kopieren und ausfüllen. Die Datei landet nicht
   im Git.
4. Nur bei SFTP: WinSCP einmal von Hand starten und verbinden. Den angezeigten
   Fingerabdruck (Form `ssh-ed25519 256 SHA256:…`) in `deploy.env` unter `SFTP_HOSTKEY`
   eintragen. Ein Stern als Platzhalter ist bewusst nicht vorgesehen — der würde jeden
   Server akzeptieren, der sich für deinen ausgibt. Bietet dein Paket kein SFTP:
   `SFTP_PROTOCOL=ftp` setzen, dann entfällt der Fingerabdruck.

### Hochladen

```
deploy.cmd            Backend und Frontend
deploy.cmd backend    nur das Backend
deploy.cmd frontend   nur das Frontend
```

Das Skript schreibt `backend/.env` aus den Werten in `deploy.env`, baut bei Bedarf das
Frontend und lädt beides hoch. Das Fenster bleibt am Ende offen und meldet Erfolg oder
Fehler. Hochgeladene Bilder und Server-Logs werden dabei nie gelöscht.

### Nachsehen, was der Server sagt

- `https://<api>/api/health` — Status, PHP-Version, Datenbankverbindung, angewandte
  Schema-Schritte. Ohne Anmeldung erreichbar.
- `https://<api>/diag.php` — PHP-Version, verfügbare Bildbibliotheken, Upload-Grenzen.
  Nur mit dem Kopfzeilenwert `X-Migrate-Token` aus `deploy.env`; ohne den verhält sich die
  Seite, als gäbe es sie nicht.

## Status

Fundament im Bau ([`STATE.md`](STATE.md) zeigt auf den aktuellen Stand). Backend-Gerüst und
Hochlade-Skript stehen, Datenbank, Anmeldung und Oberfläche folgen.
