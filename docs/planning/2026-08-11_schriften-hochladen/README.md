# Eigene Schriften hochladen

Bisher steht die Schriftauswahl fest im Quelltext: sieben Schriften vom Gerät, zehn
mitgelieferte Dateien. Wer eine weitere Schrift will, braucht einen Entwickler, einen Commit
und ein Hochladen. Dieser Plan macht daraus einen Vorgang in der Oberfläche: Datei wählen,
Namen vergeben, fertig — die Schrift steht sofort in der Auswahl jedes Textfelds.

## Phasen

| # | Phase | Was danach geht | Aufwand | Status |
|---|---|---|---|---|
| 1 | [Ablage im Backend](phase-1-backend-ablage.md) | Schriftdatei landet auf dem Server, Liste und Löschen funktionieren (per Werkzeug prüfbar) | standard | **fertig** |
| 2 | [Schriftnamen prüfen](phase-2-namenspruefung.md) | Ein Template mit hochgeladener Schrift lässt sich speichern, ein Template mit erfundener nicht | heikel | offen |
| 3 | [Schrift im Browser laden](phase-3-frontend-laden.md) | Die Karte zeichnet die hochgeladene Schrift wirklich | heikel | offen |
| 4 | [Verwaltung in der Oberfläche](phase-4-oberflaeche.md) | Hochladen, Umbenennen, Löschen — ohne Entwickler | standard | offen |
| 5 | [Fett und Kursiv](phase-5-fett-und-kursiv.md) | Zwei Umschalter am Textfeld | standard | offen |
| 6 | [Abschluss](phase-6-abschluss.md) | Doku und Abnahme | mechanisch | offen |

Phase 5 hängt nicht am Rest — sie betrifft die Textebene, nicht die Schriftverwaltung. Sie
steht hier, weil sie beim Thema Schriften auffiel, und lässt sich auch vorziehen oder
getrennt umsetzen.

## Die zwei Entscheidungen, die alles andere tragen

**1. Wir vergeben den Schriftnamen selbst, nicht die Datei.**
Jede hochgeladene Schrift heißt intern `cmfont-<id>` (`cmfont-7`), der Wunschname des Nutzers
ist nur Beschriftung. Grund: Der in einer Schriftdatei eingebettete Name ist beliebig, oft
falsch und kollidiert im schlimmsten Fall mit einer Systemschrift („Arial"). Beim Laden im
Browser bestimmen wir den Namen ohnehin selbst — also nutzen wir das. Die Ebene im Template
speichert `cmfont-7`, und der Editor zeigt daneben „Matura MT Script Capitals".

**2. Die Datei kommt als Blob, nicht per CSS-Adresse.**
Schriften liegen wie die Bilder hinter der Anmeldung. Ein `@font-face` mit `url(...)` schickt
die Anmeldekopfzeile **nicht** mit — das läuft in ein 401, und zwar still: die Karte zeichnet
dann einfach in der Ersatzschrift weiter. Deshalb derselbe Weg wie bei den Bildern
(`asset-image-loader.ts`): Datei als Blob holen, daraus ein `FontFace`-Objekt bauen und in
`document.fonts` eintragen.

## Kontrakt Backend ↔ Frontend

Alles hinter der Anmeldung, Namensschema wie bei `/api/assets`.

| Weg | Zweck | Antwort |
|---|---|---|
| `GET /api/fonts` | Liste | `{ items: [{ id, name, family, format, byteSize, createdAt }] }` |
| `POST /api/fonts` | Hochladen (`multipart/form-data`: `file`, `name`) | der neue Eintrag |
| `GET /api/fonts/{id}/file` | die Schriftdatei | Binärdaten mit passendem Inhaltstyp |
| `PATCH /api/fonts/{id}` | umbenennen (`{ name }`) | der geänderte Eintrag |
| `DELETE /api/fonts/{id}` | löschen | `204`, oder `409` wenn ein Template die Schrift benutzt |

- `family` ist immer `cmfont-<id>` — genau der Wert, der in `fontFamily` einer Textebene steht.
- `format` ist `woff2`, `ttf` oder `otf`.
- Die Liste kommt in `{ items: [...] }` — wie bei `/api/assets` und `/api/card-groups`.
- Eine abgelehnte Datei (kein Schriftformat, über 2 MB, keine ausgewählt) antwortet **422**
  mit dem Klartext in `fields.file`. Abweichung zur Bildablage, die für „zu groß" 413 nimmt.
- Feldnamen gehen wie überall in `snake_case` über die Leitung und werden in `WireFormat`
  umgesetzt (siehe `backend/src/Support/`).

## Finale Abnahme

Nach Phase 6 muss all das ohne Entwicklerwerkzeug gehen:

1. Im Template-Editor eine Textebene wählen, „Schriften verwalten" öffnen, eine `.ttf` oder
   `.woff2` hochladen, Namen vergeben → die Schrift steht sofort in der Auswahlliste.
2. Schrift auswählen → **die Karte zeichnet sie**, nicht die Ersatzschrift. Auch nach
   Neuladen der Seite.
3. Template speichern, Seite neu laden, Template öffnen → Schrift steht noch.
4. Eine Datei hochladen, die keine Schrift ist (ein PNG in `.ttf` umbenannt) → verständliche
   Fehlermeldung, kein kaputter Eintrag in der Liste.
5. Eine benutzte Schrift löschen wollen → wird abgelehnt mit dem Hinweis, welches Template
   sie benutzt. Eine unbenutzte löschen → verschwindet aus Liste und Auswahl.
6. Automatisches Verkleinern wirkt mit der hochgeladenen Schrift richtig: ein zu langer Text
   schrumpft, bis er in die Box passt (misst also nicht die Ersatzschrift aus).
7. „Fett" und „Kursiv" wirken sofort in der Vorschau, überleben Speichern und Neuladen — und
   ein fett geschalteter Text, der dadurch zu breit wird, schrumpft entsprechend mit.

## Zusammenfassung / Berührte Dateien / Abweichungen / Offene Punkte

*(beim Archivieren füllen)*
