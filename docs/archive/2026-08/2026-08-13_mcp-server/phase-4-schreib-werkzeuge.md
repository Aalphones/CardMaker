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

- [x] `client.py`: Schreibmethoden ergänzt (`post_card_group`, `patch_card_group`,
      `post_card`, `patch_card`, `post_card_duplicate`).
- [x] `mcp/cardmaker_mcp/meta.py`: `validate_card_payload` und
      `validate_card_group_payload` prüfen Schlüsselmuster, Wertlängen,
      `textOverrides`-Bereiche und Farbmuster und werfen `ValueError` mit Klartext.
      Zwischengespeichert wird die Auskunft weiterhin in `state_cache.load_meta` — ein
      zweiter Speicher daneben wäre eine zweite Wahrheit gewesen.
- [x] Warnung nach AK 3: `_unknown_field_warnings` in `server.py` lädt die Feldschlüssel
      über `card_fields.describe_card_fields` und vergleicht; bei `update_card` kommt das
      Template über `get_card(...)["templateId"]`.
- [x] Zwischenspeicher-Verfall: alle fünf Werkzeuge tragen `@invalidates_state`; die Regel
      steht im Modulkopf von `server.py` und in `docs/conventions/mcp.md`.
- [x] Werkzeuge in `server.py` registriert, typisierte Parameter, deutsche Beschreibungen.
- [x] Antworten: `{ "card"|"cardGroup": <gespeicherter Stand>, "hinweise": [...] }` —
      Warnungen zuerst, der Vorschaubild-Hinweis immer als letzter Eintrag.
- [x] Doku: `docs/conventions/mcp.md` (Werkzeug-Tabelle, vier Pflichtregeln für
      Schreib-Werkzeuge, bewusste Auslassungen), `mcp/README.md`, `docs/code-map.md`.

## Report-Back

**Umgesetzt.** Fünf Schreib-Werkzeuge, `meta.py` als Prüfung vor dem Senden, Doku nachgezogen.
`server.mcp.list_tools()` zeigt 14 Werkzeuge; die Prüfregeln wurden gegen eine nachgebaute
Meta-Antwort trocken durchgespielt (Schlüsselmuster, Wertlänge, Schriftgröße, Farbe,
unbekannte Angabe in `textOverrides`, Icon-Kennung, Namenslänge — jede lehnt mit Klartext ab).

**Zwei Festlegungen, die im Plan offen waren:**

1. **Muster mit Trennzeichen.** `/api/meta` liefert `"/^[a-z]…$/"` mitsamt der
   PHP-Trennzeichen, weil `MetaService` die Konstanten unverändert durchreicht. Ohne
   Abstreifen lehnt jedes Muster jeden Wert ab — `meta.compile_pattern` erledigt das, die
   Kontrakt-Beschreibung in der Plan-README ist korrigiert.
2. **Unbekannte Angabe in `textOverrides` wird abgelehnt** (z.B. `fontWeight`), obwohl das
   Backend sie stillschweigend verwirft. Eine still verworfene Abweichung sieht gespeichert
   aus und ist es nicht; das ist die schlimmere Sorte Nachsicht.

**Noch nicht belegt:** kein einziger echter Schreibvorgang gegen die API — `GET /api/meta`
ist nicht hochgeladen und lokal läuft das Backend nicht (PHP-Versionskonflikt, siehe
STATE.md). Der Durchstich aus AK 3 der Plan-README ist der erste echte Beleg.
