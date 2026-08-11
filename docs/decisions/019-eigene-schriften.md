# 019 — Eigene Schriften: berechneter Name, Blob statt CSS-Adresse

**Status:** Akzeptiert (2026-08-11)

## Kontext

Bisher standen alle Schriften fest im Quelltext: sieben Systemschriften plus zehn
mitgelieferte Dateien (ADR siehe `frontend/public/fonts/LIZENZ.md`). Eine neue Schrift
brauchte einen Entwickler, einen Commit und ein Hochladen aufs Hosting. Der Plan
„Eigene Schriften hochladen" macht daraus einen Vorgang in der Oberfläche. Zwei Fragen
mussten dafür entschieden werden, deren Antwort später nicht mehr offensichtlich ist.

## Frage 1 — Wer vergibt den internen Schriftnamen?

### Optionen

- (a) Den in der Schriftdatei eingebetteten Namen übernehmen (z. B. per `FontFace`-Metadaten
  oder Dateiname).
- (b) Einen eigenen Namen `cmfont-<id>` vergeben, den Wunschnamen des Nutzers nur als
  Beschriftung in der Oberfläche halten.

### Entscheidung

**(b).** Der in einer Schriftdatei eingebettete Name ist beliebig, oft falsch und kann im
schlimmsten Fall mit einer Systemschrift kollidieren (z. B. eine Datei, die sich selbst
„Arial" nennt) — das `@font-face`/`FontFace`-Objekt im Browser würde dann leise die falsche
Schrift überschreiben oder von ihr überschrieben werden. Beim Laden im Browser bestimmen wir
den `family`-Namen für das `FontFace`-Objekt ohnehin selbst (ADR-Frage 2 unten), also kostet
die eigene Vergabe nichts zusätzlich.

## Frage 2 — Wie kommt die Datei ins Canvas?

### Optionen

- (a) `@font-face` mit `url(...)` auf die API-Adresse, wie bei klassischem Web-CSS.
- (b) Datei als Blob abrufen (mit Anmeldekopfzeile), daraus ein `FontFace`-Objekt bauen und
  in `document.fonts` eintragen — derselbe Weg wie bei hochgeladenen Bildern
  (`asset-image-loader.ts`, ADR-015).

### Entscheidung

**(b).** Schriften liegen wie Bilder hinter der Anmeldung. Ein `@font-face` mit `url(...)`
schickt die Anmeldekopfzeile nicht mit — der Abruf läuft in ein 401, und zwar **still**: der
Browser fällt lautlos auf die Ersatzschrift zurück, es gibt keine Fehlermeldung, keinen
kaputten Bereich, nur eine falsch aussehende Karte. Genau dieses Verhalten war der Auslöser,
dieselbe Blob-Strategie wie bei den Bildern zu wählen: Datei angemeldet per `fetch` holen,
daraus `new FontFace(family, blob)` bauen, `document.fonts.add(...)`.

## Konsequenzen

- Die Ebene im Template speichert `cmfont-7`, der Editor zeigt daneben den Wunschnamen
  („Matura MT Script Capitals") — zwei getrennte Werte, die nie verwechselt werden dürfen
  (`family` vs. `name`, siehe Kontrakt in der Plan-README).
- `font-loader.ts` (`frontend/src/app/shared/canvas/`) übernimmt für hochgeladene Schriften
  denselben Blob-Weg wie `asset-image-loader.ts` für Bilder — mitgelieferte Schriften laufen
  weiter über `document.fonts.load` auf die öffentliche `@font-face`-Adresse in
  `_kartenschriften.scss`.
- Konva zeichnet auf ein Bitmap — das zählt für den Browser nicht als Schriftverwendung.
  Ohne die explizite `document.fonts`-Anforderung bliebe die Ersatzschrift auch bei korrekt
  geladener Datei still stehen (kein Fehler, nur falsches Bild) — das gilt für eingebaute wie
  hochgeladene Schriften gleichermaßen und ist der Grund, warum `font-loader.ts` überhaupt
  existiert.
- Löschen einer benutzten Schrift ist gesperrt (409 mit Hinweis auf das Template) — dieselbe
  Regel wie bei Bildern (ADR-015), aus demselben Grund: eine Ebene mit `font_family: cmfont-7`
  darf nie auf eine nicht mehr existierende Schrift zeigen.
