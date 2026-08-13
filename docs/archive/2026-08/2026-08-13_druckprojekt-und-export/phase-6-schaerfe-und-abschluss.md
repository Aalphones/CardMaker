# Phase 6 — Schärfe-Hinweis und Abschluss

Rating: **standard**

## Kontext (vorher lesen)

- `frontend/src/app/shared/canvas/rendering/card-content.ts` — `CardImagePlacement`
  (`width`/`height` sind die Originalmaße der Datei in Bildpunkten) und `cardImageBox()`
- `frontend/src/app/shared/canvas/rendering/card-render-input.ts` — `buildRenderInput`
- `frontend/src/app/shared/canvas/rendering/layer.ts` — Bildflächen-Geometrie
- README dieses Plans → finale Abnahmekriterien

## Die Rechnung (verbindlich)

Eine Canvas-Einheit ist ein Zehntel Millimeter, also gilt für die gezeichnete Breite eines
Motivs in Einheiten:

```
effektiveDpi = placement.width / (cardImageBox(fläche, placement).width / 254)
```

(`/254`, weil `einheiten / 10` Millimeter und `/ 25,4` Zoll ergibt.) Liegt der Wert unter
`PRINT_DPI` (300), ist das Motiv zu grob. Es wird **nichts geladen** — beide Größen stehen
bereits im Karteninhalt.

## Abnahmekriterien

- Über den Export-Knöpfen steht bei Bedarf eine Zeile in Klartext, etwa: „3 Karten haben ein
  Motiv, das für sauberen Druck zu grob ist (unter 300 Bildpunkte je Zoll): Feuerdrache,
  Wasserfee, Erdgolem. Der Druck ist trotzdem möglich, diese Motive wirken unscharf."
- Bei mehr als fünf betroffenen Karten werden fünf Namen genannt und der Rest gezählt
  („… und 4 weitere").
- Die Zeile blockiert nichts und ist keine Fehlermeldung (Hinweis-Optik, nicht rot).
- Karten ohne Motiv und Karten, deren Motive alle über 300 DPI liegen, tauchen nicht auf.

## Checkliste

- [x] `frontend/src/app/shared/canvas/rendering/image-sharpness.ts` — reine Funktion
      `lowResolutionLayers(input: CardRenderInput): string[]` (Ebenennamen) samt
      `effectiveDpi()`; Kommentar mit der Herleitung der 254.
- [x] In der Druckprojekt-Seite über alle Positionen prüfen (der Karteninhalt kommt über
      `CardRenderSource`, einmal je Karten-Kennung, beim Laden der Seite) und die Hinweiszeile
      bauen.
- [x] Doc-Abgleich zum Plan-Ende: `docs/code-map.md`, `docs/models.md`, `docs/routes.md`,
      `docs/conventions/stack.md` gegen den Ist-Stand lesen — nichts Veraltetes stehen lassen.
      (Nur `code-map.md` betroffen — Backend/Routen/Stack unverändert in dieser Phase.)
- [x] `docs/PROJECT.md`: Meilenstein 5 als erledigt markieren (mit Datum und Archivpfad). Die
      „offene Frage zur Druckauflösung" existierte in `STATE.md` zum Zeitpunkt dieses Checklisten-
      Punkts nicht mehr (Abschnitt „Offene Fragen" stand bereits auf „keine offenen Fragen") —
      nichts zu schließen.
- [x] `STATE.md` auf Meilenstein 6 (MCP-Server) als nächsten Schritt zeigen lassen.
- [x] Plan-Ordner nach `docs/archive/2026-08/` verschieben, Bottom-Sektionen der README
      füllen.

## Report-Back

Schärfe-Hinweis steht: `image-sharpness.ts` rechnet die effektive DPI je Bildebene aus
Originalmaß und gezeichneter Größe, die Druckprojekt-Seite lädt den Karteninhalt einmal je
Karte und zeigt eine Klartext-Zeile neben dem Export-Ergebnis, wenn mindestens eine Karte
betroffen ist. Build, Typen und Lint sind grün; keine Abweichungen vom Plan.
