# Phase 5 — Fett und Kursiv

Eine Textebene kennt heute nur einen Schriftschnitt. Wer im Kartennamen ein Wort hervorheben
oder einen Beschreibungstext kursiv setzen will, kann es nicht — es gibt keinen Schalter dafür.
Diese Phase ergänzt zwei Umschalter neben der Schriftgröße.

## Die Entscheidung: künstlich fett, nicht nachgeladen

Fett und Kursiv werden vom Browser **gerechnet**, nicht aus einer zweiten Schriftdatei geholt:
Er verdickt die Striche bzw. stellt die Buchstaben schräg. Das ist die Voreinstellung jedes
Browsers und kostet nichts.

Der ehrliche Nachteil: Bei einer Kalligrafieschrift wie Great Vibes sieht künstliches Fett
matschig aus, weil echte Schreibschriften ihre Strichstärke anders verteilen. Der saubere Weg
wäre, für jede Schrift einen echten Fett- und Kursivschnitt mitzuliefern — das verdreifacht
die Zahl der Dateien (30 statt 10), und für sechs der zehn Schriften gibt es schlicht keinen
zweiten Schnitt. Deshalb: künstlich für alle. Sieht eine Kombination schlecht aus, wählt man
eine andere Schrift — die Auswahl ist jetzt groß genug.

Nachrüsten bleibt jederzeit möglich (ein zweiter `@font-face`-Eintrag mit `font-weight: 700`
für dieselbe Familie, mehr braucht es nicht) und wäre ein eigener kleiner Plan.

## Zusammenspiel mit dem Karteneditor

Entschieden am 2026-08-11: Eine **einzelne Karte darf Fett und Kursiv abweichend vom
Template setzen**, genau wie Schriftgröße und Farbe. Der Kartenaufbau im Plan
`2026-08-10_karteneditor/` führt die beiden Felder deshalb bereits mit (README, Abschnitt
„Karte"), unabhängig davon, welcher Plan zuerst läuft. Diese Phase liefert die Grundlage:
Solange die Textebene Fett/Kursiv nicht kennt, werden die Kartenwerte nur gespeichert und
nicht gezeichnet — die Umschaltung im Kartenformular kommt erst, wenn diese Phase durch ist.

## Vorher lesen

- `frontend/src/app/shared/canvas/rendering/layer.ts` — `TextLayer` und die Fabrikfunktion,
  die neue Textebenen anlegt
- `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` — `textItems()` und
  `effectiveFontSize()`
- `frontend/src/app/shared/canvas/rendering/measure-text.ts` und `auto-shrink.ts` — die
  Messbrücke, die für das automatische Verkleinern zuständig ist
- `frontend/src/app/features/templates/template-editor/layer-properties/text-properties/`
- `backend/src/Validators/LayerValidator.php` — der Textebenen-Abschnitt
- Konva-Doku zu `Konva.Text`: die Eigenschaft heißt `fontStyle` und nimmt `'normal'`,
  `'bold'`, `'italic'` oder `'italic bold'` — **ein String, keine zwei Felder**

## Abnahmekriterien

- Neben der Schriftgröße sitzen zwei Umschalter „Fett" und „Kursiv", einzeln und gemeinsam
  schaltbar.
- Der Umschalter wirkt sofort in der Kartenvorschau.
- **Bestehende Templates lassen sich weiterhin öffnen und speichern**, ohne dass jemand sie
  anfasst — sie kennen die neuen Felder nicht und gelten als „nicht fett, nicht kursiv".
- Automatisches Verkleinern misst **den eingestellten Schnitt**: Ein fetter Text ist breiter
  als derselbe Text normal — schrumpft er nicht entsprechend stärker, ist die Messung falsch
  verdrahtet. Prüfen mit einem Text, der normal knapp passt und fett überläuft.
- Speichern, Seite neu laden, Template öffnen → die Einstellung steht noch.

## Checkliste

- [ ] `TextLayer` um `bold: boolean` und `italic: boolean` erweitern (zwei Wahrheitswerte,
      **nicht** ein `fontStyle`-String — der String ist eine Konva-Eigenheit und hat im
      Datenmodell nichts verloren). Fabrikfunktion für neue Textebenen: beide `false`.
- [ ] In `draw-items.ts` eine kleine Funktion `konvaFontStyle(bold, italic): string`, die
      daraus `'normal' | 'bold' | 'italic' | 'italic bold'` macht. Sie ist die **einzige**
      Stelle, die diesen String baut.
- [ ] `measure-text.ts` und `auto-shrink.ts` durchreichen lassen: Die Messung bekommt
      denselben `fontStyle` wie die Anzeige — sonst schrumpft fetter Text nach normalem Maß
      und läuft trotzdem über. Das ist die Stelle, an der diese Phase am ehesten still
      schiefgeht.
- [ ] `LayerValidator.php`: `font_bold` und `font_italic` als Wahrheitswerte prüfen —
      **optional mit Voreinstellung `false`**, nicht als Pflichtfeld. Ein Pflichtfeld würde
      jedes bereits gespeicherte Template beim nächsten Speichern zurückweisen.
- [ ] Zwei Umschalter in `text-properties`: neben der Schriftgröße, als Segment-Umschalter im
      Bestandsstil (`seg`-Bausteinklasse), mit `aria-pressed`. Beschriftung „Fett" / „Kursiv",
      keine B/I-Buchstaben — die versteht nur, wer Textverarbeitung kennt.
- [ ] Doku: `docs/models.md` bei `templates.layers` um die beiden Felder ergänzen.

## Bericht

*(nach der Umsetzung füllen)*
