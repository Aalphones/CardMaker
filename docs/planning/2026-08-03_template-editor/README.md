# Template-Editor (Meilenstein 2)

Zweiter Umsetzungsplan für CardMaker. Bringt das Projekt von „eingeloggt, Kartengruppen
angelegt" auf „ich baue mir ein Kartenlayout und sehe es beim Bauen".

**Ergebnis am Ende:** Du legst ein Template an, lädst ein Rahmenbild hoch, setzt Layer
darauf (Bildfläche, Formen, Icons, Rahmen, Textfelder), schiebst sie direkt im Bild an die
richtige Stelle und speicherst. Nach dem Neuladen ist alles unverändert da. Was du siehst,
ist das Layout — noch ohne konkrete Karteninhalte, die kommen mit dem Karteneditor
(Meilenstein 3).

---

## Leitplanken dieses Plans

Vier Festlegungen, die alles Weitere prägen — jede kostet etwas, jede ist bewusst:

- **Das Layout liegt als ein Datenblock in einer Spalte**, nicht als Tabelle mit einer Zeile
  pro Ebene (ADR-014). Ein Template wird immer als Ganzes geladen und gespeichert; einzelne
  Ebenen werden nie separat abgefragt.
- **Hochgeladene Bilder liegen außerhalb des Webbereichs** und werden vom Programm
  ausgeliefert, nicht vom Webserver (ADR-015). Damit gilt die Anmeldepflicht auch für Bilder,
  und ein hochgeladenes Bild kann auf dem Server nichts ausführen.
- **Nur PNG, kein SVG.** Abweichung vom Konzeptdokument, begründet in ADR-015: SVG ist eine
  ausführbare Datei, und beim späteren Drucken in hoher Auflösung rastern die Browser SVG
  uneinheitlich. Bleibt als Rückstellung notiert.
- **Kein Rückgängig/Wiederherstellen.** Absicherung gegen Fehlgriffe ist stattdessen:
  Änderungen werden erst beim Speichern verbindlich, und wer die Seite mit ungespeicherten
  Änderungen verlässt, wird gefragt (der Wächter dafür existiert schon).

---

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Entscheidungen & Datenmodell festhalten](phase-1-entscheidungen-und-datenmodell.md) | mechanisch | done |
| 2 | [Bildvorrat im Backend](phase-2-bildvorrat-backend.md) | heikel | done |
| 3 | [Templates im Backend](phase-3-templates-backend.md) | standard | done |
| 4 | [Templates im Frontend: Speicher, Liste, Anlegen](phase-4-templates-frontend.md) | standard | pending |
| 5 | [Kartenvorschau auf Konva](phase-5-kartenvorschau.md) | heikel | pending |
| 6 | [Ebenenliste & Eigenschaften](phase-6-ebenenliste-und-eigenschaften.md) | heikel | pending |
| 7 | [Direkt im Bild bearbeiten](phase-7-direkt-im-bild-bearbeiten.md) | heikel | pending |
| 8 | [Doku-Abgleich & Abnahme](phase-8-doku-und-abnahme.md) | mechanisch | pending |

Reihenfolge ist bindend. Einzige Ausnahme: Phase 5 hängt nur am Datenmodell unten, nicht am
Backend — sie darf vor 2/3 gebaut werden, wenn es zeitlich besser passt.

---

## Datenmodell und Schnittstelle (verbindlich)

Der Kontrakt steht hier und nirgends sonst. Alle Phasen bauen gegen genau diese Liste.
Antworten immer JSON, Feldnamen nach außen in camelCase (Regel aus `docs/conventions/php.md`).
Fehlerformat und Fehlercodes unverändert aus Meilenstein 1.

