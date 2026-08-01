# Testing Conventions — CardMaker

> Anders als Promptigofant (ADR-017 dort: keine automatisierten Tests) gilt hier die
> User-Baseline-Regel: **Features werden mit Unit-Tests abgesichert**, aber gezielt, nicht
> flächendeckend — siehe Begründung unten.

## Policy

- **Pflicht: Unit-Tests für reine Business-Logik.** Rendering-Mathematik (Layer-Kompositing,
  Auto-Shrink-Algorithmus, Druckbogen-Layout, Canvas-Einheiten-Skalierung), Validatoren,
  Backend-Services ohne HTTP-Wissen, NgRx-Selektoren/Reducer mit nicht-trivialer Logik.
  Genau die Stellen, an denen ein stiller Rechenfehler erst beim gedruckten Ergebnis auffällt
  — nicht beim Build, nicht beim Type-Check.
- **Kein Zwang für UI-Komponenten/E2E.** Component-Rendering, Konva-Canvas-Interaktion und
  Editor-Flows werden manuell smoke-getestet (siehe [`dod.md`](dod.md)) — ein Solo-Projekt
  ohne CI-Browser-Farm rechtfertigt den Aufwand für Component-/E2E-Suiten nicht.
- **Kein Baseline von „bekannten" fehlschlagenden Tests.** Ein grüner Testlauf ist der einzig
  akzeptable Zustand für das, was getestet wird.

## Warum nicht wie Promptigofant

Promptigofant ist überwiegend CRUD über eine Charakter-/Bild-Bibliothek — DoD-Checklisten und
manuelles Smoke-Testing reichen dort. CardMaker hat einen echten Rechenkern (Auto-Shrink,
Layer-Kompositing, DPI-Skalierung, Druckbogen-Layout), der bei einem stillen Fehler falsch
gedruckte Karten erzeugt, nicht nur eine falsche Anzeige. Genau dieser Kern ist reine
Funktionslogik ohne HTTP-/DOM-Abhängigkeit — billig zu testen, teuer zu debuggen, wenn er es
nicht ist.

## Stack

| Layer | Tool |
|---|---|
| PHP Unit-Tests | PHPUnit (Backend `Services/`, `Rendering/`, `Validators/`) |
| TypeScript Unit-Tests | Vitest oder Jasmine/Karman via `ng test` (Frontend Selektoren, Pipes, reine Funktionen) — Wahl im ersten Plan treffen |

## Was NICHT getestet wird

- Component-Templates/Rendering (manuelles Smoke-Testing)
- Konva-Canvas-Interaktionen (Drag/Zoom/Rotate) — visuell verifiziert, nicht per E2E
- HTTP-Controller-Layer direkt (dünn genug, dass ein Bug dort beim Smoke-Test auffällt)

## Critical Rules

1. **Rendering-/Kompositing-Logik ohne Unit-Test wird nicht gemerged** — das ist der Kern,
   den dieses Projekt anders behandelt als Promptigofant.
2. **Kein Test ohne Assertion, der nur „läuft durch"** — ein Test, der nichts prüft, ist
   schlimmer als keiner, weil er grüne Sicherheit vortäuscht.
3. **Bei Unsicherheit, ob etwas Business-Logik oder UI-Glue ist:** wenn es ohne HTTP/DOM
   aufrufbar ist, ist es Business-Logik → Unit-Test-Pflicht.
