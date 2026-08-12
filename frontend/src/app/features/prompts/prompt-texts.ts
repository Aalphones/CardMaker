/**
 * Die Bild-Prompts für ChatGPT, wie sie auch in `docs/design/prompts-chatgpt/` liegen.
 * Beide Orte müssen deckungsgleich bleiben — die Doku ist die Quelle, das hier die
 * bequem kopierbare Fassung in der Anwendung.
 */

export interface PromptBlock {
  readonly id: string;
  readonly title: string;
  readonly hint: string;
  readonly text: string;
}

export interface PromptTab {
  readonly id: string;
  readonly label: string;
  readonly target: string;
  readonly intro: readonly string[];
  readonly blocks: readonly PromptBlock[];
  readonly afterwards: readonly string[];
}

const RAHMEN_PROMPT = `Du bist Art Director für Sammelkarten und Fantasy-Illustration.

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
Danach erzeuge das Bild direkt in diesem Chat.`;

const ICONS_STILBLATT_PROMPT = `Du bist Icon-Designer für ein Sammelkartenspiel.

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
Danach erzeuge das Bild direkt in diesem Chat.`;

const ICONS_EINZELN_PROMPT = `Erzeuge jetzt das Icon "{NAME}" aus diesem Set als einzelnes Bild in
1024x1024. Formensprache, Linienstärke, Farbpalette und Beleuchtung bleiben
exakt wie im Stilblatt — geändert wird nichts außer der Bildgröße und dass nur
dieses eine Symbol zu sehen ist.

Das Symbol sitzt mittig und füllt etwa 80 Prozent der Bildfläche. Der gesamte
übrige Hintergrund ist eine vollkommen gleichmäßige Chroma-Magenta-Fläche in
#FF00FF, one single flat value, glatt und matt, ohne Verlauf und ohne Schatten.
Keine Schrift, keine Signatur, kein Rahmen.`;

const ARTWORK_STICHWORTE_PROMPT = `Du bist Illustrator für Sammelkarten-Artwork.

Motiv: {STICHWORTE — z.B. "Rotfuchs, Herbstwald, aufmerksam, Abendlicht"}
Stimmung: {STIMMUNG — z.B. "warm und heroisch" | "düster und still"}
Stil: {STIL — z.B. "malerische Illustration mit weichem Cel-Shading, klare
      Linienführung, warme gesättigte Farben"}

=== VORGABEN ===
- Genau ein Hauptmotiv, mittig, es füllt den größten Teil des Bildes
- Um das Motiv bleibt auf allen vier Seiten ein ruhiger Rand, damit das Bild
  später in einer Kartenfläche verschoben und gezoomt werden kann, ohne dass
  Wesentliches anschneidet
- Der Bildschwerpunkt liegt in der {SCHWERPUNKT: "oberen Hälfte" |
  "Bildmitte"}, weil der untere Teil der Karte später von Text überdeckt wird
- Hintergrund: {HINTERGRUND — z.B. "weicher radialer Schimmer, von hellem Gold
  in der Mitte zu tiefem Indigo an den Ecken" | "unscharfer Herbstwald"}
- Licht: {LICHT — Quelle, Richtung, Charakter, Farbtemperatur}
- Jede Fläche im Bild ist frei von Schrift, Signaturen, Wasserzeichen und Logos

=== FORMAT ===
{FORMAT: "Hochkant 63:88, erzeuge in 1024x1440" | "Quadratisch, erzeuge in
1024x1024"} — das Format der Bildfläche im Kartentemplate.

=== AUSGABE ===
1. Zwei bis drei Sätze, wie du das Motiv anlegst
2. Der Bildprompt in gegliederter Form (Scene / Subject / Style / Light /
   Composition / Constraints) in einem Codeblock
Danach erzeuge das Bild direkt in diesem Chat.`;

const ARTWORK_REFERENZ_PROMPT = `Du bist Illustrator für Sammelkarten-Artwork. Ich hänge Referenzbilder an.

Bild 1 — {ROLLE, z.B. "Motivreferenz"}: übernimm daraus {WAS GENAU, z.B.
"Körperbau, Fellzeichnung und Farbgebung des Tieres"}.
Bild 2 — {ROLLE, z.B. "Stilreferenz"}: übernimm daraus ausschließlich
{WAS GENAU, z.B. "Malweise, Linienführung und Farbstimmung"}, nicht den
Bildinhalt.
{Weitere Bilder analog — höchstens drei, sonst mischt sich alles.}

Nicht übernehmen: {WAS NICHT, z.B. "Bildausschnitt, Pose und Hintergrund von
Bild 1"}.

Neu ist: {ÄNDERUNG — z.B. "das Tier steht aufrecht und blickt nach links,
Hintergrund ein abendlicher Herbstwald"}.

=== VORGABEN ===
- Genau ein Hauptmotiv, mittig, es füllt den größten Teil des Bildes
- Ringsum bleibt ein ruhiger Rand, damit das Bild später in der Kartenfläche
  verschoben und gezoomt werden kann
- Bildschwerpunkt in der {SCHWERPUNKT}, der untere Teil wird später von Text
  überdeckt
- Jede Fläche im Bild ist frei von Schrift, Signaturen, Wasserzeichen und Logos

=== FORMAT ===
{FORMAT}

Zeige mir zuerst in zwei Sätzen, was du aus welchem Bild übernimmst, dann
erzeuge das Bild.`;

