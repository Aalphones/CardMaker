# Glossar — CardMaker

Ein Begriff, eine Bedeutung. Neu abgeklärte Fachbegriffe hier ergänzen, nicht in Code/Docs
frei erfinden.

| Begriff | Bedeutung |
|---|---|
| **Template** | Beschreibt ausschließlich das Layout einer Karte: Kartenrahmen, Layer, Positionen, Schriftarten, Farben, Standardwerte, Datenquellen. Enthält nie konkrete Charakterdaten. |
| **Karteninstanz** (Card Instance) | Eine konkrete Karte: gewählter Charakter, Bild, Bildausschnitt, individuelle Texte/Schriftgrößen/-farben. Referenziert ein Template, ändert es nie. Gespeichert wird nur die Referenz + die Abweichungen, nicht das fertige Bild — jederzeit neu renderbar. |
| **Druckprojekt** (Print Project) | Sammlung beliebig vieler Karteninstanzen. Export erzeugt daraus automatisch Druckbögen. |
| **Druckbogen** (Print Sheet) | Eine A4-Seite mit 3×3 (9) Karten, erzeugt beim Export eines Druckprojekts. |
| **Internes Canvas** | Fixes Koordinatensystem 630×880 Einheiten, auf dem jedes Template arbeitet. 10 Einheiten = 1 mm. DPI- und exportgrößen-unabhängig — beim Rendern auf die Zielauflösung skaliert. |
| **Layer** | Eine Ebene der Karte. Zeichenreihenfolge (von unten nach oben): ImageLayer → ShapeLayer → IconLayer → FrameLayer → TextLayer. Im Template-Editor umsortierbar. |
| **ImageLayer** | Zeigt das Bild des ausgewählten Charakters. Eigenschaften: Position, Größe, Rotation, Zoom, Bildausschnitt. |
| **ShapeLayer** | Geometrische Form (Rechteck, Kreis, Linie) mit Farbe, Transparenz, Rahmenfarbe/-stärke, Eckradius. |
| **IconLayer** | PNG/SVG-Grafik, statisch oder automatisch anhand eines Datenbankwerts gewählt (z.B. Element, Fraktion, Seltenheit). |
| **FrameLayer** | Der Kartenrahmen selbst — genau einer pro Template, immer PNG, immer vollflächig, nicht positionier-/skalierbar. |
| **TextLayer** | Textfeld mit Datenquelle, Standardtext, Position, Bounding Box, Schriftart, Standardgröße/-farbe, Ausrichtung, Zeilenabstand, Outline, Schatten, Auto-Shrink. Schriftgröße/-farbe pro Karteninstanz überschreibbar. |
| **Datenquelle** | Woher der Wert eines Layers kommt — drei Typen: **Datenbank** (z.B. `character.name`), **Statisch** (fester Wert im Template, z.B. „Legendary"), **Benutzer** (bei der Kartenerstellung eingegeben, gehört zur Karteninstanz, z.B. „Mana"). |
| **Auto-Shrink** | Automatische Schriftgrößen-Reduktion eines TextLayers, wenn der Text nicht in die Bounding Box passt — reduziert bis zur definierten Mindestschriftgröße. |
| **Canvas-Einheiten** | Die Maßeinheit des internen Canvas (630×880 = 63×88 mm). Nicht zu verwechseln mit Pixeln der Zielauflösung. |
| **Schnittmarken** | Optionale Markierungen auf dem Druckbogen, die die Schnittkanten der Einzelkarten anzeigen. |
| **Beschnitt** (Bleed) | Optionaler Rand über die Kartenkante hinaus, der beim Schneiden toleriert wird. |
