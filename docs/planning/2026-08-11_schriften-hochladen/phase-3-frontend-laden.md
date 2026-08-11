# Phase 3 — Schrift im Browser laden

Die hochgeladene Schrift muss im Canvas ankommen. Das ist die Phase, in der es still
schiefgehen kann: Fehlt die Schrift, zeichnet Konva klaglos die Ersatzschrift weiter — man
sieht kein rotes Kreuz, sondern nur eine Karte, die „irgendwie anders" aussieht.

## Vorher lesen

- `README.md` dieses Plans → „Die zwei Entscheidungen"
- `frontend/src/app/shared/canvas/font-loader.ts` — der bestehende Lader für die
  mitgelieferten Schriften; er wird hier erweitert, nicht ersetzt
- `frontend/src/app/shared/canvas/asset-image-loader.ts` — **das Vorbild** für den Blob-Weg
  hinter der Anmeldung (`api.getBlob(...)`)
- `frontend/src/app/shared/canvas/rendering/fonts.ts` — `renderFontFamily()`,
  `isSelfHostedFont()`, `FontFamily`
- `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` — `requestedFontFamilies()`
- `frontend/src/app/core/services/api.ts`
- `docs/conventions/angular.md`, `docs/conventions/state-management.md`

## Abnahmekriterien

- Eine Textebene mit `fontFamily: "cmfont-7"` wird im Canvas in der hochgeladenen Schrift
  gezeichnet, nicht in der Ersatzschrift — nach dem Öffnen des Editors ohne weiteres Zutun.
- Automatisches Verkleinern misst dieselbe Schrift, die gezeichnet wird: ein zu langer Text
  in einer hochgeladenen Schrift schrumpft passend, nicht nach Ersatzschrift-Maß.
- Ist die Schrift noch nicht geladen, wird die Ersatzschrift gezeichnet und **danach**
  automatisch auf die richtige gewechselt (kein Neuladen der Seite nötig).
- Schlägt das Laden fehl, bleibt die Ersatzschrift stehen und es steht eine Warnung in der
  Browser-Konsole — die Anwendung bricht nicht ab.
- Jede Schrift wird höchstens einmal geladen, auch wenn zehn Ebenen sie benutzen.

## Checkliste

- [x] `FontFamily` in `fonts.ts` erweitern: bisher eine Aufzählung fester Namen, künftig
      `EingebauteSchrift | \`cmfont-${number}\`` (Vorlagen-Literaltyp). Die Hilfsfunktionen
      `isSelfHostedFont`/`renderFontFamily` müssen mit einem unbekannten `cmfont-…` umgehen
      können, ohne zu werfen.
- [x] `renderFontFamily()` um den hochgeladenen Fall erweitern: solange nicht geladen, die
      Ersatzschrift `sans-serif` zeichnen. **Diese Funktion bleibt die einzige Stelle**, die
      entscheidet, welcher Schriftname ans Canvas geht — nicht an zwei Orten nachbauen.
- [x] `FontLoader` erweitern: Für `cmfont-<id>` die Datei über `api.getBlob('/fonts/<id>/file')`
      holen, daraus
      ```ts
      const face = new FontFace(family, await blob.arrayBuffer());
      await face.load();
      this.document.fonts.add(face);
      ```
      und danach dieselbe Meldung setzen wie bei den mitgelieferten Schriften. Der bestehende
      Weg über `document.fonts.load(...)` bleibt für die mitgelieferten Schriften unverändert.
- [x] Fehlerfall wie bisher: Warnung in die Konsole, kein erneuter Versuch, Ersatzschrift
      bleibt stehen.
- [x] Store-Slice `store/fonts/` (NgRx Classic + Facade, wie `assets`) für die Liste der
      Schriften — Namen und Nummern für die Auswahlliste. **Nicht** für die Dateien selbst:
      geladene Schriften sind kein serialisierbarer Serverzustand, die bleiben im `FontLoader`
      (dieselbe Begründung wie beim Bildlader, siehe dessen Kommentar).
- [x] Doku: `docs/code-map.md` — `font-loader.ts`-Zeile und Store-Slice ergänzt.
      `docs/clients.md` gibt es in diesem Projekt nicht (nie angelegt) — die Aufrufe stehen
      im Kontrakt der Plan-README, eine Datei nur dafür wäre eine zweite Wahrheit.
      Stattdessen `docs/conventions/state-management.md` nachgezogen (zweiter erlaubter
      HTTP-Aufruf ohne Effect + Slice-Tabelle).

## 🟡 Wo es klemmen könnte

`new FontFace(name, buffer)` benennt die Schrift beim Laden selbst um — genau darauf baut
Entscheidung 1 im README. Falls der Browser eine `.ttf` mit fehlerhaften Innentabellen
zurückweist, kommt der Fehler erst hier an, nicht beim Hochladen: Die Prüfung in Phase 1
schaut nur auf die ersten vier Bytes. **Das ist bewusst so** — eine vollständige Schriftprüfung
im PHP-Backend wäre eine eigene Bibliothek. Die Meldung im Fehlerfall muss deshalb sagen, dass
die Datei selbst nicht lesbar ist, und nicht bloß „Laden fehlgeschlagen".

## Bericht

**Status: fertig** (Build und Lint grün, Browser-Abnahme steht aus — siehe README „Finale
Abnahme", Punkte 2 und 6).

- `rendering/fonts.ts` — `FontFamily` ist jetzt `BuiltInFontFamily | \`cmfont-${number}\``.
  Dazu drei kleine Helfer (`isUploadedFont`, `uploadedFontFamily`, `uploadedFontId`), damit
  das Namensschema an genau einer Stelle steht. `renderFontFamily()` bleibt die einzige
  Entscheidungsstelle: hochgeladen + geladen → echter Name, sonst `sans-serif`.
- `font-loader.ts` — zweiter Ladeweg für hochgeladene Schriften: Blob über
  `api.getBlob('/fonts/<id>/file')`, daraus `new FontFace(family, buffer)`, `add` in
  `document.fonts`. Der Weg für die mitgelieferten Schriften ist unverändert. Fehler bei
  der Datei selbst bekommen eine eigene Meldung („für den Browser nicht lesbar"), Netz- und
  Rechtefehler die bisherige.
- `store/fonts/` — Slice mit Facade, komplett (Liste, Hochladen, Umbenennen, Löschen), damit
  Phase 4 nur noch Oberfläche baut. In `app.config.ts` eingehängt.
- `card-canvas.ts` blieb unangetastet: Es fordert schon heute jede Schriftfamilie der Ebenen
  beim Lader an — für `cmfont-…` greift derselbe Weg.

### Was hier bewusst nicht passiert ist

Die Auswahlliste im Editor kennt die hochgeladenen Schriften noch nicht (`FONT_GROUPS` ist
unverändert) — das ist Phase 4. Wer heute eine Karte mit `cmfont-…` öffnet, sieht sie
richtig gezeichnet; auswählen kann er sie noch nicht.
