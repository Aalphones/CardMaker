# 020 — Gemeinsamer Webroot: CardMaker unter /card/, API unter /api/

**Status:** Akzeptiert (2026-10-08) · ergänzt [013](013-backend-ausserhalb-des-webbereichs.md)

## Kontext

`quantum-canvas.de` liefert jetzt einen Ordner `www` aus, in dem mehrere Anwendungen nebeneinander
laufen (CamScanner unter `/scanner/`). Strato stellt für Subdomains in diesem Paket kein
Zertifikat aus, ohne HTTPS gibt es beim Scanner keine Kamera — also bekommt jede Anwendung
einen Pfad statt einer Subdomain. Der Zugang zu `www` ist auf diesen Ordner beschränkt und sieht
`cardMaker/backend/` nicht.

## Entscheidung

```
www/                  ← Webroot der Domain; Zugang A (eingesperrt in diesen Ordner)
  .htaccess           ← https erzwingen, "/" → /card/   (aus www-root/ im Git)
  card/               ← CardMaker-Oberfläche, gebaut mit base href /card/
  api/                ← Brücke (aus api-bridge/ im Git)
  scanner/            ← CamScanner
cardMaker/
  backend/            ← unverändert; Zugang B (eingesperrt in cardMaker/)
```

- Die **API bleibt unter `/api/`**, nicht unter `/card/api/`: Die Routen im Backend tragen das
  Präfix `/api` fest, die Brücke und der Pfad im MCP-Server ändern sich dadurch nicht.
- Die Brücke bindet das Backend über `../../cardMaker/backend/public/` ein — `www` und `cardMaker`
  liegen im selben übergeordneten Ordner. Das Backend selbst und seine hochgeladenen Bilder
  bleiben, wo sie sind.
- `deploy.cmd` nutzt zwei Zugänge: Zugang A für Oberfläche, Brücke und Weiterleitung, Zugang B
  (`BACKEND_SFTP_USER`) nur fürs Backend.
- Schriften der Karten werden mit relativem Pfad ins CSS eingebunden und vom Build gehasht
  abgelegt; ein absolutes `/fonts/…` würde unter `/card/` ins Leere laufen.

## Konsequenzen

- Alte Adresse `quantum-canvas.de/<Unterseite>` gibt es nicht mehr; nur `/` leitet weiter.
- Der Ordner `cardMaker/public` ist verwaist und kann gelöscht werden, sobald der neue Aufbau läuft.
- Die Brücke hängt am Ordnernamen `cardMaker`. Wird er umbenannt, muss sie mit.
