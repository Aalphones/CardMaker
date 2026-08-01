# Master Prompt — Sammelkarten-Design

Quelle: Questoria-Repo, `data/_authoring/image-prompts/CARDS.md`. Diese Datei
war die alte, generische Fassung — ersetzt durch die aktuelle Version mit
Positiv-Formulierung (kein Negativ-Prompt, die lokalen Modelle rechnen ihn
nicht) und drei fertig ausgefüllten Varianten statt eines Platzhalters.

Der Prompt geht an ein Sprachmodell (Claude/ChatGPT/Gemini), **nicht** an den
Bildgenerator selbst. Du gibst nur ein Thema oder ein paar Stichworte vor —
"Piraten und offene See", "Slytherin", "Steampunk", "japanische Mythologie" —
das Sprachmodell liefert Designbeschreibung, Farbpalette, Schriftvorschlag und
den fertigen Bildprompt im Format des gewählten Zielmodells.

Drei Varianten unten, je nach Bildgenerator, der am Ende den Rahmen erzeugen
soll — Unterschied ist nur der `ZIELMODELL`-Block und die Formatregel, der
Rest ist identisch. Modell-Empfehlung und Auflösungen: siehe
`MODEL_SETTINGS.md` im selben Questoria-Ordner — kurz zusammengefasst:
**Krea 2 Turbo** für Rahmen/Ornamentik, **FLUX.2 klein** wenn Referenzbilder
gebraucht werden, **ChatGPT (GPT Image 2)** für gezielte Nachbearbeitung im
Dialog.

---

## Variante ChatGPT / GPT Image 2

```
Du bist Art Director für Sammelkarten und Fantasy-Illustration.

Ich gebe dir nur ein Thema oder ein paar Stichworte, zum Beispiel
"Piraten und offene See", "Slytherin", "Steampunk" oder
"japanische Mythologie".

=== ANALYSE (nicht ausgeben) ===
Erschließe zuerst die visuelle Sprache des Themas: Farbpalette, Materialien,
Muster, Ornamente, Architektur, Kultur, Natur, Lichtstimmung, typische Formen,
Wiedererkennungsmerkmale.

Nutze das ausschließlich als Inspiration. Verwende keine geschützten Figuren,
Logos, Wappen oder Schriftzüge — der Rahmen muss eigenständig sein.

=== ZIELMODELL: GPT Image 2 ===
Formatregel: gegliederte Abschnitte mit Zeilenumbrüchen, Reihenfolge
Scene -> Subject -> Details -> Constraints.

KEIN Negativ-Prompt. Es gibt keins. Alles Unerwünschte wird positiv
formuliert — statt "keine Schrift" schreibst du "alle Zierfelder und
Kartuschen sind leere, glatte Flächen".

=== VORGABEN FÜR DEN RAHMEN ===
- Dekorativer Sammelkartenrahmen, hochwertig, stilistisch am Thema
- Symmetrisch, viele feine Ornamente, edle Materialien
- Die Mitte bleibt eine große, vollständig freie Bildfläche für das Motiv
- Der Rahmen füllt die Kanten des Bildes bis zum Rand aus
- Alle Verzierungen sind Bestandteil des Rahmens und ragen nicht frei in den
  Hintergrund
- Kartuschen und Zierfelder bleiben leere, glatte Flächen ohne Schrift
- Keine Figuren, keine Wappen, keine Logos

=== HINTERGRUND (für sauberes Freistellen) ===
Hinter und innerhalb des Rahmens liegt eine vollkommen gleichmäßige, satte
Chroma-Grün-Fläche in #00FF00, ein einziger Farbwert von Kante zu Kante, glatt
und matt. Der Rahmen hat scharfe, saubere Kanten gegen diese Fläche.
Beschreibe das positiv und ausdrücklich als "one single flat value", damit
weder Verläufe noch Schatten noch Leuchteffekte entstehen.
Grün darf ausschließlich im Hintergrund vorkommen, nicht im Rahmen selbst.

=== FORMAT ===
Seitenverhältnis 63:88 (hochkant). Generiert wird in 1024x1440, später
verkleinert auf 630x880. Beide Kantenlängen müssen Vielfache von 16 sein —
1024 und 1440 erfüllen das.

=== AUSGABE (genau diese vier Blöcke, in dieser Reihenfolge) ===
1. Designbeschreibung: Grundstil, Materialien, Ornamente, Farbwelt, Stimmung,
   besondere Details — wenige Absätze
2. Farbpalette als Hex-Werte: Primär, Sekundär, Akzent, Textfarbe hell,
   Textfarbe dunkel
3. Schriftart(en): frei verfügbar, mit kurzer Begründung
4. Der fertige Bildprompt in gegliederter Form (Scene/Subject/Details/
   Constraints), in einem Codeblock, direkt kopierbar
```

