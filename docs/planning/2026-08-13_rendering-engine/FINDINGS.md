# Findings — Meilenstein 4 (Rendering-Engine)

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Erledigte Punkte abhaken, nicht löschen.

---

- [x] Phase 1, Wackelstelle 1 geklärt: Eine Konva-Bühne auf einem nie eingehängten `div`
      liefert das Bild. Gemessen am PNG-Kopfsatz im kopflosen Chrome mit dem echten
      Zeichenweg: **744 × 1039**. Die Maße stammen aus `toDataURL`; `toBlob` benutzt
      dieselbe Leinwand, wurde aber nicht separat vermessen (der kopflose Browser gibt die
      Seite aus, bevor das späte Ergebnis ankommt).
- [ ] → Phase 3/4: Der Maßstab sitzt auf der **Konva-Ebene**, nicht auf der Bühne — die Bühne
      bekommt gleich die Zielgröße in Bildpunkten. Konva rechnet die Skalierung der Bühne beim
      Ausgeben nicht mit, die der Ebene schon. Wer `renderPng` erweitert, darf das nicht auf
      `pixelRatio` umstellen, ohne die Maße neu zu messen.
- [ ] → Phase 2: `renderPng` gibt heute `missing: []` zurück und bekommt leere Bild-/
      Schriftvorräte. Genau drei Zeilen in `exportContext()` sind die Nahtstelle.
- [ ] → Phase 5: Der Renderer erzeugt Bilder in jeder Zielbreite (`targetWidthPx`), die
      Kachel-Vorschaubilder können ihn also ohne Sonderweg benutzen.
