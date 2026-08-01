# Konzept: Generischer Sammelkarten-Generator

## Ziel

Die bestehende Webanwendung zur Verwaltung von Charakteren und Bildern
wird um einen flexiblen Sammelkarten-Generator erweitert.

Das System soll nicht auf einen bestimmten Kartentyp beschränkt sein.
Stattdessen soll über Templates nahezu jede Art von Sammelkarte erstellt
werden können -- von einfachen Charakterkarten bis hin zu vollständigen
Trading-Card-Systemen.

Die Architektur trennt dabei konsequent zwischen:

-   Template (Layout)
-   Karteninstanz (Inhalt)
-   Druckprojekt (Ausgabe)

Dadurch bleiben Templates unverändert, Karten jederzeit reproduzierbar
und zukünftige Erweiterungen einfach umsetzbar.

------------------------------------------------------------------------

# Grundprinzip

## Template

Ein Template beschreibt ausschließlich das Layout einer Karte.

Es enthält:

-   Kartenrahmen
-   Layer
-   Positionen
-   Schriftarten
-   Farben
-   Standardwerte
-   Datenquellen

Ein Template enthält niemals konkrete Charakterdaten.

------------------------------------------------------------------------

## Karteninstanz

Eine Karteninstanz beschreibt eine konkrete Karte.

Sie enthält:

-   ausgewählten Charakter
-   ausgewähltes Bild
-   Bildausschnitt
-   individuelle Texte
-   individuelle Schriftgrößen
-   individuelle Schriftfarben

Das Template bleibt dabei unverändert.

------------------------------------------------------------------------

## Druckprojekt

Ein Druckprojekt sammelt beliebig viele Karten.

Beim Export werden daraus automatisch Druckbögen erzeugt.

------------------------------------------------------------------------

# Workflow

## 1. Template erstellen

Ein Administrator erstellt ein Template.

Dabei werden definiert:

-   Kartenrahmen
-   Layer
-   Positionen
-   Schriftarten
-   Farben
-   Datenquellen

------------------------------------------------------------------------

## 2. Karte erstellen

Benutzer wählt:

-   Charakter
-   Bild
-   Template

Danach werden automatisch:

-   Daten aus der Datenbank übernommen
-   Icons gesetzt
-   Standardtexte eingefügt

Anschließend kann der Benutzer:

-   Bild verschieben
-   Bild zoomen
-   Bildausschnitt ändern
-   Benutzertexte eingeben
-   Schriftgröße ändern
-   Schriftfarbe ändern

------------------------------------------------------------------------

## 3. Karte speichern

Gespeichert wird nicht das fertige Bild.

Gespeichert werden ausschließlich:

-   Template
-   Charakter
-   Bild
-   Bildausschnitt
-   individuelle Änderungen

Dadurch kann jederzeit neu gerendert werden.

------------------------------------------------------------------------

# Internes Canvas

Alle Templates arbeiten auf einem festen internen Canvas.

Canvasgröße:

-   630 × 880 Einheiten

Dies entspricht exakt dem Seitenverhältnis einer Karte von 63 × 88 mm.

Dadurch gilt:

-   10 Canvas-Einheiten = 1 mm

Alle Layer beziehen sich ausschließlich auf dieses Canvas.

Beim Rendern wird das Canvas automatisch auf die gewünschte
Ausgabeauflösung skaliert.

Vorteile:

-   einfache Positionswerte
-   unabhängig von DPI
-   unabhängig von Exportgröße
-   dauerhaft kompatible Templates

------------------------------------------------------------------------

# Layer-System

Die komplette Karte besteht aus Layern.

Zeichenreihenfolge:

1.  ImageLayer
2.  ShapeLayer
3.  IconLayer
4.  FrameLayer
5.  TextLayer

Die Reihenfolge kann im Template-Editor angepasst werden.

------------------------------------------------------------------------

# Layer-Typen

## ImageLayer

Eigenschaften:

-   Position
-   Größe
-   Rotation
-   Zoom
-   Bildausschnitt

Das Bild stammt immer vom ausgewählten Charakter.

------------------------------------------------------------------------

## ShapeLayer

Unterstützt:

-   Rechteck
-   Kreis
-   Linie

Eigenschaften:

-   Farbe
-   Transparenz
-   Rahmenfarbe
-   Rahmenstärke
-   Eckradius

------------------------------------------------------------------------

## IconLayer

Stellt PNG- oder SVG-Grafiken dar.

Geeignet für:

-   Elemente
-   Fraktionen
-   Seltenheit
-   Klassen
-   Logos
-   Statussymbole

