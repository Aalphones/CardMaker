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

- [ ] `npx @angular/cli@22 new frontend --style=scss --routing --skip-git --skip-tests` im
      Projektstamm. Serverseitiges Rendern **ablehnen** (die App braucht es nicht und es
      kollidiert mit dem Zugriff auf Browser-Speicher).
- [ ] Testgerüst restlos entfernen (ADR-009): den `test`-Abschnitt aus `angular.json`
      streichen, das `test`-Skript aus `package.json`, alle Testwerkzeug-Abhängigkeiten
      (Karma, Jasmine, Vitest oder was die CLI-Fassung mitbringt), die Dateien
      `src/test.ts` und `tsconfig.spec.json`, sowie jede erzeugte `.spec.ts`-Datei.
      Anschließend `npm install` erneut laufen lassen und prüfen, dass `npm run build`
      weiterhin durchläuft.
- [ ] Bei jedem späteren `ng generate` die Option `--skip-tests` verwenden, sonst legt die
      CLI wieder Testdateien an. Diesen Hinweis in `docs/conventions/angular.md` aufnehmen.
- [ ] Zonenfreien Betrieb wählen, wenn die CLI danach fragt — die Anwendung arbeitet
      durchgehend mit Signals.
- [ ] Abhängigkeiten ergänzen: `@ngrx/store`, `@ngrx/effects`, `@ngrx/signals`,
      `@ngrx/store-devtools`, `@angular/cdk`, `konva`, `ng2-konva`,
      Entwicklungsabhängigkeit `@ngrx/eslint-plugin`. Kein Tailwind, kein PostCSS-Paket
      (ADR-010) — Angular CLI kompiliert SCSS ohnehin ohne Zusatz-Plugin.
      Konva und ng2-konva werden erst im Template-Editor gebraucht — jetzt schon aufnehmen,
      damit die Versionsentscheidung an einer Stelle fällt.
- [ ] Verzeichnisse nach `docs/code-map.md` anlegen: `core/{auth,services}`,
      `features/{auth,characters,images}`, `shared/{components,canvas,services}`, `store/`,
      `signal-stores/`, `layout/`.

### Gestaltungs-Token

- [ ] In `src/styles.scss` einen `:root`-Block mit CSS Custom Properties anlegen, zwei
      Schichten wie in `docs/conventions/css.md` beschrieben (kein `@theme`, kein Tailwind —
      ADR-010):
  - **Roh:** Farbskala (eine Markenfarbe in fünf Stufen, eine Graustufenskala in sieben
    Stufen, je eine Farbe für Erfolg, Warnung, Fehler), Abstände `--space-xs` bis `--space-xl`,
    Radien, Schatten, Schriftgrößen.
  - **Semantisch:** `--color-bg-base`, `--color-bg-elevated`, `--color-bg-sunken`,
    `--color-text-primary`, `--color-text-muted`, `--color-border`, `--color-accent`,
    `--color-danger` — jeweils auf Roh-Token verweisend.
- [ ] Ein dunkles Erscheinungsbild als Grundeinstellung wählen (Canvas-Werkzeug, dunkle
      Oberfläche ist der Standard in dieser Werkzeugklasse). Nur die semantischen Token
      belegen, keine Umschaltung bauen — die kostet jetzt nichts und lässt sich später
      nachrüsten, solange Komponenten ausschließlich semantische Token verwenden.
- [ ] Globale Grundlagen in `styles.scss`: Kastenmodell, Schriftfamilie, Fokus-Sichtbarkeit
      (`:focus-visible` mit deutlichem Rahmen — Barrierefreiheit ist in
      `docs/conventions/angular.md` festgeschrieben).

### App-Rahmen

- [ ] `layout/shell/` — Komponente mit Kopfleiste (Produktname, rechts der angemeldete
      Benutzer und eine Abmelden-Schaltfläche) und Seitenleiste (Navigationspunkte
      „Charaktere", „Bilder", später mehr). Inhaltsbereich über `<router-outlet>`.
      BEM-Klassen, scoped SCSS, keine Utilities.
- [ ] Navigationspunkte als `routerLink` mit `routerLinkActive`, kein Klick-Handler mit
      manueller Navigation.
- [ ] `app.routes.ts`: `/login` außerhalb des Rahmens, alles andere als Kindrouten des
      Rahmens, mit `loadComponent` verzögert geladen. Vorerst zwei Platzhalterseiten für
      Charaktere und Bilder, `/` leitet auf `/characters` um.
- [ ] Eine `NotFound`-Seite für unbekannte Adressen.

### Verbindung zum Backend

- [ ] `src/environments/environment.ts` und `environment.development.ts` mit `apiBaseUrl`.
      Entwicklungswert ist die Strato-Subdomain — es gibt kein lokales Backend (ADR-006).
      Die Adresse gehört ins Repository, sie ist kein Geheimnis.
- [ ] `core/services/api.ts` — dünne Hülle um `HttpClient`, setzt die Basisadresse davor und
      bietet `get/post/patch/delete` mit typisierten Rückgaben. Kein Fachwissen darin.
- [ ] `core/auth/auth-token.interceptor.ts` — hängt `Authorization: Bearer <token>` an, wenn
      ein Token vorliegt.
- [ ] `core/auth/error.interceptor.ts` — übersetzt Fehlerantworten in eine Klartextmeldung
      nach dem Fehlerformat aus dem Kontrakt. Bei `401`: Token verwerfen und auf `/login`
      leiten. Bei `0` (Backend nicht erreichbar): eigene Meldung „Server nicht erreichbar",
      nicht die technische Rohmeldung.
- [ ] `shared/services/notification.ts` — einfacher Meldungsdienst als Signal-Speicher, dazu
      eine Anzeigekomponente im Rahmen. Kein fremdes Meldungspaket dafür einbinden.
- [ ] NgRx im `app.config.ts` einrichten: `provideStore()`, `provideEffects()`,
      `provideStoreDevtools()` nur außerhalb der Auslieferung.

### Prüfwerkzeuge

- [ ] ESLint einrichten nach `docs/conventions/linting.md`, `@ngrx/eslint-plugin` aufnehmen.
- [ ] Prettier-Einstellungen im Projektstamm prüfen: einfache Anführungszeichen, sonst
      Standard. Die Hook-Einbindung in `package.json` verweist bereits auf `frontend/**`.
- [ ] Erste Zeile des Rechenkerns anlegen, damit der Ordner aus ADR-005 von Anfang an steht:
      `shared/canvas/rendering/units.ts` mit `canvasUnitsToPixels(units: number, dpi: number): number`.
      Zur Kontrolle beim Schreiben: 630 Einheiten bei 300 DPI ergeben 744 Pixel, 880 Einheiten
      ergeben 1039. Diese beiden Werte als Kommentar in die Datei — sie sind die
      Rechenprobe, die es ohne Tests sonst nirgends gibt.
- [ ] Das Skript `build` in `frontend/package.json` muss genau so heißen — das Deploy-Skript
      ruft es unter diesem Namen auf.
- [ ] Einmal `npm run build` ausführen und den tatsächlichen Ausgabepfad ermitteln
      (üblicherweise `frontend/dist/frontend/browser`). Den Pfad in `deploy.cmd` aus Phase 2
      eintragen und dort einmal prüfen — ein falscher Pfad lädt wortlos nichts hoch.

## Report-Back
