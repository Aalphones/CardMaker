# Rahmen — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Der Rahmen ist in CardMaker der **FrameLayer**: genau einer pro Template,
vollflächig, nicht verschiebbar, nicht skalierbar. Er liegt über Bild, Formen
und Icons und unter dem Text. Entscheidend ist deshalb nicht nur, wie schön er
ist, sondern **wo er Platz lässt** — Bildfläche, Titel, Textbox und
Werte-Felder werden später als eigene Ebenen daraufgelegt.

Drei Platzhalter sind zu füllen: `{THEMA}`, `{KARTENLAYOUT}` — jeder spätere
Inhaltsbereich mit Position und ungefährer Größe — und optional
`{ZUSATZVORGABEN}`. Das Kartenlayout ist verbindlich: Bereiche, die dort nicht
stehen, darf der Rahmen nicht erfinden.

Ziel: **630×880 PNG mit Alphakanal**. Erzeugt wird in 1024×1440, danach
freigestellt und verkleinert.

---

## Der Prompt

```
Du bist Art Director für hochwertige Sammelkarten, Kartenspiele und thematische Kartenrahmen.

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

Danach erzeuge das Bild direkt.
```

---

## Danach

1. Grünfläche freistellen (Farbbereich/Zauberstab oder `rembg`).
2. Ränder auf Grünsaum prüfen — Chroma-Grün blutet gern in helle Ornamente
   (Gold, Holz). Fällt das auf, nächste Runde mit **Chroma-Magenta (#FF00FF)**.
3. Auf **630×880** verkleinern, als PNG mit Alphakanal speichern.
4. In CardMaker als Rahmen hochladen und gegen ein Testbild und echte Texte
   prüfen: Passt die Bildfläche? Bleibt der Titel lesbar?
