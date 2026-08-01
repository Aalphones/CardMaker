# Fundament & Grundgerüst (Meilenstein 1)

Erster Umsetzungsplan für CardMaker. Bringt das Projekt von „nur Dokumentation" auf
„eingeloggt, erste Kartengruppe angelegt". Template-Editor, Karteneditor (inkl. Bild-Upload
pro Karte), Rendering und Druckprojekte bekommen eigene Pläne, sobald dieses Fundament
steht. Kartengruppen übernehmen hier die Rolle, die ursprünglich Charaktere hatten — ADR-011
hat die Charakterverwaltung ersatzlos gestrichen, Kartengruppen sind der einfachste Baustein,
der ohne ein Template auskommt und trotzdem den vollen Durchstich beweist.

**Ergebnis am Ende:** Du öffnest die App lokal, loggst dich ein, legst eine Kartengruppe an
(z. B. „Spiderman-Serie"), benennst sie um und siehst sie in einer Liste wieder. Das Backend
läuft dabei echt auf Strato, hochgeladen per Doppelklick auf ein Skript.

---

## Leitplanken dieses Projekts

Drei Festlegungen, die den ganzen Plan prägen — jede kostet etwas, jede ist bewusst:

- **Keine automatisierten Tests.** Weder im Frontend noch im Backend. Geprüft wird von Hand
  nach dem Rundgang am Ende dieser Datei.
- **Keine Bau-Automatik.** Kein GitHub-Actions-Durchlauf, keine Prüfung beim Hochladen. Das
  bestehende Gerüst unter `.github/` wird entfernt.
- **Hochladen per Doppelklick.** Ein Windows-Skript im Projektstamm schiebt Backend und
  gebautes Frontend per SFTP auf den Server, Zugangsdaten aus einer lokalen
  Konfigurationsdatei.

> **Korrektur während Phase 2:** Der ursprüngliche vierte Punkt — „das Backend kommt ohne
> Composer aus" — ist hinfällig. PHP und Composer liegen jetzt lokal, das Backend nutzt
> fast-route, phpdotenv, monolog und respect/validation (ADR-012). Der wichtigere Gewinn
> ist nicht die Bibliothek, sondern dass der Code vor dem Hochladen ausgeführt werden kann.

---

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Entscheidungen festhalten & Doku begradigen](phase-1-entscheidungen-und-doku.md) | mechanisch | complete |
| 2 | [Backend-Gerüst & Deploy-Skript](phase-2-backend-geruest-und-deploy.md) | heikel | complete |
| 3 | [Datenbank-Schema & Migrations-Runner](phase-3-datenbank-schema.md) | standard | complete |
| 4 | [Login & Zugriffstoken im Backend](phase-4-auth-backend.md) | heikel | complete (AK 6 offen) |
| 5 | [Frontend-Gerüst](phase-5-frontend-geruest.md) | standard | complete |
| 6 | [Login im Frontend](phase-6-auth-frontend.md) | standard | complete |
| 7 | [Kartengruppen](phase-7-kartengruppen.md) | standard | pending |
| 8 | [Doku-Abgleich & Abnahme](phase-8-abschluss.md) | mechanisch | pending |

Reihenfolge ist bindend: 2 vor 3 vor 4, und 5 vor 6 vor 7. Phase 5 darf parallel zu
2–4 laufen — sie hängt an nichts aus dem Backend außer der API-Adresse.

---

## Voraussetzungen, die nur du erledigen kannst

> **Erledigt am 2026-08-01.** Datenbank steht, WinSCP liegt bereit, der Server antwortet.
> Statt einer eigenen Subdomain liefert `quantum-canvas.de` die Oberfläche aus und die API
> läuft darunter unter `/api` — der Programmcode liegt daneben, außerhalb des
> ausgelieferten Bereichs (ADR-013). Punkt 1 unten ist damit gegenstandslos.

