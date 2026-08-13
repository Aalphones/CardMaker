# STATE

**Aktiver Plan:** (kein aktiver Plan)

Meilenstein 6 (MCP-Server) ist am 2026-08-13 abgenommen und archiviert unter
`docs/archive/2026-08/2026-08-13_mcp-server/`. Die Abnahme lief über echte
MCP-Werkzeugaufrufe gegen die laufende API; das Ergebnis samt der beiden dabei behobenen
Fehler steht am Ende von `phase-5-bilder-und-abschluss.md` in diesem Archivordner.

**Offen beim Nutzer:**

- Karte „Zwischenspeicher-Probe" (Essenskarte) stammt aus der Abnahme und kann weg —
  Löschen geht nur über die Oberfläche, nicht über MCP.
- Ein Blick in den Browser auf diese Karte: Werte und Motivbild stehen, die Kachel zeigt
  erwartungsgemäß noch kein Vorschaubild; nach einmal Speichern im Editor schon.
- Die Bildschirm-Rundläufe zu Meilenstein 3
  (`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md`), Meilenstein 4
  (`docs/archive/2026-08/2026-08-13_rendering-engine/README.md`) und Meilenstein 5
  (`docs/archive/2026-08/2026-08-13_druckprojekt-und-export/README.md`) sind weiterhin nie
  gefahren worden.

**Offener Befund:** Fett/Kursiv an Textebenen — gespeichert als `fontBold`/`fontItalic`,
gelesen überall als `bold`/`italic`. Beschrieben in `docs/PROJECT.md` → Offene Fragen.

**Nicht am echten Template geprüft:** die Feldableitung bei zwei Textebenen mit demselben
Feldschlüssel und bei einer festen (`static`) Textebene. Der Code ist deckungsgleich mit der
Frontend-Vorlage, ein passendes Template gibt es aber nicht — es entstünde nur im Editor.
