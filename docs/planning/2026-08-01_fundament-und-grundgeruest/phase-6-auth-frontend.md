# Phase 6 — Login im Frontend

**Rating:** standard · **Status:** pending

Anmeldeseite, Sperre für Innenseiten, Verwaltung der Zugriffstoken.

## Kontext lesen

- `docs/conventions/state-management.md` — besonders „Wo direkter Store-Zugriff erlaubt
  bleibt" (Anmeldung ist die dokumentierte Ausnahme von der Facade-Pflicht)
- `docs/conventions/angular.md` — Formulare, Barrierefreiheit, Komponenten-Aufbau
- ADR-008 aus Phase 1
- README dieses Plans → Kontrakt, Abschnitt „Anmeldung"
- Phase 5: `core/services/api.ts`, beide Abfangschichten, App-Rahmen

## Abnahmekriterien

1. Aufruf einer Innenseite ohne Anmeldung landet auf `/login`, mit gemerkter Zieladresse.
2. Nach erfolgreicher Anmeldung geht es genau zu dieser Zieladresse weiter, nicht pauschal auf
   die Startseite.
3. Falsche Zugangsdaten zeigen eine Klartextmeldung an der Anmeldemaske selbst — nicht als
   flüchtige Einblendung, die man verpassen kann.
4. Seite neu laden hält die Anmeldung.
5. Abmelden ruft `POST /api/auth/logout`, verwirft das Token lokal und leitet auf `/login`.
   Der Zurück-Knopf des Browsers führt nicht zurück in die App. Antwortet der Server dabei
   nicht, wird trotzdem lokal abgemeldet — ein Abmelden darf nie an einer Netzstörung
   scheitern.
6. Ein abgelaufenes Token führt beim nächsten Aufruf zur Anmeldeseite mit dem Hinweis
   „Sitzung abgelaufen", nicht zu einer nackten Fehlermeldung.
7. Zugriffstoken lassen sich anlegen und löschen; das neue Token wird groß und kopierbar
   angezeigt mit dem deutlichen Hinweis, dass es nur jetzt sichtbar ist.
8. Die Anmeldemaske ist ohne Maus vollständig bedienbar; die Eingabefelder haben
   Beschriftungen, keine bloßen Platzhaltertexte.

## Aufgaben

### Anmelde-Zustand

- [ ] `store/auth/` als klassischer Speicher-Abschnitt: Aktionen `login`, `loginSuccess`,
      `loginFailure`, `logout`, `restoreSession`, `sessionExpired`; Zustand
      `{ user, token, expiresAt, loading, error }`.
- [ ] `core/services/auth.ts` — hält das Token, schreibt und liest es aus `localStorage`
      unter dem Schlüssel `cardmaker.auth`. Beim Lesen prüfen, ob der Ablaufzeitpunkt
      überschritten ist; abgelaufene Daten sofort verwerfen. Diese Prüfung als eigene reine
      Funktion `isExpired(expiresAt: string, now: Date): boolean` — sie entscheidet über
      Zugang und darf nicht in einem Effekt vergraben liegen. Die Prüfung im Browser ist nur
      Bequemlichkeit; verbindlich entscheidet der Server (Phase 4, Ablaufprüfung in der
      Datenbankabfrage). Diesen Satz als Kommentar an die Funktion, damit niemand sie später
      für die eigentliche Absicherung hält.
- [ ] Beim Anwendungsstart einmal `restoreSession` auslösen (Initialisierungsfunktion in
      `app.config.ts`), damit der Rahmen den Benutzer sofort kennt und nicht kurz die
      Anmeldemaske aufblitzt.
- [ ] Effekte: Anmelden ruft die Schnittstelle, legt bei Erfolg ab und navigiert; Abmelden
      ruft `POST /api/auth/logout`, räumt danach Speicher und Zustand und navigiert nach
      `/login` — und zwar auch dann, wenn der Aufruf fehlschlägt (`catchError`, der trotzdem
      die Aufräum-Aktion auslöst).

### Zugangssperre

- [ ] `core/auth/auth.guard.ts` als funktionale Sperre: kein Token → Weiterleitung nach
      `/login` mit der ursprünglichen Adresse als Abfrageparameter `redirect`.
- [ ] Sperre an alle Kindrouten des Rahmens hängen — nicht an jede Route einzeln, sonst wird
      die nächste vergessen.

### Anmeldeseite

- [ ] `features/auth/login/` — reaktives Formular mit E-Mail und Passwort, beide mit sichtbarer
      Beschriftung, Abschicken per Eingabetaste, Schaltfläche während der Anfrage gesperrt und
      mit Ladehinweis.
- [ ] Fehlermeldung als Textblock über dem Formular, mit `role="alert"` ausgezeichnet, damit
      Vorlesewerkzeuge sie ansagen.
- [ ] Kommt der Nutzer wegen abgelaufener Sitzung hierher (Abfrageparameter `reason=expired`),
      steht ein entsprechender Hinweis statt einer Fehlermeldung.
- [ ] **Keine Registrierungsseite.** Existiert noch kein Konto, antwortet die Anmeldung mit
      `401`. Damit das nicht in einer Sackgasse endet: Die Seite ruft beim ersten Laden
      `GET /api/health` ab; meldet das Backend, dass noch keine Schema-Schritte angewandt
      wurden, erscheint der Klartexthinweis „Die Einrichtung ist noch nicht abgeschlossen"
      mit einem Verweis auf die Einrichtungsschritte in der README. Das ist der Ersatz für
      eine Registrierung, die es bewusst nicht gibt.

### Zugriffstoken verwalten

- [ ] `features/auth/tokens/` — Liste mit Name, Anlagedatum, letzter Verwendung; Formular für
      einen neuen Namen; Löschen mit Rückfrage.
- [ ] Nach dem Anlegen erscheint das Token in einem Bereich mit Kopieren-Schaltfläche und dem
      Hinweis „Wird nur jetzt angezeigt". Der Bereich verschwindet erst, wenn der Nutzer ihn
      schließt — nicht nach einer Zeitspanne.
- [ ] Neben der Überschrift ein unaufdringliches Fragezeichen mit Erklärung in einem Satz:
      wofür ein Zugriffstoken gut ist und dass Löschen der Widerruf ist. Pflicht aus dem
      Bedienbarkeits-Gate der Planungsregeln — jede nicht selbsterklärende Funktion trägt
      ihre Erklärung bei sich.
- [ ] Zustand über einen klassischen Speicher-Abschnitt `store/tokens/` **mit** Facade —
      hier gilt die Facade-Pflicht, die Ausnahme betrifft nur die Anmeldung selbst.
- [ ] Seite über die Kopfleiste erreichbar machen (Menüpunkt beim Benutzernamen).

## Report-Back