1. **Auf Strato eine Subdomain für die API einrichten** (Vorschlag: `api.<deine-domain>`),
   mit eigenem Verzeichnis, dessen Web-Wurzel auf `public/` zeigt. Geht das bei deinem Paket
   nicht, siehe Notlösung in Phase 2.
2. **MySQL-Datenbank auf Strato anlegen**, Zugangsdaten notieren.
3. **WinSCP als portable Fassung entpacken** (ZIP von winscp.net, keine Installation nötig,
   keine Administratorrechte) und den Pfad in der Konfigurationsdatei eintragen. Begründung
   in Phase 2: Windows bringt zwar ein SFTP-Programm mit, das aber kein Passwort aus einem
   Skript annimmt — und Strato erlaubt auf geteiltem Hosting üblicherweise keine
   Schlüsseldatei.

Ob dein Strato-Paket überhaupt SFTP anbietet oder nur einfaches FTP, weiß ich nicht. Falls
nur FTP: dasselbe Skript, dasselbe Programm, eine geänderte Zeile in der Konfiguration — das
ist in Phase 2 vorgesehen.

---

## Schnittstelle Frontend ↔ Backend (verbindlich)

Der Kontrakt steht hier und nirgends sonst. Phasen 4/6/7 bauen gegen genau diese Liste.
Antworten immer JSON, Feldnamen nach außen in camelCase (Regel aus `docs/conventions/php.md`).

### Systempfade

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/health` | `{ status, phpVersion, dbConnected, migrationsApplied }` — ohne Anmeldung erreichbar |
| `POST` | `/api/migrate` | Führt offene Schema-Schritte aus. Header `X-Migrate-Token` muss dem Wert aus der Serverkonfiguration entsprechen. Antwort `{ applied: string[] }` |
| `POST` | `/api/setup` | Legt den ersten und einzigen Account an: `{ email, password }` → `201`. Existiert schon ein Account: `410` |
| `GET` | `/diag.php` | Serverauskunft: PHP-Version, Erweiterungen, Upload-Grenzen. Header `X-Migrate-Token` nötig, sonst `404`. Liegt bewusst neben dem Wegweiser — sie muss auch dann antworten, wenn das Gerüst klemmt |

### Anmeldung

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, expiresAt, user: { id, email } }` |
| `POST` | `/api/auth/logout` | Beendet die aktuelle Sitzung → `204` |
| `GET` | `/api/auth/me` | → `{ user: { id, email } }` |
| `GET` | `/api/tokens` | `{ items: [{ id, name, createdAt, lastUsedAt }] }` |
| `POST` | `/api/tokens` | `{ name }` → `{ id, name, token }` — `token` wird **nur hier einmalig** im Klartext geliefert |
| `DELETE` | `/api/tokens/{id}` | → `204` |

