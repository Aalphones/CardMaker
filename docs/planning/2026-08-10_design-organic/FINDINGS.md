# Findings — Neues Aussehen „Organic"

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Erledigte Punkte abhaken, nicht löschen.

---

- [ ] → Phase 2: Sechs Stylesheets griffen direkt auf das rohe Grauton-Token `--color-gray-50`
      zu (Text auf Akzentfläche in Kartengruppen-Liste und -Detail, Template-Liste,
      Editor-Speichern, Ebenenliste, Bildauswahl). Mit dem Palettenwechsel zeigte die
      Referenz ins Leere; Phase 1 hat sie auf `--color-text-on-accent` umgestellt. Beim
      Bau der Baustein-Klasse für Buttons erben diese sechs Stellen die neue Klasse und die
      Einzelregeln fallen weg.
- [ ] → Phase 6: Die Kartenvorschau zeichnet auf Konva und kennt keine Token — in
      `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` stehen drei feste
      Violett-Werte (Platzhalter-Rahmen, Platzhalter-Füllung, Auswahlrahmen). Sie
      überleben den Palettenwechsel und sind der letzte sichtbare Rest der alten Farben.
      Auf Terrakotta umstellen, wenn der Editor sowieso angefasst wird (finales
      Abnahmekriterium 1).
