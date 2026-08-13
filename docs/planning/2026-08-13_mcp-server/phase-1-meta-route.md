# Phase 1 — Auskunfts-Route `GET /api/meta`

Eine Route, die sagt, was die laufende API erlaubt: Enums, Muster, Grenzwerte, verfügbare
Schriften. Sie ist die Schema-Quelle des MCP-Servers — ändert sich später eine Prüfregel im
Backend, zieht der MCP-Server ohne Codeänderung nach.

## Kontext — vorher lesen

- `docs/conventions/php.md` (Schichten, Wire-Format camelCase/snake_case)
- `backend/public/index.php` — Routen-Registrierung und Dienst-Verdrahtung (das Muster für
  eine neue Route steht dort mehrfach, z.B. `HealthController`)
- `backend/src/Validators/LayerValidator.php` — Zeilen 23–46: die Enum- und Musterkonstanten
- `backend/src/Validators/CardValidator.php`, `CardImageValidator.php`,
  `CardGroupValidator.php`, `AssetValidator.php`, `FontValidator.php`,
  `PrintProjectValidator.php` — die Grenzwerte
- `backend/src/Repositories/FontRepository.php` und `backend/src/Services/FontService.php` —
  wie hochgeladene Schriften geholt werden und wie der CSS-Name `cmfont-<Kennung>` entsteht
- Kontrakt: [README.md](README.md) → „Kontrakt: `GET /api/meta`"

## Abnahmekriterien

1. `GET /api/meta` liefert `200` und exakt die Struktur aus dem Kontrakt in der README.
2. Ohne Anmeldung: `401` (die Route steht **nicht** in der Positivliste offener Pfade).
3. Mit Zugriffstoken (nicht nur mit Sitzung): `200`.
4. Kein Zahlenwert und keine Enum-Liste in `MetaService` ist neu getippt — jeder Wert kommt
   aus der Prüfklasse, die ihn ohnehin durchsetzt. Prüfbar: `MetaService.php` enthält keine
   eigenen Zeichenketten-Listen wie `['image','shape',…]`.
5. Die Schriftliste enthält die eingebauten Familien **und** die hochgeladenen aus der
   Datenbank, jede mit `id`, `name` und dem CSS-Namen `cmfont-<id>`.

## Checkliste

- [x] Die von `MetaService` benötigten Konstanten in den Prüfklassen von `private const` auf
      `public const` heben — **nur** die im Kontrakt genannten, keine Umbenennung:
      `LayerValidator::MAX_LAYERS`, `TYPES`, `SHAPES`, `ICON_SOURCES`, `ALIGNS`,
      `VERTICAL_ALIGNS`, `BUILT_IN_FONT_FAMILIES`, `HEX_PATTERN`, `KEY_PATTERN`.
      Fehlt ein Grenzwert als Konstante (z.B. Namenslänge 191, Textlänge 2000, Bereich der
      Bildplatzierung, Anzahlgrenzen im Druckprojekt, Schrift-Höchstgröße), **erst eine
      benannte `public const` in der zuständigen Prüfklasse anlegen und die vorhandene
      Prüfung darauf umstellen** — nicht die Zahl in `MetaService` wiederholen.
- [x] `backend/src/Services/MetaService.php` anlegen: baut das Antwort-Array aus diesen
      Konstanten zusammen; einzige Abhängigkeit ist `FontRepository` (für `fonts.uploaded`)
      und `UPLOAD_MAX_BYTES` aus der Umgebung (Rückfallwert wie in `CardImageValidator`).
      Kein Repository, kein Validator, kein HTTP-Wissen.
- [x] `backend/src/Controllers/MetaController.php` anlegen — dünn: Service aufrufen,
      `Response::json(...)`. Muster: `HealthController`.
- [x] Route in `backend/public/index.php` registrieren: `GET /api/meta`, hinter der
      Auth-Middleware (also **nicht** in die Positivliste der offenen Pfade aufnehmen),
      Dienst wie die übrigen Controller verdrahten.
- [x] Canvas-Konstanten (630×880, 10 Einheiten/mm, 63×88 mm, 300 dpi): existiert im Backend
      keine Stelle, die sie schon hält, in `MetaService` als benannte Klassenkonstanten
      anlegen (sie sind Domänenkonstanten, `docs/PROJECT.md` → Randbedingungen) und im
      Kommentar auf `frontend/src/app/shared/canvas/rendering/layer.ts` und `print.ts` als
      Gegenstück verweisen.
- [x] Doku: `docs/routes.md` — neuer Abschnitt „Auskunft (`/api/meta`)" mit Zweck und dem
      Hinweis, dass die Antwortstruktur der Kontrakt für `mcp/` ist.
- [x] Doku: `docs/code-map.md` — Backend-Layout um `MetaController`/`MetaService` ergänzt
      (eine Zeile, ordner-grob).

## Abweichung vom Plan

`uploads.imageMaxBytes`/`imageMimeTypes` kommen nicht aus einem Validator, sondern aus
`CardImageService` (`FALLBACK_MAX_BYTES`, `MIME_TO_IMAGETYPE` — dort `private const` auf
`public const` gehoben, gleiches Muster). Der Plan-Kontext nannte nur die Validatoren; die
Bild-Grenzwerte liegen aber im Service, nicht im `CardImageValidator`. `FontValidator` bekam
zusätzlich `NAME_MAX_LENGTH` (191) als `public const`, obwohl der Kontrakt kein
`fonts.nameMaxLength` verlangt — Konsistenz mit den anderen Namensfeldern, ungenutzt in
`MetaService`.

## Nicht lokal geprüft

`GET /api/meta` konnte nicht gegen einen laufenden Server getestet werden — lokales PHP ist
8.3, `vendor/` ist gegen PHP 8.5 gebaut (`composer.json` verlangt `>= 8.5.0`), siehe
`STATE.md` → „Offen technisch". Geprüft wurde `php -l` auf allen geänderten Dateien (keine
Syntaxfehler). Der erste echte Beleg für Struktur, `401` ohne Anmeldung und `200` mit
Zugriffstoken ist der nächste Deploy.

## Report-Back
