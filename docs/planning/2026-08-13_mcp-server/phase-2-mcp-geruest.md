# Phase 2 — MCP-Gerüst: Subprojekt, Client, Serverstart

Das Python-Subprojekt `mcp/` entsteht, spricht mit der API und meldet sich bei Claude Code
an. Am Ende dieser Phase gibt es zwei Werkzeuge (`get_meta`, `get_state`) — genug, um den
Aufbau als funktionierend nachzuweisen.

## Kontext — vorher lesen

- `docs/conventions/mcp.md` — Aufbau, Drift-Regeln, Critical Rules
- **Referenz-Umsetzung** (anderes Projekt, gleicher Bauplan, darf abgeschaut werden):
  `C:\Users\sasch\develop\promptigofant\mcp\` — insbesondere `promptigofant_mcp/client.py`
  (Token-Auflösung, Wiederholung bei 429, Fehlerabbildung, mehrteiliger Upload),
  `server.py` (Werkzeug-Registrierung), `state_cache.py`, `README.md`, sowie die
  `.mcp.json` im dortigen Repo-Root
- `docs/routes.md` — die vollständige Routenliste
- `README.md` dieses Plans → Kontrakt

## Abnahmekriterien

1. `python -m cardmaker_mcp` startet ohne Ausgabe und ohne Fehler (stdio-Server im Leerlauf).
2. In Claude Code ist der Server `cardmaker` sichtbar, `get_meta` liefert den Kontrakt aus
   Phase 1, `get_state` eine Übersicht aus Kartengruppen, Templates und Karten.
3. Ohne gesetztes `CM_TOKEN` startet der Server mit einer **klaren** Fehlermeldung, die sagt,
   welche Umgebungsvariable fehlt und wo man ein Zugriffstoken erzeugt (Tokenverwaltung im
   Frontend) — kein Traceback als einzige Auskunft.
4. Ein Fehler der API (z.B. `422` mit `fields`) kommt beim Werkzeugaufruf als lesbarer Text
   zurück, inklusive der Feldmeldungen — nicht als roher Ausnahme-Text.
5. Kein Token im Git: `.mcp.json` referenziert `${CM_TOKEN}`, `mcp/.venv` ist ignoriert.

## Festlegungen (nicht neu entscheiden)

- Paketname `cardmaker_mcp`, Projektname `cardmaker-mcp`, Abhängigkeit `mcp[cli]>=1.0.0`,
  `requires-python = ">=3.10"`, Build-Backend `hatchling` — wie in der Referenz.
- Umgebungsvariablen: **`CM_TOKEN`** (Zugriffstoken, Pflicht), **`CM_BASE`** (Basisadresse,
  Vorgabe `https://quantum-canvas.de/api`). Zusätzlich als Ausweichweg eine Datei
  `.cm_token` (Arbeitsverzeichnis, dann Paketordner) — beide Namen gehören in `.gitignore`.
- `get_state` wird **im Client zusammengesetzt** aus `GET /api/card-groups`,
  `GET /api/templates` und `GET /api/cards` — es gibt keine neue Backend-Route dafür
  (ADR-025, in Phase 5 geschrieben). Ergebnis wird prozessweit zwischengespeichert.

## Checkliste

- [x] `mcp/pyproject.toml` anlegen (Werte s.o.).
- [x] `mcp/cardmaker_mcp/__init__.py`, `__main__.py` (startet `server.main()`).
- [x] `mcp/cardmaker_mcp/client.py`: Token-Auflösung (Konstruktor → `CM_TOKEN` → `.cm_token`),
      Basisadresse aus `CM_BASE`, `Authorization: Bearer <token>`, JSON-Anfragen,
      Zeitüberschreitung 30 s (Uploads 120 s), Wiederholung mit wachsender Wartezeit bei
      `429`, Abbildung von HTTP-Fehlern auf eine `ApiError` mit `status`, `message` und
      `fields` (das Fehlerformat des Backends ist `{ error, message, fields? }`,
      `docs/routes.md`), Methode zum mehrteiligen Hochladen (CRLF-Zeilenenden — die Referenz
      erklärt in `_build_multipart_body`, warum das nicht kosmetisch ist).
      Lesemethoden dieser Phase: `get_meta()`, `get_card_groups()`, `get_templates()`,
      `get_cards()`.
- [x] `mcp/cardmaker_mcp/state_cache.py`: prozessweiter Zwischenspeicher für Meta und
      Zustandsbild, mit einer Funktion zum gezielten Verwerfen (wird in Phase 4 von jedem
      Schreib-Werkzeug gerufen).
