# 013 — Backend außerhalb des ausgelieferten Bereichs, Brücke im Webbereich

**Status:** Akzeptiert (2026-08-01)

## Kontext

Der Plan ging von einer eigenen Subdomain für die API aus, deren Web-Wurzel direkt auf
`backend/public/` zeigt. Der tatsächliche Zustand auf Strato ist ein anderer:

- Der SFTP-Zugang beginnt bei `htdocs/cardMaker/`.
- `quantum-canvas.de` liefert `htdocs/cardMaker/public` aus.
- Eine API-Subdomain gibt es nicht, und die Oberfläche soll unter der Hauptadresse laufen,
  die API darunter unter `/api`.

Damit steht die Frage, wo Programmcode, `vendor/` und vor allem die Datei mit den
Datenbank-Zugangsdaten liegen.

## Optionen

- (a) Subdomain im Strato-Panel anlegen und auf ein eigenes Verzeichnis zeigen lassen.
  Sauber, aber setzt Handarbeit im Panel und eine DNS-Wartezeit voraus.
- (b) Das ganze Backend nach `public/api/` legen. Einfach, aber `.env`, `src/` und `vendor/`
  liegen dann im ausgelieferten Bereich, geschützt nur durch eine Zugriffsregel-Datei.
- (c) Backend **neben** den ausgelieferten Bereich legen, im Webbereich steht nur eine
  Brücke aus drei Dateien.

## Entscheidung

**(c).** Auf dem Server:

```
cardMaker/
  backend/          ← src, vendor, storage, .env — über keine Adresse erreichbar
  public/           ← was der Webserver ausliefert
    api/            ← Brücke: index.php, diag.php, .htaccess (aus api-bridge/ im Git)
    <Oberfläche>
```

Die Brücke besteht aus je einer Zeile, die die echte Eintrittsstelle einbindet. `__DIR__`
zeigt in der eingebundenen Datei auf deren eigenen Ort, deshalb findet das Backend seine
Pfade unverändert — am Programmcode ändert sich nichts.

Vorbedingung, gemessen statt vermutet: `open_basedir` ist auf diesem Paket leer, der
übergeordnete Ordner ist lesbar.

## Konsequenzen

- Zugangsdaten und Programmcode sind nicht über eine Adresse erreichbar — auch dann nicht,
  wenn eine Zugriffsregel-Datei einmal nicht greift. Belegt: `/api/.env` antwortet mit `404`.
- Drei Dateien mehr, die zum Backend passen müssen. Ändert sich der Name der Eintrittsstelle,
  ändert sich die Brücke mit.
- `backend/.htaccess` und `backend/public/.htaccess` bleiben liegen, obwohl sie in diesem
  Aufbau nicht greifen — sie sind die Rückfallebene, falls das Backend doch einmal im
  ausgelieferten Bereich landet.
- **Offen für den Karteneditor (Meilenstein 3):** Hochgeladene Bilder müssen über eine
  Adresse abrufbar sein, dürfen also nicht neben dem Programmcode liegen. Entweder ein
  eigener Ordner im ausgelieferten Bereich oder Ausliefern durch PHP — das entscheidet der
  Karteneditor-Plan.
- Wird später doch eine Subdomain eingerichtet, entfällt die Brücke ersatzlos; die
  Zielpfade stehen alle in `deploy.env`.
