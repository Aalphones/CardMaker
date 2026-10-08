# 020 — Gemeinsamer Webroot: CardMaker unter /card/, API unter /api/

**Status:** Akzeptiert (2026-10-08) · ändert das Ordnerlayout aus [013](013-backend-ausserhalb-des-webbereichs.md)

## Kontext

`quantum-canvas.de` liefert jetzt einen Ordner `www` aus, in dem mehrere Anwendungen nebeneinander
laufen (CamScanner unter `/scanner/`). Strato stellt für Subdomains in diesem Paket kein
Zertifikat aus, ohne HTTPS gibt es beim Scanner keine Kamera — also bekommt jede Anwendung
einen Pfad statt einer Subdomain. Der einzige SFTP-Zugang sieht nur `www`; der frühere Ordner
`cardMaker/` samt Backend existiert nicht mehr.

## Entscheidung

```
www/                  ← Webroot der Domain, einziger SFTP-Zugang
  .htaccess           ← https erzwingen, "/" → /card/   (aus www-root/ im Git)
  card/               ← CardMaker-Oberfläche, gebaut mit base href /card/
  api/                ← Brücke (aus api-bridge/ im Git)
  backend/            ← Programmcode, vendor/, .env, uploads/ — per .htaccess komplett gesperrt
  scanner/            ← CamScanner
```

- Die **API bleibt unter `/api/`**, nicht unter `/card/api/`: Die Routen im Backend tragen das
  Präfix `/api` fest, der Pfad im MCP-Server ändert sich dadurch nicht.
- Das **Backend liegt im Webroot** (Option (b) aus 013), weil es keinen zweiten Zugang gibt, der
  außerhalb von `www` schreiben darf. Es wird nie über eine Adresse aufgerufen: die Brücke bindet es
  per Dateizugriff (`../backend/public/`) ein, und `backend/.htaccess` sperrt den ganzen Ordner
  mit `Require all denied`. Der Schutz hängt damit an dieser einen Datei — nach jedem Deploy per
  `curl` prüfen, dass `/backend/.env` und `/backend/composer.json` mit 403 antworten.
- Schriften der Karten werden mit relativem Pfad ins CSS eingebunden und vom Build gehasht
  abgelegt; ein absolutes `/fonts/…` würde unter `/card/` ins Leere laufen.

## Konsequenzen

- Fällt die Sperre aus (andere Apache-Einstellung, Datei überschrieben), liegen Datenbank-Passwort
  und Programmcode offen. Wer einen zweiten Zugang oberhalb von `www` einrichtet, verschiebt
  `backend/` dorthin und stellt die Brücke wieder auf 013 um (`REMOTE_BACKEND_PATH`, ein Pfad in
  `api-bridge/`).
- Alte Adressen wie `quantum-canvas.de/<Unterseite>` gibt es nicht mehr; nur `/` leitet weiter.
- Hochgeladene Bilder und Schriften unter `backend/uploads/`, die nur auf dem alten Server lagen,
  sind mit dem Ordner `cardMaker/` verloren, sofern keine Sicherung existiert.
