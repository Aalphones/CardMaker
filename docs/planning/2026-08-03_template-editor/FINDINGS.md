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

- [ ] → Phase 3: Die Löschsperre für benutzte Bilder wird in `AssetService::delete()`
      eingebaut, nicht neu gebaut. `Response::ERROR_CONFLICT` liegt schon bereit; der Dienst
      braucht dafür Zugriff auf die Templates (Ebene `frame`/`icon` mit dieser `assetId`).

- [ ] → Phase 3: `AssetRepository` heißt seine Formatier-Methode `format()` (Muster
      `CardGroupRepository`), nicht `formatAsset()` wie im Plan-Text. Beim Templates-Backend
      denselben Namen verwenden.

- [ ] → Phase 4: Hochladen läuft als `multipart/form-data`. In Angular den `Content-Type`
      **nicht** selbst setzen — sonst fehlt die Trennmarke und das Backend sieht keine Datei.
      `FormData` mit den Feldern `file`, `kind`, `name` genügt.

- [ ] → Phase 4: `GET /api/assets/{id}/file` liegt hinter der Anmeldung und antwortet mit
      `Cache-Control: private, max-age=86400`. Der Bildlader holt die Datei als Blob mit
      Anmelde-Kopfzeile; ein direktes `<img src="/api/assets/…">` funktioniert nicht.

- [ ] → Phase 4: Fehlerformat der Hochladung, damit die Oberfläche es unterscheiden kann:
      `413` (`payload_too_large`) für zu groß, `422` (`validation_failed`) mit
      `fields.file` für „kein PNG" bzw. „keine Datei", `500` wenn das Ablegen scheitert.

- [ ] → Phase 5 und 7: `ng2-konva` 12.0.1 verlangt Angular ^21 und Konva ^10 — beides
      installiert, passt. Alle Formen laufen über eine einzige Komponente
      (`CoreShapeComponent`) mit der Eingabe `[config]`; `ko-transformer` ist vorhanden.
