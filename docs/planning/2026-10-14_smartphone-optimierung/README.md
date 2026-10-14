# Smartphone-Optimierung aller Bildschirme

**Ziel:** Jeder Bildschirm von CardMaker ist auf einem Smartphone (ab 360 px Breite, Hochformat) ohne seitliches Scrollen, ohne Zoomen und mit dem Daumen bedienbar. Dazu kommen einheitliche Breakpoints, größere Tippflächen auf Touch-Geräten und für das Smartphone eigene Bedienelemente: eine Tab-Leiste unten statt der Seitenspalte, ein Aktionsmenü an den Kartenkacheln, Reiter „Formular/Vorschau" im Karteneditor, eine Werkzeugleiste unten und Zwei-Finger-Zoom im Template-Editor.

**Design-Deckung:** Der verbindliche Handoff `docs/design/handoff-organic/` enthält **keine** Smartphone-Ansichten (einzige Breitenangabe: die Anmeldekarte `min(380px, 100%)`). Alle Smartphone-Strukturen in diesem Plan sind **freihändig nach Konzept** festgelegt (Freigabe durch Sascha bei der Plan-Abnahme). Farben, Schriften, Radien und Schatten kommen weiterhin ausschließlich aus den bestehenden Zweck-Token — nur Anordnung und Größen ändern sich.

## Overview

| Phase | Thema | Tier | Status |
|---|---|---|---|
| [1](phase-1-fundament.md) | Fundament: Breakpoints, Touch-Größen der Bausteine, gestapelte Tabelle, Menü-Baustein, Dialog-Breite, ADR-028 | standard | complete |
| [2](phase-2-app-shell.md) | App-Shell: Tab-Leiste unten + „Mehr"-Blatt, kompakte Kopfzeile, Meldungen | standard | complete |
| [3](phase-3-listen.md) | Alle Karten, Templates, Kartengruppen (Liste + Formular) | standard | complete |
| [4](phase-4-weitere-seiten.md) | Bildvorrat, Zugriffstoken, Bild-Prompts, Anmeldung, Druckprojekt | standard | complete |
| [5](phase-5-karteneditor.md) | Karteneditor: Reiter Formular/Vorschau, feste Aktionsleiste, Bildablage per Tippen | standard | complete |
| [6](phase-6-template-editor-layout.md) | Template-Editor: Kopfzeile, Werkzeugleiste unten, Spalten als Blätter, Dialoge | standard | complete |
| [7](phase-7-template-editor-gesten.md) | Template-Editor: Zwei-Finger-Zoom/-Verschieben, größere Anfasser, Ebenen per Touch | heikel | complete |
| [8](phase-8-doku-und-abschluss.md) | Doku & Abschluss | mechanisch | pending |

## Begriffe (gelten in allen Phasen)

