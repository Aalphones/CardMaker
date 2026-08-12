# Vorschaubilder für Templates und Karten

Die Template-Übersicht zeigt heute nur Name, Ebenenzahl und Änderungsdatum — das Layout selbst
bleibt unsichtbar, weil die Listen-Abfrage die Ebenen gar nicht mitliefert
(`TemplateRepository::allSummaries()`). Dieser Plan legt beim Speichern im Editor ein
Vorschaubild an, speichert es im Backend und zeigt es als Kachelbild in der Übersicht.

**Gewählter Weg (Sascha, 2026-08-12):** Bild beim Speichern erzeugen und ablegen — nicht in der
Liste live rendern. Begründung und Verworfenes stehen in ADR-021 (wird in Phase 1 geschrieben).

**Karten sind mitgeplant (Sascha, 2026-08-12).** Das Backend aus Phase 1 und der Bild-Lader aus
Phase 3 tragen beide Sorten. Die Kartenliste selbst und das Erzeugen des Kartenbildes gehören
dem Karteneditor-Plan (`2026-08-10_karteneditor/`, Phasen 5 und 7) — dessen Phasen-Dateien sind
am 2026-08-12 entsprechend angepasst worden und benutzen die Bausteine von hier. **Dieser Plan
baut keine Kartenliste**, sonst hätte der Screen zwei Eigentümer.

Damit entfällt im Karteneditor-Plan die geplante Live-Zeichnung je Kachel samt
Sichtbarkeits-Beobachter — das dort notierte Risiko „sehr viele Konva-Bühnen gleichzeitig"
löst sich auf.

## Phasen

| # | Phase | Datei | Rating | Status |
|---|---|---|---|---|
| 1 | Ablage und Endpunkte im Backend (Templates **und** Karten) | `phase-1-backend-ablage.md` | standard | complete |
| 2 | Template-Editor erzeugt das Bild und lädt es hoch | `phase-2-editor-export.md` | heikel | complete |
| 3 | Gemeinsamer Bild-Lader, Template-Übersicht zeigt die Vorschau | `phase-3-uebersicht.md` | standard | complete |

**Reihenfolge:** Dieser Plan läuft **vor** Phase 5 des Karteneditor-Plans. Sonst baut die
Kartenliste ihre Kacheln auf einem Baustein, den es noch nicht gibt.

## Kontrakt (Backend ↔ Frontend)

Wird in Phase 1 gebaut, in Phase 2/3 benutzt. Ändert sich hier etwas, ändert es sich für beide.

Templates und Karten bekommen **dieselben** Endpunkte, nur unter ihrem eigenen Pfad — im Text
unten steht `<sorte>` für `templates` oder `cards`.

**Neue Felder an bestehenden Antworten** — `GET /api/<sorte>` (jeder Eintrag in `items`),
`GET /api/<sorte>/{id}`, sowie die Antworten von `POST`/`PATCH`:

```
previewUpdatedAt: string | null   // ISO-Zeitstempel, null = es gibt noch kein Bild
```

**`POST /api/<sorte>/{id}/preview`** — multipart/form-data, ein Feld `file` mit einem PNG.

```
201 { "previewUpdatedAt": "2026-08-12T09:15:00+00:00" }
404 Template bzw. Karte gibt es nicht
422 { error: "validation_failed", details: { file: "<Grund>" } }   // kein PNG, zu groß, kaputt
```

**`GET /api/<sorte>/{id}/preview/file`** — liefert die PNG-Datei aus (`Response::file`,
hinter der Anmeldung wie Bildvorrat und Kartenbilder). `404`, wenn es kein Bild gibt.

**Ablage:** `backend/uploads/previews/templates/` bzw. `backend/uploads/previews/cards/`,
Dateiname 32 Hex-Zeichen + `.png`, erzeugt vom Server (nie der Name vom Browser) — dasselbe
Muster wie `uploads/cards/` (ADR-017). Getrennte Ordner, damit ein Aufräum-Lauf später eine
Sorte allein anfassen kann.

**Datenbank:** je zwei neue Spalten an `templates` und `cards` (Migration
`M010AddPreviewImages`): `preview_file_name VARCHAR(191) NULL`,
`preview_updated_at DATETIME NULL`.

**Bildmaße:** 420 × 587 px (Kartenformat 630 × 880 auf Breite 420 gerechnet), PNG. Für beide
Sorten gleich — es ist dasselbe Kartenformat.

**Duplizieren einer Karte** kopiert das Vorschaubild mit (neuer Dateiname), analog zu
`CardImageService::duplicateForCard()`. Fehlt die Datei, wird stillschweigend keins gesetzt.

## Finale Abnahmekriterien

1. In der Template-Übersicht zeigt jede Kachel das Aussehen der Karte als Bild — Rahmen,
   Formen, Icons und Texte in der Anordnung, die der Editor zeigt.
2. Ein Template ohne gespeichertes Bild zeigt eine ruhige Platzhalter-Fläche mit einem
   erklärenden Satz, keine kaputte Bild-Ikone und keinen Sprung im Raster.
3. Nach dem Speichern im Editor ist das Bild in der Übersicht auf dem neuen Stand — ohne
   dass die Seite neu geladen werden muss.
4. Schlägt das Erzeugen oder Hochladen des Bildes fehl, bleibt das Speichern des Templates
   trotzdem erfolgreich; der Nutzer sieht eine Hinweismeldung, keinen Fehlerdialog.
