# Phase 8 — Bildverwaltung & Upload

**Rating:** heikel · **Status:** pending

Dateien auf einem geteilten Hoster entgegennehmen ist die unangenehmste Stelle des ganzen
Plans: unbekannte Grenzwerte, Dateien als Angriffsfläche, und Fehler, die als leere Seite
statt als Meldung ankommen.

## Kontext lesen

- Report-Back aus Phase 2 — **die dort ausgelesenen Serverwerte sind die Grundlage dieser
  Phase.** Ohne sie nicht anfangen.
- `docs/conventions/php.md`
- README dieses Plans → Kontrakt, Abschnitt „Bilder"
- Phase 3: Tabelle `images`; Phase 7: das dort gebaute Muster wird gespiegelt

## Abnahmekriterien

1. Ein JPEG und ein PNG von je etwa 3 MB lassen sich hochladen und erscheinen sofort in der
   Liste.
2. Eine Datei über dem Grenzwert wird mit Klartextmeldung abgewiesen — im Browser **vor** dem
   Absenden und im Backend nochmals.
3. Eine umbenannte Nicht-Bilddatei (etwa ein PHP-Skript als `.jpg`) wird abgewiesen.
4. Die abgelegte Datei trägt einen erzeugten Namen, nicht den hochgeladenen.
5. Der Bilder-Ordner führt kein PHP aus — direkter Aufruf einer dort abgelegten Datei liefert
   sie als Datei aus oder wird verweigert, aber wird niemals ausgeführt.
6. Breite und Höhe stehen in der Datenbank und stimmen mit dem Bild überein.
7. Löschen entfernt Datenbankeintrag und Datei; die Adresse läuft danach ins Leere.
8. Charakter löschen entfernt seine Bilder samt Dateien — keine verwaisten Reste.
9. Ein abgebrochener Upload hinterlässt keine halbe Datei und keinen Datenbankeintrag.

## Aufgaben

### Grenzwerte festlegen

- [ ] Aus dem Report-Back von Phase 2 den kleineren Wert von `upload_max_filesize` und
      `post_max_size` als Obergrenze übernehmen, davon 10 % Sicherheitsabstand abziehen und
      als Konstante in Backend **und** Frontend ablegen. Keinen Wunschwert eintragen — liegt
      die Serverbegrenzung bei 2 MB, ist die Grenze 2 MB, und dann gehört das ins
      Report-Back, weil Kartenmotive dann knapp werden könnten.
- [ ] Erlaubte Typen: `image/jpeg`, `image/png`, `image/webp`. Kein SVG — es kann Skripte
      enthalten und wird beim Ausliefern im Browser ausgeführt. (Der IconLayer wird laut
      Konzept später SVG unterstützen wollen; das ist dann eine eigene Entscheidung mit
      eigener Bereinigung, nicht ein stilles Mitnehmen hier.)

### Backend

- [ ] Ablageort `backend/public/uploads/`, mit Unterordnern nach Jahr und Monat, damit ein
      Verzeichnis nicht endlos wächst. Ordner beim ersten Schreiben anlegen.
- [ ] `backend/public/uploads/.htaccess`: PHP-Verarbeitung abschalten, nur Bildtypen
      ausliefern, keine Verzeichnisauflistung.
- [ ] **Achtung, Zielkonflikt:** Das Deploy-Skript aus Phase 2 schließt `uploads/` vom
      Abgleich aus, damit hochgeladene Bilder nicht gelöscht werden — damit kommt auch diese
      Schutzdatei nie auf den Server. Sie muss einmalig von Hand hochgeladen werden. Diesen
      Schritt in `README.md` unter den Einrichtungsschritten festhalten und im Report-Back
      bestätigen, dass er erledigt ist. Ohne die Datei liegt ein Verzeichnis auf dem Server,
      in das jeder Angemeldete Dateien schreiben kann und in dem PHP ausgeführt wird.
