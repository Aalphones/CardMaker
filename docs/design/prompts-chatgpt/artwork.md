# Artwork — Master-Prompt für ChatGPT

Gemeinsame Regeln für alle Bild-Prompts: [README.md](README.md).

Das Artwork ist das **Kartenbild** einer Karteninstanz. CardMaker speichert
immer das Original plus Verschiebung und Maßstab und schneidet nie zu
(ADR-018) — du ziehst und zoomst später direkt in der Vorschau. Zwei
Konsequenzen für den Prompt:

- **Luft rundum lassen.** Ein randlos angeschnittenes Motiv lässt sich nicht
  mehr passend schieben.
- **Motivmitte dorthin, wo der Rahmen die Bildfläche freilässt** — bei einer
  Karte mit Textbox unten also in die obere Hälfte.

Ziel: **PNG, lange Kante ≥ 1024 px**, deckend — kein Freistellen nötig.

---

## Variante A — nur Stichworte

```
Du bist Illustrator für Sammelkarten-Artwork.

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
Danach erzeuge das Bild direkt in diesem Chat.
```

---

## Variante B — mit Referenzbild(ern)

Bilder anhängen und **jedes per Index benennen** — das ist der Punkt, an dem
die meisten Referenz-Prompts scheitern: ChatGPT muss wissen, *was* es aus
welchem Bild zieht, sonst mischt es alles.

```
Du bist Illustrator für Sammelkarten-Artwork. Ich hänge Referenzbilder an.

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
erzeuge das Bild.
```

---

## Danach

- **Nachschärfen:** eine Änderung pro Runde, und dazusagen, was bleibt —
  „Behalte Pose, Beleuchtung und Farbpalette exakt bei, ändere nur den
  Hintergrund zu …". Ohne diesen Halbsatz driftet das ganze Bild mit.
- Kein Freistellen nötig, das Artwork ist deckend. Als PNG speichern, in
  CardMaker in die Bildfläche hochladen und dort schieben/zoomen.
- Gegenprüfen: Schneidet nach dem Zoomen etwas Wesentliches an? Dann in der
  nächsten Runde mehr Rand anfordern, nicht das Motiv verkleinern.