- [x] `mcp/cardmaker_mcp/server.py`: `MCPServer("cardmaker")` (SDK 2.0, s. Report-Back), Werkzeuge `get_meta` und
      `get_state` registrieren, `main()` mit stdio-Transport. Jedes Werkzeug fängt `ApiError`
      und gibt den lesbaren Text zurück.
- [x] `.mcp.json` im **Repo-Root** anlegen: Server `cardmaker`, `command`
      `mcp/.venv/Scripts/python.exe`, `args` `["-m","cardmaker_mcp"]`, `cwd` `mcp`,
      `env` `{ "CM_TOKEN": "${CM_TOKEN}" }` — kein Token-Literal.
- [x] `.gitignore` ergänzen: `mcp/.cm_token`, `.cm_token` (`mcp/.venv/` steht schon drin).
- [x] `mcp/README.md`: Einrichtung (venv mit `py -3 -m venv .venv`, `pip install -e .`),
      Token setzen (`setx CM_TOKEN …`), Start als Rauchtest, Registrierung, der Hinweis
      „läuft nur lokal, nie auf Strato".
- [x] Doku: `docs/conventions/mcp.md` von „geplant" auf den gebauten Stand ziehen
      (Paketname, Umgebungsvariablen, Werkzeug-Liste als Stand nach Phase 2 — die weiteren
      Werkzeuge kommen in den Folgephasen dazu).
- [x] Doku: `docs/code-map.md` — neuer Abschnitt „MCP-Server (`mcp/`)" mit den Dateien
      ordner-grob und dem Satz, dass er nicht deployt wird.
- [x] Prüfen, dass `deploy.cmd` `mcp/` **nicht** hochlädt — die Abgleiche laufen über
      `backend/`, `api-bridge/` und den Frontend-Build; steht dort ein Muster, das `mcp/`
      erfassen könnte, eine Ausnahme ergänzen und im Report-Back vermerken.

## Report-Back

**Status: complete** (2026-08-13), mit einem offenen Nachweis (unten).

**Abweichung vom Plan — SDK 2.0 statt 1.x:** Die Festlegung nannte `mcp[cli]>=1.0.0` und
`FastMCP("cardmaker")` wie in der Referenz. Installiert wird inzwischen SDK **2.0.0**, dort
gibt es `mcp.server.fastmcp` nicht mehr — die ergonomische Server-Klasse heißt `MCPServer`
(`mcp.server.mcpserver`), Bedienung unverändert (`@mcp.tool()`, `run()`). Gewählt: mitgehen
statt auf `<2` festnageln; Abhängigkeit steht auf `mcp[cli]>=2.0.0`. Ein Rückzug auf 1.x
wäre zwei Zeilen.

**Rauchtest, tatsächlich gelaufen:**

- Vollständiger stdio-Handschlag von Hand gefahren (`initialize` → `notifications/initialized`
  → `tools/list`): der Server antwortet, beide Werkzeuge erscheinen mit Schema, `get_state`
  mit dem Schalter `refresh`.
- Ohne `CM_TOKEN`: Abbruch mit Code 1 und der Klartext-Zeile auf der Fehlerausgabe (welche
  Variable fehlt, wo der Token herkommt) — kein Traceback.
- `deploy.cmd` prüft: die drei Abgleiche laufen über `backend/`, `api-bridge/` und den
  Frontend-Build. `mcp/` ist von keinem Muster erfasst, keine Ausnahme nötig.
- `git status`: nur `mcp/`-Quellen, `.mcp.json` und `.gitignore` — venv und Token-Dateien
  bleiben draußen.

**Offen (braucht den Nutzer):** AK 2 zur Hälfte — dass `get_meta` den Kontrakt aus Phase 1
**wirklich** liefert, ist ungeprüft: die Auskunftsroute ist noch nicht hochgeladen und es
existiert lokal kein Zugriffstoken (`CM_TOKEN` nicht gesetzt). Nach dem nächsten Deploy:
Token im Frontend erzeugen, `setx CM_TOKEN …`, Claude Code neu starten, `get_meta` aufrufen.

**Nebenbefund (nicht von dieser Phase verursacht):** Der Python-Interpreter der Maschine
schreibt bei jedem Start `Could not find platform independent libraries <prefix>` auf die
Fehlerausgabe — auch bei `py -3 -c "print(1)"` ohne dieses Projekt. Stört das Protokoll
nicht (stdout bleibt sauber), ist aber Rauschen im Log.
