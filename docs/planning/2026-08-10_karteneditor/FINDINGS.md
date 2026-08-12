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
- [ ] → Phase 7: Der Vorbehalt zu Fett/Kursiv im README ist hinfällig — der Schriften-Plan
      ist durch, das Canvas zeichnet beides. Die Abweichungen wirken sofort.
- [ ] → Phase 9: `docs/models.md` wurde in Phase 1 neu angelegt und deckt alle Tabellen ab.
      Beim Doku-Abgleich am Plan-Ende gegen den dann gebauten Stand prüfen.
