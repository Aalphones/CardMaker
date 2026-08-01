# Glossar — CardMaker

Ein Begriff, eine Bedeutung. Neu abgeklärte Fachbegriffe hier ergänzen, nicht in Code/Docs
frei erfinden.

| Begriff | Bedeutung |
|---|---|
| **Template** | Beschreibt ausschließlich das Layout einer Karte: Kartenrahmen, Layer, Positionen, Schriftarten, Farben, Standardwerte, Datenquellen. Enthält nie konkrete Karteninhalte. |
| **Karteninstanz** (Card Instance) | Eine konkrete Karte: Bild, Bildausschnitt, die ausgefüllten Textfelder des Templates, individuelle Schriftgrößen/-farben, optional eine Kartengruppe. Referenziert ein Template, ändert es nie. Gespeichert wird nur die Referenz + die Abweichungen, nicht das fertige Bild — jederzeit neu renderbar. Textfelder werden per Formular oder von Claude über MCP befüllt, nie automatisch aus einer Datenbank (ADR-011). |
| **Kartengruppe** (Card Group) | Organisationseinheit für gespeicherte Karteninstanzen, z. B. eine „Spiderman-Serie" (gleiches Template, unterschiedliche Bilder/Texte). Dient nur dem Wiederfinden/Browsen, nicht dem Export — dafür ist das Druckprojekt zuständig. Eine Karte gehört höchstens einer Kartengruppe an. |
| **Druckprojekt** (Print Project) | Sammlung beliebig vieler Karteninstanzen zum Exportieren, unabhängig von deren Kartengruppe. Export erzeugt daraus automatisch Druckbögen. |
| **Druckbogen** (Print Sheet) | Eine A4-Seite mit 3×3 (9) Karten, erzeugt beim Export eines Druckprojekts. |
| **Internes Canvas** | Fixes Koordinatensystem 630×880 Einheiten, auf dem jedes Template arbeitet. 10 Einheiten = 1 mm. DPI- und exportgrößen-unabhängig — beim Rendern auf die Zielauflösung skaliert. |
| **Layer** | Eine Ebene der Karte. Zeichenreihenfolge (von unten nach oben): ImageLayer → ShapeLayer → IconLayer → FrameLayer → TextLayer. Im Template-Editor umsortierbar. |
| **ImageLayer** | Zeigt das Bild der Karteninstanz — ausgewählt oder hochgeladen beim Erstellen der Karte. Eigenschaften: Position, Größe, Rotation, Zoom, Bildausschnitt. |
| **ShapeLayer** | Geometrische Form (Rechteck, Kreis, Linie) mit Farbe, Transparenz, Rahmenfarbe/-stärke, Eckradius. |
| **IconLayer** | PNG/SVG-Grafik, statisch (Templatevorgabe) oder vom Benutzer aus einer im Template hinterlegten Auswahl gewählt — keine automatische Ableitung aus einer Datenbank. |
| **FrameLayer** | Der Kartenrahmen selbst — genau einer pro Template, immer PNG, immer vollflächig, nicht positionier-/skalierbar. |
| **TextLayer** | Textfeld mit Datenquelle, Standardtext, Position, Bounding Box, Schriftart, Standardgröße/-farbe, Ausrichtung, Zeilenabstand, Outline, Schatten, Auto-Shrink. Schriftgröße/-farbe pro Karteninstanz überschreibbar. |
| **Datenquelle** | Woher der Wert eines Layers kommt — zwei Typen: **Statisch** (fester Wert im Template, z.B. „Legendary"), **Benutzer** (bei der Kartenerstellung per Formular oder MCP eingegeben, gehört zur Karteninstanz, z.B. „Mana"). Keine Datenbank-Anbindung (ADR-011). |
| **Auto-Shrink** | Automatische Schriftgrößen-Reduktion eines TextLayers, wenn der Text nicht in die Bounding Box passt — reduziert bis zur definierten Mindestschriftgröße. |
| **Canvas-Einheiten** | Die Maßeinheit des internen Canvas (630×880 = 63×88 mm). Nicht zu verwechseln mit Pixeln der Zielauflösung. |
| **Schnittmarken** | Optionale Markierungen auf dem Druckbogen, die die Schnittkanten der Einzelkarten anzeigen. |
| **Beschnitt** (Bleed) | Optionaler Rand über die Kartenkante hinaus, der beim Schneiden toleriert wird. |
