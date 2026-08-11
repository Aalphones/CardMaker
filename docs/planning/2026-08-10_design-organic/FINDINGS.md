# Findings — Neues Aussehen „Organic"

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Erledigte Punkte abhaken, nicht löschen.

---

- [ ] → Phase 4/5/6: Sechs Stylesheets griffen direkt auf das rohe Grauton-Token
      `--color-gray-50` zu (Text auf Akzentfläche in Kartengruppen-Liste und -Detail,
      Template-Liste, Editor-Speichern, Ebenenliste, Bildauswahl). Mit dem Palettenwechsel
      zeigte die Referenz ins Leere; Phase 1 hat sie auf `--color-text-on-accent`
      umgestellt. Phase 2 hat `.btn` in `_bausteine.scss` gebaut, aber **nicht** diese
      sechs Stellen migriert (nicht in ihrer Reihenfolge — die betraf nur confirm-dialog,
      field-hint, notification-list, not-found). Sobald die jeweilige Folgephase
      Kartengruppen-Liste/-Detail, Template-Liste, Editor-Kopfzeile, Ebenenliste bzw.
      Bildauswahl auf `.btn` umstellt, fallen die lokalen `--color-gray-50`-Einzelregeln
      dort mit weg — bis dahin bleibt der (jetzt korrekte) Einzelverweis auf
      `--color-text-on-accent` stehen.
      **Stand nach Phase 5:** Editor-Kopfzeile (Speichern) und Ebenenliste (Hinzufügen)
      sind auf `.btn` umgestellt, ihre Einzelregeln sind weg. Offen bleibt nur noch die
      Bildauswahl → Phase 8.
- [x] → Phase 6: Die Kartenvorschau zeichnet auf Konva und kennt keine Token — in
      `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` stehen drei feste
      Violett-Werte (Platzhalter-Rahmen, Platzhalter-Füllung, Auswahlrahmen). Sie
      überleben den Palettenwechsel und sind der letzte sichtbare Rest der alten Farben.
      Auf Terrakotta umstellen, wenn der Editor sowieso angefasst wird (finales
      Abnahmekriterium 1).
- [x] → Phase 6: Die Karte passt sich auf der Bühne bisher rein über CSS ein — die Bühne ist
      ein Größen-Container (`container-type: size`), die Karte bekommt
      `block-size: min(100cqh, 100cqw * 880 / 630)` in `template-editor.scss`. Sobald der
      echte Maßstab kommt, ersetzt der diese Zeile; „Einpassen" ist genau diese Rechnung.
- [x] → Phase 6: Das Menü hinter „Element hinzufügen" steht noch in der alten Form
      (reine Textliste, Reihenfolge schon auf den Entwurf gedreht). Zeichen und
      Tastenkürzel-Hinweise fehlen — die baut Phase 6 mit dem Element-Menü.
- [ ] → Phase 7: Die Zoom-Pille bringt den „?"-Knopf schon mit, er ist gesperrt und hat
      bewusst noch keinen Ausgang. Phase 7 hängt den Kürzel-Dialog daran und ergänzt die
      Zoom-Kürzel (+/−, Cmd+0 einpassen, Cmd+1 100 %) — die Store-Methoden `zoomIn`,
      `zoomOut`, `fitView` liegen dafür bereit.
- [ ] → Phase 7: Der Fenster-Tastaturzweig im Editor unterscheidet ab jetzt drei Fälle:
      Eingabefelder (nichts greift), Schaltflächen/Menüeinträge (die Leertaste löst dort
      weiterhin aus, statt das Verschieben einzuschalten) und alles andere. Die
      Buchstabenkürzel aus Phase 7 (T/I/K/R/O/L/F, H, F2) brauchen dieselbe Unterscheidung,
      sonst legen sie beim Tippen im Namensfeld oder im offenen Menü Ebenen an.
      `isActivatableTarget()` in `template-editor.ts` ist die vorhandene Stelle dafür.
- [ ] → Phase 7: Das Element-Menü zeigt die Kürzel als schlichten kleinen Text — der
      Kürzel-Dialog braucht ohnehin einen `kbd`-Baustein (11px, Rahmen, Radius 6px). Wenn
      der steht, gehört er auch ins Menü.
- [ ] → Phase 6/8: Die Kartenumrandung hängt jetzt am neuen Zweck-Token
      `--shadow-canvas-card` (Standard: Haarlinie, die Editor-Bühne überschreibt ihn auf
      `--shadow-lg`). Wer die Karte woanders zeigt (Kartenliste, Druckvorschau), setzt den
      Token dort passend, statt in `card-canvas.scss` zu schreiben.
