# Konzept: Generischer Sammelkarten-Generator

## Ziel

CardMaker ist ein reines Werkzeug zum Erstellen von Sammelkarten. Es soll nicht auf einen
bestimmten Kartentyp beschränkt sein. Stattdessen soll über Templates nahezu jede Art von
Sammelkarte erstellt werden können -- von einfachen Charakterkarten bis hin zu vollständigen
Trading-Card-Systemen.

Ausdrücklich **kein** Bestandteil: eine Verwaltung von Charakteren. CardMaker zieht beim
Erstellen einer Karte nie automatisch Daten aus einer Datenbank. Jede Karte wird einzeln
befüllt -- entweder von Hand über ein Formular, oder von Claude über den MCP-Server. Was
dauerhaft gespeichert wird, sind ausschließlich die fertig erstellten Karten selbst, damit
sich Schreibfehler und andere Details nachträglich korrigieren lassen.

Die Architektur trennt dabei konsequent zwischen:

-   Template (Layout)
-   Karteninstanz (Inhalt)
-   Kartengruppe (Organisation)
-   Druckprojekt (Ausgabe)

Dadurch bleiben Templates unverändert, Karten jederzeit reproduzierbar und zukünftige
Erweiterungen einfach umsetzbar.

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

Ein Template enthält niemals konkrete Karteninhalte.

------------------------------------------------------------------------

## Karteninstanz

Eine Karteninstanz beschreibt eine konkrete Karte.

Sie enthält:

-   ein Bild
-   Bildausschnitt
-   die ausgefüllten Textfelder des Templates
-   individuelle Schriftgrößen
-   individuelle Schriftfarben
-   optional eine zugeordnete Kartengruppe

Das Template bleibt dabei unverändert.

------------------------------------------------------------------------

## Kartengruppe

Eine Kartengruppe fasst beliebig viele Karteninstanzen thematisch zusammen -- zum Beispiel
eine "Spiderman-Serie", in der alle Karten dasselbe Template, aber unterschiedliche Bilder
und Texte haben.

Kartengruppen dienen ausschließlich der Organisation und dem Wiederfinden gespeicherter
Karten. Mit dem Export ins Druckbogen hat eine Kartengruppe nichts zu tun -- dafür ist das
Druckprojekt zuständig. Eine Karte kann höchstens einer Kartengruppe angehören, muss aber
keiner angehören.

------------------------------------------------------------------------

## Druckprojekt

Ein Druckprojekt sammelt beliebig viele Karteninstanzen zum Exportieren -- unabhängig davon,
welcher Kartengruppe sie angehören.

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

Der Benutzer wählt ein Template und ein Bild.

Danach werden automatisch:

-   Icons gesetzt, sofern das Template sie statisch vorgibt
-   Standardtexte eingefügt

Die eigentlichen Textfelder befüllt der Benutzer anschließend auf einem von zwei Wegen:

-   **Formular:** Der Benutzer trägt die Texte selbst in die Felder des Templates ein.
-   **MCP:** Claude befüllt die Textfelder über den lokalen MCP-Server mit Text -- der
    Benutzer beschreibt, was auf der Karte stehen soll, Claude schreibt es in die passenden
    Felder.

Beide Wege führen zum selben Ergebnis: ausgefüllte Textfelder auf der Karteninstanz. Welcher
Weg benutzt wird, spielt für die Datenhaltung keine Rolle.

Zusätzlich kann der Benutzer:

-   Bild verschieben
-   Bild zoomen
-   Bildausschnitt ändern
-   Schriftgröße ändern
-   Schriftfarbe ändern

------------------------------------------------------------------------

## 3. Karte speichern

Gespeichert wird nicht das fertige Bild.

Gespeichert werden ausschließlich:

-   Template
-   Bild
-   Bildausschnitt
-   ausgefüllte Textfelder
-   individuelle Schriftgröße/-farbe
-   optional die zugeordnete Kartengruppe

Dadurch kann jederzeit neu gerendert werden -- und ein Schreibfehler in einem Text lässt sich
nachträglich korrigieren, ohne die Karte neu anzulegen.

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

Das Bild stammt immer von der Karteninstanz -- ausgewählt oder hochgeladen beim Erstellen
der Karte.

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

Icons sind entweder statisch (Teil des Templates) oder werden vom Benutzer beim Erstellen
der Karte aus einer im Template hinterlegten Auswahl gewählt. Es gibt keine automatische
Ableitung aus einer Datenbank.

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

Jeder Layer besitzt genau eine Datenquelle. Es gibt zwei Typen -- keine Datenbank-Anbindung.

## Statisch

Der Wert ist Bestandteil des Templates.

Beispiele:

-   Legendary
-   Rare
-   Hero Card

------------------------------------------------------------------------

## Benutzer

Der Wert wird beim Erstellen der Karte eingetragen -- per Formular oder von Claude über MCP.

Beispiele:

-   Name
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
-   Textfelder befüllen (Formular oder MCP)
-   Schriftgröße ändern
-   Schriftfarbe ändern

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

Ein Druckprojekt sammelt beliebig viele Karten -- unabhängig von deren Kartengruppe.

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
-   Keine Datenbankabhängigkeit beim Erstellen -- jede Karte steht für sich, egal ob per
    Formular oder per MCP befüllt
