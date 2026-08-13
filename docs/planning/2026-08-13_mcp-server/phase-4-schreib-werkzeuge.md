# Phase 4 — Schreib-Werkzeuge: Karten und Kartengruppen

Der Kern des Meilensteins: Claude legt Karten an und befüllt ihre Textfelder. Dazu
Kartengruppen anlegen/ändern und das Duplizieren.

## Kontext — vorher lesen

- `docs/routes.md` → Karten (Prüfregeln `CardValidator`, der **Grundsatz** am Ende des
  Abschnitts: Werte werden nie gegen das Template abgeglichen) und Kartengruppen
- `mcp/cardmaker_mcp/` — Stand nach Phase 3, besonders `state_cache.py` und `card_fields.py`
- Referenz für Meta-Prüfung vor dem Senden:
  `C:\Users\sasch\develop\promptigofant\mcp\promptigofant_mcp\meta.py`
- `README.md` dieses Plans → Kontrakt und „Bekannte Grenzen"

## Abnahmekriterien

1. `create_card(name, template_id, values, …)` legt eine Karte an und gibt deren `id` sowie
   den gespeicherten Stand zurück.
2. `update_card(card_id, …)` ändert **nur** die übergebenen Felder; nicht übergebene bleiben
   unangetastet (das Backend patcht, das Werkzeug schickt keine Nullwerte für Weggelassenes).
3. Ein Feldschlüssel, den das Template nicht kennt, wird **nicht** abgelehnt — aber das
   Werkzeug **warnt** im Antworttext und nennt die bekannten Schlüssel. (Begründung: der
   Grundsatz in `docs/routes.md`; eine harte Ablehnung wäre strenger als die App selbst.)
4. Ein Wert, der gegen eine **Meta-Regel** verstößt (Schlüsselmuster, Länge, Schriftgröße
   außerhalb 4–200, Farbe kein `#rrggbb`), wird **vor** dem Senden abgelehnt, mit einer
   Meldung, die die Regel im Klartext nennt.
5. Nach jedem erfolgreichen Schreibvorgang liefern `find_*`/`get_state` sofort den neuen
   Stand — der Zwischenspeicher wird verworfen, kein Prozess-Neustart nötig.
6. Jede Antwort eines schreibenden Werkzeugs enthält den Hinweis, dass die Kachel der Karte
   erst ein Vorschaubild bekommt, wenn sie einmal im Editor gespeichert wurde.
7. `delete_*` gibt es **nicht** — Löschen bleibt der Oberfläche vorbehalten (siehe
   Festlegung unten).

## Festlegungen (nicht neu entscheiden)

- **Kein Löschwerkzeug.** Ein Zugriffstoken kann alles, was der Nutzer kann; ein
  irrtümliches `delete_card` über einen Assistenten ist unumkehrbar und nicht der Zweck des
  Meilensteins. Entfernt wird im Frontend.
- **Meta-Prüfung vor dem Senden** ist eine Bequemlichkeit, keine zweite Wahrheit: sie prüft
  gegen die Regeln aus `GET /api/meta` (also gegen die Backend-Prüfklassen), sie erfindet
  keine eigenen. Was Meta nicht beschreibt, geht ungeprüft ans Backend.

## Werkzeuge dieser Phase (verbindliche Namen)

| Werkzeug | Zweck |
|---|---|
| `create_card_group(name, description=None)` | Kartengruppe anlegen |
| `update_card_group(card_group_id, name=None, description=None)` | Umbenennen/Beschreibung ändern |
| `create_card(name, template_id, values=None, card_group_id=None, icon_choices=None, text_overrides=None)` | Karte anlegen |
| `update_card(card_id, name=None, values=None, card_group_id=None, icon_choices=None, text_overrides=None)` | Karte ändern (nur Übergebenes) |
| `duplicate_card(card_id)` | Kopie anlegen (Backend-Route `POST /api/cards/{id}/duplicate`) |

## Checkliste

- [ ] `client.py`: Schreibmethoden ergänzen (`post_card_group`, `patch_card_group`,
      `post_card`, `patch_card`, `post_card_duplicate`).
- [ ] `mcp/cardmaker_mcp/meta.py`: Meta einmalig laden und zwischenspeichern; eine Funktion
      `validate_card_payload(meta, payload)`, die Schlüsselmuster, Wertlängen,
      `textOverrides`-Bereiche und Farbmuster prüft und bei Verstoß eine `ValueError` mit
      Klartext wirft.
- [ ] Warnung nach AK 3: Werkzeug lädt über `describe_card_fields` die Feldschlüssel des
      Templates und vergleicht sie mit den gesendeten — Abweichung wird gemeldet, nicht
      erzwungen. Bei `update_card` kommt das Template über die Karte (`templateId`).
- [ ] Zwischenspeicher-Verfall: **jedes** dieser Werkzeuge ruft am Ende das Verwerfen aus
      `state_cache.py`. Als Regel im Modulkopf-Kommentar festhalten (Drift-Regel aus
      `docs/conventions/mcp.md`).
- [ ] Werkzeuge in `server.py` registrieren, typisierte Parameter, sprechende Beschreibungen.
- [ ] Antworttexte: gespeicherter Stand kompakt + der Vorschaubild-Hinweis aus AK 6.
- [ ] Doku: `docs/conventions/mcp.md` — Werkzeug-Tabelle ergänzen, Regel „jedes neue
      Schreib-Werkzeug verwirft den Zwischenspeicher" als Pflicht festhalten, das fehlende
      Löschwerkzeug als bewusste Auslassung notieren.

## Report-Back
