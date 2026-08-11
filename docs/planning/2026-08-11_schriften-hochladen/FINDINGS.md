# Erkenntnisse während der Umsetzung

Was beim Bauen auffällt und eine spätere Phase betrifft, kommt hierher — statt es in der
laufenden Phase mitzuerledigen oder zu vergessen.

Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

- [ ] → Phase 2: `LayerValidator.php` prüft `font_family` heute über `requiredEnum(...,
      self::FONT_FAMILIES, ...)` (Zeile ~276) — eine feste Liste im Quelltext. Genau dieser
      Aufruf ist die Stelle, die um die hochgeladenen Schriften erweitert werden muss; die
      Liste selbst ist das Gegenstück zu `frontend/.../rendering/fonts.ts`.
- [ ] → Phase 3: Der Löschschutz sucht `cmfont-<id>` im Feld `font_family` der gespeicherten
      Ebenen. Das Frontend schickt `fontFamily`, das Backend wandelt an der Wire-Grenze um —
      wer den Namen im Frontend anders ablegt, hebelt den Schutz aus, ohne dass es auffällt.
- [ ] → Phase 4: Fehlerantworten beim Hochladen sind **immer 422** mit dem Klartext in
      `fields.file` (kein 413 wie bei Bildern). Die Oberfläche kann eine Meldung durchreichen,
      statt drei Fälle zu unterscheiden.
- [ ] → Phase 4: Sammlungen (`.ttc`) werden abgelehnt — sie enthalten mehrere Schriften. Falls
      das im Test auffällt: gewollt, nicht vergessen.
