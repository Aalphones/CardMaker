# Findings — Meilenstein 5

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis>
```

Erledigte Einträge abhaken, nicht löschen.

- [ ] → Phase 5: ADR-024 steht schon im Index von `docs/decisions/README.md`, die Zeile für
  ADR-023 (jsPDF) fehlt noch — beim Schreiben **oberhalb** von 024 einsortieren, sonst steht
  der Index nicht mehr in der Reihenfolge.
- [ ] → Phase 3: Die Anzahl je Position ist im Backend auf **99** gedeckelt (Validator und
  „schon drin → +1"). Der Plus-Knopf sollte bei 99 nicht weiterzählen, sonst antwortet das
  Backend mit 422 statt still zu deckeln.
- [ ] → Phase 2/3: Das Backend liefert `previewUpdatedAt` je Position, aber **keine**
  Bild-Adresse — das Kachelbild kommt wie in der Kartenliste über
  `shared/canvas/preview-image-loader.ts` aus `cardId` + Zeitstempel.
