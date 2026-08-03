# Phase 6 — Login im Frontend

**Rating:** standard · **Status:** complete

Anmeldeseite, Sperre für Innenseiten, Verwaltung der Zugriffstoken.

## Kontext lesen

- `docs/conventions/state-management.md` — besonders „Wo direkter Store-Zugriff erlaubt
  bleibt" (Anmeldung ist die dokumentierte Ausnahme von der Facade-Pflicht)
- `docs/conventions/angular.md` — Formulare, Barrierefreiheit, Komponenten-Aufbau
- ADR-008 aus Phase 1
- README dieses Plans → Kontrakt, Abschnitt „Anmeldung"
- Phase 5: `core/services/api.ts`, beide Abfangschichten, App-Rahmen

## Abnahmekriterien

1. [x] Aufruf einer Innenseite ohne Anmeldung landet auf `/login`, mit gemerkter Zieladresse.
2. [x] Nach erfolgreicher Anmeldung geht es genau zu dieser Zieladresse weiter, nicht pauschal
   auf die Startseite.
3. [x] Falsche Zugangsdaten zeigen eine Klartextmeldung an der Anmeldemaske selbst — nicht als
   flüchtige Einblendung, die man verpassen kann.
4. [x] Seite neu laden hält die Anmeldung.
5. [x] Abmelden ruft `POST /api/auth/logout`, verwirft das Token lokal und leitet auf `/login`.
   Der Zurück-Knopf des Browsers führt nicht zurück in die App. Antwortet der Server dabei
   nicht, wird trotzdem lokal abgemeldet — ein Abmelden darf nie an einer Netzstörung
   scheitern.
6. [x] Ein abgelaufenes Token führt beim nächsten Aufruf zur Anmeldeseite mit dem Hinweis
   „Sitzung abgelaufen", nicht zu einer nackten Fehlermeldung.
7. [x] Zugriffstoken lassen sich anlegen und löschen; das neue Token wird groß und kopierbar
   angezeigt mit dem deutlichen Hinweis, dass es nur jetzt sichtbar ist.
8. [x] Die Anmeldemaske ist ohne Maus vollständig bedienbar; die Eingabefelder haben
   Beschriftungen, keine bloßen Platzhaltertexte.

Automatisiert geprüft: `npm run lint` und `npm run build` grün. Der eigentliche Rundgang
(gegen das echte Backend, Punkte 5–7 im Abnahme-Rundgang der Plan-README) ist Sache des
Users — hier gibt's kein lokales PHP/keine lokale Datenbank (ADR-006).

## Aufgaben

### Anmelde-Zustand

- [x] `store/auth/` als klassischer Speicher-Abschnitt: Aktionen `login`, `loginSuccess`,
      `loginFailure`, `logout`, `restoreSession`, `sessionExpired`; Zustand
      `{ user, token, expiresAt, loading, error }`.
- [x] `core/services/auth.ts` — hält das Token, schreibt und liest es aus `localStorage`
      unter dem Schlüssel `cardmaker.auth`. Beim Lesen prüfen, ob der Ablaufzeitpunkt
      überschritten ist; abgelaufene Daten sofort verwerfen. Diese Prüfung als eigene reine
      Funktion `isExpired(expiresAt: string, now: Date): boolean` — sie entscheidet über
      Zugang und darf nicht in einem Effekt vergraben liegen. Die Prüfung im Browser ist nur
      Bequemlichkeit; verbindlich entscheidet der Server (Phase 4, Ablaufprüfung in der
      Datenbankabfrage). Diesen Satz als Kommentar an die Funktion, damit niemand sie später
      für die eigentliche Absicherung hält.
- [x] Beim Anwendungsstart einmal `restoreSession` auslösen (Initialisierungsfunktion in
      `app.config.ts`), damit der Rahmen den Benutzer sofort kennt und nicht kurz die
      Anmeldemaske aufblitzt.
- [x] Effekte: Anmelden ruft die Schnittstelle, legt bei Erfolg ab und navigiert; Abmelden
      ruft `POST /api/auth/logout`, räumt danach Speicher und Zustand und navigiert nach
      `/login` — und zwar auch dann, wenn der Aufruf fehlschlägt (`catchError`, der trotzdem
      die Aufräum-Aktion auslöst).

### Zugangssperre

- [x] `core/auth/auth.guard.ts` als funktionale Sperre: kein Token → Weiterleitung nach
      `/login` mit der ursprünglichen Adresse als Abfrageparameter `redirect`.
- [x] Sperre an alle Kindrouten des Rahmens hängen — nicht an jede Route einzeln, sonst wird
      die nächste vergessen.

