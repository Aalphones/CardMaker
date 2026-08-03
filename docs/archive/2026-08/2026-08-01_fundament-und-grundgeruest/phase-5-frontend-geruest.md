# Phase 5 — Frontend-Gerüst

**Rating:** standard · **Status:** pending

Angular-Projekt aufsetzen, Gestaltungs-Token, Prüfwerkzeuge, App-Rahmen und die
Verbindungsschicht zum Backend. Am Ende läuft eine leere, aber vollständig verdrahtete App.

## Kontext lesen

- `docs/conventions/angular.md` — vollständig
- `docs/conventions/css.md` — vollständig, besonders Token-Architektur (Roh/Semantisch) und
  das Verbot von Utility-Klassen im Template (ADR-010: kein Tailwind, reines semantisches CSS)
- `docs/conventions/linting.md`
- `docs/conventions/state-management.md` — Facade-Pflicht
- `docs/code-map.md` — geplantes Frontend-Layout, exakt so anlegen
- README dieses Plans → Kontrakt (Fehlerformat)

## Abnahmekriterien

1. `npm start` in `frontend/` startet die App auf `http://localhost:4200`, sichtbar sind
   Kopfleiste und Seitenleiste des App-Rahmens.
2. `npm run lint` und `npm run build` laufen beide durch.
3. Im Projekt existiert kein Testwerkzeug — weder in `package.json`, noch in `angular.json`,
   noch als `.spec.ts`-Datei.
4. Die Farbwerte im Kopfbereich kommen aus einem semantischen Token, nicht aus einem festen
   Farbwert im Komponenten-Stylesheet.
5. Kein einziges Template enthält eine Utility-Klasse; `package.json` listet weder
   `tailwindcss` noch `@tailwindcss/postcss`.
6. Ein bewusst falscher Aufruf gegen das Backend erzeugt eine sichtbare Fehlermeldung in
   Klartext, nicht nur einen Eintrag in der Entwicklerkonsole.
7. Der Ausgabepfad des Bauvorgangs ist bekannt und im Deploy-Skript aus Phase 2 eingetragen.

## Aufgaben

### Projekt anlegen

