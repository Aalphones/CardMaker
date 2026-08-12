# 018 — Bildausschnitt direkt in der Live-Vorschau

**Status:** Akzeptiert (2026-08-12)

Löst die offene Frage aus `docs/PROJECT.md`: „Bild-Crop/Zoom-Interaktion im Karteneditor —
direkt über Konva-Image-Transform lösen oder zusätzliche Crop-UI nötig?"

## Kontext

Ein hochgeladenes Motivbild passt praktisch nie von selbst in die Bildfläche, die das
Template vorgibt: falsches Seitenverhältnis, Gesicht zu weit oben, zu viel Rand. Der Mensch
muss den Ausschnitt festlegen können. Der Karteneditor zeigt ohnehin schon eine Live-Vorschau
der ganzen Karte, und aus dem Template-Editor (Meilenstein 2) existiert die Technik zum
Ziehen und Skalieren von Ebenen auf dem Canvas bereits.

## Optionen

- (a) Eigener Zuschneide-Dialog: Bild anklicken, Dialog geht auf, Ausschnitt wählen,
  bestätigen.
- (b) Zahlenfelder im Formular für Verschiebung und Maßstab.
- (c) Ziehen und Zoomen direkt in der Live-Vorschau, ohne Moduswechsel.

## Entscheidung

**(c).** Der Ausschnitt ist eine Gestaltungsentscheidung, und die trifft man am Ergebnis, nicht
daneben. In der Live-Vorschau sieht man das Bild bereits im Rahmen, unter den Texten, in
seiner echten Größe — genau die Ansicht, in der die Frage „sitzt das?" überhaupt beantwortbar
ist. Ein Dialog zeigt dasselbe Bild ohne diesen Zusammenhang und verlangt zusätzlich zwei
Klicks pro Korrektur.

Option (b) ist als alleinige Bedienung untauglich: niemand schätzt einen Bildausschnitt in
Zahlen. Die Werte bleiben trotzdem sichtbar und eintippbar, aber als Feinschliff, nicht als
Hauptweg.

Die Technik ist die vom Verschieben der Ebenen im Template-Editor — Konva zieht das Bild
innerhalb seiner Fläche, das Mausrad ändert den Maßstab.

## Konsequenzen

- Die Live-Vorschau bekommt einen Bearbeitungszustand: solange eine Bildfläche ausgewählt
  ist, greifen Ziehen und Mausrad am Bild statt an der Ansicht. Das muss sichtbar sein,
  sonst verschiebt jemand versehentlich die Karte statt das Motiv.
- Gespeichert wird nie ein beschnittenes Bild, sondern immer die Originaldatei plus
  Verschiebung und Maßstab (`card_images.offset_x`, `offset_y`, `scale`). Der Ausschnitt
  bleibt damit jederzeit korrigierbar, und die Karte bleibt neu renderbar, auch wenn das
  Template die Bildfläche später verschiebt oder vergrößert (`AGENTS.md`, Regel 1).
- Der Preis dafür ist Speicherplatz: es liegt immer die volle hochgeladene Datei, auch wenn
  am Ende ein Viertel davon zu sehen ist.
- `scale` ist bezogen auf „das Bild füllt die kürzere Seite der Fläche" (Wert 1), nicht auf
  die Originalpixel — sonst hinge die Bedeutung des Werts von der Auflösung des Uploads ab.
