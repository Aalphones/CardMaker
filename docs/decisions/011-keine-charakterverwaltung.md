# 011 — Keine Charakterverwaltung: Karten speichern ausgefüllte Templatefelder direkt

**Status:** Akzeptiert (2026-08-01)

## Kontext

ADR-007 legte eine `characters`-Tabelle mit festen Kernfeldern plus frei benannten
Attributen fest; TextLayer-Datenquellen sollten u. a. aus `character.*` gelesen werden
(Konzeptdokument, ursprüngliche Fassung). Der Auftrag für CardMaker ist damit enger gefasst
worden: CardMaker ist ein reines Werkzeug zum **Erstellen** von Sammelkarten, keine
Verwaltung von Charakteren. Karten werden einzeln befüllt — von Hand über ein Formular oder
von Claude über den MCP-Server — statt automatisch aus einer Datenbank gezogen zu werden.
Aufbewahrt werden soll ausschließlich die fertig erstellte Karte selbst, damit sich
Schreibfehler nachträglich korrigieren lassen.

## Optionen

- (a) ADR-007 unverändert lassen, Charaktere nur optional beim Kartenerstellen anbieten.
- (b) Charaktere als Entität vollständig streichen; die Karteninstanz speichert die
  ausgefüllten Textfeldwerte direkt als flache Zuordnung Feldname → Text.
- (c) Zwischenschritt: Charaktere als reine, nicht-persistente Textvorlagen im Frontend
  behalten, ohne Backend-Tabelle.

## Entscheidung

**(b).** Es gibt keine `characters`-Tabelle und keine Charakter-Entität irgendwo im System.
Eine Karteninstanz speichert ihre Textfeldwerte direkt, benannt nach den TextLayer-Namen des
referenzierten Templates. Das Bild hängt direkt an der Karteninstanz, nicht an einem
Charakter. Die Datenquelle „Datenbank" aus dem ursprünglichen Konzept entfällt ersatzlos —
TextLayer- und IconLayer-Datenquellen sind ab jetzt nur noch **Statisch** (Templatevorgabe)
oder **Benutzer** (beim Kartenerstellen eingegeben, gleichwertig ob per Formular oder MCP).

## Konsequenzen

- **ADR-007 ist hiermit abgelöst** — dessen Datei bekommt den Status „Abgelöst durch
  ADR-011". Die `attributes`-JSON-Spalte und `GET /api/characters/attribute-keys` aus
  ADR-007 entstehen nicht.
- **ADR-002 bleibt im Kern gültig** (eigenständige App, kein geteiltes Backend mit
  Promptigofant), aber dessen Begründung über eine „eigene Charakter-/Bildverwaltung" ist
  gegenstandslos — es gibt schlicht keine Charakterverwaltung zu entscheiden.
- Der IconLayer verliert seine Option „automatisch anhand eines Datenbankwerts gewählt"
  (Konzeptdokument) — Icons sind ab jetzt nur noch statisch oder vom Benutzer aus einer im
  Template hinterlegten Auswahl gewählt.
- Meilenstein 1 (Fundament) verliert seine ursprüngliche Vertical-Slice „Charakterverwaltung".
  An ihre Stelle tritt **Kartengruppen**-CRUD (Name, Beschreibung) — eine einfache, von
  Templates unabhängige Organisationseinheit für später gespeicherte Karten, die den vollen
  Durchstich DB→Backend→Store→UI genauso beweist.
- Bildverwaltung ist damit **kein eigenständiges Feature von Meilenstein 1 mehr** — ein Bild
  gehört direkt zu einer Karteninstanz und wird erst dort hochgeladen (Meilenstein 3,
  Karteneditor), nicht vorab in einer separaten Bibliothek.
- Die zwei Eingabewege (Formular, MCP) sind auf Datenebene ununterscheidbar — beide schreiben
  in dieselben Textfeldwerte derselben Karteninstanz.
