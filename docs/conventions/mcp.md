# MCP-Server (Werkzeug-Zugriff für den Assistenten) — CardMaker

`mcp/` ist ein versioniertes Python-Subprojekt, das die CardMaker-REST-API als typisierte
MCP-Werkzeuge bereitstellt. Läuft **nur lokal**, neben Claude Code — nie auf Strato. Dieselbe
REST-API, dieselbe Zugriffstoken-Anmeldung wie das Frontend; am Backend ändert sich dadurch
nichts (einzige Ausnahme: die Auskunftsroute `GET /api/meta`).

Einrichtung, Token setzen und die vollständige Werkzeugliste: `mcp/README.md`.
Aufbau in der Landkarte: `docs/code-map.md` → „MCP-Server".

## Stand (Meilenstein 6, `docs/archive/2026-08/2026-08-13_mcp-server/` — abgeschlossen)

- **Paket** `cardmaker_mcp`, Projektname `cardmaker-mcp`, Abhängigkeit `mcp[cli]>=2.0.0`,
  `requires-python >=3.10`, Build über `hatchling`.
- **Umgebungsvariablen:** `CM_TOKEN` (Zugriffstoken, Pflicht — Ausweichweg: Datei `.cm_token`
  im Arbeitsverzeichnis oder Paketordner), `CM_BASE` (Basisadresse, Vorgabe
  `https://quantum-canvas.de/api`).
- **Kein Zustandsbild im Backend:** `get_state` wird im MCP-Server aus drei Listenabrufen
  zusammengesetzt (ADR-025) und prozessweit zwischengespeichert.
- **SDK-Namen:** Ab SDK 2.0 heißt die Server-Klasse `MCPServer` (`mcp.server.mcpserver`),
  in 1.x hieß sie `FastMCP` — die Referenz-Umsetzung bei Promptigofant steht noch auf 1.x.

### Werkzeuge

| Werkzeug | Phase | Zweck |
|---|---|---|
| `get_meta` | 2 | Prüfregeln/Enums der laufenden API |
| `get_state(refresh)` | 2 | Kartengruppen + Templates + Karten (Kurzfassungen) |
| `find_template(query)` | 3 | Templates nach Namensteil suchen |
| `find_card(query, template_id, card_group_id)` | 3 | Karten suchen, optional gefiltert |
| `find_card_group(query)` | 3 | Kartengruppen nach Namensteil suchen |
| `get_template(template_id)` | 3 | Template vollständig, inklusive Ebenen — nur lesend |
| `get_card(card_id)` | 3 | Karte vollständig |
| `describe_card_fields(template_id)` | 3 | Kartenfelder eines Templates: Text, Bild, Icon |
| `list_assets(kind)` | 3 | Bildvorrat (Rahmen/Icons) |
| `rename_asset(asset_id, name)` | Bildvorrat-Erw. 3 | Bild im Vorrat umbenennen |
| `create_card_group(name, description)` | 4 | Kartengruppe anlegen |
| `update_card_group(card_group_id, name, description)` | 4 | Umbenennen/Beschreibung ändern |
| `create_card(name, template_id, values, card_group_id, icon_choices, text_overrides)` | 4 | Karte anlegen und befüllen |
| `update_card(card_id, …)` | 4 | Karte ändern — nur übergebene Felder |
| `duplicate_card(card_id)` | 4 | Karte kopieren |
| `upload_card_image(card_id, layer_id, file_path)` | 5 | Motivbild hochladen/ersetzen |
| `set_card_image_placement(card_id, layer_id, offset_x, offset_y, scale)` | 5 | Verschiebung/Maßstab ändern |
| `remove_card_image(card_id, layer_id)` | 5 | Bild dieser Ebene entfernen |

### Bewusst nicht vorhanden

- **Kein `delete_*`** außer `remove_card_image` — das leert nur eine Bildfläche, es entfernt
  kein Datenobjekt, und die Karte bleibt ohne Bild weiterhin vollständig (dasselbe, was der
  Editor mit einem Klick tut). Ein Zugriffstoken kann alles, was der Nutzer kann; ein
  irrtümliches Löschen einer Karte oder Kartengruppe über einen Assistenten ist unumkehrbar
  und nicht der Zweck des Servers. Entfernt wird im Frontend.
