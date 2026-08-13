# Phase 5 — Motivbilder und Meilenstein-Abschluss

Bilder an Karten hochladen und zurechtrücken — danach Doku, Entscheidungen und
Meilenstein-Abschluss.

## Kontext — vorher lesen

- `docs/routes.md` → Karten, Abschnitt Bilder (`POST /api/cards/{id}/images`,
  `PATCH …/images/{layerId}`, `DELETE …/images/{layerId}`) samt Prüfregeln
- `mcp/cardmaker_mcp/client.py` — der mehrteilige Upload aus Phase 2
- `docs/PROJECT.md` → Meilensteine · `docs/decisions/README.md` → ADR-Format
- `README.md` dieses Plans → Bekannte Grenzen

## Abnahmekriterien

1. `upload_card_image(card_id, layer_id, file_path)` lädt eine PNG-/JPEG-Datei vom lokalen
   Rechner hoch und ersetzt ein vorhandenes Bild derselben Ebene.
2. Eine `layer_id`, die im Template der Karte keine Bildebene ist, wird **vor** dem Senden
   abgefangen — mit einer Meldung, die die vorhandenen Bildflächen samt Beschriftung nennt
   (Quelle: `describe_card_fields`).
3. Eine zu große oder falsch formatierte Datei bringt eine Klartext-Meldung mit der Grenze
   aus Meta (`uploads.imageMaxBytes`, `uploads.imageMimeTypes`), keinen rohen HTTP-Fehler.
4. `set_card_image_placement(card_id, layer_id, offset_x=None, offset_y=None, scale=None)`
   ändert nur die übergebenen Werte, geprüft gegen die Grenzen aus Meta.
5. `docs/PROJECT.md` weist Meilenstein 6 als erledigt aus, `STATE.md` zeigt auf keinen
   aktiven Plan mehr, der Planordner liegt unter `docs/archive/2026-08/`.

## Werkzeuge dieser Phase

| Werkzeug | Zweck |
|---|---|
| `upload_card_image(card_id, layer_id, file_path)` | Motivbild hochladen/ersetzen |
| `set_card_image_placement(card_id, layer_id, …)` | Verschiebung/Maßstab ändern |
| `remove_card_image(card_id, layer_id)` | Bild dieser Ebene entfernen |

`remove_card_image` ist die eine Ausnahme von „kein Löschwerkzeug" (Phase 4): es entfernt
kein Datenobjekt, sondern leert eine Bildfläche — dasselbe, was der Editor mit einem Klick
tut, und ohne Bild ist die Karte weiterhin vollständig.

## Checkliste

- [x] `client.py`: `post_card_image` (mehrteilig), `patch_card_image_placement`,
      `delete_card_image`.
- [x] Vorabprüfungen nach AK 2–4 im Werkzeug, Meldungen im Klartext.
- [x] Werkzeuge in `server.py` registrieren; alle drei verwerfen den Zwischenspeicher.
- [x] **ADR-025** `docs/decisions/025-mcp-zustandsbild-im-client.md` — das Zustandsbild des
      MCP-Servers wird aus den vorhandenen Listenrouten zusammengesetzt statt über eine neue
      Backend-Route; Kontext, betrachtete Optionen (eigene `/api/state`-Route), Entscheidung,
      Konsequenzen (drei Anfragen statt einer, dafür keine zweite Datenquelle im Backend).
- [x] **ADR-026** `docs/decisions/026-keine-vorschaubilder-ueber-mcp.md` — über MCP angelegte
      Karten bekommen kein Vorschaubild, weil gerendert wird, wo ein Browser steht
      (ADR-005/ADR-022); Konsequenz: leere Kachel bis zum ersten Speichern im Editor,
      Werkzeuge sagen das.
- [x] `docs/decisions/README.md` um beide ADRs ergänzen.
- [x] Doku-Abgleich zum Schluss: `docs/conventions/mcp.md` (vollständige Werkzeug-Tabelle,
      Drift-Regeln auf den gebauten Stand), `docs/routes.md`, `docs/code-map.md`,
      `mcp/README.md`, `AGENTS.md` (Stack-Zeile: `mcp/` existiert jetzt wirklich).
- [x] `docs/PROJECT.md`: Meilenstein 6 als **erledigt** markieren mit Datum und Archivpfad.
- [ ] Smoke-Checkliste unten abarbeiten lassen (macht der Nutzer), dann Plan nach
      `docs/archive/2026-08/2026-08-13_mcp-server/` verschieben und `STATE.md` aktualisieren.

## Smoke-Checkliste für den Nutzer (am Plan-Ende)

Wacklige Stellen zuerst — dort prüfen, wo die Umsetzung am ehesten danebenliegt:

1. **Feldschlüssel-Ableitung** (Phase 3): Ein Template mit zwei Textebenen, die denselben
   Feldschlüssel tragen, und einer `static`-Textebene öffnen. `describe_card_fields` muss
   genau die Felder nennen, die auch das Formular im Karteneditor zeigt — nicht mehr, nicht
   weniger.
2. **Meta gegen Wirklichkeit** (Phase 1/4): Eine Schriftgröße-Abweichung von `3` über
   `update_card` versuchen — muss vor dem Senden scheitern. Dann `201` über die Oberfläche
   gegenprüfen: dieselbe Grenze.
3. **Zwischenspeicher** (Phase 4): Karte über MCP anlegen, direkt danach `find_card` mit dem
   neuen Namen — muss sie finden, ohne dass der Server neu startet.
4. Karte über MCP anlegen, Textfelder befüllen, Motivbild hochladen → im Browser öffnen:
   Werte und Bild stehen, Kachel zeigt (erwartungsgemäß) noch kein Vorschaubild; nach einmal
   Speichern im Editor schon.
5. `GET /api/meta` ohne Anmeldung im Browser aufrufen → `401`.

## Report-Back
