# Findings — Template-Editor

Erkenntnisse, die während einer Phase auffallen und eine andere Phase betreffen. Hier
eintragen statt sofort umzusetzen — sonst wandert der Umfang unkontrolliert.

Format:

```
- [ ] → Phase N: <Erkenntnis in einem Satz>
```

Erledigt wird der Eintrag von der Phase, an die er adressiert ist. Was am Ende noch offen
ist, wandert in Phase 8 in die Folgeaufgaben der Plan-README.

---

- [x] → Phase 2: Aus Meilenstein 1 übernommen — Bilder müssen über eine Adresse erreichbar
      sein, dürfen also nicht ungeschützt neben dem Programmcode liegen (ADR-013). In diesem
      Plan entschieden: Ablage in `backend/uploads/`, Ausliefern durch PHP (ADR-015).

- [x] → Phase 2: Die Grenze für Hochladungen steht schon als `UPLOAD_MAX_BYTES` in
      `backend/.env` (Vorgabe 8 MB, geschrieben von `deploy.cmd`). Nicht neu erfinden, den
      Wert lesen. Serverseitig meldet Strato 128 MB — die 8 MB sind unsere eigene Grenze.

- [x] → Phase 2: Der Ordner `uploads/` ist im Hochlade-Skript bereits vom Abgleich
      ausgenommen (`-filemask="|uploads/;…"`), hochgeladene Bilder überleben also ein
      Deploy. Geprüft am 2026-08-03, keine Änderung an `deploy.cmd` nötig.

- [x] → Phase 3: Die Löschsperre für benutzte Bilder wird in `AssetService::delete()`
      eingebaut, nicht neu gebaut. `Response::ERROR_CONFLICT` liegt schon bereit; der Dienst
      braucht dafür Zugriff auf die Templates (Ebene `frame`/`icon` mit dieser `assetId`).

- [x] → Phase 3: `AssetRepository` heißt seine Formatier-Methode `format()` (Muster
      `CardGroupRepository`), nicht `formatAsset()` wie im Plan-Text. Beim Templates-Backend
      denselben Namen verwenden.

- [x] → Phase 4: Hochladen läuft als `multipart/form-data`. In Angular den `Content-Type`
      **nicht** selbst setzen — sonst fehlt die Trennmarke und das Backend sieht keine Datei.
      `FormData` mit den Feldern `file`, `kind`, `name` genügt. Umgesetzt in
      `store/assets/assets.effects.ts` (`Api.postForm`, kein manueller Header).

- [x] → Phase 5: `GET /api/assets/{id}/file` liegt hinter der Anmeldung und antwortet mit
      `Cache-Control: private, max-age=86400`. Der Bildlader holt die Datei als Blob mit
      Anmelde-Kopfzeile; ein direktes `<img src="/api/assets/…">` funktioniert nicht. In
      Phase 4 gibt es noch keine Bildanzeige (keine Asset-UI) — greift erst, sobald die
      Vorschau ein Bild zeichnet.

- [x] → Phase 6: Fehlerformat der Hochladung, damit die Oberfläche es unterscheiden kann:
      `413` (`payload_too_large`) für zu groß, `422` (`validation_failed`) mit
      `fields.file` für „kein PNG" bzw. „keine Datei", `500` wenn das Ablegen scheitert. Der
      globale `errorInterceptor` zeigt die Server-Nachricht bereits als Toast — reicht so
      lange, bis eine echte Hochlade-UI (Rahmen-/Icon-Auswahl mit Upload-Knopf) feldgenaue
      Rückmeldung braucht.
      Umgesetzt: `AssetsActions.uploadFailure` trägt jetzt `fileError` (aus `fields.file`),
      der `asset-picker`-Dialog zeigt es direkt unter dem Datei-Feld.

- [ ] → Phase 8 (Folgeaufgaben): Zugriffstoken laufen nicht ab und kennen keine
      Einschränkung — `personal_access_tokens` hat nur `created_at` und `last_used_at`, und
      die Anmeldesperre behandelt ein Token wie eine volle Anmeldung. Für ein Solo-Werkzeug
      vertretbar, aber es heißt: ein einmal weitergegebenes Token ist ein Generalschlüssel
      auf Lebenszeit. Zu entscheiden wäre eine Ablauffrist (Spalte `expires_at`, Vergleich
      in der Abfrage wie bei den Sitzungen). Aufgefallen beim Nachmessen von Phase 2.

- [x] → Phase 7: `ng2-konva` 12.0.1 verlangt Angular ^21 und Konva ^10 — beides installiert,
      passt. Alle Formen laufen über eine einzige Komponente (`CoreShapeComponent`) mit der
      Eingabe `[config]`; `ko-transformer` ist vorhanden. In Phase 5 bestätigt: Die
      Zeichenreihenfolge kommt aus der DOM-Reihenfolge (`ng2-konva` beobachtet sie), `@for`
      mit `track` reicht also.
      Erledigt: `ko-transformer` als einzelner, umgehängter Knoten umgesetzt (siehe
      Phase-7-Report-Back).

- [x] → Phase 6: Der Editor zeigt im Moment einen Wegwerf-Schalter „Beispielebenen anzeigen"
      (`features/templates/template-editor/example-layers.ts`). Er existiert nur, weil es
      ohne Ebenenliste keine Ebenen zum Zeichnen gibt. Sobald Phase 6 echte Ebenen anlegen
      kann: Schalter, Datei und die zugehörigen Felder in `template-editor.ts` entfernen.
      Erledigt: Datei gelöscht, Editor zeichnet jetzt die echten Ebenen aus dem Signal Store.

- [x] → Phase 6: Die Vorschau nimmt schon `selectedLayerId` (zeichnet einen gestrichelten
      Umriss) und `interactive` (schaltet die Klick-Erkennung frei) entgegen und meldet
      `layerClicked` mit der Ebenen-ID. Die Ebenenliste muss also nur beides verdrahten,
      nichts nachbauen.
      Erledigt: `card-canvas` bekommt `selectedLayerId`/`interactive` aus dem Signal Store,
      `layerClicked` wählt die Ebene aus.

- [x] → Phase 7: Konva rechnet die Bildschirmauflösung selbst ein (`devicePixelRatio` im
      Canvas). Die Bühnengröße NICHT zusätzlich multiplizieren — das skaliert doppelt. Der
      Maßstab Canvas-Einheiten → Bildschirmpunkte sitzt an genau einer Stelle: der
      `scaleX`/`scaleY` der Konva-Ebene. Anfasser-Werte aus Phase 7 müssen entsprechend
      durch diesen Maßstab zurückgerechnet werden, bevor sie in eine Ebene wandern.
      Erledigt — mit einer Präzisierung: Nur die Anfasser-**Optik** (`anchorSize` u. Ä.)
      braucht die Division, die Geometrie-**Werte** (Breite/Höhe/Position) rechnet Konvas
      Transformer selbst schon in Canvas-Einheiten zurück. Details in
      `docs/conventions/state-management.md`.

- [x] → Phase 6 und 7: Ein Textknoten mit fest gesetzter Höhe bricht in Konva nur so viele
      Zeilen um, wie in die Box passen — er meldet also nie eine Höhe größer als die Box.
      Wer Text messen will, muss einen Knoten OHNE feste Höhe benutzen (macht
      `rendering/measure-text.ts`). Sonst greift das automatische Verkleinern nie.
      War bereits seit Phase 5/6 in `measure-text.ts` umgesetzt, Phase 7 hat daran nichts
      geändert (Transform-Ereignisse lösen keine Neumessung aus).
