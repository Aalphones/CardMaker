# Findings — Meilenstein 5

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis>
```

Erledigte Einträge abhaken, nicht löschen.

- [ ] → Phase 5: Die Karte wird bei 300 DPI 744 × 1039 Bildpunkte groß — `mmToPx(63, 300)`
  liefert genau die 744 aus `PRINT_WIDTH_PX`, die Rechnungen passen also zusammen. Mit
  Beschnitt sind es 65 × 90 mm; das Kartenbild wird dann schlicht größer skaliert, es gibt
  kein zusätzliches Material am Rand.
- [ ] → Phase 5: `sheetMarks(options)` liefert bei ausgeschalteten Schnittmarken eine leere
  Liste — der Ausgabeweg muss die Option nicht selbst abfragen, nur über die Striche laufen.
- [ ] → Phase 5: ADR-024 steht schon im Index von `docs/decisions/README.md`, die Zeile für
  ADR-023 (jsPDF) fehlt noch — beim Schreiben **oberhalb** von 024 einsortieren, sonst steht
  der Index nicht mehr in der Reihenfolge.
- [ ] → Phase 3: Die Anzahl je Position ist im Backend auf **99** gedeckelt (Validator und
  „schon drin → +1"). Der Plus-Knopf sollte bei 99 nicht weiterzählen, sonst antwortet das
  Backend mit 422 statt still zu deckeln.
- [ ] → Phase 2/3: Das Backend liefert `previewUpdatedAt` je Position, aber **keine**
  Bild-Adresse — das Kachelbild kommt wie in der Kartenliste über
  `shared/canvas/preview-image-loader.ts` aus `cardId` + Zeitstempel.
