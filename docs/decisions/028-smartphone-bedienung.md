# 028 — Smartphone-Bedienung: Breite für die Anordnung, Zeigerart für die Tippflächen

**Status:** Akzeptiert (2026-10-14)

## Kontext

Der Design-Handoff enthält keine Smartphone-Ansichten. Bisher gab es drei verstreute Media-Queries mit nackten Zahlen (Shell und Karteneditor 900 px, Template-Editor 999 px). Die App soll ab 360 px Breite ohne seitliches Scrollen und mit dem Daumen bedienbar sein.

## Optionen

- (a) **Nur Touch-Abfrage** (`pointer: coarse`). Ein schmales Desktop-Fenster bliebe unbedienbar eng, ein Tablet bekäme das Smartphone-Layout.
- (b) **Nur Breite.** Ein großes Tablet mit Finger bekäme zu kleine Tippflächen.
- (c) **Breite für die Anordnung, `pointer: coarse` für die Tippflächen.**

## Entscheidung

**(c).** Breakpoints 600 px (Smartphone), 900 px (schmal), 999 px (Template-Editor schmal); Tippfläche mindestens 44 px, Eingabeschrift 16 px (darunter zoomt iOS Safari beim Antippen heran). Muster: Tab-Leiste unten statt Seitenspalte, Aktionsmenü statt Icon-Reihe, Reiter statt Nebeneinander, Blätter statt Seitenspalten, zwei Finger für die Bühne im Template-Editor.

## Konsequenzen

- Breakpoint-Zahlen stehen nur in `frontend/src/styles/_breakpoints.scss`; Komponenten nutzen die Mixins `phone`, `narrow`, `editor-narrow`, `touch`.
- In TypeScript fragt nur `shared/services/pointer.ts` die Zeigerart ab.
- Alle Smartphone-Strukturen sind freihändig festgelegt; ein später nachgelieferter Entwurf ersetzt sie in einem Folgeplan.
