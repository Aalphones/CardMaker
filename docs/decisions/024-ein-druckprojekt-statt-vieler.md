# 024 — Es gibt genau ein Druckprojekt, kein Verwalten mehrerer

**Status:** Akzeptiert (2026-08-13)

## Kontext

Das Konzept spricht von „Druckprojekten" in der Mehrzahl, der Entwurf des Bildschirms zeigt
aber einen Warenkorb: Karten sammeln, Anzahl einstellen, ausgeben. Nirgends wird ein Projekt
benannt, gewechselt oder gelöscht. Bevor Ablage und Endpunkte entstehen, muss klar sein,
welche der beiden Lesarten gebaut wird.

## Optionen

- (a) **Mehrere benannte Projekte.** Liste, Anlegen, Umbenennen, Löschen, Umschalten — eine
  eigene Verwaltungsoberfläche neben der Karten- und der Template-Verwaltung.
- (b) **Ein Warenkorb im Backend.** Eine Sammlung, gespeichert wie alles andere, überlebt das
  Neuladen und den Rechnerwechsel.
- (c) **Warenkorb nur im Browser.** Ablage im lokalen Speicher, kein Backend-Aufwand.

## Entscheidung

**(b)** (Sascha, 2026-08-13). (a) baut Verwaltungsoberfläche für einen Bedarf, den es heute
nicht gibt — gedruckt wird, was gerade fertig ist. (c) spart eine Migration und kostet dafür
die Sammlung bei jedem geleerten Browser-Speicher; dieselbe Karte an einem zweiten Rechner
zu drucken, wäre gar nicht möglich.

## Konsequenzen

- Die Ablage trägt trotzdem schon einen Projekt-Schlüssel: `print_project_items` zeigt per
  Fremdschlüssel auf `print_projects`, wo genau eine Zeile steht. Eine spätere Erweiterung auf
  mehrere Projekte kostet nur Oberfläche, keinen Umbau der Ablage und keine Datenwanderung.
- Kein Pfad trägt eine Projekt-Kennung (`/api/print-project`, nicht `/api/print-projects/{id}`).
  Wird (a) doch einmal gebraucht, sind das neue Pfade neben den alten, keine geänderten.
- Die eine Zeile entsteht beim ersten Zugriff, nicht in der Migration — sonst hinge der
  Bestand an einem Schritt, den ein neu aufgesetztes System vergessen könnte.
- Die Druckoptionen (Schnittmarken, Beschnitt) hängen am Projekt, nicht an der Sitzung: Sie
  sind Eigenschaft des Auftrags und überleben das Neuladen mit ihm.