export const PROMPT_TABS: readonly PromptTab[] = [
  {
    id: 'rahmen',
    label: 'Rahmen',
    target: '630 × 880 PNG, freigestellt',
    intro: [
      'Der Rahmen ist die Rahmen-Ebene eines Templates: genau eine pro Template, vollflächig, ' +
        'nicht verschiebbar. Sie liegt über Bild, Formen und Icons und unter dem Text.',
      'Entscheidend ist deshalb nicht nur, wie schön der Rahmen ist, sondern wo er Platz ' +
        'lässt — Bildfläche, Titel, Textbox und Werte-Felder kommen später als eigene Ebenen ' +
        'darüber. Genau das beschreibt der Block „Freie Flächen“, den du ausfüllen musst.',
    ],
    blocks: [
      {
        id: 'rahmen-master',
        title: 'Master-Prompt',
        hint: 'Thema und freie Flächen eintragen, alles andere wörtlich lassen.',
        text: RAHMEN_PROMPT,
      },
    ],
    afterwards: [
      'Grünfläche freistellen (Farbbereich, Zauberstab oder rembg).',
      'Ränder auf Grünsaum prüfen — Chroma-Grün blutet gern in helle Ornamente wie Gold und ' +
        'Holz. Fällt das auf, nächste Runde mit Chroma-Magenta (#FF00FF).',
      'Auf 630 × 880 verkleinern, als PNG mit Transparenz speichern.',
      'Hier hochladen und gegen ein Testbild und echte Texte prüfen: Passt die Bildfläche? ' +
        'Bleibt der Titel lesbar?',
    ],
  },
  {
    id: 'icons',
    label: 'Icons',
    target: '512 × 512 PNG, freigestellt',
    intro: [
      'Icons sind die Grafiken, die ein Template zur Auswahl anbietet — Element, Seltenheit, ' +
        'Typ, Symbolwert. Auf der gedruckten Karte sind sie oft nur wenige Millimeter groß.',
      'Das ist die eigentliche Schwierigkeit: Ein Icon, das am Bildschirm in voller Größe ' +
        'prächtig aussieht, ist bei 8 mm ein grauer Fleck. Deshalb verlangt der Prompt eine ' +
        'kräftige Silhouette und wenige Details. Zwei Runden — erst den Stil festlegen, dann ' +
        'sauber ausproduzieren.',
    ],
    blocks: [
      {
        id: 'icons-stilblatt',
        title: 'Runde 1 — Stilblatt',
        hint: 'Alle Icons des Sets in einem Bild, damit sie dieselbe Formensprache teilen.',
        text: ICONS_STILBLATT_PROMPT,
      },
      {
        id: 'icons-einzeln',
        title: 'Runde 2 — jedes Icon einzeln',
        hint:
          'Im selben Chat nachlegen. Aus einem 3 × 3-Raster geschnitten hätte ein Icon nur ' +
          'rund 340 Pixel — zu wenig für scharfe Kanten auf der Karte.',
        text: ICONS_EINZELN_PROMPT,
      },
    ],
    afterwards: [
      'Freistellen — Magenta ist bei bunten Symbolen der verträglichere Chroma-Wert als Grün, ' +
        'das in Blattwerk, Gift und Edelsteinen steckt.',
      'Auf 512 × 512 verkleinern, als PNG mit Transparenz speichern.',
      'Prüfen, ob das Icon in der Kartenvorschau bei tatsächlicher Größe noch erkennbar ist — ' +
        'nicht am 100-%-Zoom entscheiden.',
    ],
  },
  {
    id: 'artwork',
    label: 'Artwork',
    target: 'PNG, lange Kante ab 1024 Pixel',
    intro: [
      'Das Artwork ist das Motivbild einer einzelnen Karte. CardMaker speichert immer das ' +
        'Original plus Verschiebung und Maßstab und schneidet nie zu — du ziehst und zoomst ' +
        'später direkt in der Vorschau.',
      'Daraus folgen zwei Vorgaben im Prompt: rundum Luft lassen, und den Bildschwerpunkt ' +
        'dorthin legen, wo der Rahmen die Bildfläche freilässt.',
    ],
    blocks: [
      {
        id: 'artwork-stichworte',
        title: 'Variante A — nur Stichworte',
        hint: 'Wenn du kein Vorbild hast, sondern nur eine Vorstellung.',
        text: ARTWORK_STICHWORTE_PROMPT,
      },
      {
        id: 'artwork-referenz',
        title: 'Variante B — mit Referenzbildern',
        hint:
          'Bilder anhängen und jedes einzeln benennen. Ohne die Zeile „Nicht übernehmen“ ' +
          'mischt ChatGPT Stil und Inhalt zu Brei.',
        text: ARTWORK_REFERENZ_PROMPT,
      },
    ],
    afterwards: [
      'Nachschärfen: eine Änderung pro Runde, und dazusagen, was bleibt — „Behalte Pose, ' +
        'Beleuchtung und Farbpalette exakt bei, ändere nur den Hintergrund zu …“. Ohne diesen ' +
        'Halbsatz driftet das ganze Bild mit.',
      'Kein Freistellen nötig, das Artwork ist deckend. Als PNG speichern und beim Bearbeiten ' +
        'einer Karte in die Bildfläche hochladen.',
      'Gegenprüfen: Schneidet nach dem Zoomen etwas Wesentliches an? Dann in der nächsten ' +
        'Runde mehr Rand anfordern, nicht das Motiv verkleinern.',
    ],
  },
];