### Bildvorrat

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/assets` | `{ items: [Asset] }`, optional gefiltert per `?kind=frame` oder `?kind=icon` |
| `POST` | `/api/assets` | `multipart/form-data` mit `file`, `kind`, `name` → `201` + `Asset` |
| `GET` | `/api/assets/{id}/file` | Die Bilddatei selbst, `Content-Type: image/png` |
| `DELETE` | `/api/assets/{id}` | → `204`; benutzt ein Template das Bild noch: `409` |

```
Asset = {
  id: number,
  kind: 'frame' | 'icon',
  name: string,
  mimeType: string,                     // immer "image/png"
  byteSize: number,
  width: number,                        // Pixel der hochgeladenen Datei
  height: number,
  createdAt: string                     // ISO-8601
}
```

### Templates

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/templates` | `{ items: [TemplateSummary] }` — ohne `layers`, für die Liste |
| `POST` | `/api/templates` | `{ name, description? }` → `201` + `Template` mit leerer Ebenenliste |
| `GET` | `/api/templates/{id}` | → `Template` (mit `layers`) |
| `PATCH` | `/api/templates/{id}` | Teilaktualisierung, auch `layers` als Ganzes → `Template` |
| `DELETE` | `/api/templates/{id}` | → `204` |

```
TemplateSummary = { id, name, description | null, layerCount, createdAt, updatedAt }
Template        = { id, name, description | null, layers: Layer[], createdAt, updatedAt }
```

`layers` ist **immer die vollständige Liste**. Es gibt keine Einzel-Ebenen-Pfade: Wer eine
Ebene ändert, schickt die ganze Liste. Die **Reihenfolge im Array ist die Zeichenreihenfolge**
— Index 0 liegt zuunterst.

### Die fünf Ebenentypen

Jede Ebene hat diese vier Felder:

| Feld | Typ | Regel |
|---|---|---|
| `id` | string | Vom Frontend erzeugt (`crypto.randomUUID()`), bleibt über Speichern hinweg stabil |
| `type` | string | `image` \| `shape` \| `icon` \| `frame` \| `text` |
| `name` | string | 1–80 Zeichen, frei wählbar, dient nur der Ebenenliste |
| `visible` | boolean | Ausgeblendete Ebenen erscheinen weder in der Vorschau noch beim späteren Drucken |

**Geometrie** heißt im Folgenden: `x`, `y`, `width`, `height`, `rotation`. Alle vier
Längenwerte in Canvas-Einheiten (das Canvas ist 630 × 880), `x`/`y` sind die obere linke
Ecke der ungedrehten Box, `rotation` in Grad (−360 bis 360) um diese Ecke. Werte dürfen
außerhalb des Canvas liegen — was übersteht, wird abgeschnitten.

| Typ | Felder |
|---|---|
| `image` | Geometrie, `opacity` (0–1). Die Bildfläche der späteren Karte. Welches Bild dort landet, entscheidet die Karteninstanz — das Template legt nur die Fläche fest. |
| `shape` mit `shape: 'rect'` | Geometrie, `fill` (Hex oder `null`), `opacity`, `stroke` (Hex oder `null`), `strokeWidth` (≥ 0), `cornerRadius` (≥ 0) |
| `shape` mit `shape: 'circle'` | wie `rect`, ohne `cornerRadius`. `width`/`height` sind die umschließende Box — bei gleichen Werten ein Kreis, sonst ein Oval |
| `shape` mit `shape: 'line'` | `points: [x1, y1, x2, y2]`, `stroke`, `strokeWidth`, `opacity`. Keine Geometrie, keine Füllung |
| `icon` | Geometrie, `opacity`, `source` (`static` \| `user`), `assetId` (number oder `null`), `choiceAssetIds` (number[], nur bei `source: 'user'` gefüllt) |
| `frame` | nur `assetId` (number oder `null`). Keine Geometrie — der Rahmen liegt immer vollflächig auf 0/0/630/880. **Höchstens einer pro Template**, ein zweiter wird abgelehnt |
| `text` | siehe eigene Tabelle unten |

**Textebene:**

