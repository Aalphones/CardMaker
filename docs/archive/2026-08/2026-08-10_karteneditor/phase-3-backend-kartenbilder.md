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

- [x] `backend/uploads/cards/` — kein Ordner im Repo nötig (`.gitignore` schließt schon
      den ganzen `backend/uploads/`-Baum aus, `deploy.cmd` sichert `uploads/` per Filemask
      komplett gegen den Abgleich ab); `CardImageService::ensureUploadsDirectory()` legt
      ihn beim ersten Upload selbst an, gleiches Muster wie bei Schriften/Bildvorrat.
- [x] `backend/src/Repositories/CardImageRepository.php`: `findByCard`, `findOne`,
      `upsert` (Ersetzen über `ON DUPLICATE KEY UPDATE`, setzt Verschiebung/Maßstab
      zurück), `copy` (fürs Duplizieren, übernimmt Verschiebung/Maßstab 1:1),
      `updatePlacement` (nur übergebene Felder), `delete`, `deleteByCard` (liefert die
      Dateinamen zurück).
- [x] `backend/src/Services/CardImageService.php`: Upload (Prüfen, Speichern, Ersetzen,
      alte Datei löschen), Platzierung ändern, Löschen, Aufräumen beim Löschen einer
      Karte, Kopieren beim Duplizieren.
- [x] `backend/src/Validators/CardImageValidator.php`: `layerId` (Zeichenkette, 1–64),
      Platzierungswerte mit den oben genannten Grenzen.
- [x] **Entscheidung umgesetzt: eigener `CardImageController`**, damit die
      Kartenverwaltung und die Dateiverwaltung getrennt bleiben.
- [x] Die in Phase 2 markierte Stelle im Duplizieren fertiggestellt
      (`CardService::duplicate()` ruft jetzt `CardImageService::duplicateForCard()`).
- [x] `CardService::delete()` ruft vor dem Löschen der Zeile das Aufräumen der Dateien.
- [x] Routen registriert (`POST/PATCH/DELETE/GET .../images*`).
- [ ] Von Hand prüfen: PNG hochladen, JPEG hochladen, zu große Datei (muss scheitern),
      GIF (muss scheitern), Ebene ersetzen (alte Datei ist von der Platte verschwunden),
      Karte löschen (Dateien weg), Karte duplizieren (zwei eigenständige Dateien).
      **Offen — braucht eine laufende Datenbank** (siehe Report-Back): auf diesem Rechner
      nicht möglich, geht in die Smoke-Checkliste am Plan-Ende.
- [x] `docs/routes.md`, `docs/code-map.md` nachgezogen. `docs/models.md` deckte
      `card_images` schon aus Phase 1 vollständig ab, keine Änderung nötig.

## Report-Back

**Stand: Code fertig, nur `php -l` geprüft — kein Live-Rundlauf.** Wie schon in Phase 1/2:
keine lokale MySQL-Instanz auf diesem Rechner, ein echter Testlauf ginge nur über
`deploy.cmd` gegen den Strato-Server. Bleibt Teil der Smoke-Checkliste am Plan-Ende,
zusammen mit dem noch offenen Migrationslauf.

**Card-Kontrakt nachgezogen:** `CardService::find()`/`create()`/`update()`/`duplicate()`
hängen jetzt über `withImages()` das `images`-Array an — das stand zwar schon im Kontrakt,
aber `card_images` gab es vor dieser Phase noch nicht zu befüllen. Ohne diese Änderung
hätte jede Karten-Antwort dem Kontrakt widersprochen.

**Design-Entscheidung, die der Plan offenließ:** Ersetzt ein neuer Upload ein Bild
derselben Ebene, werden Verschiebung und Maßstab auf die Grundstellung (0, 0, 1)
zurückgesetzt — die alten Werte bezogen sich auf die alte Bildgröße und könnten beim neuen
Bild einen falschen Ausschnitt zeigen. Beim Duplizieren einer Karte dagegen bleiben
Verschiebung und Maßstab erhalten, weil es dort wortwörtlich dasselbe Bild ist, nur unter
neuem Dateinamen.

**Abweichung vom Plan:** `CardController` bekam keine neuen Methoden (wie im Kontext
„oder falls die Datei unübersichtlich wird" angedeutet) — der eigene
`CardImageController` war von Anfang an klar die bessere Trennung, siehe ADR-017-Folgen.
