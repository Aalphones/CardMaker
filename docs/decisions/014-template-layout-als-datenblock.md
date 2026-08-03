# 014 — Template-Layout als Datenblock statt Ebenentabelle

**Status:** Akzeptiert (2026-08-03)

## Kontext

Der Template-Editor-Plan (Meilenstein 2) braucht ein Speicherformat für die Ebenenliste
eines Templates: fünf Ebenentypen (Image, Shape, Icon, Frame, Text) mit unterschiedlichen
Feldern, in fester Zeichenreihenfolge. Offene Frage aus `docs/PROJECT.md` → „Offene Fragen".

## Optionen

- (a) Eigene Tabelle `template_layers`, eine Zeile pro Ebene, Typ-Spalte plus
  Eigenschaften-Blob für die typspezifischen Felder, Reihenfolge über eine Sortier-Spalte.
- (b) Die Ebenen eines Templates liegen als ein JSON-Wert in der Spalte `templates.layers`.

## Entscheidung

**(b).** Ein Template wird immer als Ganzes gelesen und als Ganzes gespeichert; einzelne
Ebenen werden nie separat gesucht, gefiltert oder sortiert — die Reihenfolge im Array ist
bereits die Zeichenreihenfolge. Eine Ebenentabelle bräuchte für jede neue Ebeneneigenschaft
eine Schema-Änderung, der Datenblock nicht.

Alternative (a) verworfen: gleiche fehlende Prüfbarkeit auf Datenbankebene wie (b) (der
Eigenschaften-Blob bleibt so oder so unstrukturiert), zusätzlich aber eine
Reihenfolge-Spalte, ein Fremdschlüssel und mehrere Abfragen pro Speichervorgang — Kosten
ohne Gegenwert.

## Konsequenzen

- Die Datenbank prüft nichts an der internen Struktur der Ebenenliste. Die vollständige
  Validierung im Backend (Template-Editor-Plan, Phase 3) ist damit Pflicht, nicht Kür.
- Ein Bild aus dem Bildvorrat lässt sich nicht per Fremdschlüssel vor dem Löschen schützen,
  solange es noch in einem Template verwendet wird — das übernimmt eine Prüfung im
  Anwendungscode.
- Wachsen die Anforderungen (Suche/Filter über Ebenen einzelner Templates) doch noch, ist
  das eine neue ADR, keine stillschweigende Erweiterung dieser hier.
