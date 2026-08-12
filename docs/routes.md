# Routen — CardMaker

Alle Endpunkte, wie in `backend/public/index.php` registriert. Wire-Format: camelCase rein
und raus, snake_case nur intern (`docs/conventions/php.md`). Fehlerantworten immer
`{ error, message, fields? }`, Feldnamen in `fields` camelCase.

Positivliste der offenen Pfade (ohne Anmeldung erreichbar): `/api/health`, `/api/setup`,
`/api/auth/login`, `/api/migrate`. Alles andere braucht eine Sitzung oder ein Zugriffstoken.

## Auth & Setup

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/health` | Diagnose |
| POST | `/api/setup` | Erstes Konto anlegen, danach versiegelt |
| POST | `/api/auth/login` | Anmelden |
| POST | `/api/auth/logout` | Abmelden |
| GET | `/api/auth/me` | Angemeldetes Konto |
| GET | `/api/tokens` | Zugriffstoken auflisten |
| POST | `/api/tokens` | Zugriffstoken anlegen |
| DELETE | `/api/tokens/{id}` | Zugriffstoken widerrufen |
| POST | `/api/migrate` | Ausstehende Migrationen ausführen (Migrate-Token) |

## Kartengruppen (`/api/card-groups`)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/card-groups` | Alle Kartengruppen |
| POST | `/api/card-groups` | Anlegen |
| GET | `/api/card-groups/{id}` | Einzeln |
| PATCH | `/api/card-groups/{id}` | Ändern (nur übergebene Felder) |
| DELETE | `/api/card-groups/{id}` | Löschen — Karten der Gruppe verlieren nur die Zuordnung (`ON DELETE SET NULL`) |

## Bildvorrat (`/api/assets`)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/assets` | Auflisten, optional nach `kind` gefiltert |
| POST | `/api/assets` | Hochladen (mehrteilig: `kind`, `name`, `file`) |
| GET | `/api/assets/{id}/file` | Bilddatei, hinter der Anmeldung |
| DELETE | `/api/assets/{id}` | Löschen — 409, wenn ein Template das Bild noch benutzt |

## Schriftvorrat (`/api/fonts`)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/fonts` | Auflisten |
| POST | `/api/fonts` | Hochladen (mehrteilig: `name`, `file`) |
| GET | `/api/fonts/{id}/file` | Schriftdatei, hinter der Anmeldung |
| PATCH | `/api/fonts/{id}` | Umbenennen |
| DELETE | `/api/fonts/{id}` | Löschen — 409, wenn ein Template die Schrift noch benutzt |

## Templates (`/api/templates`)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/templates` | Kurzfassungen (ohne `layers`, mit `layerCount`) |
| POST | `/api/templates` | Anlegen (startet immer mit leerer Ebenenliste) |
| GET | `/api/templates/{id}` | Vollständig, inklusive `layers` |
| PATCH | `/api/templates/{id}` | Ändern — `layers` wird komplett ersetzt und von `LayerValidator` geprüft |
| DELETE | `/api/templates/{id}` | Löschen — 409, wenn noch Karten dieses Template benutzen |

## Karten (`/api/cards`)

Kontrakt (Typen, Feldregeln): `docs/planning/2026-08-10_karteneditor/README.md`.
Bild-Endpunkte (`.../images*`) kommen erst mit Phase 3 dieses Plans.

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/cards` | Kurzfassungen aller Karten (`id, name, templateId, templateName, cardGroupId, cardGroupName, updatedAt`), für die Liste |
| POST | `/api/cards` | Anlegen |
| GET | `/api/cards/{id}` | Vollständig, inklusive `values`, `iconChoices`, `textOverrides`, `images` |
| PATCH | `/api/cards/{id}` | Ändern (nur übergebene Felder) |
| DELETE | `/api/cards/{id}` | Löschen (Kartenbilder fallen per `ON DELETE CASCADE` mit) |
| POST | `/api/cards/{id}/duplicate` | Kopie anlegen (Name + „ (Kopie)", Werte/Icon-Wahl/Abweichungen übernommen; Bilder ab Phase 3) |

Prüfregeln (`CardValidator`, Existenzprüfungen in `CardService`):

- `name`: 1–191 Zeichen, nicht leer
- `templateId`: muss ein existierendes Template sein
- `cardGroupId`: `null` oder eine existierende Kartengruppe
- `values`: Objekt, Schlüssel `^[a-z][a-z0-9_]{0,39}$`, Werte Zeichenketten bis 2000 Zeichen — **nicht** gegen die Template-Feldliste geprüft (siehe Grundsatz unten)
- `iconChoices`: Objekt, Werte müssen existierende Bild-Kennungen sein
- `textOverrides`: Objekt, je Eintrag optional `fontSize` (4–200), `color` (`#rrggbb`), `bold`, `italic` — alle vier einzeln weglassbar, weggelassen heißt „so wie im Template"

**Grundsatz:** Werte werden nie gegen das aktuelle Template abgeglichen. Ein Feldschlüssel,
den das Template (noch oder nicht mehr) kennt, ist kein Fehler — sonst würde jede
Template-Änderung bestehende Karten unspeicherbar machen.
