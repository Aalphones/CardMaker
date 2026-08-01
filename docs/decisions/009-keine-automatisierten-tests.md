# 009 — Keine automatisierten Tests

**Status:** Akzeptiert (2026-08-01)

## Kontext

`docs/conventions/testing.md` schrieb ursprünglich Unit-Test-Pflicht für Fachlogik vor, mit
dem Argument, ein Rechenfehler im Rendering (Einheiten-Umrechnung, Auto-Shrink,
Bogenaufteilung) falle sonst erst am gedruckten Ergebnis auf, nicht beim Build. Das Argument
bleibt inhaltlich richtig — die Abwägung für dieses Fundament fällt trotzdem anders aus: ein
Solo-Projekt ohne Bau-Automatik (ADR-006) zahlt für eine Testsuite laufende Pflegekosten,
und ohne automatischen Durchlauf (kein CI, siehe ADR-006) verrottet eine Testsuite
erfahrungsgemäß, statt Sicherheit zu geben.

## Optionen

- (a) Testpflicht für Fachlogik wie ursprünglich in `testing.md` geplant.
- (b) Tests nur für den Rechenkern, erst ab dem Rendering-Plan (Meilenstein 4).
- (c) Gar keine Tests — Prüfung ausschließlich über manuellen Abnahme-Rundgang.

## Entscheidung

**(c) für dieses Fundament.** Geprüft wird über den Abnahme-Rundgang im Plan
(`docs/planning/2026-08-01_fundament-und-grundgeruest/README.md`). Für dieses Fundament ist
das vertretbar — es ist fast ausschließlich Datenverwaltung (Auth, Charaktere, Bilder), kein
Rechenkern.

## Konsequenzen

- `docs/conventions/testing.md` entfällt ersatzlos.
- `docs/conventions/dod.md` verliert die automatisierte Ebene und wird zur reinen
  Handprüfung.
- Kein Testwerkzeug im Frontend (kein Vitest/Karma), kein PHPUnit im Backend.

## Wiedervorlage — ausdrücklich festgehalten

**Vor dem Rendering-Plan (Meilenstein 4) wird diese Entscheidung erneut gestellt.** Dort
entstehen Einheiten-Umrechnung, automatische Textverkleinerung und Bogenaufteilung — genau
die Rechenlogik, für die das ursprüngliche Testpflicht-Argument in `testing.md` galt. Kein
stillschweigendes Fortschreiben dieser Entscheidung über das Fundament hinaus.
