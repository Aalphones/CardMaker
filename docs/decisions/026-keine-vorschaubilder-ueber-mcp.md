# 026 — Über MCP angelegte oder geänderte Karten bekommen kein Vorschaubild

**Status:** Akzeptiert (2026-08-13)

## Kontext

Vorschaubilder entstehen beim Speichern im Editor, gerendert über den kopflosen Renderer
im Browser (ADR-021, ADR-022, ADR-005: clientseitiges Rendering statt Server-Rendering).
Der MCP-Server legt Karten an, ändert Felder und lädt Motivbilder hoch, ohne dass je ein
Browser beteiligt ist.

## Optionen

- (a) **Serverseitig nachrendern.** Das Backend baut aus `layers` und den Kartenwerten ein
  PNG, sobald eine Karte über die API entsteht oder sich ändert.
- (b) **Keine Vorschau über MCP.** Die Kachel bleibt leer, bis die Karte einmal im Editor
  geöffnet und gespeichert wird — genau der bestehende Weg für jede neue Karte.

## Entscheidung

**(b).** ADR-005 hat Server-Rendering bewusst verworfen — ein zweiter Rendering-Pfad allein
für den MCP-Server würde genau das zurückholen, dazu nur für einen einzigen, lokalen
Aufrufer. Der bestehende Renderer läuft im Browser (ADR-022); ihn dem Backend beizulegen
hieße, das Canvas-Layout ein zweites Mal zu implementieren und auf Dauer synchron zu halten.

## Konsequenzen

- Karten, die über MCP entstehen oder sich ändern, zeigen in der Kartenliste eine leere
  Kachel, bis sie einmal im Editor gespeichert wurden.
- Jedes schreibende Werkzeug nennt das im Antworttext (`PREVIEW_HINT` in `server.py`), damit
  das Modell den Nutzer nicht im Unklaren lässt.
- Der Werkzeug-Nutzen bleibt: Textfelder befüllen und Motivbilder setzen funktioniert
  vollständig über MCP, nur das Vorschaubild braucht den einen zusätzlichen Schritt im
  Browser.
