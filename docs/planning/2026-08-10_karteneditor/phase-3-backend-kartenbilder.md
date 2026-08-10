# Phase 3 — Backend: Kartenbilder

**Rating:** standard (folgt dem Upload-Muster des Bildvorrats)

## Kontext — vorher lesen

- `backend/src/Services/AssetService.php` — Prüfung, Zufallsname, Größenlimit
- `backend/src/Controllers/AssetController.php` — insbesondere `file()` und
  `Response::file()`
- `backend/src/Validators/AssetValidator.php`
- `docs/decisions/015-bildablage-und-dateiformate.md`
- `docs/decisions/013-backend-ausserhalb-des-webbereichs.md`
- ADR-017 aus Phase 1

## Abnahmekriterien

- `POST /api/cards/{id}/images` nimmt eine mehrteilige Anfrage mit `layerId` und `file`
  entgegen, legt die Datei unter `backend/uploads/cards/` ab und trägt sie in
  `card_images` ein. Existiert für diese Ebene bereits ein Bild, wird es **ersetzt** und
  die alte Datei gelöscht.
- Erlaubte Formate: **PNG und JPEG**. (Der Bildvorrat erlaubt nur PNG, weil Rahmen und
  Icons Transparenz brauchen — Kartenmotive sind meist Fotos oder KI-Bilder und kommen
  als JPEG.) Doppelte Prüfung wie beim Bildvorrat: Mime-Typ **und** `getimagesize()`.
- Größenlimit wie im Bestand über `UPLOAD_MAX_BYTES`, Rückfallwert 8 MiB.
- Der Dateiname kommt nie vom Client: Zufallswert plus passende Endung.
- `layerId` muss im Template der Karte als **Bildebene** existieren — sonst 422 mit
  klarer Meldung.
- `PATCH /api/cards/{id}/images/{layerId}` ändert nur `offsetX`, `offsetY`, `scale`.
  Grenzen: Maßstab 0.1–10, Verschiebung −2000 bis 2000 Canvas-Einheiten.
- `DELETE /api/cards/{id}/images/{layerId}` entfernt Eintrag und Datei.
- `GET /api/cards/{id}/images/{layerId}/file` liefert die Datei **hinter der Anmeldung**
  (nicht in der Positivliste offener Pfade), mit korrektem Mime-Typ.
- Löschen einer Karte löscht alle zugehörigen Dateien von der Platte, nicht nur die
  Datenbankzeilen.
- Duplizieren einer Karte kopiert die Bilddateien mit (neue Zufallsnamen), sodass das
  Löschen der einen Karte die andere nicht beschädigt.

## Checkliste

- [ ] `backend/uploads/cards/` anlegen; sicherstellen, dass der Ordner vom Hochladen
      ausgenommen ist (`deploy.cmd` prüfen, wie es für `uploads/` schon geregelt ist) und
      auf dem Server beim ersten Upload angelegt wird, falls er fehlt.
- [ ] `backend/src/Repositories/CardImageRepository.php`: `findByCard(int $cardId)`,
      `findOne(int $cardId, string $layerId)`, `upsert(...)`, `updatePlacement(...)`,
      `delete(...)`, `deleteByCard(int $cardId)` (gibt die Dateinamen zurück, damit der
      Dienst die Dateien löschen kann).
- [ ] `backend/src/Services/CardImageService.php`: Upload (Prüfen, Speichern, Ersetzen,
      alte Datei löschen), Platzierung ändern, Löschen, Aufräumen beim Löschen einer
      Karte, Kopieren beim Duplizieren.
- [ ] `backend/src/Validators/CardImageValidator.php`: `layerId` (Zeichenkette, 1–64),
      Platzierungswerte mit den oben genannten Grenzen.
- [ ] Controller-Methoden in `CardController` ergänzen (`uploadImage`, `updateImage`,
      `deleteImage`, `imageFile`) oder — falls die Datei dadurch unübersichtlich wird —
      einen eigenen `CardImageController`. **Entscheidung: eigener Controller**, damit
      die Kartenverwaltung und die Dateiverwaltung getrennt bleiben.
- [ ] Die in Phase 2 markierte Stelle im Duplizieren fertigstellen.
- [ ] `CardService::delete()` ruft vor dem Löschen der Zeile das Aufräumen der Dateien.
- [ ] Routen registrieren.
- [ ] Von Hand prüfen: PNG hochladen, JPEG hochladen, zu große Datei (muss scheitern),
      GIF (muss scheitern), Ebene ersetzen (alte Datei ist von der Platte verschwunden),
      Karte löschen (Dateien weg), Karte duplizieren (zwei eigenständige Dateien).
- [ ] `docs/routes.md`, `docs/models.md`, `docs/code-map.md` nachziehen.

## Report-Back
