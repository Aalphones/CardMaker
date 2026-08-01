# CardMaker

Ein generischer Sammelkarten-Generator: Templates definieren das Layout einer Karte
(Rahmen, Layer, Positionen, Datenquellen), Karteninstanzen füllen ein Template mit
konkretem Inhalt (Charakter, Bild, Texte), Druckprojekte sammeln Karten und exportieren sie
als druckfertige Bögen (DIN A4, 3×3 Karten, PDF/PNG).

Die Trennung von Layout und Inhalt bedeutet: Templates bleiben unverändert, Karten sind
jederzeit neu renderbar, und das System ist nicht auf einen bestimmten Kartentyp beschränkt.

Vollständiger Projekt-Kontext, Scope und Architektur: [`AGENTS.md`](AGENTS.md) →
[`docs/PROJECT.md`](docs/PROJECT.md).

## Stack

Angular 22 + NgRx + Konva.js + Semantic CSS (Frontend) · PHP 8.5 + MySQL, kein Composer
(Backend, Strato Shared Hosting) · Python + MCP SDK (lokaler Assistant-Tool-Server).

## Quickstart

> Backend und Frontend sind noch nicht gescaffoldet — das ist der erste Implementierungsschritt.
> Sobald `backend/` und `frontend/` existieren, hier konkrete Befehle ergänzen
> (`composer install`, `npm install`, Dev-Server-Start, Migrationslauf).

## Status

Projekt in der Konzeptions-/Setup-Phase. Nächster Schritt: erster Plan aus
[`docs/PROJECT.md`](docs/PROJECT.md) (Meilenstein 1 — Grundgerüst).
