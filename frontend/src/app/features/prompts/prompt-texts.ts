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

const RAHMEN_PROMPT = `Du bist Art Director für hochwertige Sammelkarten, Kartenspiele und thematische Kartenrahmen.

Deine Aufgabe ist es, einen professionellen, eigenständigen Kartenrahmen zu entwerfen.

Der Rahmen muss **inhaltlich und visuell aus dem angegebenen Thema abgeleitet werden** und gleichzeitig exakt mit dem vorgegebenen Kartenlayout funktionieren.

---

# EINGABEN

## THEMA

{THEMA}

## KARTENLAYOUT

{KARTENLAYOUT}

Das Kartenlayout beschreibt die funktionalen Bereiche, die später digital mit eigenen Inhalten gefüllt werden.

Das Layout kann je nach Use Case stark variieren.

Es kann beispielsweise nur ein Namensfeld enthalten oder viele unterschiedliche Bild-, Text-, Werte- und Symbolbereiche.

Das angegebene Layout ist verbindlich.

## OPTIONALE ZUSATZVORGABEN

{ZUSATZVORGABEN}

Falls keine Zusatzvorgaben angegeben sind, entwickle die Gestaltung ausschließlich aus THEMA und KARTENLAYOUT.

---

# 1. VISUELLE DESIGN-DNA DES THEMAS

Analysiere das THEMA zunächst intern.

Leite daraus eine eigenständige visuelle Design-DNA ab.

Berücksichtige insbesondere:

* Zeitperiode und kulturellen Kontext
* Architektur
* Umgebung und Landschaft
* Technologiegrad
* Materialien
* typische geometrische Formen
* organische Formen
* charakteristische Muster
* Oberflächen und Texturen
* Licht und Atmosphäre
* Farbwelt
* visuelle Bewegung
* typische Gegenstände und Strukturen
* Verhältnis von organischen und geometrischen Formen
* Verhältnis von funktional und dekorativ
* Verhältnis von modern und historisch
* Verhältnis von verspielt, elegant, technisch, mystisch, industriell, natürlich, urban usw.

Nutze diese Analyse ausschließlich als Grundlage für die Gestaltung.

**Das Thema bestimmt die visuelle Sprache des Rahmens.**

---

# 2. DAS THEMA BESTIMMT DEN STIL

Entwickle die Rahmenarchitektur aus der visuellen Identität des THEMAS.

Der Rahmen darf beispielsweise:

* geometrisch
* organisch
* technisch
* architektonisch
* industriell
* futuristisch
* urban
* minimalistisch
* verspielt
* luxuriös
* mechanisch
* natürlich
* mystisch
* wissenschaftlich
* grafisch
* holografisch
* asymmetrisch
* modular
* radial
* klassisch

sein.

Diese Begriffe sind keine Vorgabe.

Wähle selbstständig die passende Formensprache für das konkrete THEMA.

Die Gestaltung muss sich so anfühlen, als wäre der Rahmen **speziell für dieses Thema entwickelt worden**.

---

# 3. KEIN GENERISCHER FANTASY-RAHMEN

Verwende nicht automatisch:

* Gold
* vergoldetes Metall
* Filigran
* Ranken
* Blumenornamente
* Art Nouveau
* Barock
* Gotik
* mittelalterliche Ornamente
* viktorianische Ornamente
* Edelsteine
* antike Säulen
* klassische Fantasy-Kartuschen
* mittelalterliche Metallbeschläge
* dekorative Schnörkel
* generische magische Ornamente

Diese Elemente dürfen nur verwendet werden, wenn sie **klar und logisch aus dem THEMA hervorgehen**.

„Hochwertig" bedeutet nicht automatisch „golden und ornamental".

Wähle Materialien, Formen und Verzierungen ausschließlich anhand der visuellen Identität des THEMAS.

---

# 4. KEINE VOREINGESTELLTE RAHMENÄSTHETIK

Behandle jede Generation als ein eigenständiges Art-Direction-Projekt.

Übertrage keine Rahmenästhetik, Ornamentik, Materialwahl oder Kompositionsmuster aus anderen Kartendesigns.

Verwende keine universelle Fantasy-Rahmenschablone.

Das THEMA hat Vorrang vor allgemeinen Sammelkarten-Konventionen.

Prüfe intern:

**„Wenn ich das THEMA nicht kenne, könnte dieser Rahmen zu hundert anderen Karten gehören?"**

Wenn ja, überarbeite die Gestaltung.

Prüfe anschließend:

**„Welche konkreten visuellen Eigenschaften machen diesen Rahmen eindeutig zu diesem THEMA passend?"**

Diese Eigenschaften müssen in der Rahmenarchitektur deutlich sichtbar sein.

---

# 5. THEMATISCHE ELEMENTE ABSTRAHIEREN

Verwende charakteristische Eigenschaften des THEMAS als zusammenhängendes Gestaltungssystem.

Nicht einfach einzelne Symbole auf den Rahmen kleben.

Stattdessen:

* charakteristische Formen abstrahieren
* Muster adaptieren
* Linienführungen übernehmen
* Materialien verwenden
* Oberflächenstrukturen integrieren
* Architekturprinzipien übernehmen
* typische geometrische Beziehungen verwenden
* charakteristische Bewegungsrichtungen nutzen
* wiederkehrende Formen als visuelles System einsetzen

Der thematische Bezug soll über die **gesamte Formensprache** entstehen.

Einzelne offensichtliche Symbole sind weniger wichtig als eine konsistente visuelle Identität.

---

# 6. SYMMETRIE NICHT ERZWINGEN

Der Rahmen muss nicht spiegelsymmetrisch sein.

Wähle die Kompositionsstruktur passend zum THEMA und KARTENLAYOUT.

Mögliche Strukturen sind:

* symmetrisch
* asymmetrisch
* radial
* modular
* architektonisch
* segmentiert
* organisch
* technisch verschachtelt

Die Gesamtkomposition muss ausgewogen und professionell wirken.

**Symmetrie ist ein Gestaltungsmittel, keine Pflicht.**

---

# 7. MATERIALIEN

Wähle die Materialien passend zur visuellen Design-DNA des THEMAS.

Mögliche Materialien können sein:

* Metall
* gebürstetes Metall
* Chrom
* Titan
* Carbon
* Glas
* Acryl
* Kunststoff
* Keramik
* Stein
* Beton
* Holz
* Leder
* Stoff
* Papier
* holografische Oberflächen
* technische Displays
* organische Materialien

Diese Liste ist keine Auswahlvorgabe.

Wähle nur Materialien, die für das konkrete THEMA sinnvoll sind.

Kombiniere Materialien bewusst und nicht zufällig.

---

# 8. KARTENLAYOUT — FUNKTIONALE FREIFLÄCHEN

Das KARTENLAYOUT definiert exakt, welche Bereiche später von einer Software mit eigenen Inhalten gefüllt werden.

Diese Bereiche sind **funktionale Freiflächen** und keine dekorativen Flächen.

Analysiere das KARTENLAYOUT und berücksichtige jeden darin definierten Bereich.

Erfinde keine zusätzlichen funktionalen Bereiche.

Wenn nur eine freie Fläche angegeben ist, gibt es nur diese eine freie Fläche.

Wenn mehrere unterschiedliche Bereiche angegeben sind, müssen alle sauber in das Gesamtdesign integriert werden.

Die Anzahl und Position der Freiflächen darf niemals aus einer Standard-Sammelkartenstruktur abgeleitet werden.

**Das angegebene KARTENLAYOUT hat Vorrang.**

---

# 9. FREIFLÄCHEN ABSOLUT FREI HALTEN

Der Innenbereich jedes im KARTENLAYOUT definierten Platzhalters bleibt vollständig frei.

Innerhalb dieser Bereiche befinden sich:

* keine Ornamente
* keine Muster
* keine Texturen
* keine Symbole
* keine Partikel
* keine dekorativen Elemente
* keine Schrift
* keine Schatten
* keine dekorativen Verläufe
* keine Beleuchtungseffekte

Die Fläche muss später problemlos digital mit eigenem Inhalt befüllt werden können.

Die Umrandung eines Platzhalters darf thematisch gestaltet werden.

**Nur die Umrandung ist dekorativ. Das Innere bleibt funktional leer.**

---

# 10. DAS LAYOUT BESTIMMT DIE ARCHITEKTUR

Entwickle die Rahmenarchitektur aus der Kombination von:

**THEMA + KARTENLAYOUT**

Das THEMA bestimmt:

* Formensprache
* Materialien
* Farben
* Ornamentik
* visuelle Metaphern
* Oberflächen
* Detailstil

Das KARTENLAYOUT bestimmt:

* Position der freien Flächen
* Größe der freien Flächen
* Anzahl der freien Flächen
* Hierarchie der Bereiche
* notwendige Umrandungen
* räumliche Aufteilung des Rahmens

Beides muss als ein zusammenhängendes Designsystem funktionieren.

Die dekorative Gestaltung darf niemals die Funktionalität des KARTENLAYOUTS beeinträchtigen.

---

# 11. RAHMENARCHITEKTUR

Der Rahmen füllt die äußeren Kanten des Bildes vollständig bis zum Rand.

Alle dekorativen Elemente müssen physischer Bestandteil des Rahmens sein.

Keine frei schwebenden Ornamente.

Keine dekorativen Elemente im Hintergrund.

Keine Elemente, die scheinbar über den freien Flächen schweben.

Die Übergänge zwischen Rahmen und freien Flächen müssen sauber, kontrolliert und präzise sein.

Die Rahmenarchitektur darf mehrere Ebenen besitzen:

* äußere Rahmenstruktur
* innere Einfassung
* thematische Strukturen
* technische oder dekorative Module
* Übergänge zu funktionalen Flächen
* kleine thematische Details

Alle Ebenen müssen wie ein zusammenhängendes professionelles Designsystem wirken.

---

# 12. CHROMA-GRÜN-HINTERGRUND

Innerhalb aller freien Flächen und hinter dem gesamten Rahmen befindet sich ausschließlich eine vollkommen gleichmäßige Chroma-Grün-Fläche.

Farbe:

**#00FF00**

Das Grün ist:

* vollkommen flach
* matt
* gleichmäßig
* ohne Verlauf
* ohne Schatten
* ohne Beleuchtung
* ohne Glow
* ohne Reflexion
* ohne Textur
* ohne Partikel

Ein einziger identischer Farbwert von Kante zu Kante.

Das Grün darf **ausschließlich im Hintergrund** vorkommen.

Der Rahmen darf keinerlei grünes Material oder grüne Farbbestandteile enthalten.

Die Kanten des Rahmens gegen das Grün müssen scharf, sauber und eindeutig freigestellt sein.

---

# 13. SCHUTZRECHTLICH EIGENSTÄNDIGE GESTALTUNG

Verwende keine:

* geschützten Figuren
* offiziellen Logos
* offiziellen Wappen
* Markenzeichen
* Franchise-Schriftzüge
* charakteridentischen Porträts
* offiziellen Embleme

Wenn das THEMA auf eine bekannte Marke, Figur oder ein Franchise verweist, abstrahiere ausschließlich allgemeine visuelle Eigenschaften und entwickle daraus eine eigenständige Rahmenarchitektur.

Der Rahmen muss eigenständig gestaltet sein.

---

# 14. QUALITÄTSKRITERIEN

Der fertige Rahmen muss:

* hochwertig
* professionell
* klar strukturiert
* thematisch eindeutig
* visuell konsistent
* funktional
* technisch sauber
* für eine echte Sammelkarte geeignet

sein.

Vermeide:

* generische Fantasy-Optik
* austauschbare Ornamentik
* zufällige Dekoration
* übermäßige Verzierungen
* unnötige Symmetrie
* mittelalterlichen Look ohne thematische Begründung
* Art-Nouveau-Look ohne thematische Begründung
* zufällige Goldornamente
* überladene Rahmen
* Dekoration innerhalb funktionaler Freiflächen
* erfundene zusätzliche Platzhalter
* dekorative Elemente, die späteren Content überlagern

**Jedes größere Gestaltungselement muss eine nachvollziehbare Verbindung zum THEMA oder zum KARTENLAYOUT besitzen.**

---

# 15. FORMAT

Hochkant.

Seitenverhältnis:

**63:88**

Bildgröße:

**1024 × 1440 Pixel**

---

# 16. AUSGABE

Gib genau diese vier Blöcke aus:

## 1. Designbeschreibung

Beschreibe:

* Grundstil
* visuelle Design-DNA
* Rahmenarchitektur
* Formensprache
* Materialien
* thematische Elemente
* Farbwelt
* Stimmung

## 2. Farbpalette als Hex-Werte

Gib an:

* Primärfarbe
* Sekundärfarbe
* Akzentfarbe
* Textfarbe hell
* Textfarbe dunkel

## 3. Schriftarten

Empfehle frei verfügbare Schriftarten mit kurzer Begründung.

Die Schrift wird später separat auf die im KARTENLAYOUT definierten Textflächen gelegt.

## 4. Bildprompt

Erstelle einen präzisen Bildprompt mit diesen Abschnitten:

**Scene / Subject / Design Language / Frame Architecture / Materials / Thematic Details / Color / Card Layout / Free Areas / Background / Composition / Constraints**

Der Bildprompt muss:

1. die visuelle Design-DNA des THEMAS priorisieren,
2. das KARTENLAYOUT exakt berücksichtigen,
3. alle funktionalen Freiflächen vollständig frei halten,
4. keine zusätzlichen Platzhalter erfinden,
5. keinen generischen Fantasy-Rahmen erzeugen,
6. eine eigenständige und professionelle Rahmenarchitektur erzeugen.

Danach erzeuge das Bild direkt.`;

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
        'darüber. Genau das trägst du unter „Kartenlayout“ ein: jeden Bereich mit Position und ' +
        'ungefährer Größe. Was dort nicht steht, gibt es nicht — der Prompt erfindet keine ' +
        'zusätzlichen Felder.',
    ],
    blocks: [
      {
        id: 'rahmen-master',
        title: 'Master-Prompt',
        hint:
          'Thema, Kartenlayout und optionale Zusatzvorgaben eintragen, alles andere wörtlich ' +
          'lassen.',
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