### Kartengruppen

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/card-groups` | `{ items: [CardGroup] }` |
| `POST` | `/api/card-groups` | `{ name, description? }` → `201` + `CardGroup` |
| `GET` | `/api/card-groups/{id}` | → `CardGroup` |
| `PATCH` | `/api/card-groups/{id}` | Teilaktualisierung → `CardGroup` |
| `DELETE` | `/api/card-groups/{id}` | → `204` |

```
CardGroup = {
  id: number,
  name: string,
  description: string | null,
  createdAt: string,                    // ISO-8601
  updatedAt: string
}
```

Kartengruppen sind reine Organisation (siehe ADR-011) — sie enthalten in diesem Plan noch
keine Karten, das Feld dafür entsteht erst mit dem Karteneditor-Plan (Meilenstein 3). Bilder
gehören dort direkt zur Karteninstanz, nicht zu einer eigenen Verwaltung — deshalb taucht in
diesem Fundament-Plan kein `/api/images`-Pfad auf.

### Fehler

Einheitlich, immer JSON:

```
{ "error": "<maschinenlesbarer_code>", "message": "<Klartext>", "fields"?: { "<feld>": "<grund>" } }
```

Codes: `unauthorized` (401), `forbidden` (403), `not_found` (404), `method_not_allowed` (405),
`validation_failed` (422), `payload_too_large` (413), `server_error` (500).

---

## Abnahmekriterien für das Gesamtergebnis

1. `GET /api/health` auf der Strato-Subdomain antwortet mit Status `ok`, meldet die
   PHP-Version und dass die Datenbank verbunden ist.
2. Doppelklick auf das Deploy-Skript lädt Backend und gebautes Frontend hoch und meldet am
   Ende deutlich Erfolg oder Fehler — das Fenster schließt sich nicht von selbst.
3. Die lokal gestartete Angular-App spricht mit genau diesem Backend — kein Mock.
4. Anmeldung funktioniert: falsches Passwort wird abgewiesen, richtiges führt in die App, und
   nach einem Browser-Neustart bist du noch angemeldet.
5. Ohne Anmeldung landet jeder Aufruf einer Innenseite auf der Anmeldeseite.
6. Kartengruppe anlegen, umbenennen und löschen funktioniert, Änderungen überleben ein
   Neuladen.
7. Ein selbst erzeugtes Zugriffstoken funktioniert als Alternative zur Anmeldung, geprüft mit
   einem einzelnen Aufruf gegen `/api/card-groups`.
8. Im Projekt existiert kein Testgerüst und kein `.github/`-Verzeichnis mehr.

---

## Abnahme-Rundgang (in dieser Reihenfolge durchgehen)

Es gibt keine automatisierten Tests — dieser Rundgang ist die einzige Prüfung, die dieses
Projekt kennt. Oben stehen die Stellen, an denen ich selbst am unsichersten bin.

1. **🔴 Kommt das Deploy-Skript überhaupt auf den Server?** Doppelklick, zusehen. Erwartetes
   Verhalten bei falschem Passwort: verständliche Meldung, kein wortloses Verschwinden des
   Fensters.
2. **🔴 Läuft auf Strato wirklich PHP 8.5?** Öffne `/api/health` und lies die Version. Steht
   dort etwas Älteres als 8.2, sag Bescheid — dann muss der Code an ein paar Stellen anders
   geschrieben werden.
3. **🔴 Kommt eine hochgeladene Datei heil an?** Lade ein großes Bild hoch (5–8 MB). Strato
   begrenzt Uploads serverseitig. Erwartet bei zu großer Datei: verständliche Meldung in der
   Oberfläche, kein stiller Abbruch.
4. **🔴 Greift die Herkunftssperre des Browsers?** App läuft lokal, Backend auf Strato — zwei
   Adressen. Entwicklerkonsole beim Anmelden öffnen: dort darf keine CORS-Meldung stehen.
5. Anmelden mit falschem Passwort → verständliche Fehlermeldung, kein Sprung in die App.
6. Angemeldet Seite neu laden → du bleibst drin.
7. Abmelden → zurück zur Anmeldeseite; danach dasselbe Token noch einmal von Hand verwenden
   → muss abgewiesen werden.
7a. **Aus Phase 4 offen:** In phpMyAdmin bei einer frischen Sitzung `expires_at` in die
    Vergangenheit setzen (Spalte ist UTC), dann `GET /api/auth/me` mit dem Token → muss
    `401` liefern. Die einzige Prüfung, die von außen nicht geht: Strato lässt keine
    Datenbankverbindung von woanders zu.
8. Kartengruppe anlegen (z. B. „Spiderman-Serie"), speichern, neu laden, Name prüfen.
9. Kartengruppe umbenennen — Änderung übersteht ein Neuladen.
10. Kartengruppe löschen mit Rückfrage → verschwindet aus der Liste.
11. Zugriffstoken erzeugen, damit `/api/card-groups` abrufen, Token löschen, Aufruf
    wiederholen → jetzt abgewiesen.
12. Deploy-Skript ein zweites Mal laufen lassen → die angelegten Kartengruppen sind noch da.

---

## Risiken und Annahmen

- 🟡 **Ohne Tests ist der Rundgang die einzige Absicherung.** Das trifft besonders den
  Rechenkern, der später kommt: Einheiten-Umrechnung, automatische Textverkleinerung,
  Bogenaufteilung. Ein Rechenfehler dort zeigt sich am gedruckten Ergebnis, nicht vorher.
  Für dieses Fundament ist das vertretbar (fast alles ist Datenverwaltung), für den
  Rendering-Plan gehört die Frage neu gestellt.
- 🟡 **Jede Backend-Änderung braucht einen Doppelklick und ein paar Sekunden.** Es gibt lokal
  kein PHP, keine Datenbank (ADR-006). Ein Tippfehler zeigt sich erst nach dem Hochladen.
  Gegenmittel ist keine neue Architektur, sondern eine lokale PHP-Installation — sag
  Bescheid, wenn es nervt.
- 🟡 **Selbst geschriebene Grundbausteine statt Bibliotheken.** Wegweiser, Konfigurationsleser
  und Prüfhelfer sind einfach und überschaubar. Die einzige Stelle, an der das ernsthaft
  Gewicht hätte, wäre die Anmeldung — deshalb wird dort **nichts** selbst gebaut, was mit
  Kryptografie zu tun hat: keine selbstgebauten JWT, sondern Zufallstoken in der Datenbank
  (ADR-008). Das ist gleichzeitig einfacher und sicherer.
- 🟡 **Wer das Zugriffstoken hat, kommt rein.** Tokens werden nur als Hashwert gespeichert und
  sind genau einmal im Klartext sichtbar. Kein Ablaufdatum, Löschen ist der Widerruf.
- 🟡 **Ein einziges Benutzerkonto, keine Registrierung.** Das Konto entsteht über einen
  Einrichtungsaufruf, der sich selbst versiegelt. Passwort vergessen = Eintrag über
  phpMyAdmin ersetzen.
- 🟡 **Die Zugangsdaten fürs Hochladen liegen im Klartext auf deiner Platte.** In einer Datei,
  die nicht im Git landet. Auf einem Einzelplatzrechner vertretbar; wenn die Platte nicht
  verschlüsselt ist, ist das dein Abwägungspunkt, nicht meiner.

### Wo ich mir am wenigsten sicher war — beantwortet in Phase 2

| Stelle | Ergebnis |
|---|---|
| Bietet Strato SFTP mit Passwort? | Ja, SFTP läuft, Fingerabdruck geprüft |
| PHP-Version und Erweiterungen | PHP 8.5.7; `pdo_mysql`, `gd`, `imagick`, `fileinfo`, `mbstring` alle vorhanden |
| Upload-Grenzen | 128 MB, Speicher 512 MB, Laufzeit 240 s — deutlich mehr als angenommen |
| Web-Wurzel auf `public/` legbar? | Nicht nötig: Programmcode liegt **neben** dem ausgelieferten Bereich, im Webbereich steht nur eine Brücke (ADR-013) |

---

## Nicht Teil dieses Plans

Template-Editor, Karteneditor, Rendering in Druckauflösung, Druckbögen, Assistenten-Zugriff.
Auch das Datenbankschema für Templates und Karten bleibt bewusst offen — es hängt an
Entscheidungen, die erst der Template-Editor-Plan trifft.

Bildverwaltung ist ebenfalls nicht Teil dieses Plans: Ein Bild gehört ab jetzt direkt zu
einer Karteninstanz (ADR-011) und wird erst im Karteneditor-Plan (Meilenstein 3) gebaut,
zusammen mit dem Upload-Mechanismus. Es entsteht hier keine eigenständige Bild-Bibliothek.

---

## Summary

_(beim Archivieren füllen)_

## Files touched

_(beim Archivieren füllen)_

## Commits

_(beim Archivieren füllen)_

## Deviations from plan

_(beim Archivieren füllen)_

## Follow-ups

_(beim Archivieren füllen)_
