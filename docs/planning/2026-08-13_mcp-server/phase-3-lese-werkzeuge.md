# Phase 3 — Such- und Lese-Werkzeuge

Damit Claude eine Karte befüllen kann, muss er zwei Dinge finden: die richtige Karte bzw.
das richtige Template — und die **Feldschlüssel**, die das Template anbietet. Diese Phase
liefert beides.

## Kontext — vorher lesen

- `mcp/cardmaker_mcp/client.py` und `server.py` aus Phase 2
- `docs/routes.md` → Templates, Karten, Kartengruppen, Bildvorrat (welche Felder die
  Kurzfassungen tragen und was `GET /api/{templates,cards}/{id}` vollständig liefert)
- `frontend/src/app/features/cards/card-editor/card-fields.ts` — `describeCardFields()`:
  **die** Regel, welche Ebenen ein Kartenfeld ergeben. Wird hier in Python nachgebaut, die
  Regeln müssen deckungsgleich bleiben (Kommentar in beide Richtungen setzen).
- `frontend/src/app/shared/canvas/rendering/layer.ts` — Aufbau der Ebenentypen

## Abnahmekriterien

1. `find_card("spider")` findet Karten unabhängig von Groß-/Kleinschreibung, liefert je
   Treffer `id`, `name`, `templateId`, `templateName`, `cardGroupName` — und bei keinem
   Treffer einen Satz, der das sagt, statt einer leeren Liste ohne Erklärung.
2. `describe_card_fields(templateId)` liefert für ein Template mit Textebenen alle
   Feldschlüssel mit Beschriftung, Vorgabetext und den Template-Vorgaben für Schriftgröße,
   Farbe, Fett/Kursiv — dazu die Bildflächen (`layerId` + Beschriftung) und die
   Icon-Auswahlen mit ihren erlaubten Bild-Kennungen.
3. Zwei Textebenen mit demselben Feldschlüssel erscheinen **einmal** — wie im Formular.
4. Nur Ebenen mit `source: "user"` gelten als Kartenfelder; `static`-Ebenen tauchen nicht auf.
5. Jedes Werkzeug hat eine Kurzbeschreibung, aus der ohne Blick in den Code hervorgeht, wann
   man es nimmt.

## Werkzeuge dieser Phase (verbindliche Namen)

| Werkzeug | Zweck |
|---|---|
| `find_template(query)` | Templates nach Namensteil suchen (Kurzfassungen) |
| `find_card(query, template_id=None, card_group_id=None)` | Karten suchen, optional gefiltert |
| `find_card_group(query)` | Kartengruppen nach Namensteil suchen |
| `get_template(template_id)` | Template vollständig, inklusive Ebenen |
| `get_card(card_id)` | Karte vollständig (`values`, `iconChoices`, `textOverrides`, `images`) |
| `describe_card_fields(template_id)` | Was an diesem Template pro Karte befüllt wird — Text-, Bild- und Icon-Felder |
| `list_assets(kind=None)` | Bildvorrat (Rahmen/Icons) — Kennungen für die Icon-Auswahl |

Gesucht wird **im Client** über die Kurzfassungen aus dem Zustandsbild (Teilzeichenkette,
Groß-/Kleinschreibung egal) — das Backend hat keine Suchroute, und die Listen sind klein.

## Checkliste

- [ ] `client.py` um die Einzelabrufe erweitern: `get_template(id)`, `get_card(id)`,
      `get_assets(kind=None)`.
- [ ] `mcp/cardmaker_mcp/card_fields.py` anlegen: `describe_card_fields(layers)` als reine
      Funktion, 1:1 nach `card-fields.ts` (Reihenfolge der Ebenen bleibt erhalten,
      Doppel-Schlüssel einmal, nur `source: "user"`). Kommentar mit Verweis auf die
      TypeScript-Fassung als Gegenstück.
- [ ] Suchhelfer in `state_cache.py` bzw. einem `search.py`: Teilzeichenketten-Suche über die
      zwischengespeicherten Kurzfassungen, Filter nach Template und Kartengruppe.
- [ ] Die sieben Werkzeuge in `server.py` registrieren, jedes mit typisierten Parametern und
      einer Beschreibung im Sinne von AK 5.
- [ ] Antworten kompakt halten: Suchergebnisse als Liste flacher Objekte, keine Ebenen-Dumps
      in `find_*` — Ebenen gibt es nur über `get_template`.
- [ ] Doku: `docs/conventions/mcp.md` — Werkzeug-Tabelle um diese Phase ergänzen, plus die
      Zeile, dass `card_fields.py` und `card-fields.ts` deckungsgleich bleiben müssen.
- [ ] Doku: `docs/code-map.md` — MCP-Abschnitt um `card_fields.py`/`search.py` ergänzen.

## Report-Back
