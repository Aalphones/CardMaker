# 025 — Zustandsbild des MCP-Servers entsteht im Client, nicht über eine eigene Backend-Route

**Status:** Akzeptiert (2026-08-13)

## Kontext

`get_state` und die `find_*`-Werkzeuge (Phase 3) brauchen Kurzfassungen von Kartengruppen,
Templates und Karten, um Namensteil-Suche und Filterung anzubieten, ohne bei jedem Aufruf
gegen die API zu laufen. Diese drei Listen kommen bereits einzeln über bestehende Routen
(`GET /api/card-groups`, `GET /api/templates`, `GET /api/cards`).

## Optionen

- (a) **Eigene `/api/state`-Route.** Das Backend bündelt alle drei Listen in einer Antwort.
- (b) **Der MCP-Server baut das Zustandsbild selbst**, aus drei Anfragen an die vorhandenen
  Listenrouten, und hält es im Prozess zwischengespeichert (`state_cache.py`).

## Entscheidung

**(b).** Der MCP-Server läuft ausschließlich lokal, nie hinter Last, und ist der einzige
Nutzer eines gebündelten Zustandsbilds — eine neue Backend-Route allein für einen einzigen,
lokalen Client wäre eine zweite Datenquelle für dieselben drei Listen, die ab jetzt synchron
gehalten werden müsste. Der Zwischenspeicher im Client (`state_cache.py`) macht die
Mehrkosten der drei Anfragen irrelevant: er wird nur beim ersten Zugriff und nach jedem
Schreib-Werkzeug (`invalidates_state`) neu befüllt, nicht bei jeder Suche.

## Konsequenzen

- Drei HTTP-Anfragen statt einer beim (seltenen) Neuaufbau des Zustandsbilds — spürbar nur
  direkt nach dem Serverstart oder nach einem Schreibvorgang, nicht bei jeder Suche.
- Keine zweite Backend-Route zu pflegen, keine zweite Stelle, an der die drei Listenformen
  synchron gehalten werden müssen.
- Ändert sich eine der drei Listenrouten (neue Felder, andere Kurzfassung), zieht
  `state_cache.py` automatisch mit — es liest dieselben Antworten, die auch das Frontend
  bekommt.