- [ ] `src/Services/ImageService.php`:
  - erzeugten Dateinamen bilden: `bin2hex(random_bytes(16))` plus Endung aus dem erkannten
    Typ — **nie** aus dem hochgeladenen Namen abgeleitet.
  - Typ mit `finfo_file()` am Inhalt bestimmen, nicht an der Endung und nicht am vom Browser
    gemeldeten Typ. Beides ist frei wählbar und damit wertlos als Prüfung.
  - Maße bestimmen: primär `getimagesize()`. Ist die Bildbibliothek laut Phase-2-Auskunft
    nicht vorhanden, stattdessen die vom Frontend mitgeschickten Werte übernehmen und dabei
    auf plausible Bereiche prüfen (1 bis 20000). Welcher Weg gewählt wurde, gehört ins
    Report-Back.
  - Reihenfolge beim Anlegen: erst Datei endgültig ablegen, dann Datenbankeintrag. Schlägt
    der Eintrag fehl, Datei wieder entfernen. Umgekehrt entstünde ein Eintrag ohne Datei, und
    das fällt erst auf, wenn eine Karte plötzlich ein Loch hat.
  - Beim Löschen erst den Eintrag entfernen, dann die Datei. Ist die Datei schon weg, ist das
    kein Fehler.
- [ ] `src/Repositories/ImageRepository.php` — `all(?int $characterId)`, `find`, `create`,
      `update`, `delete`, `deleteByCharacter`. `url` wird aus der öffentlichen Basisadresse
      und dem Pfad gebildet und mitgeliefert; das Frontend setzt nie selbst Adressen
      zusammen.
- [ ] `src/Controllers/ImageController.php` — die vier Pfade aus dem Kontrakt.
      Bei zu großer Datei `413` mit Code `payload_too_large`.
- [ ] **Der stille Fall:** Übersteigt der Anfragerumpf `post_max_size`, sind `$_POST` und
      `$_FILES` von PHP her leer und es gibt keine Fehlermeldung. Diesen Fall ausdrücklich
      abfangen — leerer Rumpf bei gesetztem `CONTENT_LENGTH` größer null bedeutet
      Größenüberschreitung, nicht „keine Datei geschickt". Ohne diese Prüfung bekommt der
      Nutzer „Datei fehlt", obwohl er eine ausgewählt hat.
- [ ] Beim Löschen eines Charakters (Phase 7) die zugehörigen Dateien mitentfernen. Der
      Fremdschlüssel räumt nur die Datenbankzeilen auf, nicht die Platte — das muss der
      Dienst tun.
- [ ] Von Hand prüfen (es gibt keine Tests): eine `.txt`-Datei in `.jpg` umbenennen und
      hochladen → abgewiesen; eine Datei mit dem Namen `../../index.php.jpg` hochladen → der
      abgelegte Name ist trotzdem zufällig erzeugt und liegt im Upload-Ordner. Ergebnisse ins
      Report-Back.

### Frontend

- [ ] `store/images/` nach demselben Muster wie `characters` in Phase 7, mit Facade.
- [ ] `features/images/list/` — Raster mit Vorschaubildern, Filter nach Charakter,
      Umschalter „nur nicht zugeordnete". Vorschaubilder mit `loading="lazy"`; es gibt keine
      serverseitig verkleinerten Varianten, das genügt bei diesen Mengen.
- [ ] `features/images/upload/` — Ablagefläche zum Hineinziehen plus Dateiauswahl. Vor dem
      Absenden im Browser: Größe gegen den Grenzwert prüfen, Typ prüfen, Bild einmal laden um
      Breite und Höhe zu ermitteln und mitzuschicken.
- [ ] Fortschrittsanzeige über die Fortschrittsereignisse von `HttpClient`. Bei mehreren
      Dateien nacheinander hochladen, nicht gleichzeitig — ein geteilter Hoster quittiert
      Parallelität gern mit Abbrüchen.
- [ ] Fehler pro Datei anzeigen, nicht als Sammelmeldung. Bei fünf Dateien und einer zu
      großen muss erkennbar sein, welche.
- [ ] Zuordnung zu einem Charakter direkt in der Bildkachel über ein Auswahlfeld, ohne
      Umweg über eine Detailseite.
- [ ] In der Charakter-Detailseite aus Phase 7 einen Abschnitt „Bilder" ergänzen: zugeordnete
      Bilder anzeigen, direkt dort hochladen.
- [ ] An der Ablagefläche ein Satz in Klartext: welche Formate erlaubt sind und wie groß eine
      Datei höchstens sein darf — vorher, nicht als Fehlermeldung hinterher.

### Dokumentation

- [ ] `docs/code-map.md`: Zeile für das Feature `images` ergänzen.
- [ ] `docs/PROJECT.md` → Constraints: die tatsächlich vorgefundenen Strato-Grenzwerte als
      Zeile aufnehmen. Sie sind eine dauerhafte Randbedingung des Projekts, keine
      Phasen-Notiz.

## Report-Back
