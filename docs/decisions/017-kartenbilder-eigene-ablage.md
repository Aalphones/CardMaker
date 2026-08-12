# 017 — Kartenbilder liegen getrennt vom Bildvorrat

**Status:** Akzeptiert (2026-08-12)

## Kontext

Der Karteneditor (Meilenstein 3) lässt zu jeder Karte ein Motivbild hochladen. Es gibt schon
einen Bildvorrat: `assets` mit Rahmen und Icons, abgelegt in `backend/uploads/`, ausgeliefert
über `GET /api/assets/{id}/file` (ADR-015). Die Frage ist, ob die Kartenbilder dort mit
hineingehören.

Der Unterschied zwischen beiden Sorten ist inhaltlich, nicht technisch: Rahmen und Icons sind
wiederverwendbares Layout-Material, das ein Mensch bewusst auswählt und über viele Karten
hinweg einsetzt. Ein Kartenbild gehört zu genau einer Karte und wird nie ein zweites Mal
gebraucht.

## Optionen

- (a) Kartenbilder in den Bildvorrat aufnehmen — ein dritter Wert für `assets.kind`, ein
  Upload-Weg, eine Ablage, eine Auslieferungsroute.
- (b) Eigene Tabelle `card_images` mit eigenem Ordner `backend/uploads/cards/` und eigenen
  Routen unterhalb der Karte.

## Entscheidung

**(b).** Der Bildvorrat ist eine Auswahlliste, die der Mensch durchsucht — jedes Motivbild
darin ist ein Eintrag, der dort nie gebraucht wird und die Liste zumüllt. Nach fünfzig Karten
stünden fünfzig Motive zwischen den zehn Rahmen.

Dazu kommt das Löschen: ein Kartenbild soll mit seiner Karte verschwinden, ohne dass jemand
aufräumt. Als Fremdschlüssel mit `ON DELETE CASCADE` an der Karte ist das eine Zeile Schema.
Im gemeinsamen Bildvorrat wäre es eine Aufräumroutine im Anwendungscode, die genau dann
Datenmüll hinterlässt, wenn sie einmal nicht läuft.

Die Ablage bleibt außerhalb des ausgelieferten Bereichs und hinter der Anmeldung, genau wie
in ADR-015 entschieden — nur in einem eigenen Unterordner.

## Konsequenzen

- Zwei Upload-Wege im Backend, die sich ähneln (Prüfung des Dateityps, Zufallsname, Maße
  auslesen). Bewusst in Kauf genommen; die gemeinsamen Teile wandern in einen Hilfsdienst,
  die Routen bleiben getrennt.
- Ein Kartenbild lässt sich nicht in einer zweiten Karte weiterverwenden. Wer dasselbe Motiv
  zweimal will, lädt es zweimal hoch. Für ein Solo-Werkzeug ist das billiger als eine
  Verwaltungsoberfläche für Motive.
- `card_images.layer_id` zeigt auf eine Bildebene im Template-Datenblock und ist deshalb
  nicht per Fremdschlüssel absicherbar — dieselbe Folge, die ADR-014 schon für Templates
  beschreibt. Verschwindet die Ebene aus dem Template, bleibt die Zeile stehen und wird
  einfach nicht gezeichnet.