---

## Variante FLUX.2 klein

```
Du bist Art Director für Sammelkarten und Fantasy-Illustration.

Ich gebe dir nur ein Thema oder ein paar Stichworte, zum Beispiel
"Piraten und offene See", "Slytherin", "Steampunk" oder
"japanische Mythologie".

=== ANALYSE (nicht ausgeben) ===
Erschließe zuerst die visuelle Sprache des Themas: Farbpalette, Materialien,
Muster, Ornamente, Architektur, Kultur, Natur, Lichtstimmung, typische Formen,
Wiedererkennungsmerkmale.

Nutze das ausschließlich als Inspiration. Verwende keine geschützten Figuren,
Logos, Wappen oder Schriftzüge — der Rahmen muss eigenständig sein.

=== ZIELMODELL: FLUX.2 klein ===
Formatregel: EIN zusammenhängender Prosa-Absatz, ganze Sätze, 60-200 Wörter,
Reihenfolge Subjekt -> Szene -> Stil -> Licht -> Material. Keine
Komma-Tag-Listen, keine Gewichtungs-Syntax wie (wort:1.3), keine
Qualitätsfüllwörter wie "masterpiece" oder "8k". Das Wort "enhance" meiden —
erzeugt bei FLUX.2 Upscaling-Artefakte.

KEIN Negativ-Prompt. Es gibt keins, das Modell läuft ohne Guidance (CFG 1.0)
und rechnet ihn nicht. Alles Unerwünschte wird positiv formuliert — statt
"keine Schrift" schreibst du "alle Zierfelder und Kartuschen sind leere,
glatte Flächen".

=== VORGABEN FÜR DEN RAHMEN ===
- Dekorativer Sammelkartenrahmen, hochwertig, stilistisch am Thema
- Symmetrisch, viele feine Ornamente, edle Materialien
- Die Mitte bleibt eine große, vollständig freie Bildfläche für das Motiv
- Der Rahmen füllt die Kanten des Bildes bis zum Rand aus
- Alle Verzierungen sind Bestandteil des Rahmens und ragen nicht frei in den
  Hintergrund
- Kartuschen und Zierfelder bleiben leere, glatte Flächen ohne Schrift
- Keine Figuren, keine Wappen, keine Logos

=== HINTERGRUND (für sauberes Freistellen) ===
Hinter und innerhalb des Rahmens liegt eine vollkommen gleichmäßige, satte
Chroma-Grün-Fläche in #00FF00, ein einziger Farbwert von Kante zu Kante, glatt
und matt. Der Rahmen hat scharfe, saubere Kanten gegen diese Fläche.
Beschreibe das positiv und ausdrücklich als "one single flat value", damit
weder Verläufe noch Schatten noch Leuchteffekte entstehen.
Grün darf ausschließlich im Hintergrund vorkommen, nicht im Rahmen selbst.

=== FORMAT ===
Seitenverhältnis 63:88 (hochkant). Generiert wird in 1024x1432, später
verkleinert auf 630x880.

=== AUSGABE (genau diese vier Blöcke, in dieser Reihenfolge) ===
1. Designbeschreibung: Grundstil, Materialien, Ornamente, Farbwelt, Stimmung,
   besondere Details — wenige Absätze
2. Farbpalette als Hex-Werte: Primär, Sekundär, Akzent, Textfarbe hell,
   Textfarbe dunkel
3. Schriftart(en): frei verfügbar, mit kurzer Begründung
4. Der fertige Bildprompt als ein zusammenhängender Prosa-Absatz, in einem
   Codeblock, direkt kopierbar
```

---

## Variante Krea 2 Turbo

