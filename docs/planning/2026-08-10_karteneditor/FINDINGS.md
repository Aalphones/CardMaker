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
- [ ] → Phase 5: `features/cards/cards-list/` existiert als Rohbau (Überschrift + Knopf
      „Neue Karte"), Route `/cards` hängt schon dran. Phase 5 füllt die Datei, legt sie
      nicht neu an. Die Fassade liefert `summaries()`, `summariesLoading()`,
      `ensureLoaded()`, `duplicate(id)`, `remove(id)`; die Kurzfassung enthält
      `templateName` und `cardGroupName` — die Filter brauchen keinen zweiten Aufruf.
- [ ] → Phase 6: `CardEditor.hasUnsavedChanges()` gibt im Rohbau hart `false` zurück. Der
      Riegel gegen ungespeicherte Änderungen hängt an den Routen, schützt aber nichts,
      bis Phase 6 die Methode an den echten Entwurfs-Zustand hängt.
- [ ] → Phase 6: Anlegen und Ändern gehen über `create(input)` bzw.
      `save(id, changes)` — `save` schickt nur die übergebenen Felder (PATCH). Nach dem
      Anlegen springt der Effekt selbst auf `/cards/{id}`, die Komponente muss nicht
      navigieren.
- [ ] → Phase 8: Kartenbilder liegen nicht im Store, sondern im
      `CardImageLoader` (`shared/canvas/card-image-loader.ts`, Schlüssel `cardId:layerId`).
      Nach Hochladen und Entfernen hält der Effekt den Zwischenspeicher schon aktuell —
      die Vorschau muss nur `load(cardId, layerId)` aufrufen und auf `images()` hören.
- [ ] → Phase 7: Der Vorbehalt zu Fett/Kursiv im README ist hinfällig — der Schriften-Plan
      ist durch, das Canvas zeichnet beides. Die Abweichungen wirken sofort.
- [ ] → Phase 9: `docs/models.md` wurde in Phase 1 neu angelegt und deckt alle Tabellen ab.
      Beim Doku-Abgleich am Plan-Ende gegen den dann gebauten Stand prüfen.
