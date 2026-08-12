# Findings — Meilenstein 3 (Karteneditor)

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Erledigte Punkte abhaken, nicht löschen.

---

- [x] → Phase 2: Die Tabellen heißen wie geplant, die Migrationen aber `M008CreateCards` und
      `M009CreateCardImages` (M007 war beim Umsetzen schon von den Schriften belegt). Der
      Datenblock-ADR ist die 020, nicht die 019.
- [x] → Phase 2: Alle Schlüsselspalten sind `INT UNSIGNED`, nicht `INT` — der Bestand macht
      das durchgehend so, und ein Fremdschlüssel muss zum Typ der Zielspalte passen.
- [x] → Phase 2: `values` ist in MySQL reserviert. Jede Abfrage, die die Spalte anfasst,
      braucht Backticks — auch das `INSERT`, auch das `SELECT`. (`CardRepository` benutzt
      überall Backticks um `values`.)
- [x] → Phase 3: `card_images` hat einen eindeutigen Schlüssel auf (`card_id`, `layer_id`).
      Ein zweiter Upload in dieselbe Bildfläche muss also ersetzen, nicht einfügen, sonst
      knallt es auf Datenbankebene. (Betrifft `card_images`, nicht `cards` — Phase 3 baut
      den Bild-Upload.)
      Umgesetzt über `INSERT ... ON DUPLICATE KEY UPDATE` in `CardImageRepository::upsert()`.
- [x] → Phase 5: `features/cards/cards-list/` existiert als Rohbau (Überschrift + Knopf
      „Neue Karte"), Route `/cards` hängt schon dran. Phase 5 füllt die Datei, legt sie
      nicht neu an. Die Fassade liefert `summaries()`, `summariesLoading()`,
      `ensureLoaded()`, `duplicate(id)`, `remove(id)`; die Kurzfassung enthält
      `templateName` und `cardGroupName` — die Filter brauchen keinen zweiten Aufruf.
- [x] → Phase 6: `CardEditor.hasUnsavedChanges()` gibt im Rohbau hart `false` zurück. Der
      Riegel gegen ungespeicherte Änderungen hängt an den Routen, schützt aber nichts,
      bis Phase 6 die Methode an den echten Entwurfs-Zustand hängt.
      Hängt jetzt an `form.dirty` **und** einem Merker für den Template-Wechsel — den
      bekommt kein Formular-Control mit.
- [x] → Phase 6: Anlegen und Ändern gehen über `create(input)` bzw.
      `save(id, changes)` — `save` schickt nur die übergebenen Felder (PATCH). Nach dem
      Anlegen springt der Effekt selbst auf `/cards/{id}`, die Komponente muss nicht
      navigieren.
- [x] → Phase 7: Welche Felder eine Karte hat, sagt `features/cards/card-editor/card-fields.ts`
      (`describeCardFields(layers)`) — dieselbe Funktion für Formular und Vorschau, kein
      zweiter Ableitungsweg. Bildflächen kommen aus **allen** Bildebenen, Text- und
      Icon-Felder nur aus denen mit „Wird pro Karte …".
- [x] → Phase 7: Abweichungen werden nur gespeichert, wenn sie gesetzt sind — ein Eintrag in
      `textOverrides` ohne Feld existiert nicht. Fehlt ein Schlüssel, gilt der Template-Wert.
      Fett/Kursiv sind dreistufig (Template | An | Aus), im Datensatz also `undefined`/`true`/
      `false`.
- [x] → Phase 7: Der Platz für die Vorschau steht: rechte Spalte, `card-editor__preview-frame`
      im Seitenverhältnis 63:88. Nur den Platzhaltertext ersetzen.
- [x] → Phase 7: Der Editor hält **alle** je gesehenen Werte, auch die des aktuellen Templates
      unbekannten. Die Vorschau zeichnet ausschließlich die Felder aus `describeCardFields` —
      verwaiste Werte gehören nicht aufs Bild.
- [ ] → Phase 8: `CardsActions.create` nimmt jetzt optional ein `pendingImage` mit; der Effekt
      lädt es hoch, sobald die neue Karte eine Kennung hat. Beim Zurechtschieben in Phase 8
      ist die Karte immer schon angelegt — dort reicht `updateImagePlacement`.
- [ ] → Phase 8: Kartenbilder liegen nicht im Store, sondern im
      `CardImageLoader` (`shared/canvas/card-image-loader.ts`, Schlüssel `cardId:layerId`).
      Nach Hochladen und Entfernen hält der Effekt den Zwischenspeicher schon aktuell —
      die Vorschau muss nur `load(cardId, layerId)` aufrufen und auf `images()` hören.
- [x] → Phase 7: Der Vorbehalt zu Fett/Kursiv im README ist hinfällig — der Schriften-Plan
      ist durch, das Canvas zeichnet beides. Die Abweichungen wirken sofort.
- [ ] → Phase 8: Die Umrechnung „Verschiebung + Maßstab → Zeichenkasten" steht als
      `cardImageBox(area, placement)` in `shared/canvas/rendering/card-content.ts`. Maßstab 1
      heißt: das Bild füllt die Fläche gerade eben (kürzere Seite passt genau), von dort aus
      zentriert und um `offsetX/offsetY` versetzt. Die Ziehen-und-Zoomen-Geste muss ihre
      Werte in genau diese Größen umrechnen, sonst springt das Bild beim Neuladen.
- [ ] → Phase 8: Die Bildgruppe in der Vorschau ist noch taub (`listening: false`, siehe
      `cardImageItem()` in `draw-items.ts`) — Phase 8 muss sie hörbar machen und die Gesten
      dort anhängen. Der Zuschnitt sitzt auf der Gruppe, das Bild darin trägt nur den Versatz.
- [ ] → Phase 8: Das Vorschaubild der Kachel entsteht **nur** beim Klick auf „Karte speichern"
      (`uploadPreview()` im Karteneditor). Legt man bei einer neuen Karte zuerst ein Bild ab,
      entsteht die Karte ohne Vorschaubild — erst das nächste Speichern liefert eins nach.
      Wird in Phase 8 der Ausschnitt geändert, gehört dort dieselbe Frage gestellt.
- [ ] → Phase 9: Der Doku-Abgleich muss `docs/code-map.md` gegen `card-content.ts` und die
      Gruppen-Zeichnung prüfen — beide Zeilen sind in Phase 7 neu geschrieben worden.
- [ ] → Phase 9: `docs/models.md` wurde in Phase 1 neu angelegt und deckt alle Tabellen ab.
      Beim Doku-Abgleich am Plan-Ende gegen den dann gebauten Stand prüfen.
