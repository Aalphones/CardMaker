# Phase 3 — MCP-Werkzeug `rename_asset`

**Tier:** mechanisch — kopiert das Muster von `update_card_group` 1:1 auf Assets.

**Voraussetzung:** Phase 2 abgeschlossen (`PATCH /api/assets/{id}` existiert im Backend).

## Kontext (lesen vor dem Start)

- `mcp/cardmaker_mcp/server.py` Zeile 204–228 — `update_card_group`: exaktes Muster für ein
  Umbenennen-Werkzeug (`_payload()`-Aufbau, `meta.validate_card_group_payload`, kein
  `invalidates_state` nötig hier — **Unterschied:** `update_card_group` braucht
  `@invalidates_state`, weil Kartengruppen im Zustandsbild stehen; Assets stehen **nicht** im
  Zustandsbild (`state_cache.py` Zeile 34–38 kennt nur `cardGroups`/`templates`/`cards`), also
  entfällt der Dekorator hier.
- `mcp/cardmaker_mcp/client.py` Zeile 197–203 (`patch_card_group`) — Vorbild für die neue
  `patch_asset(asset_id: int, payload: dict) -> dict`-Methode.
- `mcp/cardmaker_mcp/meta.py` — es gibt noch keine `validate_asset_payload`-Funktion; neu
  anlegen nach dem Muster von `validate_card_group_payload` (Zeile 36–49), aber schlanker (nur
  `name`, keine `description`).
- `docs/conventions/mcp.md` „Regeln für jedes schreibende Werkzeug" (Zeile 66–83) — die vier
  Pflichten. Für `rename_asset` gilt: Punkt 2 (Meta-Prüfung) ja, Punkt 3 (`_payload`) ja,
  Punkt 4 (Vorschaubild-Hinweis `_with_hints`) **nein** — der Hinweis ist kartenspezifisch
  („Karten … bekommen ihr Vorschaubild erst …"), Assets haben kein Vorschaubild-Konzept. Punkt
  1 (`invalidates_state`) **nein**, siehe oben.

## AK

1. `rename_asset(asset_id=<id>, name="Feuer")` benennt ein Asset um und liefert das
   aktualisierte Objekt (id, kind, name, mimeType, byteSize, width, height, createdAt).
2. Ein zu langer Name (>191 Zeichen) scheitert **client-seitig** mit einer lesbaren
   `ValueError`-Meldung, bevor die Anfrage rausgeht (Klartext-vor-422-Regel).
3. Eine nicht existente `asset_id` liefert die Backend-404-Meldung lesbar über
   `ApiError.format_for_tool()`.

## Implementation

- [ ] `mcp/cardmaker_mcp/client.py`: neue Methode
      ```python
      def patch_asset(self, asset_id: int, payload: dict) -> dict:
          return self.request("PATCH", f"assets/{asset_id}", payload)
      ```
      (nach `patch_card_group`, gleicher Stil).
- [ ] `mcp/cardmaker_mcp/meta.py`: neue Funktion
      ```python
      def validate_asset_payload(meta: dict, payload: dict[str, Any]) -> None:
          rules = meta.get("assets", {})
          _check_name(payload, rules.get("nameMaxLength"), "Bild")
      ```
      (nutzt das bestehende private `_check_name` — dafür `_check_name` von `_check_name(...)`
      auf modulweit aufrufbar lassen, sie ist bereits ohne führenden Unterstrich-Schutz einer
      Klasse, nur Konvention; kein Zugriffsproblem, da alles im selben Modul).
- [ ] `mcp/cardmaker_mcp/server.py`: neues Werkzeug nach `list_assets` (vor
      `create_card_group`, um die Lesend/Schreibend-Reihenfolge zu halten):
      ```python
      @mcp.tool()
      @api_tool
      def rename_asset(asset_id: int, name: str) -> dict:
          """Ein Bild im Vorrat (Rahmen/Icon/Artwork) umbenennen.

          Args:
              asset_id: Kennung des Bildes (`list_assets`).
              name: Neuer Anzeigename.
          """
          payload = _payload(name=name)
          meta.validate_asset_payload(state_cache.load_meta(get_client()), payload)
          return get_client().patch_asset(asset_id, payload)
      ```
- [ ] `mcp/README.md`: Werkzeugliste um `rename_asset(asset_id, name)` ergänzen (gleiche
      Tabellenform wie die anderen Einträge).

## Manuelle Abnahme-Checkliste

- [ ] `list_assets()` → eine `asset_id` notieren, `rename_asset(asset_id, "Testname")` →
      Antwort trägt `"name": "Testname"`.
- [ ] `rename_asset(asset_id, "")` → lesbarer `ValueError` vor jeder Netzwerk-Anfrage (kein
      rohes 422).
- [ ] `rename_asset(999999, "X")` → lesbare 404-Meldung über `ApiError.format_for_tool()`.

## Doc-Updates

- [ ] `docs/conventions/mcp.md` → Werkzeugtabelle (Zeile 23–44): `rename_asset(asset_id,
      name)` als neue Zeile, Phase-Spalte auf die tatsächliche Meilenstein-/Plan-Referenz
      dieses Plans setzen (analog den bestehenden Einträgen).
- [ ] `mcp/README.md` (siehe Implementation oben).

## Report-Back

(wird beim Umsetzen ausgefüllt)
