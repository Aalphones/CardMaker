# Phase 1 — Entscheidungen festhalten & Doku begradigen

**Rating:** mechanisch · **Status:** pending

Sechs Architektur-Entscheidungen sind gefallen und müssen als ADR festgehalten werden, bevor
Code entsteht — sonst rollt eine spätere Session sie neu auf. Dazu die Doku begradigen: an
mehreren Stellen steht heute das Gegenteil von dem, was gilt.

## Kontext lesen

- `docs/decisions/README.md` (ADR-Format)
- `docs/decisions/001-canvas-rendering-konva.md` (Vorbild für Aufbau und Länge)
- `docs/decisions/004-jwt-plus-pat-auth.md` (wird abgelöst)
- `docs/PROJECT.md`, `docs/code-map.md`
- `docs/conventions/testing.md`, `dod.md`, `php.md`, `tailwind.md` (wird zu `css.md`),
  `stack.md`, `linting.md`
- `package.json`, `.github/workflows/ci.yml`

## Abnahmekriterien

- Sechs neue ADRs mit den Nummern 005–010 liegen in `docs/decisions/`, jeweils mit Kontext,
  betrachteten Optionen, Entscheidung, Konsequenzen.
- ADR-004 trägt den Status „Abgelöst durch ADR-008" und einen Satz warum.
- `docs/conventions/testing.md` existiert nicht mehr, und kein anderes Dokument verweist noch
  darauf.
- `.github/` existiert nicht mehr.
- Kein Dokument behauptet mehr etwas, das eine Entscheidung überholt hat.

## Aufgaben

### ADR-005 — Karten werden im Browser gerendert, nicht auf dem Server

- [ ] `docs/decisions/005-client-side-rendering.md` anlegen.
- [ ] Kontext: Das Konzeptdokument sah serverseitiges Rendern vor. Konva zeichnet die Karte
      für die Vorschau ohnehin; eine zweite Zeichenlogik in PHP müsste pixelgleiche
      Ergebnisse liefern, inklusive Schriftmetrik und automatischer Textverkleinerung.
- [ ] Optionen: (a) nur Browser, (b) nur Server, (c) beides.
- [ ] Entscheidung: **nur Browser**. Konva-Bühne mit erhöhtem Pixelverhältnis exportieren.
      Eine Karte in 300 DPI sind 744×1039 Pixel, ein A4-Bogen 2480×3508 — unkritisch.
- [ ] Konsequenzen:
  - `backend/src/Rendering/` entfällt; das Backend speichert und liefert nur Daten.
  - Die Zeichenregeln (Einheiten-Umrechnung, automatische Textverkleinerung,
    Ebenen-Reihenfolge) liegen als reine TypeScript-Funktionen **ohne Konva-Abhängigkeit**
    unter `frontend/src/app/shared/canvas/rendering/` — damit sie lesbar und später
    portierbar bleiben.
  - Der später geplante Assistenten-Zugriff kann Daten pflegen, aber nicht selbst rendern.

### ADR-006 — Kein Composer, keine Bau-Automatik, Hochladen per Skript

- [ ] `docs/decisions/006-deployment-und-abhaengigkeiten.md` anlegen.
- [ ] Kontext: Auf der Entwicklungsmaschine gibt es weder PHP noch Composer noch MySQL noch
      Docker, und es soll keine Bau-Automatik geben. Damit kann kein `vendor/`-Verzeichnis
      entstehen — weder lokal noch auf einem Bau-Rechner.
- [ ] Optionen: (a) PHP und Composer lokal installieren, (b) `vendor/` von einem
      Bau-Durchlauf erzeugen lassen, (c) Backend ohne Composer-Abhängigkeiten schreiben.
- [ ] Entscheidung: **(c)**. Fünf vorgesehene Bibliotheken werden ersetzt durch rund 200
      Zeilen eigenen Code:

  | Vorgesehen war | Ersatz |
  |---|---|
  | `nikic/fast-route` | Eigener Wegweiser über Pfadsegmente, rund 50 Zeilen — bei etwa 15 Pfaden braucht es keinen Regelwerk-Übersetzer |
  | `vlucas/phpdotenv` | Eigener Leser für die Konfigurationsdatei, rund 20 Zeilen |
  | `monolog/monolog` | `error_log()` in eine Datei, rund 10 Zeilen |
  | `respect/validation` | Eigene Prüfhelfer, rund 60 Zeilen |
  | `firebase/php-jwt` | **Entfällt ersatzlos** — siehe ADR-008, es gibt keine JWT mehr |