Icons können statisch sein oder automatisch anhand eines Datenbankwertes
ausgewählt werden.

------------------------------------------------------------------------

## FrameLayer

Der FrameLayer enthält den Kartenrahmen.

Eigenschaften:

-   PNG-Datei

Der Frame wird immer automatisch auf das komplette Canvas gelegt.

Position oder Größe sind nicht konfigurierbar.

Pro Template existiert genau ein FrameLayer.

------------------------------------------------------------------------

## TextLayer

Ein TextLayer besitzt:

-   Name
-   Datenquelle
-   Standardtext
-   Position
-   Rotation
-   Bounding Box
-   Schriftart
-   Standardschriftgröße
-   Standardschriftfarbe
-   horizontale Ausrichtung
-   vertikale Ausrichtung
-   Zeilenabstand
-   Outline
-   Schatten
-   Auto-Shrink

Während der Kartenerstellung können Schriftgröße und Schriftfarbe
überschrieben werden.

------------------------------------------------------------------------

# Datenquellen

Jeder Layer besitzt genau eine Datenquelle.

## Datenbank

Beispiele:

-   character.name
-   character.description
-   character.species
-   character.age
-   character.element
-   character.faction

------------------------------------------------------------------------

## Statisch

Der Wert ist Bestandteil des Templates.

Beispiele:

-   Legendary
-   Rare
-   Hero Card

------------------------------------------------------------------------

## Benutzer

Der Benutzer gibt den Wert beim Erstellen der Karte ein.

Beispiele:

-   Angriff
-   Schaden
-   Mana
-   HP
-   Flavor Text

Diese Werte gehören ausschließlich zur Karteninstanz.

------------------------------------------------------------------------

# Auto-Shrink

Texte werden automatisch verkleinert, falls sie nicht vollständig in die
definierte Bounding Box passen.

Jeder TextLayer besitzt:

-   Standardschriftgröße
-   Mindestschriftgröße

Der Renderer reduziert die Schriftgröße automatisch bis der Text
vollständig dargestellt werden kann.

------------------------------------------------------------------------

# Template-Editor

Der Editor besteht aus drei Bereichen.

## Layerliste

Alle Layer werden angezeigt.

Mögliche Aktionen:

-   erstellen
-   löschen
-   duplizieren
-   umbenennen
-   Reihenfolge ändern

------------------------------------------------------------------------

## Kartenvorschau

Live-Vorschau des Templates.

Alle Änderungen werden sofort angezeigt.

------------------------------------------------------------------------

## Eigenschaften

Je nach Layer:

-   Position
-   Größe
-   Rotation
-   Schrift
-   Farben
-   Datenquelle
-   Standardwerte

------------------------------------------------------------------------

# Karteneditor

Beim Erstellen einer Karte kann der Benutzer:

-   Bild verschieben
-   Bild zoomen
-   Bildausschnitt ändern
-   Benutzertexte eingeben
-   Schriftgröße ändern
-   Schriftfarbe ändern

Gemappte Werte werden automatisch übernommen.

Statische Werte werden automatisch gesetzt.

Benutzerfelder müssen ausgefüllt werden.

------------------------------------------------------------------------

# Rendering

Render-Reihenfolge:

1.  ImageLayer
2.  ShapeLayer
3.  IconLayer
4.  FrameLayer
5.  TextLayer

Der Renderer skaliert das interne Canvas automatisch auf die gewünschte
Ausgabeauflösung.

------------------------------------------------------------------------

# Druck

Kartengröße:

-   63 × 88 mm

Standardauflösung:

-   300 DPI

Die physische Kartengröße bleibt unabhängig von der Auflösung immer
identisch.

------------------------------------------------------------------------

# Druckprojekt

Ein Druckprojekt sammelt beliebig viele Karten.

Beim Export werden automatisch Druckbögen erzeugt.

Layout:

-   DIN A4
-   3 × 3 Karten
-   insgesamt 9 Karten pro Seite

Optional:

-   Schnittmarken
-   Beschnitt
-   Kartenabstand

Export:

-   PDF
-   PNG

------------------------------------------------------------------------

# Vorteile der Architektur

-   Klare Trennung von Layout und Inhalt
-   Templates bleiben unverändert
-   Karten jederzeit neu renderbar
-   Beliebig erweiterbar
-   Unterstützt unterschiedlichste Kartentypen
-   DPI-unabhängiges Arbeiten durch internes Canvas
-   Exakte Druckgröße von 63 × 88 mm