| Feld | Typ | Regel |
|---|---|---|
| Geometrie | | `width`/`height` sind die Bounding Box, in die der Text passen muss |
| `key` | string | Feldschlüssel, unter dem die Karteninstanz (und Claude über MCP) den Text liefert. Muster `^[a-z][a-z0-9_]{0,39}$`, **eindeutig innerhalb des Templates** |
| `source` | string | `static` = der Text steht fest im Template. `user` = wird beim Kartenerstellen eingetragen |
| `defaultText` | string | max. 500 Zeichen. Bei `static` der endgültige Text, bei `user` die Vorbelegung |
| `fontFamily` | string | Aus der festen Liste (unten) |
| `fontSize` | number | 4–200 Canvas-Einheiten (40 Einheiten = 4 mm Schrifthöhe) |
| `minFontSize` | number | 4–200, muss ≤ `fontSize` sein |
| `color` | string | Hex, z. B. `#1a1a1a` |
| `align` | string | `left` \| `center` \| `right` |
| `verticalAlign` | string | `top` \| `middle` \| `bottom` |
| `lineHeight` | number | 0.5–3, einheitenlos (Vielfaches der Schriftgröße) |
| `outlineColor` | string \| null | Umrandung der Buchstaben |
| `outlineWidth` | number | ≥ 0, Canvas-Einheiten |
| `shadowColor` | string \| null | |
| `shadowBlur` | number | ≥ 0 |
| `shadowOffsetX` / `shadowOffsetY` | number | Canvas-Einheiten |
| `autoShrink` | boolean | Text automatisch verkleinern, bis er in die Box passt — bis höchstens `minFontSize` |
| `opacity` | number | 0–1 |

**Schriftenliste** (fest, in `frontend/src/app/shared/canvas/rendering/fonts.ts`): `Arial`,
`Verdana`, `Trebuchet MS`, `Georgia`, `Times New Roman`, `Courier New`, `Impact`. Eigene
Schriftdateien hochladen ist ausdrücklich **nicht** Teil dieses Plans — siehe „Nicht Teil
dieses Plans".

---

## Bildschirmaufteilung des Editors (verbindlich)

Es gibt kein Mockup; diese Beschreibung ist der Ersatz und gilt als Kontrakt. Drei Spalten
unter einer Kopfzeile, im Stil der bestehenden Seiten (dieselben Design-Tokens, BEM,
`docs/conventions/css.md`).

```
┌──────────────────────────────────────────────────────────────────┐
│ Kopfzeile: Template-Name (bearbeitbar) · Speichern · Zurück      │
├──────────────┬─────────────────────────────┬─────────────────────┤
│ Ebenen       │        Vorschau             │   Eigenschaften     │
│ (280px fest) │      (flexibel, mittig)     │   (340px fest)      │
│              │                             │                     │
│ [+ Ebene]    │   ┌───────────────┐         │  Ebene: „Titel"     │
│ ▸ Text Titel │   │               │         │  ───────────────    │
│ ▸ Rahmen     │   │  630 × 880    │         │  Position X  [ ]    │
│ ▸ Icon Selt. │   │   Karte       │         │  Position Y  [ ]    │
│ ▸ Bildfläche │   │               │         │  Breite      [ ]    │
│              │   └───────────────┘         │  …                  │
└──────────────┴─────────────────────────────┴─────────────────────┘
```

Feste Punkte, die prüfbar sind:

- **Drei Spalten nebeneinander**, mittlere Spalte flexibel, äußere fest (280 px links,
  340 px rechts).
- **Ebenenliste oben zuoberst**: Der Eintrag ganz oben in der Liste ist die Ebene, die im
  Bild ganz **vorne** liegt. Das ist die umgekehrte Reihenfolge des gespeicherten Arrays und
  entspricht dem, was jedes Grafikprogramm macht.
- **Vorschau** zeigt die Karte im Seitenverhältnis 630:880, zentriert, mit sichtbarem
  Kartenrand und einem hellen Schachbrettmuster dahinter (damit man Transparenz sieht).
- **Eigenschaftenspalte** zeigt die Felder der ausgewählten Ebene; ohne Auswahl den Satz
  „Keine Ebene ausgewählt".
- **Jedes Eingabefeld mit erklärungsbedürftigem Wert** (Schlüssel, Mindestschriftgröße,
  automatisches Verkleinern, Deckkraft, Datenquelle) trägt ein kleines Fragezeichen, das per
  Klick einen kurzen Klartext-Hinweis aufklappt. Das ist Teil der Abnahme, kein Beiwerk.
- **Unter 1200 px Fensterbreite** klappen die drei Spalten untereinander (Vorschau zuerst).

---

## Abnahmekriterien für das Gesamtergebnis