- [ ] Ausdrücklich festhalten: **Nichts Kryptografisches wird selbst gebaut.** Der einzige
      Grund, warum der Verzicht auf `firebase/php-jwt` vertretbar ist, ist der Wegfall von
      JWT als solchem. Ein selbstgeschriebener Token-Prüfer wäre die falsche Sparsamkeit.
- [ ] Hochladen: ein Windows-Skript `deploy.cmd` im Projektstamm, Zugangsdaten in
      `deploy.env` (nicht im Git). Kein GitHub-Actions-Durchlauf, `.github/` wird entfernt.
- [ ] Konsequenzen: Jede Backend-Änderung braucht einen Hochlade-Lauf; es gibt keine
      automatische Prüfung vor dem Hochladen; kommt später doch eine Bibliothek dazu, ist das
      eine echte Entscheidung mit eigenem ADR, kein Nebenbei.

### ADR-007 — Charaktere haben feste Kernfelder plus frei benannte Attribute

- [ ] `docs/decisions/007-character-attributes.md` anlegen.
- [ ] Kontext: Templates greifen auf Werte wie `character.element` zu. Ein generischer
      Kartengenerator kann diese Felder nicht fest verdrahten — jedes Kartensystem hat andere.
- [ ] Optionen: (a) feste Spaltenliste, (b) frei benannte Attribute als JSON-Feld,
      (c) eigene Attribut-Tabelle mit Definition und Werten.
- [ ] Entscheidung: **(b)**. Kern fest (`name`, `description`), alles Weitere in einer
      JSON-Spalte `attributes` als flache Zuordnung Name → Text. Verfügbare Attributnamen
      werden aus dem Bestand abgeleitet und als Vorschläge angeboten.
- [ ] Konsequenzen: keine Schema-Änderung bei einem neuen Kartensystem; Attributwerte sind
      immer Text, Formatierung ist Sache des Templates; Tippfehler in Namen sind möglich,
      dagegen die Vorschlagsliste. Zeigt sich später Bedarf an Typen oder Pflichtfeldern, ist
      Variante (c) der Nachfolger — dann als neues ADR.

### ADR-008 — Zufallstoken in der Datenbank statt JWT (löst ADR-004 ab)

- [ ] `docs/decisions/008-opaque-tokens.md` anlegen.
- [ ] Kontext: ADR-004 sah JWT für den Browser und dauerhafte Zugriffstoken für Skripte vor —
      zwei Verfahren nebeneinander. Mit dem Wegfall von Composer (ADR-006) gäbe es für JWT
      keine geprüfte Bibliothek mehr, und selbst gebaute Signaturprüfung ist genau die Art
      Sparsamkeit, die man später bereut.
- [ ] Optionen: (a) JWT-Bibliothek doch einbinden und `vendor/` von Hand pflegen,
      (b) JWT selbst implementieren, (c) beide Tokenarten als Zufallswerte in der Datenbank.
- [ ] Entscheidung: **(c)**. Anmeldung erzeugt 32 Zufallsbytes, gespeichert wird nur der
      SHA-256-Hashwert in der Tabelle `sessions` samt Ablaufzeitpunkt. Zugriffstoken für
      Skripte funktionieren identisch, nur ohne Ablauf, in `personal_access_tokens`.
- [ ] Konsequenzen ehrlich benennen:
  - **Vorteil:** eine einzige Codebahn statt zweier; keine Kryptografie im eigenen Code;
    Abmelden wirkt sofort, was bei JWT prinzipbedingt nicht geht.
  - **Preis:** eine Datenbankabfrage pro Anfrage. Bei einem Einzelnutzer-Werkzeug irrelevant.
  - Laufzeit einer Anmeldung: 30 Tage. Ablage im Browser unter `localStorage`. Bei einer
    Skriptlücke im Frontend wäre das Token auslesbar — für ein Werkzeug ohne fremde Inhalte
    akzeptiert, bei Mehrbenutzerbetrieb zu revidieren.
  - Kein Passwort-Zurücksetzen; Wiederherstellung über phpMyAdmin.
- [ ] `docs/decisions/004-jwt-plus-pat-auth.md`: Status auf
      „**Abgelöst durch ADR-008 (2026-08-01)**" ändern, einen Satz Begründung ergänzen. Datei
      **nicht löschen** — eine abgelöste Entscheidung ist Teil der Geschichte.

### ADR-009 — Keine automatisierten Tests

