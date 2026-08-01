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

### Einmalig einrichten

1. **PHP 8.5 und Composer** portabel bereitlegen (ADR-012). PHP-ZIP von
   `windows.php.net`, Variante NTS x64, entpacken; `php.ini-development` nach `php.ini`
   kopieren und darin `extension_dir = "ext"` sowie `pdo_mysql`, `mbstring`, `fileinfo`,
   `gd`, `openssl`, `curl`, `zip` aktivieren. Dazu `composer.phar` von `getcomposer.org`.
   Dann einmal `composer install --working-dir=backend` — `vendor/` liegt nicht im Git.
2. Auf Strato eine MySQL-Datenbank anlegen und wissen, welcher Ordner ausgeliefert wird.
   Der Programmcode landet **neben** diesem Ordner, nicht darin (ADR-013).
3. [WinSCP](https://winscp.net) als portables Paket entpacken (keine Installation, keine
   Administratorrechte). Gebraucht wird die Konsolen-Fassung `WinSCP.com`.
4. `deploy.env.example` nach `deploy.env` kopieren und ausfüllen. Die Datei landet nicht
   im Git.
5. Nur bei SFTP: WinSCP einmal von Hand verbinden, mit `Strg+I` die Server- und
   Protokollinformationen öffnen und den Fingerabdruck in `deploy.env` unter
   `SFTP_HOSTKEY` eintragen — **ohne** das `SHA256:`-Präfix, also in der Form
   `ssh-ed25519 255 1gx2w8…`. Wer den Abdruck nicht findet: einmal mit irgendeinem Wert
   starten, WinSCP bricht ab und nennt den echten. Ein Stern als Platzhalter ist bewusst
   nicht vorgesehen — der würde jeden Server akzeptieren, der sich für deinen ausgibt.
   Bietet dein Paket kein SFTP: `SFTP_PROTOCOL=ftp` setzen, dann entfällt der
   Fingerabdruck.

### Backend lokal starten

```
<php>\php.exe -S 127.0.0.1:8123 -t backend/public backend/public/index.php
```

Danach antwortet `http://127.0.0.1:8123/api/health`. Ohne lokale Datenbank meldet die
Auskunft `dbConnected: false` — der Rest funktioniert trotzdem. Syntaxprüfung ohne Start:
`php -l <datei>`.

### Hochladen

```
deploy.cmd            Backend und Frontend
deploy.cmd backend    nur das Backend (samt Brücke)
deploy.cmd frontend   nur das Frontend
```

Das Skript installiert die Bibliotheken, baut bei Bedarf das Frontend, schreibt
`backend/.env` aus den Werten in `deploy.env` und gleicht drei Ordner mit dem Server ab.
Das Fenster bleibt am Ende offen und meldet Erfolg oder Fehler. Hochgeladene Bilder und
Server-Logs werden dabei nie gelöscht.

### Nachsehen, was der Server sagt

- `<basisadresse>/api/health` — Status, PHP-Version, Datenbankverbindung, angewandte
  Schema-Schritte. Ohne Anmeldung erreichbar.
- `<basisadresse>/api/diag.php` — PHP-Version, verfügbare Bildbibliotheken, Upload-Grenzen.
  Nur mit dem Kopfzeilenwert `X-Migrate-Token` aus `deploy.env`; ohne den verhält sich die
  Seite, als gäbe es sie nicht. Der Token gehört aus reinen Buchstaben und Ziffern zu
  bestehen — Umlaute überleben eine HTTP-Kopfzeile nicht zuverlässig.

## Status

Fundament im Bau ([`STATE.md`](STATE.md) zeigt auf den aktuellen Stand). Backend-Gerüst und
Hochlade-Skript stehen, Datenbank, Anmeldung und Oberfläche folgen.
