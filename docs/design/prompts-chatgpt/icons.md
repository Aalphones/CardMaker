# Icons — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Icons sind in CardMaker der **IconLayer** — kleine Grafiken, die das Template
zur Auswahl anbietet (Element, Seltenheit, Typ, Symbolwert). Auf der gedruckten
Karte sind sie oft nur wenige Millimeter groß. **Das ist die eigentliche
Schwierigkeit:** ein Icon, das am Bildschirm in 1024 px prächtig aussieht, ist
bei 8 mm ein grauer Fleck. Deshalb verlangt der Prompt kräftige Silhouette und
wenige Details.

Ziel: **512×512 PNG mit Alphakanal** je Icon. Zwei Runden — erst Stil
festlegen, dann sauber ausproduzieren.

---

## Runde 1 — Stilblatt (ein Bild, alle Icons)

```
Du bist Icon-Designer für ein Sammelkartenspiel.

Thema / Stilwelt: {THEMA — z.B. "Piraten und offene See"}
Icon-Set: {LISTE, z.B. "Feuer, Wasser, Erde, Luft, Blitz, Eis"}

=== ANALYSE (nicht ausgeben) ===
Leite aus dem Thema eine gemeinsame Formensprache ab: Silhouettentyp,
Linienstärke, Materialanmutung, Farbfamilie. Alle Icons des Sets teilen diese
Sprache.

=== VORGABEN ===
- Ein Bild, darin ein sauberes Raster mit {ANZAHL} Feldern, ein Icon je Feld,
  in genau der oben genannten Reihenfolge
- Jedes Icon sitzt mittig in seinem Feld, mit gleichem Abstand zum Feldrand,
  und alle Icons wirken optisch gleich groß
- Kräftige, sofort erkennbare Silhouette; das Icon bleibt lesbar, wenn es auf
  Daumennagelgröße verkleinert wird
- Wenige, große Formen statt feiner Binnenzeichnung; klare Innenabstände
- Einheitliche Beleuchtung über alle Icons hinweg
- Alle Flächen sind frei von Schrift, Zahlen und Signaturen
- Keine Rahmen, keine Kreise, keine Plaketten um die Icons herum — nur das
  Symbol selbst

=== HINTERGRUND ===
Der gesamte Hintergrund inklusive der Rasterfelder ist eine vollkommen
gleichmäßige Chroma-Magenta-Fläche in #FF00FF — one single flat value, glatt
und matt, ohne Verlauf, ohne Schatten, ohne Leuchten, ohne sichtbare
Rasterlinien. Magenta kommt ausschließlich im Hintergrund vor, nirgends in den
Icons.

=== FORMAT ===
Quadratisch, erzeuge das Bild in 1024x1024.

=== AUSGABE ===
1. Kurzbeschreibung der gemeinsamen Formensprache (wenige Sätze)
2. Farbpalette als Hex-Werte
3. Der Bildprompt in gegliederter Form (Scene / Subject / Details /
   Constraints) in einem Codeblock
Danach erzeuge das Bild direkt in diesem Chat.
```

---

## Runde 2 — jedes Icon einzeln in voller Auflösung

Aus dem Stilblatt geschnittene Icons haben bei einem 3×3-Raster nur ~340 px —
unter der Empfehlung von 512 px (ADR-015), also beim Vergrößern unscharf.
Deshalb jedes gewählte Icon nochmal einzeln, im selben Chat:

```
Erzeuge jetzt das Icon "{NAME}" aus diesem Set als einzelnes Bild in
1024x1024. Formensprache, Linienstärke, Farbpalette und Beleuchtung bleiben
exakt wie im Stilblatt — geändert wird nichts außer der Bildgröße und dass nur
dieses eine Symbol zu sehen ist.

Das Symbol sitzt mittig und füllt etwa 80 Prozent der Bildfläche. Der gesamte
übrige Hintergrund ist eine vollkommen gleichmäßige Chroma-Magenta-Fläche in
#FF00FF, one single flat value, glatt und matt, ohne Verlauf und ohne Schatten.
Keine Schrift, keine Signatur, kein Rahmen.
```

---

## Danach

1. Freistellen (Magenta ist bei bunten Symbolen der verträglichere Chroma-Wert
   als Grün — Grün steckt in Blattwerk, Gift, Edelsteinen).
2. Auf **512×512** verkleinern, als PNG mit Alphakanal speichern.
3. Prüfen, ob das Icon in der Kartenvorschau bei tatsächlicher Größe noch
   erkennbar ist — nicht am 100-%-Zoom entscheiden.