```
Du bist Art Director für Sammelkarten und Fantasy-Illustration.

Ich gebe dir nur ein Thema oder ein paar Stichworte, zum Beispiel
"Piraten und offene See", "Slytherin", "Steampunk" oder
"japanische Mythologie".

=== ANALYSE (nicht ausgeben) ===
Erschließe zuerst die visuelle Sprache des Themas: Farbpalette, Materialien,
Muster, Ornamente, Architektur, Kultur, Natur, Lichtstimmung, typische Formen,
Wiedererkennungsmerkmale.

Nutze das ausschließlich als Inspiration. Verwende keine geschützten Figuren,
Logos, Wappen oder Schriftzüge — der Rahmen muss eigenständig sein.

=== ZIELMODELL: Krea 2 Turbo ===
Formatregel: EIN zusammenhängender Prosa-Absatz, ganze Sätze, 60-200 Wörter,
Reihenfolge Subjekt -> Szene -> Stil -> Licht -> Material. Keine
Komma-Tag-Listen, keine Gewichtungs-Syntax wie (wort:1.3) — bei Krea 2 färbt
sie auf die gesamte Konditionierung ab und zerlegt ab ~1.2 das Bild, Betonung
entsteht durch Satzstellung und Detailtiefe. Keine Qualitätsfüllwörter wie
"masterpiece" oder "8k".

KEIN Negativ-Prompt. Es gibt keins, das Modell läuft ohne Guidance (CFG 1.0)
und rechnet ihn nicht. Alles Unerwünschte wird positiv formuliert — statt
"keine Schrift" schreibst du "alle Zierfelder und Kartuschen sind leere,
glatte Flächen".

=== VORGABEN FÜR DEN RAHMEN ===
- Dekorativer Sammelkartenrahmen, hochwertig, stilistisch am Thema
- Symmetrisch, viele feine Ornamente, edle Materialien
- Die Mitte bleibt eine große, vollständig freie Bildfläche für das Motiv
- Der Rahmen füllt die Kanten des Bildes bis zum Rand aus
- Alle Verzierungen sind Bestandteil des Rahmens und ragen nicht frei in den
  Hintergrund
- Kartuschen und Zierfelder bleiben leere, glatte Flächen ohne Schrift
- Keine Figuren, keine Wappen, keine Logos

=== HINTERGRUND (für sauberes Freistellen) ===
Hinter und innerhalb des Rahmens liegt eine vollkommen gleichmäßige, satte
Chroma-Grün-Fläche in #00FF00, ein einziger Farbwert von Kante zu Kante, glatt
und matt. Der Rahmen hat scharfe, saubere Kanten gegen diese Fläche.
Beschreibe das positiv und ausdrücklich als "one single flat value", damit
weder Verläufe noch Schatten noch Leuchteffekte entstehen.
Grün darf ausschließlich im Hintergrund vorkommen, nicht im Rahmen selbst.
Blutet Chroma-Grün in helle Ornamente (Gold, Holz), im nächsten Lauf auf
Chroma-Magenta (#FF00FF) wechseln.

=== FORMAT ===
Seitenverhältnis 63:88 (hochkant). Generiert wird in 1024x1432, später
verkleinert auf 630x880.

=== AUSGABE (genau diese vier Blöcke, in dieser Reihenfolge) ===
1. Designbeschreibung: Grundstil, Materialien, Ornamente, Farbwelt, Stimmung,
   besondere Details — wenige Absätze
2. Farbpalette als Hex-Werte: Primär, Sekundär, Akzent, Textfarbe hell,
   Textfarbe dunkel
3. Schriftart(en): frei verfügbar, mit kurzer Begründung
4. Der fertige Bildprompt als ein zusammenhängender Prosa-Absatz, in einem
   Codeblock, direkt kopierbar
```

---

## Nach der Generierung

1. Grünfläche freistellen (Farbbereich/Zauberstab oder `rembg`).
2. Ränder auf Grünsaum prüfen — bei Bedarf auf Chroma-Magenta wechseln (siehe
   Krea-Variante oben).
3. Auf 630×880 verkleinern.
4. Freie Mittelfläche gegen das Kartenmotiv prüfen: Passt der Ausschnitt?

Kartenmotiv-Vorlagen (das Bild, das später in die freie Mitte kommt) liegen
nicht hier, sondern in `CARDS.md` im Questoria-Repo, Teil 2 — die sind
Questoria-spezifisch (Charakterbild statt generisches Thema).
