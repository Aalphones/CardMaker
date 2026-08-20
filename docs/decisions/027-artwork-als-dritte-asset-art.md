# 027 — Artwork ist eine dritte Art im Bildvorrat, kein eigener Ebenen-Typ

**Status:** Akzeptiert (2026-08-20)

## Kontext

Der Bildvorrat (`assets`, ADR-015) kannte bisher zwei Arten: Rahmen und Icons. Beide werden
von einer Ebene im Template gezeichnet. Gewünscht war eine dritte Sorte Bilder — Artwork:
größere Motivbilder, die genauso hochgeladen, benannt und verwaltet werden sollen wie Rahmen
und Icons, ohne dass es dafür schon eine Stelle auf der Karte gäbe, die sie zeichnet.

## Optionen

- (a) **Dritte Ausprägung von `assets.kind`.** `ENUM('frame','icon')` wird um `'artwork'`
  erweitert; Hochladen, Auflisten, Umbenennen und Löschen laufen unverändert über die
  bestehenden Wege.
- (b) **Eigene Tabelle `artworks`.** Getrenntes Datenmodell mit eigenen Routen, eigenem
  Dienst, eigener Ablage.
- (c) **`card_images` mitbenutzen.** Die Ablage für Motivbilder einer Karte (ADR-017) auch
  für frei verwaltbare Artwork-Bilder öffnen.

## Entscheidung

**(a).** Artwork verhält sich in jedem beobachtbaren Punkt wie Rahmen und Icons: PNG,
außerhalb des Webbereichs abgelegt, mit Anzeigename, listbar, umbenennbar, löschbar. Eine
zweite Tabelle (b) würde Ablage, Prüfung, Ausliefern der Datei und die Löschregeln
verdoppeln, ohne dass sich ein Feld unterscheidet. (c) scheidet aus, weil `card_images` an
je eine Karte gebunden ist (ADR-017) — Artwork gehört keiner Karte.

## Konsequenzen

- Es gibt **keinen Zeichenpfad für Artwork.** Kein Ebenen-Typ und keine Auswahl im
  Template-Editor nimmt ein Artwork-Bild entgegen; es lässt sich verwalten, aber noch nicht
  auf eine Karte bringen. Das wäre ein eigener Folgeplan (neuer Ebenen-Typ oder eine
  Verweis-Spalte von `card_images` auf ein Asset).
- Die Existenzprüfung beim Speichern von Templates und Karten
  (`AssetRepository::existingIds()`) fragt nur nach der Kennung, nicht nach der Art. Über die
  Oberfläche kann kein Artwork-Bild in eine Icon- oder Rahmen-Ebene geraten — die Auswahl
  filtert nach `kind` —, über einen selbstgebauten API-Aufruf schon. Bewusst so gelassen:
  eine Verschärfung würde auch bestehende Templates beim nächsten Speichern neu bewerten.
- `assets.kinds` in `GET /api/meta` liefert die drei Arten; Frontend und MCP-Server lesen die
  erlaubten Werte von dort, statt sie zu wiederholen.