- **Smartphone-Breite** = Fensterbreite ≤ 600 px (Mixin `bp.phone`).
- **Schmal** = ≤ 900 px (Mixin `bp.narrow`, bestehender Wert von Shell und Karteneditor).
- **Editor-schmal** = ≤ 999 px (Mixin `bp.editor-narrow`, bestehender Wert des Template-Editors).
- **Touch-Gerät** = grober Zeiger, `(pointer: coarse)` (Mixin `bp.touch`, in TypeScript `isCoarsePointer()`). Gilt unabhängig von der Breite, also auch für Tablets.
- **Tippfläche** = mindestens `var(--touch-target-min)` (2,75 rem = 44 px) in Breite und Höhe.
- **Blatt** = eine Fläche, die von unten über den Inhalt fährt (englisch „bottom sheet").

## Kontrakt (phasenübergreifend)

- Breakpoint-Mixins aus `frontend/src/styles/_breakpoints.scss`, in Komponenten eingebunden mit `@use 'breakpoints' as bp;` (Phase 1 macht das über `stylePreprocessorOptions.includePaths` möglich). **Keine** nackten `@media (max-width: …)`-Zahlen mehr in Komponenten.
- Neue Zweck-Token in `styles.scss`: `--shell-tabbar-height: 3.75rem;` und `--editor-toolbar-height: 3.5rem;`.
- `frontend/src/app/shared/services/pointer.ts` exportiert `isCoarsePointer(): boolean` — die einzige Stelle in TypeScript, die `(pointer: coarse)` abfragt.
- Neue Bausteinklassen in `_bausteine.scss`: `.table--stack` (Tabelle als gestapelte Zeilen auf Smartphone-Breite, Zellbeschriftung aus `data-label`) und `.menu` + `.menu__item` (+ `--danger`) für Aufklappmenüs mit `@angular/cdk/menu`.

## Finale Abnahmekriterien (Gesamtergebnis)

1. Auf 360 × 740 px (Chrome-Gerätemodus) zeigt **kein** Bildschirm einen waagrechten Bildlaufbalken: Anmeldung, Alle Karten (Raster und Tabelle), Karteneditor, Kartengruppen (Liste, Formular), Templates, Template-Editor, Bildvorrat, Bild-Prompts, Druckprojekt, Zugriffstoken.
2. Auf Smartphone-Breite steht die Navigation als Tab-Leiste unten (Karten, Gruppen, Templates, Druck, Mehr); „Mehr" öffnet ein Blatt mit Bildvorrat, Bild-Prompts, Zugriffstoken und Abmelden.
3. Auf einem Touch-Gerät ist jede Schaltfläche, jedes Eingabefeld und jeder Umschalter mindestens 44 px hoch; Tippen in ein Eingabefeld zoomt iOS Safari **nicht** heran.
4. Im Karteneditor auf Smartphone-Breite schalten Reiter zwischen Formular und Vorschau um; Abbrechen/Herunterladen/Speichern bleiben unten sichtbar, während das Formular scrollt.
5. Im Template-Editor auf einem echten Smartphone: zwei Finger zoomen und verschieben die Karte, ein Finger verschiebt/skaliert die ausgewählte Ebene, die Werkzeugleiste unten öffnet Ebenen und Eigenschaften als Blatt.
6. Oberhalb von 900 px sieht jeder Bildschirm aus wie vorher (Regressionsprüfung am Desktop, 1440 × 900).
7. `npm run build` (Produktion) läuft ohne Budget-Fehler durch; `npm run lint` ist grün.

## Smoke-Checkliste (User, am Plan-Ende) — Wackelstellen zuerst

1. **Template-Editor auf dem echten Smartphone:** Ebene mit einem Finger anfassen, zweiten Finger dazunehmen → das Verschieben der Ebene bricht ab, stattdessen zoomt die Karte. Danach Rückgängig drücken: höchstens ein kleiner Versatz der Ebene wird zurückgenommen. (Wie: nach Deploy auf dem Telefon öffnen.)
2. **Karteneditor, feste Aktionsleiste:** langes Template, Formular nach unten scrollen → Speichern bleibt über der Tab-Leiste sichtbar und wird nicht von ihr verdeckt. (Wie: Chrome-Gerätemodus „iPhone SE" und echtes Telefon.)
3. **Karteneditor, Reiter wechseln:** Vorschau → Formular → Vorschau: die Karte erscheint wieder in voller Größe (nicht leer, nicht winzig), Bild ziehen funktioniert.
4. Druckprojekt auf dem Telefon: „PDF" lädt die Datei herunter statt einen leeren Druckdialog zu zeigen.
5. Alle Karten auf dem Telefon: „⋯" an einer Kachel öffnet das Menü mit Drucken, Duplizieren, Herunterladen, Löschen; jede Aktion funktioniert.
6. „Mehr"-Blatt: öffnet, schließt mit Tippen daneben, mit Escape und nach Auswahl eines Eintrags.
7. Desktop 1440 × 900: Shell, Karteneditor, Template-Editor unverändert (Seitenspalte links, beide Editorspalten fest).
8. Tablet-Breite 768 px: Navigation wie bisher als Leiste oben, nicht als Tab-Leiste.

## Bewusst außen vor (Scope-Grenze)

- **Querformat-Sonderlayouts.** Ein Telefon im Querformat ist 640–930 px breit und fällt damit in „schmal" (Tablet-Verhalten). Kein eigenes Layout.
- **Ein-Finger-Verschieben der Bühne im Template-Editor.** Ein Finger gehört der Ebene (auswählen, ziehen, Anfasser); die Bühne bewegt sich nur mit zwei Fingern. Grund: sonst entscheidet die Position des Fingers zwischen zwei völlig verschiedenen Handlungen.
- **Tastenkürzel-Übersicht auf Touch-Geräten.** Der „?"-Knopf wird dort ausgeblendet, die Kürzel selbst bleiben (Bluetooth-Tastatur).
- **PWA/Offline** bleibt ausgeschlossen (ADR-003).
- **Kein neues Design-Handoff.** Wird ein Smartphone-Entwurf später nachgeliefert, ersetzt er die freihändigen Strukturen in einem Folgeplan.

## Konfidenz-Ausweis

- **Abbruch eines laufenden Konva-Ziehens beim zweiten Finger (Phase 7).** `draggable` hängt nicht an `panning` (`draw-items.ts` → `interactionConfig`), deshalb bricht Phase 7 das Ziehen ausdrücklich mit `stopDrag()`/`stopTransform()` ab. Ob dabei ein `dragend` mit Versatz in den Verlauf geht, zeigt erst das echte Gerät → Smoke-Punkt 1.
- **Feste Aktionsleiste im Karteneditor (Phase 5).** `position: sticky` braucht den Fensterbildlauf; `.shell__content` hat `overflow-y: auto` und wäre sonst der Bezugskasten. Phase 2 setzt es auf Smartphone-Breite auf `overflow: visible` — geprüft per Gerätemodus → Smoke-Punkt 2.
- ~~CDK-Dialog-Vorgaben~~ — beim Planen geprüft: `dialog.mjs` (CDK 21.2.14) rechnet `this._defaultOptions || new DialogConfig()`, ein eigener `DEFAULT_DIALOG_CONFIG` ersetzt die Vorgaben also vollständig. Phase 1 breitet deshalb `new DialogConfig()` aus. `@angular/cdk/menu` ist in derselben Version vorhanden (`fesm2022/menu.mjs`).

Fehlerklassen geprüft: im Wissens-Vault gibt es keine Einträge zu Angular, Konva oder SCSS — die einschlägigen Fallen stehen deshalb direkt als Prüfpunkte in den Phasen.

## Nebenbefunde (nicht Teil dieses Plans)

- Zwei ADRs tragen die Nummer 020 (`020-karteninhalt-als-datenblock.md`, `020-gemeinsamer-webroot-mit-pfaden.md`). Neue Nummer dieses Plans ist deshalb 028; die Doppelung selbst bleibt offen.

## Summary

## Files touched

## Commits

## Deviations from plan

## Follow-ups
