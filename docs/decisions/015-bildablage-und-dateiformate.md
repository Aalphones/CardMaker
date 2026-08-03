# 015 — Bildablage außerhalb des Webbereichs, nur PNG

**Status:** Akzeptiert (2026-08-03)

## Kontext

Der Template-Editor-Plan (Meilenstein 2) führt Bild-Uploads ein (Rahmen, Icons). ADR-013
hatte diese Frage für den Karteneditor offen gelassen: Hochgeladene Bilder müssen über eine
Adresse abrufbar sein, dürfen also nicht neben dem Programmcode liegen. Zusätzlich offen:
welche Dateiformate erlaubt sind — das Konzeptdokument nennt an einer Stelle auch SVG.

## Optionen — Ablageort

- (a) Öffentlicher Ordner im ausgelieferten Bereich (`public/uploads/`). Schneller, kein
  Bildlader im Frontend nötig, aber Bilder wären ohne Anmeldung abrufbar, und der Ordner
  müsste gegen das Ausführen hochgeladener Dateien gesondert abgesichert werden.
- (b) Ablage in `backend/uploads/`, außerhalb des ausgelieferten Bereichs (ADR-013),
  ausgeliefert über `GET /api/assets/{id}/file`.

## Optionen — Dateiformate

- (a) PNG und SVG, wie im Konzeptdokument ursprünglich vorgesehen.
- (b) Nur PNG.

## Entscheidung

**Ablageort (b).** Die Anmeldepflicht ist im Backend als Positivliste gebaut — was nicht
ausdrücklich offen ist, ist zu. Ein Upload-Ordner, den der Webserver direkt ausliefert, wäre
ein Loch in genau dieser Systematik und die klassische Stelle, an der eine hochgeladene
Programmdatei ausgeführt wird.

**Dateiformat (b), nur PNG.** Abweichung vom Konzeptdokument, aus zwei Gründen: SVG ist eine
ausführbare Datei (Script-Inhalte im Markup), und beim späteren Drucken in hoher Auflösung
rastern Browser SVG uneinheitlich. Bleibt als Rückstellung notiert — siehe „Nicht Teil dieses
Plans" im Template-Editor-Plan.

## Konsequenzen

- Das Frontend braucht einen Bildlader, der Bilddateien angemeldet über die API abruft und
  im Speicher hält, statt sie direkt per `<img src>` auf eine öffentliche Adresse zu
  verweisen. Bilder gehen damit einzeln über die Anwendung statt direkt vom Webserver.
- Icons werden beim Vergrößern unscharf, wenn sie klein hochgeladen wurden — Faustregel:
  Icons mindestens 512 px breit hochladen.
- SVG-Icons sind nicht Teil dieses Plans. Kommt der Bedarf später zurück, braucht es eine
  eigene Entscheidung (Sanitizing des SVG-Markups, Rasterungsstrategie fürs Drucken), keine
  stillschweigende Erweiterung dieser ADR.
