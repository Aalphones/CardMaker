# Phase 4 — Frontend: Speicher und Routen

**Rating:** standard (1:1 nach dem Muster von `store/templates/`)

## Kontext — vorher lesen

- `frontend/src/app/store/templates/` — alle vier Dateien, das ist die Vorlage
- `frontend/src/app/store/card-groups/`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/core/services/` — der HTTP-Zugang (`Api`), insbesondere `getBlob()`
- `docs/conventions/state-management.md`
- `README.md` dieses Plans → Kontrakt

## Abnahmekriterien

- `frontend/src/app/store/cards/` enthält `cards.actions.ts`, `cards.feature.ts`,
  `cards.effects.ts`, `cards.facade.ts` — Namensschema exakt wie bei `templates`.
- Der Zustand hält: Kurzfassungen plus Ladezustand, die aktuell geöffnete Karte plus
  Ladezustand, Fehler.
- Die Fassade bietet: `ensureLoaded()`, `loadOne(id)`, `create(...)`, `save(id, ...)`,
  `remove(id)`, `duplicate(id)`, `uploadImage(cardId, layerId, file)`,
  `updateImagePlacement(cardId, layerId, placement)`, `removeImage(cardId, layerId)`.
- Die Routen `cards`, `cards/new`, `cards/:id` sind angelegt, hinter der Anmeldung, mit
  Schutz vor ungespeicherten Änderungen auf den beiden Editor-Routen.
- Kartenbilder werden **nicht** im NgRx-Speicher gehalten — Bildelemente sind kein
  serialisierbarer Zustand. Sie kommen wie die Vorratsbilder über einen Lader.

## Checkliste

- [ ] `store/cards/` nach dem Vorbild anlegen. Die Typen `Card`, `CardSummary`,
      `CardImage` aus dem Kontrakt in `cards.actions.ts`, wie bei `templates`.
- [ ] Effekte für alle Endpunkte. Beim Hochladen eines Bildes `FormData` benutzen und
      den Inhaltstyp **nicht** von Hand setzen — der Browser muss die Trennmarke selbst
      ergänzen.
- [ ] `shared/canvas/card-image-loader.ts` anlegen, nach dem Vorbild von
      `asset-image-loader.ts`: lädt Kartenbilder als Blob hinter der Anmeldung und hält
      sie als fertige Bildelemente in einem Signal, Schlüssel ist `cardId:layerId`.
      Gemeinsame Teile mit dem Vorratslader in eine kleine Hilfsfunktion ziehen, statt
      die Datei zu verdoppeln.
- [ ] Routen in `app.routes.ts` ergänzen, mit verzögertem Laden wie im Bestand.
- [ ] `docs/code-map.md` und `docs/clients.md` nachziehen.

## Report-Back
