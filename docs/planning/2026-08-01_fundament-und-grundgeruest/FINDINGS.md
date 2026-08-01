# Findings — Fundament & Grundgerüst

Erkenntnisse, die während einer Phase auffallen und eine andere Phase betreffen. Hier
eintragen statt sofort umzusetzen — sonst wandert der Umfang unkontrolliert.

Format:

```
- [ ] → Phase N: <Erkenntnis in einem Satz>
```

Erledigt wird der Eintrag von der Phase, an die er adressiert ist. Was am Ende noch offen
ist, wandert in Phase 9 in die Folgeaufgaben der Plan-README.

---

- [x] → Phase 3: Die Datenbank ist verbunden (`dbConnected: true`), die Zugangsdaten in
      `deploy.env` stimmen. Migrationen können direkt gebaut werden.

- [ ] → Phase 4 und 7: Der Wegweiser ist jetzt `nikic/fast-route`, Prüfregeln kommen von
      `respect/validation`, Konfigurationswerte stehen in `$_ENV` (phpdotenv). Neue Pfade
      werden in `backend/public/index.php` im `simpleDispatcher`-Block registriert.

- [ ] → Karteneditor-Plan (Meilenstein 3): Bilder müssen über eine Adresse erreichbar sein,
      dürfen also **nicht** neben dem Programmcode liegen (der ist außerhalb des
      ausgelieferten Bereichs, ADR-013). Entweder ein eigener Ordner im Webbereich oder
      Ausliefern durch PHP.

- [x] → Phase 3: Die Auskunft `/api/health` zählt die angewandten Schema-Schritte mit
      `SELECT COUNT(*) FROM migrations`. Die Verwaltungstabelle muss genau `migrations`
      heißen, sonst meldet die Auskunft dauerhaft 0, ohne zu meckern.

- [x] → Phase 4: Controller, die den Anfrage-Inhalt brauchen, bekommen ihn im
      Zusammenbau (`backend/public/index.php`) über den Konstruktor gereicht. Der Wegweiser
      übergibt an die Methode nur die Platzhalter aus dem Pfad (`{id}`), nicht die Anfrage.

- [x] → Phase 4: Der `Authorization`-Header überlebt geteiltes Hosting nur, weil
      `backend/public/.htaccess` ihn ausdrücklich durchreicht und `Request::header()` auf
      `REDIRECT_HTTP_AUTHORIZATION` zurückfällt. Beides sieht überflüssig aus, ist es aber
      nicht — ohne das kommt die Anmeldung nie im PHP an.

- [ ] → Phase 7: Zeitstempel werden mit `UTC_TIMESTAMP()` geschrieben und verglichen,
      nach außen wandelt `Support\Timestamps::toIso()` sie in ISO-8601 mit `Z`. Die
      `createdAt`/`updatedAt` der Kartengruppen genauso bauen — sonst stehen in einer
      Tabelle zwei Zeitzonen nebeneinander. Regel steht in `docs/conventions/php.md`.

- [ ] → Phase 7: Neue Pfade sind ab Phase 4 **automatisch gesperrt**. Die Positivliste
      offener Pfade in `backend/public/index.php` bekommt keine Kartengruppen-Einträge —
      der angemeldete Nutzer steht über `$request->user()` bereit.

- [ ] → Phase 6: Abmelden mit einem Zugriffstoken antwortet `403`, nicht `204`. Die
      Oberfläche meldet sich immer mit dem Anmelde-Token an, trifft das also nie — beim
      Bauen des Fehlerpfads trotzdem nicht als „Sitzung abgelaufen" auslegen.

- [ ] → Phase 5: Der Ausgabeordner des Angular-Builds steht in `deploy.env` unter
      `FRONTEND_DIST` (Vorgabe `frontend\dist\frontend\browser`). Nach dem ersten Build
      den echten Pfad prüfen und **dort** korrigieren — nicht im Skript.

- [ ] → Phase 2 (offen): Die Werte aus `/diag.php` (PHP-Version, Bildbibliotheken,
      Upload-Grenzen) sind noch nicht abgerufen — das Hochladen hängt an den drei
      Voraussetzungen. Sobald sie da sind, hier wörtlich eintragen und die Folgerungen aus
      der Phasen-Datei ziehen.

- [ ] → Künftiger Karteneditor-Plan (Meilenstein 3): Serverwerte aus der Auskunftsseite von
      Phase 2 dort festhalten, sobald bekannt (Dateigrößen-Grenze, verfügbare
      Bildbibliothek) — Bildverwaltung ist seit ADR-011 nicht mehr Teil dieses
      Fundament-Plans, die Erkenntnis bleibt aber für den Bild-Upload am Karteninstanz
      relevant.
