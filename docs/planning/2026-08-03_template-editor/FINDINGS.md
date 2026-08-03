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

- [ ] → Phase 2: Aus Meilenstein 1 übernommen — Bilder müssen über eine Adresse erreichbar
      sein, dürfen also nicht ungeschützt neben dem Programmcode liegen (ADR-013). In diesem
      Plan entschieden: Ablage in `backend/uploads/`, Ausliefern durch PHP (ADR-015).

- [ ] → Phase 2: Die Grenze für Hochladungen steht schon als `UPLOAD_MAX_BYTES` in
      `backend/.env` (Vorgabe 8 MB, geschrieben von `deploy.cmd`). Nicht neu erfinden, den
      Wert lesen. Serverseitig meldet Strato 128 MB — die 8 MB sind unsere eigene Grenze.

- [ ] → Phase 2: Der Ordner `uploads/` ist im Hochlade-Skript bereits vom Abgleich
      ausgenommen (`-filemask="|uploads/;…"`), hochgeladene Bilder überleben also ein
      Deploy. Geprüft am 2026-08-03, keine Änderung an `deploy.cmd` nötig.

- [ ] → Phase 5 und 7: `ng2-konva` 12.0.1 verlangt Angular ^21 und Konva ^10 — beides
      installiert, passt. Alle Formen laufen über eine einzige Komponente
      (`CoreShapeComponent`) mit der Eingabe `[config]`; `ko-transformer` ist vorhanden.
