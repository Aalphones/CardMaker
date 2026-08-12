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

- [x] `store/cards/` nach dem Vorbild anlegen. Die Typen `Card`, `CardSummary`,
      `CardImage` aus dem Kontrakt in `cards.actions.ts`, wie bei `templates`.
- [x] Effekte für alle Endpunkte. Beim Hochladen eines Bildes `FormData` benutzen und
      den Inhaltstyp **nicht** von Hand setzen — der Browser muss die Trennmarke selbst
      ergänzen.
- [x] `shared/canvas/card-image-loader.ts` anlegen, nach dem Vorbild von
      `asset-image-loader.ts`: lädt Kartenbilder als Blob hinter der Anmeldung und hält
      sie als fertige Bildelemente in einem Signal, Schlüssel ist `cardId:layerId`.
      Gemeinsame Teile mit dem Vorratslader in eine kleine Hilfsfunktion ziehen, statt
      die Datei zu verdoppeln.
- [x] Routen in `app.routes.ts` ergänzen, mit verzögertem Laden wie im Bestand.
- [x] `docs/code-map.md` und `docs/clients.md` nachziehen.

## Report-Back

**Status:** complete (2026-08-12). `npm run lint` und `npm run build` laufen sauber.

Gebaut:

- `store/cards/` mit den vier Dateien nach dem Muster von `templates`, dazu in
  `app.config.ts` angemeldet (Zustand + Effekte).
- `shared/canvas/blob-image-cache.ts` — der gemeinsame Unterbau (Blob holen, Bildelement
  bauen, Signal halten, Objekt-Adressen freigeben). `asset-image-loader.ts` wurde darauf
  umgestellt statt verdoppelt, `card-image-loader.ts` neu (Schlüssel `cardId:layerId`).
- Routen `cards`, `cards/new`, `cards/:id` mit verzögertem Laden und dem Schutz vor
  ungespeicherten Änderungen auf beiden Editor-Routen.

Abweichungen und Entscheidungen:

- **Rohbau-Komponenten statt kaputtem Build:** Routen brauchen Komponenten. `cards-list`
  und `card-editor` gibt es deshalb als Rohbau mit Überschrift; Phasen 5-8 füllen sie.
  Ohne das hätte `npm run build` bis Phase 6 rot gestanden.
- **`hasUnsavedChanges()` gibt im Rohbau `false` zurück** — es gibt noch keinen Entwurf,
  den man verlieren könnte. Muss in Phase 6 echt werden, sonst schützt der Riegel nichts.
- **Liste wird nach jeder Änderung neu geholt** (`CardsActions.refresh`, ohne den
  `loaded`-Riegel): Die Kurzfassung trägt Template- und Gruppennamen, die keine Antwort
  einer Karten-Änderung mitliefert — aus der geänderten Karte lässt sich die Listenzeile
  also nicht zusammensetzen. Beim Löschen entfällt das, dort fällt nur eine Zeile weg.
- **Kontrakt nachgetragen:** `POST /api/cards/{id}/duplicate` steht in Phase 2 gebaut,
  fehlte aber in der Endpunkt-Tabelle der Plan-README. Nachgezogen.
- **Bild-Zwischenspeicher hängt an den Erfolgs-Meldungen:** Nach dem Ersetzen eines
  Bildes in derselben Fläche lädt der Lader neu, nach dem Entfernen vergisst er den
  Eintrag — sonst zeigt die Vorschau weiter das alte Bild.

Nicht geprüft: alles außer Lint und Build. Es gibt keine Datenbank lokal, die Endpunkte
sind seit Phase 2/3 nicht live gelaufen (siehe STATE.md).