- [ ] `docs/decisions/009-keine-automatisierten-tests.md` anlegen.
- [ ] Kontext: `docs/conventions/testing.md` schrieb Unit-Tests für Fachlogik vor, mit dem
      Argument, ein Rechenfehler falle erst am gedruckten Ergebnis auf. Das Argument bleibt
      richtig — die Abwägung fällt trotzdem anders aus: Ein Solo-Projekt ohne
      Bau-Automatik zahlt für eine Testsuite Zeit und laufende Pflege, und ohne
      automatischen Durchlauf verrottet sie erfahrungsgemäß.
- [ ] Optionen: (a) Testpflicht für Fachlogik wie ursprünglich geplant, (b) Tests nur für den
      Rechenkern ab dem Rendering-Plan, (c) gar keine Tests.
- [ ] Entscheidung: **(c)** für dieses Fundament. Geprüft wird über den Abnahme-Rundgang im
      Plan.
- [ ] Konsequenzen: `docs/conventions/testing.md` entfällt; `docs/conventions/dod.md` verliert
      die automatisierte Ebene und wird zur reinen Handprüfung; kein Testwerkzeug im Frontend,
      kein PHPUnit im Backend.
- [ ] **Wiedervorlage ausdrücklich festhalten:** Vor dem Rendering-Plan (Meilenstein 4) wird
      diese Entscheidung erneut gestellt — dort entstehen Einheiten-Umrechnung, automatische
      Textverkleinerung und Bogenaufteilung, also genau die Rechenlogik, für die das
      ursprüngliche Argument galt. Kein stillschweigendes Fortschreiben.

### ADR-010 — Semantic CSS statt Tailwind

- [ ] `docs/decisions/010-semantic-css-statt-tailwind.md` anlegen.
- [ ] Kontext: `docs/conventions/tailwind.md` verbot Utility-Klassen im Template bereits
      vollständig — Tailwinds einzige verbliebene Aufgabe war, den `@theme`-Block zu
      CSS-Custom-Properties zu kompilieren. Das ist genau das, was ein `:root`-Block in
      purem SCSS ohne Build-Plugin auch liefert. Bewusste Präferenz für CardMaker: Styling
      ausschließlich als semantisches CSS (BEM-Klassen, CSS Custom Properties als Tokens),
      kein Utility-Framework, auch nicht nur als Token-Pipeline im Hintergrund.
- [ ] Optionen: (a) Tailwind nur als `@theme`-Token-Quelle behalten (bisheriger Stand),
      (b) Tailwind restlos entfernen, Tokens als reine CSS Custom Properties in `styles.scss`,
      (c) ein dediziertes Token-Werkzeug wie Style Dictionary einführen.
- [ ] Entscheidung: **(b)**. Kein `tailwindcss`, kein `@tailwindcss/postcss`, keine
      PostCSS-Pipeline im Frontend. Zwei Schichten Custom Properties (Roh → Semantisch) direkt
      in `:root`, Komponenten konsumieren ausschließlich die semantische Schicht — Token-Regeln
      aus dem bisherigen `tailwind.md` bleiben inhaltlich gültig, nur ohne Tailwind darunter.
- [ ] Konsequenzen:
  - `docs/conventions/tailwind.md` wird zu `docs/conventions/css.md` (Inhalt neu geschrieben:
    BEM + scoped SCSS + Custom-Properties-Tokens, kein Tailwind-Bezug mehr).
  - `package.json` verliert `tailwindcss` und `@tailwindcss/postcss` aus `devDependencies`.
  - Phase 5 installiert kein Tailwind, legt keine `postcss.config.json` an; der
    Gestaltungs-Token-Schritt schreibt direkt einen `:root`-Block statt eines `@theme`-Blocks.
  - Eine Zeile weniger Build-Tooling, ein Abhängigkeit weniger zu pflegen — passt zur Linie aus
    ADR-006 (Ersatz durch Eigenbau, wo der Ersatz trivial ist und keine Kryptografie/Sicherheit
    betrifft).
- [ ] `AGENTS.md` → Conventions-Index: Zeile „Tailwind" auf „CSS / Styling" →
      `docs/conventions/css.md` ändern.

### Testgerüst und Bau-Automatik entfernen