1. Du legst ein Template an, gibst ihm einen Namen und findest es in der Liste wieder.
2. Du lädst ein Rahmenbild (PNG) hoch und siehst es sofort in der Vorschau.
3. Du legst Ebenen aller fünf Typen an, benennst sie um, duplizierst und löschst sie und
   änderst ihre Reihenfolge — die Vorschau folgt jeder Änderung sofort.
4. Du ziehst eine Ebene direkt im Vorschaubild an eine andere Stelle, skalierst und drehst
   sie — die Zahlen in der Eigenschaftenspalte folgen mit.
5. Ein Textfeld mit zu langem Text schrumpft automatisch, bis es passt, aber nie unter die
   eingestellte Mindestgröße.
6. Speichern, Seite neu laden: Ebenen, Reihenfolge, Bildzuordnung und alle Werte sind
   unverändert.
7. Wer den Editor mit ungespeicherten Änderungen verlässt, wird gefragt.
8. Ein zweiter Rahmen im selben Template wird abgelehnt, mit verständlicher Meldung.
9. Ein Bild, das noch in einem Template steckt, lässt sich nicht löschen — verständliche
   Meldung statt kaputter Vorschau.
10. Jedes erklärungsbedürftige Eingabefeld hat seinen aufklappbaren Hinweis.

---

## Abnahme-Rundgang

Es gibt keine automatisierten Tests (ADR-009) — dieser Rundgang ist die einzige Prüfung.
**Oben stehen die drei Stellen, an denen ich selbst am unsichersten bin.**

1. **🔴 Lässt sich eine Ebene direkt im Bild anfassen?** Ebene auswählen, ziehen, an einer
   Ecke größer ziehen, drehen. Erwartet: Anfasser erscheinen an der ausgewählten Ebene, die
   Zahlen rechts ändern sich erst beim Loslassen, nicht bei jedem Zucken der Maus.
2. **🔴 Schrumpft der Text richtig?** Textfeld mit kleiner Box anlegen, `Standardtext` immer
   länger machen. Erwartet: Schrift wird stufenlos kleiner, stoppt bei der Mindestgröße, und
   der Rest wird dann abgeschnitten statt aus der Box zu laufen.
3. **🔴 Kommt ein großes Bild heil auf dem Server an?** 5-MB-PNG hochladen, danach die Seite
   neu laden. Erwartet: Bild ist da. Bei zu großer Datei: verständliche Meldung, kein
   stiller Abbruch, kein weißer Bildschirm.
4. Template anlegen, Namen vergeben, Liste prüfen.
5. Von jedem der fünf Ebenentypen einen anlegen. Erwartet: Vorschau ändert sich sofort.
6. Reihenfolge in der Liste umsortieren — die Vorschau folgt, das Oberste liegt vorne.
7. Ebene duplizieren → zweiter Eintrag, gleicher Inhalt, eigener Name.
8. Zweiten Rahmen anlegen wollen → wird abgelehnt, verständlich.
9. Speichern, neu laden, alles vergleichen.
10. Editor verlassen ohne Speichern → Rückfrage kommt.
11. Bild löschen, das ein Template benutzt → wird abgelehnt, verständlich.
12. Fenster schmal ziehen (unter 1200 px) → Spalten klappen untereinander, nichts überlappt.
13. Bei jedem Fragezeichen einmal klicken → Hinweis erscheint und verschwindet wieder.

---

## Risiken und Annahmen

- 🟡 **Die Ebenendaten liegen ungeprüft-verschachtelt in einer Spalte.** Ein Tippfehler im
  Frontend kann eine Struktur speichern, die die Vorschau nicht mehr zeichnen kann. Gegenmittel
  ist die vollständige Prüfung im Backend (Phase 3) — deshalb steht die Prüfregel-Tabelle
  oben so genau da. Ohne Tests ist diese Prüfung die einzige Absicherung.
- 🟡 **Kein Rückgängig.** Wer 20 Minuten schiebt und dann versehentlich eine Ebene löscht,
  hat sie verloren, solange nicht gespeichert wurde. Bewusst so entschieden; nachrüstbar,
  weil der Editor-Zustand ohnehin an einer Stelle liegt.