- **Layer-Kennungen sind Zeichenketten**, nicht Zahlen — wie `iconChoices`-Schlüssel folgen
  sie demselben Muster (`layers.fieldKeyPattern` aus `/api/meta`). Ein `layer_id`, der im
  Template der Karte keine Bildfläche ist, wird vor dem Senden abgefangen
  (`server._check_image_layer`) — mit den vorhandenen Bildflächen samt Beschriftung in der
  Fehlermeldung.
- **Kein Weg, eine Zuordnung zu leeren.** `update_card` kann eine Karte in eine andere
  Gruppe schieben, aber nicht aus ihrer Gruppe lösen; `update_card_group` kann eine
  Beschreibung nicht wieder leeren. Grund: ein weggelassenes Argument heißt „unverändert",
  ein Nullwert bräuchte ein zweites, verwirrendes Sonderzeichen an derselben Stelle.
  Beides ist in der Oberfläche ein Klick.
- **Kein Abgleich der Feldschlüssel gegen das Template.** Das Backend gleicht bewusst nicht
  ab (Grundsatz in `docs/routes.md`) — der Server ist deshalb nicht strenger als die App,
  sondern **warnt** nur im Antworttext und nennt die bekannten Schlüssel.

## Regeln für jedes schreibende Werkzeug

Alle vier gehören zusammen; fehlt eine, ist der Fehler still:

1. `@invalidates_state` — sonst antworten `find_*`/`get_state` bis zum Prozess-Neustart aus
   veralteten Daten.
2. **Nutzlast vorher gegen `/api/meta` prüfen** (`meta.validate_card_payload` /
   `validate_card_group_payload`) — Klartext-Meldung statt eines `422` nach der Fahrt.
3. **Weggelassene Argumente gehören nicht in die Nutzlast** (`server._payload`). Die
   PATCH-Routen ändern genau die Schlüssel, die im Rumpf stehen — ein Nullwert für ein
   nicht übergebenes Feld löscht Daten.
4. **Vorschaubild-Hinweis anhängen** (`server._with_hints`): über MCP angelegte Karten
   haben keine Kachel, bis sie einmal im Editor gespeichert wurden (ADR-026).

Bild-Werkzeuge zusätzlich: Datei **vor** dem Hochladen gegen `/api/meta` prüfen
(`meta.validate_image_file` — Existenz, Größe, Format) und Verschiebung/Maßstab gegen
`cards.imagePlacement` (`meta.validate_image_placement`) — dieselbe Klartext-vor-`422`-Regel
wie bei den übrigen Schreib-Werkzeugen.

Die Muster aus `/api/meta` tragen ihre **PHP-Trennzeichen** (`/^…$/`), weil sie unverändert
aus den Prüfklassen stammen — vor dem Übersetzen nach Python durch `meta.compile_pattern`
schicken, sonst lehnt jedes Muster jeden Wert ab.

## Drift-Regeln (was still veralten kann)

- **Werkzeug-Schemas aus der Laufzeit-Auskunft ableiten, nicht hand-pflegen** — ändert sich
  eine Prüfregel im Backend, darf das keine Codeänderung im MCP-Server erzwingen.
- **Jedes neue Schreib-Werkzeug muss den Zwischenspeicher verwerfen**
  (`invalidates_state`), sonst antworten `find_*`/`get_state` nach einem Schreibvorgang mit
  veralteten Daten bis zum Neustart des Prozesses.
- **Routen-Bestand im MCP-Code muss mit der API-Oberfläche mitlaufen** — neue Routen, die
  mit Zugriffstoken erreichbar sind, brauchen ein Werkzeug oder eine ausdrückliche Notiz
  „bewusst außen vor".
- **`card_fields.py` und `card-fields.ts` müssen deckungsgleich bleiben** — beide leiten aus
  denselben Ebenen dieselben Kartenfelder ab. Ändert sich die Regel in einer Fassung
  (Feldtypen, Dopplungs-Behandlung, `source`-Filter), zieht die andere sofort nach.

## Critical Rules

1. **Nie hochladen** — `mcp/` läuft ausschließlich lokal neben Claude Code.
2. **Kein Token-Literal in `.mcp.json`** — der Token kommt aus der Umgebung (`${CM_TOKEN}`).
3. **Werkzeug-Schemas zur Laufzeit ableiten, nicht abschreiben** — sonst driftet die
   Beschreibung vom tatsächlichen API-Vertrag weg, ohne dass es auffällt.
4. **Templates bleiben lesend** — das Ebenen-Layout entsteht im Editor, nicht als blind
   geschriebener JSON-Block (Entscheidung 2026-08-13).
