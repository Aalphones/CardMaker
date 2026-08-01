# Fundament & Grundgerüst (Meilenstein 1)

Erster Umsetzungsplan für CardMaker. Bringt das Projekt von „nur Dokumentation" auf
„eingeloggt, Charaktere mit Bildern angelegt". Template-Editor, Karteneditor, Rendering und
Druckprojekte bekommen eigene Pläne, sobald dieses Fundament steht.

**Ergebnis am Ende:** Du öffnest die App lokal, loggst dich ein, legst einen Charakter mit
Attributen an, lädst ein Bild dazu hoch und siehst beides in einer Liste wieder. Das Backend
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

Daraus folgt eine vierte, weniger offensichtliche: **Das Backend kommt ohne Composer aus.**
Ohne Bau-Automatik und ohne lokales PHP könnte niemand ein `vendor/`-Verzeichnis erzeugen.
Statt fünf Bibliotheken einzubinden, die dann per Hand gepflegt werden müssten, schreibt das
Backend die knapp 200 Zeilen selbst, die es davon wirklich braucht. Details in ADR-006.

---

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Entscheidungen festhalten & Doku begradigen](phase-1-entscheidungen-und-doku.md) | mechanisch | complete |
| 2 | [Backend-Gerüst & Deploy-Skript](phase-2-backend-geruest-und-deploy.md) | heikel | pending |
| 3 | [Datenbank-Schema & Migrations-Runner](phase-3-datenbank-schema.md) | standard | pending |
| 4 | [Login & Zugriffstoken im Backend](phase-4-auth-backend.md) | heikel | pending |
| 5 | [Frontend-Gerüst](phase-5-frontend-geruest.md) | standard | pending |
| 6 | [Login im Frontend](phase-6-auth-frontend.md) | standard | pending |
| 7 | [Charakterverwaltung](phase-7-charaktere.md) | standard | pending |
| 8 | [Bildverwaltung & Upload](phase-8-bilder.md) | heikel | pending |
| 9 | [Doku-Abgleich & Abnahme](phase-9-abschluss.md) | mechanisch | pending |

Reihenfolge ist bindend: 2 vor 3 vor 4, und 5 vor 6 vor 7 vor 8. Phase 5 darf parallel zu
2–4 laufen — sie hängt an nichts aus dem Backend außer der API-Adresse.

---

## Voraussetzungen, die nur du erledigen kannst

Diese drei Punkte blockieren Phase 2.

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

Der Kontrakt steht hier und nirgends sonst. Phasen 4/6/7/8 bauen gegen genau diese Liste.
Antworten immer JSON, Feldnamen nach außen in camelCase (Regel aus `docs/conventions/php.md`).

### Systempfade

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/health` | `{ status, phpVersion, dbConnected, migrationsApplied }` — ohne Anmeldung erreichbar |
| `POST` | `/api/migrate` | Führt offene Schema-Schritte aus. Header `X-Migrate-Token` muss dem Wert aus der Serverkonfiguration entsprechen. Antwort `{ applied: string[] }` |
| `POST` | `/api/setup` | Legt den ersten und einzigen Account an: `{ email, password }` → `201`. Existiert schon ein Account: `410` |

### Anmeldung

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, expiresAt, user: { id, email } }` |
| `POST` | `/api/auth/logout` | Beendet die aktuelle Sitzung → `204` |
| `GET` | `/api/auth/me` | → `{ user: { id, email } }` |
| `GET` | `/api/tokens` | `{ items: [{ id, name, createdAt, lastUsedAt }] }` |
| `POST` | `/api/tokens` | `{ name }` → `{ id, name, token }` — `token` wird **nur hier einmalig** im Klartext geliefert |
| `DELETE` | `/api/tokens/{id}` | → `204` |