- [x] `npx @angular/cli@21 new frontend --style=scss --routing --skip-git --skip-tests` im
      Projektstamm (Version 21 statt 22 — Begründung unten unter „Abweichungen"). Serverseitiges
      Rendern lehnt die CLI mit `--defaults` bereits ab, kein `server.ts`/`@angular/ssr` im Baum.
- [x] Testgerüst restlos entfernen (ADR-009): `--skip-tests` lässt die CLI 21 bereits ohne
      Karma/Jasmine, ohne `test`-Abschnitt in `angular.json` und ohne `src/test.ts` erzeugen —
      übrig blieben nur das `test`-Skript in `package.json` und `tsconfig.spec.json`, beide
      entfernt. `npm run build` lief danach unverändert durch.
- [x] Hinweis „immer mit `--skip-tests`" in `docs/conventions/angular.md` ergänzt.
- [x] Zonenfreier Betrieb ist mit `--defaults` bereits die Vorgabe — kein `zone.js` in
      `package.json`.
- [x] Abhängigkeiten ergänzt: `@ngrx/store`, `@ngrx/effects`, `@ngrx/signals`,
      `@ngrx/store-devtools` (alle `21.1.1`), `@angular/cdk`, `konva`, `ng2-konva` (`12.0.1`),
      Entwicklungsabhängigkeit `@ngrx/eslint-plugin` (`21.1.1`). Kein Tailwind, kein
      PostCSS-Paket. Versionsentscheidung siehe „Abweichungen" — NgRx/ng2-konva hatten zum
      Zeitpunkt dieser Phase keine Angular-22-taugliche stabile Version.
- [x] Verzeichnisse nach `docs/code-map.md` angelegt: `core/{auth,services}`,
      `features/{auth,card-groups}`, `shared/{components,canvas/rendering,services}`, `store/`,
      `signal-stores/`, `layout/`.

### Gestaltungs-Token

- [x] `:root`-Block mit Raw- und Semantic-Tokens in `src/styles.scss` angelegt — Markenfarbe
      Violett-Blau (`--color-brand-500: #6d5ef8`) in fünf Stufen, Graustufen in sieben Stufen,
      Erfolg/Warnung/Fehler, Abstände, Radien, Schatten, Schriftgrößen. Semantic-Schicht wie im
      Kontrakt. `docs/conventions/css.md` mit den finalen Werten nachgezogen.
- [x] Dunkles Erscheinungsbild als Grundeinstellung (`color-scheme: dark`, keine Umschaltung
      gebaut).
- [x] Globale Grundlagen (Kastenmodell, Schriftfamilie, `:focus-visible`) in `styles.scss`.

### App-Rahmen

- [x] `layout/shell/` — Kopfleiste (Produktname, „Angemeldet"-Platzhalter, Abmelden-Schaltfläche)
      und Seitenleiste (Navigationspunkt „Kartengruppen"). Inhaltsbereich über
      `<router-outlet>`. BEM-Klassen, scoped SCSS, keine Utilities. Die Abmelden-Schaltfläche
      navigiert vorerst nur zu `/login` — den echten `POST /api/auth/logout`-Aufruf baut
      Phase 6.
- [x] Navigationspunkt als `routerLink` mit `routerLinkActive`.
- [x] `app.routes.ts`: `/login` außerhalb des Rahmens (eigene Platzhalterseite,
      `features/auth/login/` — nicht nur die Route, auch eine Platzhalterkomponente, sonst
      hätte die App nicht gebaut), alles andere als Kindrouten des Rahmens, `loadComponent`
      verzögert geladen. `/` leitet über die leere Kindroute auf `/card-groups` um.
- [x] `NotFound`-Seite unter `shared/components/not-found/`, als Wildcard-Kindroute der Shell
      (bleibt dadurch mit Kopfleiste/Sidebar sichtbar).

### Verbindung zum Backend

- [x] `src/environments/environment.ts` (Produktion: `apiBaseUrl: '/api'`, relativ — Frontend
      und Backend teilen sich die Domain, ADR-013) und `environment.development.ts`
      (`https://quantum-canvas.de/api`, absolut — Dev-Server läuft auf `localhost:4200`, braucht
      CORS). `fileReplacements` in `angular.json` für die `development`-Konfiguration ergänzt.
- [x] `core/services/api.ts` — dünne Hülle um `HttpClient`.
- [x] `core/auth/auth-token-interceptor.ts` (CLI-Namensschema hängt `-interceptor` statt
      `.interceptor` an, siehe Abweichungen) — hängt `Authorization: Bearer <token>` an.
      Liest über `core/auth/auth-storage.ts` (neu, nicht im Plan benannt) aus `localStorage`
      unter dem Schlüssel `cardmaker.auth` — demselben Schlüssel, den Phase 6 für
      `core/services/auth.ts` vorsieht, damit beide Phasen zum selben Speicherformat greifen.
- [x] `core/auth/error-interceptor.ts` — bei `401`: `auth-storage` leeren, auf `/login`
      leiten. Bei `0`: „Server nicht erreichbar." Sonst: `message` aus dem Fehlerformat des
      Kontrakts über die Notification anzeigen. Format gegen den echten Server geprüft
      (`GET /api/nonexistent-path` → `401` mit `{"error":"unauthorized","message":"..."}`).
- [x] `shared/services/notification.ts` als Signal-Speicher, Anzeige über
      `shared/components/notification-list/`, im Rahmen eingebunden.
- [x] NgRx im `app.config.ts`: `provideStore()`, `provideEffects()`, `provideStoreDevtools()`
      nur wenn `!environment.production`.

### Prüfwerkzeuge

- [x] ESLint über `ng add @angular-eslint/schematics@21` eingerichtet (Version 21 statt der
      generischen Anleitung — Begründung unten), Selector-Prefixes `['app', 'cm']` gesetzt.
      `@ngrx/eslint-plugin` eingebunden — dessen Config ist noch reines eslintrc-Format ohne
      Flat-Config-Preset, deshalb von Hand als `plugins`/`rules`-Block in `eslint.config.js`
      übernommen statt per `extends`.
- [x] Prettier-Einstellungen geprüft (`singleQuote: true` bereits gesetzt), ganzen
      `frontend/`-Baum einmal formatiert.
- [x] `shared/canvas/rendering/units.ts` mit `canvasUnitsToPixels` — Rechenprobe (630/300 DPI →
      744, 880/300 DPI → 1039) im Kommentar und per Node-Skript nachgerechnet, stimmt.
- [x] `build`-Skript heißt `ng build`, unverändert vom CLI-Default.
- [x] Ausgabepfad `frontend/dist/frontend/browser` bestätigt — war in `deploy.env`
      (`FRONTEND_DIST`) aus Phase 2 bereits korrekt eingetragen, keine Änderung nötig.

## Report-Back

**Stand: abgeschlossen.** `npm run lint` und `npm run build` laufen beide grün durch, kein
Testwerkzeug im Baum. Per Headless-Chrome-Screenshot geprüft: `/card-groups` zeigt Kopfleiste
(Markenfarbe aus Token) und Sidebar mit aktivem Navigationspunkt, `/login` rendert komplett
ohne Rahmen, eine unbekannte Adresse zeigt die `NotFound`-Seite innerhalb der Shell. CORS von
`localhost:4200` gegen die echte Strato-API funktioniert (Preflight liefert `204` mit den
erwarteten Headern).

### Abweichungen vom Plan

1. **Angular 21 statt 22.** NgRx hatte zum Zeitpunkt dieser Phase nur eine Beta-Version für
   Angular 22, `ng2-konva` noch gar keine (letzte Version zielt auf Angular 21). Auf Nachfrage
   hat Sascha entschieden, das ganze Frontend auf Angular 21 zu stellen statt Beta-Pakete oder
   `--legacy-peer-deps`-Notlösungen einzusetzen. `docs/conventions/angular.md`,
   `docs/conventions/stack.md` und `docs/PROJECT.md` sind entsprechend nachgezogen.
2. **`--defaults` statt interaktiver Prompts** bei `ng new` — Zonenfrei und kein SSR sind bei
   Angular 21 bereits die Vorgabe, spart die manuelle Bestätigung.
3. **CLI-Namensschema für Services/Interceptoren.** Angular 21 hängt kein `.service`/`.interceptor`
   mehr an Dateinamen — `api.ts`/`notification.ts` treffen den Plan-Wortlaut exakt,
   `auth-token-interceptor.ts`/`error-interceptor.ts` (Bindestrich statt Punkt) weichen leicht
   vom Plan-Text ab. CLI-Standard übernommen statt von Hand umzubenennen.
4. **`core/auth/auth-storage.ts` neu, nicht im Plan benannt.** Enthält nur Schlüssel-Konstante,
   Lesen und Löschen (`cardmaker.auth`) — das Schreiben und die Ablauf-Prüfung bleiben bewusst
   Phase 6 (`core/services/auth.ts`) vorbehalten, damit nichts doppelt gebaut wird.
5. **`environment.ts` nutzt `/api` (relativ) statt der Strato-Subdomain.** Produktion liefert
   Frontend und Backend von derselben Domain (ADR-013) — relativ vermeidet unnötiges CORS in
   Produktion. Nur `environment.development.ts` zeigt auf die absolute Adresse.
6. **AK 6 (sichtbare Fehlermeldung bei Backend-Fehler) nicht per Screenshot demonstriert** —
   noch keine Seite in dieser Phase ruft die API auf (Kartengruppen-Seite ist reiner
   Platzhalter). Verifiziert stattdessen per Code-Review plus einem echten Aufruf gegen die
   Strato-API, der das erwartete Fehlerformat bestätigt. Das ist die unsicherste Stelle dieser
   Phase — volle Gewissheit gibt erst Phase 6 oder 7, sobald eine Seite tatsächlich einen
   Aufruf macht, der schiefgehen kann.

### Was geprüft wurde, und wie

- `npm run lint`, `npm run build` — beide grün.
- Headless-Chrome-Screenshots von `/card-groups`, `/login`, einer unbekannten Adresse.
- CORS-Preflight und Fehlerformat direkt gegen `https://quantum-canvas.de/api` per `curl`.
- `canvasUnitsToPixels` per Node-Einzeiler gegen die beiden Kontrollwerte nachgerechnet.