5. Auf dem Bild sind keine Bedien-Elemente des Editors zu sehen (keine Auswahl-Anfasser,
   kein Auswahlrahmen).
6. Das Löschen eines Templates entfernt auch dessen Bilddatei.
7. Für Karten steht dieselbe Ablage bereit und ist über die Endpunkte benutzbar; ein
   Karten-Vorschaubild lässt sich hochladen, abrufen und wird beim Löschen der Karte
   mitentfernt. Die Anzeige in der Kartenliste und das Erzeugen beim Speichern baut der
   Karteneditor-Plan.

🟡 **Karten ohne Bild bleiben ohne Bild, bis sie einmal gespeichert werden.** Es gibt keinen
Nachzieh-Lauf für Bestandskarten. Das ist zurzeit folgenlos — die Kartentabelle existiert noch
gar nicht (Migration `M008` ist nie gelaufen), es gibt also keine Bestandskarten. Käme das
Feature später, wäre es ein Problem.

## Smoke-Checkliste (Sascha prüft am Plan-Ende)

Zuerst die wackligen Stellen — dort steckt das Risiko:

1. **Anfasser im Bild?** Im Editor eine Ebene auswählen (Anfasser sichtbar), dann speichern.
   In der Übersicht das Bild ansehen: dort dürfen weder Anfasser noch Auswahlrahmen sein.
2. **Schrift und Bilder im Export.** Ein Template mit eigener Schrift und einem Rahmen-Bild
   speichern. Im Bild müssen dieselbe Schrift und das Rahmen-Bild zu sehen sein — nicht die
   Ersatzschrift und keine leere Fläche.
3. **Aktualität.** Template ändern (z.B. Text), speichern, zurück zur Übersicht: die Kachel
   zeigt die Änderung, ohne Neuladen.
4. Übersicht mit einem noch nie gespeicherten Template: Platzhalter statt Bildruine.
5. Template löschen: verschwindet aus der Liste, `backend/uploads/templates/` hat eine Datei
   weniger.
6. Der Vorschau-Aufruf ohne Anmeldung (z.B. im privaten Fenster) liefert `401`, kein Bild.
7. **Raster mit Vorschaubild.** Übersicht mit mehreren Templates ansehen: werden die Kacheln
   durch das hochkant stehende Bild unangenehm lang? Falls ja, ist in
   `templates-list.scss` (`&__grid`) eine zusätzliche Regel für breite Fenster fällig — nicht
   automatisch umgesetzt, weil das eine Bildschirm-Beurteilung ist.

## Summary

Templates und Karten haben jetzt eine gemeinsame Vorschaubild-Ablage im Backend (Phase 1),
der Editor erzeugt beim Speichern ein PNG und lädt es hoch (Phase 2), und die
Template-Übersicht zeigt das Bild statt nur Name/Ebenenzahl (Phase 3). Am 2026-08-12 live
gegen Strato deployt, alle drei Migrationen (`M008`, `M009`, `M010`) angewendet, Smoke-Test
von Sascha im Browser bestätigt.

## Files touched

Backend: `PreviewImageStorage`, `TemplatePreviewService`/`CardPreviewService`,
`TemplatePreviewController`/`CardPreviewController`, Migration `M010AddPreviewImages`,
Erweiterungen an `TemplateRepository`/`CardRepository`, `TemplateService`/`CardService`,
`backend/public/index.php` (Routing).
Frontend: `template-preview.ts` (Export im Editor), `card-canvas.ts`/`.html` (Anfasser
ausblenden fürs Bild), `shared/canvas/preview-image-loader.ts` +
`shared/canvas/preview-upload.service.ts` (gemeinsamer Lader/Upload), `templates-list.ts`/
`.html`/`.scss` (Anzeige + Platzhalter), Store-Erweiterungen in `templates.actions.ts`/
`templates.feature.ts`.
Docs: `docs/decisions/021-vorschaubilder.md`, `docs/code-map.md`, `docs/models.md`,
`docs/routes.md`.

## Commits

- `c1b2295` Ablage und Endpunkte für Vorschaubilder (Templates und Karten)
- `721cd62` Template-Editor erzeugt das Bild und lädt es hoch
- `638cf26` Vorschaubild in der Template-Übersicht anzeigen
- `a53171e` Deploy gegen Strato, Migrationen M008-M010 angewendet

## Deviations from plan

Der Frontend-Dienst heißt `template-preview.ts`, nicht `template-preview.service.ts` — im
Frontend gibt es projektweit keine einzige `*.service.ts`-Datei, der Plan hatte das Suffix
noch vorgesehen.

## Follow-ups

- Kartenliste und Karteneditor-Bild-Erzeugung (Karteneditor-Plan, Phasen 5 und 7) bauen auf
  den hier entstandenen Bausteinen auf — noch offen.
- 🟡 Aus den finalen AK weiterhin gültig: Bestandskarten ohne Bild bleiben ohne Bild, bis sie
  einmal gespeichert werden (kein Nachzieh-Lauf). Aktuell folgenlos, da die Kartentabelle bis
  zum Deploy leer war.
- Punkt 7 der Smoke-Checkliste (Raster-Layout bei vielen Kacheln) war Teil der von Sascha
  bestätigten Prüfung — falls das Raster bei sehr vielen Templates doch unangenehm lang wirkt,
  ist die Stelle `templates-list.scss` (`&__grid`).