- [ ] `docs/conventions/testing.md` löschen.
- [ ] `AGENTS.md` → Conventions-Index: Zeile „Testing" entfernen.
- [ ] `docs/conventions/dod.md` überarbeiten: den Abschnitt „Zwei Ebenen" auf eine Ebene
      zusammenziehen (nur Handprüfung), die Verweise auf `testing.md` und auf Unit-Tests
      entfernen. Der Kern der Datei bleibt gültig und wichtig — „Der Build war grün" ist
      ohnehin kein Beleg, und jetzt gibt es nicht mal mehr einen Build zum Grünsein.
- [ ] `docs/conventions/php.md`: Abschnitt „Rendering-Layer" entfernen, `Rendering/` aus dem
      Verzeichnisbaum streichen, Critical Rule 4 streichen. Neu unter Critical Rules: „Das
      Backend rendert nicht — Kartenbilder entstehen im Browser (ADR-005)" und „Keine
      Composer-Abhängigkeiten — was gebraucht wird, steht in `src/Support/` (ADR-006)".
- [ ] `.github/` samt Inhalt löschen.
- [ ] `package.json`: aus `lint-staged` die Zeile für `backend/**/*.php` entfernen — sie ruft
      ein PHP-Werkzeug auf, das es auf dieser Maschine nicht gibt, und wäre beim ersten
      Backend-Commit gescheitert. Die Prettier-Zeile für `frontend/**` bleibt.
- [ ] `docs/conventions/linting.md`: prüfen, ob dort PHP CS Fixer oder ein Bau-Durchlauf
      erwähnt wird, und die Stellen entfernen. ESLint und Prettier bleiben — sie laufen über
      den Commit-Hook und brauchen nur Node.

### Übrige Doku begradigen

- [ ] `docs/PROJECT.md` → Stack-Tabelle:
  - Zeile „Styling" auf „Semantic CSS — SCSS + BEM, CSS Custom Properties als Design-Tokens
    (kein Utility-Framework, siehe ADR-010)" ändern. Bisherige Zeile sagte „utility-first" und
    widersprach damit schon `docs/conventions/tailwind.md`, das Utility-Klassen im Template
    ausdrücklich verbot — ADR-010 löst den Widerspruch jetzt endgültig auf, indem Tailwind
    ganz entfällt statt nur als Token-Quelle zu bleiben.
  - Zeile „Backend libs" streichen (ADR-006).
  - Zeile „Auth" auf „Zufallstoken in der Datenbank, Sitzungen und Zugriffstoken" ändern.
  - Zeile „Tooling" auf ESLint und Prettier eindampfen; Husky bleibt, PHP CS Fixer geht.
- [ ] `docs/PROJECT.md` → Meilenstein 4 umformulieren: „Rendern in Druckauflösung im Browser
      (ADR-005)".
- [ ] `docs/PROJECT.md` → „Offene Fragen": die Frage nach client- oder serverseitigem Export
      streichen (ADR-005), ebenso die Frage nach einer zusätzlichen Zuschnitt-Oberfläche —
      `docs/conventions/stack.md` hat sie bereits entschieden. Es bleibt nur das
      Datenbankschema für Templates und Karten.
- [ ] `docs/PROJECT.md` → Stack-Abschnitt: den Absatz „Offene Stack-Frage" über
      Imagick-Verfügbarkeit entfernen, ein Satz zu ADR-005 stattdessen.
- [ ] `docs/conventions/stack.md`: Backend-Bibliotheken, Tooling- und Styling-Zeile
      entsprechend korrigieren (ADR-010: Semantic CSS statt Tailwind), Abschnitt „Was bewusst
      fehlt" um „kein Testwerkzeug, keine Bau-Automatik, keine Composer-Abhängigkeiten, kein
      Tailwind/PostCSS" ergänzen, den `tailwindcss.com`-Verweis aus den Source-of-truth-Links
      entfernen.
- [ ] `docs/conventions/angular.md`: Stack-Tabelle Zeile „Styling" auf „Semantic CSS (BEM +
      Custom Properties)" ändern, Abschnitt „CSS / Styling" verweist auf `css.md` statt
      `tailwind.md`.
- [ ] `README.md` und `AGENTS.md` → Tech-Stack-Kurzfassung: „Tailwind v4" aus der
      Frontend-Aufzählung streichen.
- [ ] `docs/code-map.md`: `Rendering/` aus dem Backend-Layout entfernen, `Support/` ergänzen;
      im Frontend-Layout unter `shared/canvas/` den Unterordner `rendering/` ergänzen.
- [ ] `docs/conventions/mcp.md` überfliegen und Stellen korrigieren, die serverseitiges
      Rendern oder JWT voraussetzen.

## Report-Back