### Charaktere

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/characters` | `{ items: [Character] }` |
| `POST` | `/api/characters` | `{ name, description?, attributes? }` → `201` + `Character` |
| `GET` | `/api/characters/{id}` | → `Character` |
| `PATCH` | `/api/characters/{id}` | Teilaktualisierung → `Character` |
| `DELETE` | `/api/characters/{id}` | → `204`, zugehörige Bilder werden mitgelöscht |
| `GET` | `/api/characters/attribute-keys` | `{ keys: string[] }` — alle im Bestand vorkommenden Attributnamen, Vorschlagsliste für die Eingabe und später für den Template-Editor |

```
Character = {
  id: number,
  name: string,
  description: string | null,
  attributes: Record<string, string>,   // frei wählbare Schlüssel, siehe ADR-007
  imageCount: number,
  createdAt: string,                    // ISO-8601
  updatedAt: string
}
```

### Bilder

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/images` | Optional `?characterId=<id>` → `{ items: [Image] }` |
| `POST` | `/api/images` | `multipart/form-data`: `file`, optional `characterId`, `label`, `width`, `height` → `201` + `Image` |
| `PATCH` | `/api/images/{id}` | `{ characterId?, label? }` → `Image` |
| `DELETE` | `/api/images/{id}` | → `204`, Datei wird mitgelöscht |

```
Image = {
  id: number,
  characterId: number | null,
  label: string | null,
  url: string,        // absolute Adresse, direkt im <img> verwendbar
  width: number,
  height: number,
  bytes: number,
  mimeType: string,
  createdAt: string
}
```

### Fehler

Einheitlich, immer JSON:

```
{ "error": "<maschinenlesbarer_code>", "message": "<Klartext>", "fields"?: { "<feld>": "<grund>" } }
```

Codes: `unauthorized` (401), `forbidden` (403), `not_found` (404), `validation_failed` (422),
`payload_too_large` (413), `server_error` (500).

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
6. Charakter anlegen, umbenennen, Attribute setzen und löschen funktioniert, Änderungen
   überleben ein Neuladen.
7. Bild hochladen funktioniert, das Bild erscheint in der Liste, lässt sich einem Charakter
   zuordnen und wieder löschen — die Datei verschwindet dabei auch vom Server.
8. Ein selbst erzeugtes Zugriffstoken funktioniert als Alternative zur Anmeldung, geprüft mit
   einem einzelnen Aufruf gegen `/api/characters`.
9. Im Projekt existiert kein Testgerüst und kein `.github/`-Verzeichnis mehr.

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
8. Charakter mit zwei eigenen Attributen anlegen (`element: Feuer`, `faction: Rebellen`),
   speichern, neu laden, Werte prüfen.
9. Zweiten Charakter anlegen — beim dritten muss `element` als Vorschlag auftauchen.
10. Bild hochladen, einem Charakter zuordnen, Liste nach Charakter filtern.
11. Bild löschen, danach die Bildadresse direkt im Browser aufrufen → muss ins Leere laufen.
12. Charakter mit Bildern löschen → Bilder weg, keine verwaisten Dateien (per FTP-Programm im
    Upload-Ordner nachsehen).
13. Zugriffstoken erzeugen, damit `/api/characters` abrufen, Token löschen, Aufruf wiederholen
    → jetzt abgewiesen.
14. Deploy-Skript ein zweites Mal laufen lassen → die hochgeladenen Bilder sind noch da.

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

### Wo ich mir am wenigsten sicher bin

| Stelle | Warum wacklig | Was es klärt |
|---|---|---|
| Bietet Strato für dein Paket SFTP an — und mit Passwort? | `docs/PROJECT.md` sagt „kein SSH", was meist auch Schlüsselauthentifizierung ausschließt. SFTP mit Passwort ist trotzdem oft möglich, aber nicht sicher | Erster Lauf des Deploy-Skripts in Phase 2. Falls nur FTP: eine Zeile in der Konfiguration ändern, der Rest bleibt |
| PHP-Version und verfügbare Erweiterungen auf Strato | Nie geprüft, hängt am Paket | Phase 2 lädt eine Auskunftsseite hoch und liest sie einmal aus |
| Upload-Grenzen auf Strato | Geteiltes Hosting deckelt das, Werte unbekannt und nicht überschreibbar | Dieselbe Auskunftsseite meldet sie mit |
| Web-Wurzel auf `public/` legbar? | Wenn nicht, liegen Konfigurationsdatei und Programmcode im öffentlich erreichbaren Bereich | Phase 2 prüft es und hat Zugriffsregeln als Rückfallebene |

---

## Nicht Teil dieses Plans

Template-Editor, Karteneditor, Rendering in Druckauflösung, Druckbögen, Assistenten-Zugriff.
Auch das Datenbankschema für Templates und Karten bleibt bewusst offen — es hängt an
Entscheidungen, die erst der Template-Editor-Plan trifft.

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