- 🟡 **Bilder gehen doppelt über die Leitung.** Weil sie hinter der Anmeldung liegen, lädt
  das Frontend sie einzeln über das Programm und hält sie im Speicher. Bei den paar Rahmen
  und Icons eines Solo-Werkzeugs ist das belanglos; bei hunderten Icons wäre es das nicht.
- 🟡 **Nur PNG.** Icons werden damit beim Vergrößern unscharf, wenn sie klein hochgeladen
  wurden. Faustregel für dich: Icons mindestens 512 px breit hochladen.
- 🟡 **Ebenen-Reihenfolge ist zweimal gedreht** — Array unten-nach-oben, Liste
  oben-nach-unten. Genau die Sorte Detail, die man beim Umsortieren falsch herum baut. Steht
  deshalb im Kontrakt und im Rundgang.
- 🟡 **Jede Backend-Änderung braucht weiterhin einen Doppelklick aufs Hochlade-Skript.**
  Unverändert aus Meilenstein 1.

### Wo ich mir am wenigsten sicher bin

| Stelle | Der Check, der es klärt |
|---|---|
| Anfasser zum Verschieben/Skalieren an eine per Schleife gezeichnete Ebene hängen (Phase 7) | Vor der Auswahl-Logik ein Wegwerf-Beispiel bauen: ein Rechteck, ein `ko-transformer`, Knoten per `viewChildren` + `getNode()` verbinden. Klappt das nicht, ist der Ausweg ein einzelner Anfasser-Knoten, der beim Auswählen umgehängt wird — nicht einer pro Ebene |
| Textmessung fürs automatische Verkleinern (Phase 5) | Textknoten mit fester Breite und Umbruch anlegen, Text schrittweise verlängern, `getClientRect().height` gegen die Boxhöhe halten. Liefert Konva dort keine verlässliche Höhe, wird stattdessen über die Zeilenzahl gerechnet |
| Ob ein 5-MB-Upload durch die Brücke auf Strato durchkommt (Phase 2) | Nach dem ersten Hochladen echt gegen die Serveradresse posten und die Antwort ansehen. Serverseitig gemeldet sind 128 MB Grenze — der Engpass wäre eher die Brücke als das Limit |

**Bereits geprüft, kein Risiko mehr:** `ng2-konva` 12.0.1 verlangt Angular ^21 und Konva ^10
— beides installiert, passt. Der Ablageordner `backend/uploads/` ist im Hochlade-Skript
bereits vom Abgleich ausgenommen, hochgeladene Bilder überleben also ein Deploy.

---

## Nicht Teil dieses Plans

- **Karteninstanzen** — Textfelder befüllen, Bild hochladen, zuschneiden (Meilenstein 3).
- **Drucken in Zielauflösung** und Druckbögen (Meilenstein 4/5). Die Vorschau hier zeichnet
  am Bildschirm, nicht in 300 DPI. Die Rechenteile, die beides teilen (Einheiten-Umrechnung,
  automatisches Verkleinern), entstehen aber schon hier unter
  `frontend/src/app/shared/canvas/rendering/` — ohne Konva-Abhängigkeit, damit Meilenstein 4
  sie wiederverwenden kann.
- **Rückgängig/Wiederherstellen** — bewusst zurückgestellt.
- **Eigene Schriftdateien hochladen** — die Schriftenliste ist fest. Sobald das kommt, muss
  auch das Drucken die Schrift mitbringen; das gehört in einen Zug erledigt, nicht halb.
- **SVG-Icons** — siehe ADR-015.
- **Templates teilen oder exportieren.**
- **Template duplizieren** („Vorlage kopieren") — bei der Freigabe genannt, nicht
  eingeplant. Kleiner Knopf, großer Nutzen bei Kartenserien mit kleinen Abweichungen; passt
  jederzeit nachträglich in die Template-Übersicht.

---

## Summary

_(beim Archivieren füllen)_

## Files touched

_(beim Archivieren füllen)_

## Commits

_(beim Archivieren füllen)_

## Deviations from plan

_(beim Archivieren füllen)_

## Follow-ups

_(beim Archivieren füllen)_
