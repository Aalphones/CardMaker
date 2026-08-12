# Rahmen — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Der Rahmen ist in CardMaker der **FrameLayer**: genau einer pro Template,
vollflächig, nicht verschiebbar, nicht skalierbar. Er liegt über Bild, Formen
und Icons und unter dem Text. Entscheidend ist deshalb nicht nur, wie schön er
ist, sondern **wo er Platz lässt** — Bildfläche, Titel, Textbox und
Werte-Felder werden später als eigene Ebenen daraufgelegt.

Ziel: **630×880 PNG mit Alphakanal**. Erzeugt wird in 1024×1440, danach
freigestellt und verkleinert.

---

## Der Prompt

```
Du bist Art Director für Sammelkarten und Fantasy-Illustration.

Ich gebe dir ein Thema oder ein paar Stichworte, zum Beispiel
"Piraten und offene See", "Steampunk", "japanische Mythologie".

Thema: {THEMA}

=== ANALYSE (nicht ausgeben) ===
Erschließe zuerst die visuelle Sprache des Themas: Farbpalette, Materialien,
Muster, Ornamente, Architektur, Kultur, Natur, Lichtstimmung, typische Formen,
Wiedererkennungsmerkmale. Nutze das ausschließlich als Inspiration. Verwende
keine geschützten Figuren, Logos, Wappen oder Schriftzüge — der Rahmen muss
eigenständig sein.

=== VORGABEN FÜR DEN RAHMEN ===
- Dekorativer Sammelkartenrahmen, hochwertig, stilistisch am Thema
- Symmetrisch entlang der senkrechten Mittelachse, feine Ornamente, edle
  Materialien
- Der Rahmen füllt die Kanten des Bildes bis zum Rand aus
- Alle Verzierungen sind Bestandteil des Rahmens und ragen nicht frei in den
  Hintergrund
- Keine Figuren, keine Wappen, keine Logos, keine Schrift

=== FREIE FLÄCHEN (das Wichtigste — der Rahmen wird später beschriftet) ===
Über diesen Rahmen legt die Software eigene Ebenen. Diese Flächen bleiben
deshalb vollständig frei von Ornamentik:
- {BILDFLÄCHE: z.B. "das obere Zweidrittel der Karte" | "ein hochkantes
  Fenster in der Mitte"} — hier kommt später das Motivbild hinein
- Ein Titelband {TITEL_POSITION: z.B. "direkt unterhalb der Bildfläche"} als
  glatte, leere Kartusche für eine Zeile Text
- Ein Textfeld im unteren Drittel als ruhige, glatte Fläche für mehrere
  Zeilen Text
- {WEITERE_FELDER: z.B. "zwei kleine runde Felder in den unteren Ecken für
  Zahlenwerte" — oder streichen}
Diese Flächen sind glatte, gleichmäßige Flächen ohne Muster, ohne
Verlaufskanten quer durch die Mitte und ohne Schrift. Ihre Umrandung darf
verziert sein, ihr Inneres nicht.

=== HINTERGRUND (für sauberes Freistellen) ===
Innerhalb aller oben genannten freien Flächen und hinter dem Rahmen liegt
eine vollkommen gleichmäßige Chroma-Grün-Fläche in #00FF00 — one single flat
value von Kante zu Kante, glatt und matt, ohne Verlauf, ohne Schatten, ohne
Leuchten. Der Rahmen hat scharfe, saubere Kanten gegen diese Fläche. Grün
kommt ausschließlich im Hintergrund vor, nirgends im Rahmen selbst.

=== FORMAT ===
Hochkant, Seitenverhältnis 63:88. Erzeuge das Bild in 1024x1440.

=== AUSGABE (genau diese vier Blöcke, dann das Bild) ===
1. Designbeschreibung: Grundstil, Materialien, Ornamente, Farbwelt, Stimmung
2. Farbpalette als Hex-Werte: Primär, Sekundär, Akzent, Textfarbe hell,
   Textfarbe dunkel
3. Schriftart(en): frei verfügbar, mit kurzer Begründung — passend zum Rahmen,
   wird später in der Software auf die Textfelder gelegt
4. Der fertige Bildprompt in gegliederter Form
   (Scene / Subject / Details / Constraints), in einem Codeblock
Danach erzeuge das Bild direkt in diesem Chat.
```

---

## Danach

1. Grünfläche freistellen (Farbbereich/Zauberstab oder `rembg`).
2. Ränder auf Grünsaum prüfen — Chroma-Grün blutet gern in helle Ornamente
   (Gold, Holz). Fällt das auf, nächste Runde mit **Chroma-Magenta (#FF00FF)**.
3. Auf **630×880** verkleinern, als PNG mit Alphakanal speichern.
4. In CardMaker als Rahmen hochladen und gegen ein Testbild und echte Texte
   prüfen: Passt die Bildfläche? Bleibt der Titel lesbar?
