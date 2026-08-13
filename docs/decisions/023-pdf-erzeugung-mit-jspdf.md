# 023 — PDF-Erzeugung mit jsPDF, nur beim Klick geladen

**Status:** Akzeptiert (2026-08-13)

## Kontext

Das Druckprojekt soll eine PDF-Datei liefern: A4, je Bogen eine Seite, neun Karten je Seite,
jede Karte auf den Millimeter genau dort, wo `sheet-layout.ts` sie berechnet hat. Im Browser,
ohne Server — das Backend liegt auf Strato-Shared-Hosting und hat weder Bibliotheken noch
Rechenzeit dafür (ADR-005: gezeichnet wird beim Nutzer).

## Optionen

- (a) **Browser-Druckdialog über HTML.** Eine Seite mit `@page`-Regeln bauen und drucken
  lassen. Keine Abhängigkeit — aber Ränder, Seitengröße und Skalierung entscheidet der
  Druckdialog des Nutzers, nicht wir. Genau 63 × 88 mm ist damit nicht zugesichert.
- (b) **`pdf-lib`.** Mächtiger, kann vorhandene PDFs verändern — rechnet aber in Punkten;
  jede Millimeter-Koordinate aus der Geometrie müsste vor dem Setzen umgerechnet werden.
- (c) **`jspdf`** (MIT). Kennt `unit: 'mm'` und setzt Bilder direkt mit
  Millimeter-Koordinaten und -Größen.

## Entscheidung

**(c).** Wir bearbeiten keine vorhandenen PDFs, wir setzen Bilder auf leere Seiten — dafür ist
jsPDF das kleinere Werkzeug, und seine Millimeter-Einheit passt genau auf den Geometrie-Kontrakt
aus Meilenstein 5. Eine zweite Umrechnung wäre eine zweite Stelle, an der die Kartengröße
falsch werden kann.

**jsPDF wird ausschließlich dynamisch geladen** — `const { jsPDF } = await import('jspdf')`
im Knopf-Handler, nie als Import am Dateikopf. Gemessen am 13.08.2026 hebt ein Import am Kopf
das Start-Bündel von 358 kB auf 771 kB, weil jsPDF `html2canvas` (203 kB), `canvg` (159 kB)
und `dompurify` (29 kB) mitzieht. Nichts davon benutzen wir.

## Konsequenzen

- Der erste Klick auf „Als PDF drucken" lädt ein zusätzliches Stück nach — spürbar nur einmal,
  und nur bei dem, der wirklich druckt.
- Die Regel „kein Import am Dateikopf" ist nicht selbsterklärend: Wer den Aufruf umbaut und
  den dynamischen Import zu einem gewöhnlichen macht, verdreifacht das Start-Bündel, ohne dass
  irgendetwas rot wird. Der Kommentar an der Importstelle nennt deshalb die Zahl.
- Karten liegen im PDF als JPEG (Güte 0,9) auf weißem Grund. PNG in Druckauflösung ergäbe je
  Bogen 15–20 MB — Größenordnungen, an denen Druckerwarteschlangen abbrechen. JPEG kennt keine
  Durchsichtigkeit, deshalb bekommt jede Karte beim Zeichnen ein weißes Grundrechteck; ohne das
  würden durchsichtige Stellen schwarz.
- Für „Als Bild herunterladen" in Karteneditor und Kartenliste bleibt es bei PNG mit
  Durchsichtigkeit — dort geht es nicht ums Drucken.
