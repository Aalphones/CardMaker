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
| **ImageLayer** | Zeigt das Bild der Karteninstanz. Das Template legt nur Position, Größe und Rotation der Bildfläche fest — Zoom und Bildausschnitt sind Werte der Karteninstanz (Meilenstein 3), nicht des Templates. |
| **ShapeLayer** | Geometrische Form (Rechteck, Kreis, Linie) mit Farbe, Transparenz, Rahmenfarbe/-stärke, Eckradius. |
| **IconLayer** | PNG/SVG-Grafik, statisch (Templatevorgabe) oder vom Benutzer aus einer im Template hinterlegten Auswahl gewählt — keine automatische Ableitung aus einer Datenbank. |
| **FrameLayer** | Der Kartenrahmen selbst — genau einer pro Template, immer PNG, immer vollflächig, nicht positionier-/skalierbar. |
| **TextLayer** | Textfeld mit Datenquelle, Standardtext, Position, Bounding Box, Schriftart, Standardgröße/-farbe, Ausrichtung, Zeilenabstand, Outline, Schatten, Auto-Shrink. Schriftgröße/-farbe pro Karteninstanz überschreibbar. |
| **Datenquelle** | Woher der Wert eines Layers kommt — zwei Typen: **Statisch** (fester Wert im Template, z.B. „Legendary"), **Benutzer** (bei der Kartenerstellung per Formular oder MCP eingegeben, gehört zur Karteninstanz, z.B. „Mana"). Keine Datenbank-Anbindung (ADR-011). |
| **Auto-Shrink** | Automatische Schriftgrößen-Reduktion eines TextLayers, wenn der Text nicht in die Bounding Box passt — reduziert bis zur definierten Mindestschriftgröße. |
| **Canvas-Einheiten** | Die Maßeinheit des internen Canvas (630×880 = 63×88 mm). Nicht zu verwechseln mit Pixeln der Zielauflösung. |
| **Schnittmarken** | Optionale Markierungen auf dem Druckbogen, die die Schnittkanten der Einzelkarten anzeigen. |
| **Beschnitt** (Bleed) | Optionaler Rand über die Kartenkante hinaus, der beim Schneiden toleriert wird. |
| **Zugriffstoken** (Personal Access Token, PAT) | Alternative zur Anmeldung für skripteten Zugriff (z. B. MCP). Ein Zufallswert, in der Datenbank nur als Hashwert gespeichert, im Klartext genau einmal bei der Erzeugung sichtbar. Kein Ablaufdatum, Löschen ist der einzige Widerruf (ADR-008). |
| **Einrichtungsaufruf** (Setup) | Einmaliger API-Aufruf (`POST /api/setup`), der den ersten und einzigen Account anlegt und sich danach selbst versiegelt — jeder weitere Versuch liefert `410`. Es gibt keine Registrierung (ein Benutzerkonto insgesamt). |
| **Bildvorrat** (Assets) | Die hochgeladenen Rahmen- und Icon-Dateien, gemeinsam verwaltet über `/api/assets`. Ausschließlich PNG, liegen außerhalb des Webbereichs, hinter der Anmeldung (ADR-015). |
| **Kartenbild** (Card Image) | Das Motivbild einer einzelnen Karteninstanz, hochgeladen in eine Bildfläche des Templates. Gehört zu genau einer Karte, verschwindet mit ihr und liegt getrennt vom Bildvorrat (ADR-017). Gespeichert wird immer die Originaldatei plus Verschiebung und Maßstab — nie ein beschnittenes Bild (ADR-018). |
| **Abweichung** (Override) | Ein Wert, mit dem eine Karteninstanz eine Vorgabe ihres Templates für ein einzelnes Textfeld übersteuert: Schriftgröße, Farbe, Fett, Kursiv. Wird nur gespeichert, wo tatsächlich abgewichen wird — fehlt die Abweichung, gilt die Templatevorgabe. Ändert das Template nie. |
| **Feldschlüssel** (Key) | Der Name, unter dem eine Textebene ihren Text von der Karteninstanz oder von Claude über MCP erwartet. Kleinbuchstaben, Ziffern, Unterstrich; eindeutig innerhalb seines Templates. |
| **Ebenenreihenfolge** | Im gespeicherten Datenblock (`templates.layers`) liegt Index 0 zuunterst — das ist die Zeichenreihenfolge. In der Ebenenliste der Oberfläche steht das vorderste Element oben, also genau umgekehrt zum Array. |
| **Anfasser** (Transform Handles) | Die Griffe am Rand einer ausgewählten Ebene im Vorschaubild, mit denen direkt gezogen, skaliert und gedreht wird (Konva-Transformer). Ein einzelner Knoten, der beim Auswählen zwischen Ebenen umgehängt wird — nicht einer pro Ebene. |
| **Arbeitskopie** | Der Bearbeitungszustand des Template-Editors (Ebenenliste, Auswahl, `dirty`-Flag) im Signal Store `template-editor.ts` — lebt nur während der Editor-Sitzung, wird erst beim Speichern in die echten Template-Daten übernommen. Verwerfen ohne Speichern verwirft nur die Arbeitskopie. |