### Anmeldeseite

- [x] `features/auth/login/` — reaktives Formular mit E-Mail und Passwort, beide mit sichtbarer
      Beschriftung, Abschicken per Eingabetaste, Schaltfläche während der Anfrage gesperrt und
      mit Ladehinweis.
- [x] Fehlermeldung als Textblock über dem Formular, mit `role="alert"` ausgezeichnet, damit
      Vorlesewerkzeuge sie ansagen.
- [x] Kommt der Nutzer wegen abgelaufener Sitzung hierher (Abfrageparameter `reason=expired`),
      steht ein entsprechender Hinweis statt einer Fehlermeldung.
- [x] **Keine Registrierungsseite.** Existiert noch kein Konto, antwortet die Anmeldung mit
      `401`. Damit das nicht in einer Sackgasse endet: Die Seite ruft beim ersten Laden
      `GET /api/health` ab; meldet das Backend, dass noch keine Schema-Schritte angewandt
      wurden, erscheint der Klartexthinweis „Die Einrichtung ist noch nicht abgeschlossen"
      mit einem Verweis auf die Einrichtungsschritte in der README. Das ist der Ersatz für
      eine Registrierung, die es bewusst nicht gibt.

### Zugriffstoken verwalten

- [x] `features/auth/tokens/` — Liste mit Name, Anlagedatum, letzter Verwendung; Formular für
      einen neuen Namen; Löschen mit Rückfrage.
- [x] Nach dem Anlegen erscheint das Token in einem Bereich mit Kopieren-Schaltfläche und dem
      Hinweis „Wird nur jetzt angezeigt". Der Bereich verschwindet erst, wenn der Nutzer ihn
      schließt — nicht nach einer Zeitspanne.
- [x] Neben der Überschrift ein unaufdringliches Fragezeichen mit Erklärung in einem Satz:
      wofür ein Zugriffstoken gut ist und dass Löschen der Widerruf ist. Pflicht aus dem
      Bedienbarkeits-Gate der Planungsregeln — jede nicht selbsterklärende Funktion trägt
      ihre Erklärung bei sich.
- [x] Zustand über einen klassischen Speicher-Abschnitt `store/tokens/` **mit** Facade —
      hier gilt die Facade-Pflicht, die Ausnahme betrifft nur die Anmeldung selbst.
- [x] Seite über die Kopfleiste erreichbar machen (Menüpunkt beim Benutzernamen).

## Report-Back

**Umgesetzt wie geplant**, drei kleine Abweichungen:

- **Guard heißt `auth-guard.ts`, nicht `auth.guard.ts`.** Die Angular-CLI (v21) benennt
  funktionale Guards seit einigen Versionen so — `ng generate guard` hat den Namen
  vorgegeben, „ng generate für alles" sticht die im Plan geschriebene Dateiendung.
- **Ein siebtes Store-Signal `logoutComplete` zusätzlich zu den sechs geplanten Aktionen.**
  Nötig, weil Abmelden erst *nach* der Serverantwort (Erfolg oder Fehler) aufräumen soll —
  ohne eine eigene Abschluss-Aktion hätte der Reducer nicht gewusst, wann genau er den
  Zustand leeren soll. Reine Verkabelung, keine neue Vorbedingung/Schwelle nach außen.
- **Neue Abhängigkeit `@ngrx/operators`** (`concatLatestFrom`) — der ESLint-Regelsatz
  (`@ngrx/eslint-plugin`, schon in `package.json`) verlangt das statt des in
  `state-management.md` gezeigten `withLatestFrom`-Beispiels. Installiert in derselben
  Version wie die übrigen `@ngrx/*`-Pakete (`^21.1.1`).

**Sicherheitsrelevante Entscheidung:** Anmelden/Abmelden sind im Fehler-Interceptor jetzt
explizit ausgenommen (`/auth/login`, `/auth/logout`) — sonst hätte ein falsches Passwort den
generischen 401-Pfad ausgelöst (Session als „abgelaufen" gewertet, Weiterleitung statt
Inline-Fehler an der Maske). Jeder andere 401 einer authentifizierten Anfrage löst
`sessionExpired` aus und räumt auf.

Nicht automatisiert geprüft (kein PHP/keine DB lokal, ADR-006): der eigentliche Rundgang
gegen das echte Backend — Punkte 5–7 im Abnahme-Rundgang der Plan-README, plus AK 6
(abgelaufenes Token) und AK 7 (Zugriffstoken-Fluss Ende-zu-Ende).
