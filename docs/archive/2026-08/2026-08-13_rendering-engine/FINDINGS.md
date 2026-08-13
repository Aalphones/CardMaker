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
- [x] → Phase 2: `renderPng` gibt heute `missing: []` zurück und bekommt leere Bild-/
      Schriftvorräte. Genau drei Zeilen in `exportContext()` sind die Nahtstelle.
- [x] → Phase 4: `RenderResult.missing` ist ab jetzt echt gefüllt — Klartext-Ebenennamen der
      Bilder, die nicht geladen werden konnten. Der Herunterladen-Knopf muss das dem Nutzer
      sagen (Hinweismeldung), sonst lädt er still eine Karte mit Löchern herunter.
- [x] → Phase 4/5: Ein Export wartet jetzt auf Bilder und Schriften — im schlechtesten Fall
      10 Sekunden. Der Knopf braucht also einen Wartezustand (gesperrt/„wird erzeugt"), und
      Phase 5 darf das Vorschaubild nicht synchron im Speicher-Ablauf erwarten.
- [x] → Phase 5: Der Schriftlader meldet jetzt auch Fehlschläge (`FontLoader.failed`), der
      Vorratslader seine Fehlliste (`AssetImageLoader.failedKeys`). Wer sonst noch auf Bilder
      wartet, kann sich daran hängen statt an einer eigenen Zeitschaltung. — Gebraucht: gar
      nicht extra, `CardRenderer.renderPng()` wartet das intern schon ab; die Vorschaubilder
      rufen nur noch `renderPng()` auf statt selbst zu warten.
- [x] → Phase 5: Der Renderer erzeugt Bilder in jeder Zielbreite (`targetWidthPx`), die
      Kachel-Vorschaubilder können ihn also ohne Sonderweg benutzen. — Bestätigt: beide
      Vorschau-Uploads rufen `renderPng(..., PREVIEW_WIDTH_PX)` ohne Sonderfall auf.
- [x] Phase 3: `card-editor.ts` bleibt bei seiner eigenen `previewContent`-Zuordnung.
      `buildRenderInput(card, template)` nimmt den **gespeicherten** Stand entgegen — der
      Editor zeigt aber den Entwurf (Formularwerte, unbestätigte Bildausschnitte in
      `pendingPlacements`). Beides auf eine Funktion zu ziehen hieße, aus dem Entwurf einen
      synthetischen `Card` zu bauen — mehr Verrenkung als Nutzen für eine Phase, deren Ziel
      der editorlose Weg ist. `previewContent` bleibt bestehen, wie im Plan als Ausweg
      vorgesehen.
