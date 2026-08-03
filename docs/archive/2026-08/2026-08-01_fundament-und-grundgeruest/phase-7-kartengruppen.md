# Phase 7 — Kartengruppen

**Rating:** standard · **Status:** complete (Deploy + Abnahme-Rundgang stehen bei Sascha aus)

Erster vollständiger Durchstich durch alle Schichten: Datenbank → Backend → Speicher →
Oberfläche. Kartengruppen ersetzen hier die ursprünglich geplante Charakterverwaltung
(ADR-011) — bewusst einfach gehalten (nur Name + Beschreibung), weil der Zweck dieser Phase
ist, das Muster einmal sauber zu bauen. Templates und Karteninstanzen (Meilenstein 2/3)
kopieren dieses Muster später; Karten bekommen dann ein Fremdschlüsselfeld auf
`card_groups`.

Ab hier gilt: nach jeder größeren Backend-Änderung `deploy.cmd backend` laufen lassen, sonst
spricht das Frontend gegen einen alten Stand. Das ist der Preis aus ADR-006.

## Kontext lesen

- ADR-011 aus Phase 1 (keine Charakterverwaltung, Kartengruppen als reine Organisation)
- `docs/conventions/php.md` — Schichtenaufbau, Wire-Format
- `docs/conventions/state-management.md` — Aufbau einer Facade, Fallstrick
  „Reducer laufen vor Effects"
- `docs/conventions/angular.md`, `docs/conventions/css.md`
- README dieses Plans → Kontrakt, Abschnitt „Kartengruppen"
- Phase 3: Tabelle `card_groups`; Phase 4: Absicherung; Phase 5/6: Rahmen und Sperre

## Abnahmekriterien

1. Alle fünf Pfade aus dem Kontrakt antworten wie beschrieben.
2. Eine Kartengruppe mit Name und Beschreibung überlebt Anlegen, Neuladen und Bearbeiten
   unverändert — auch Umlaute und Emoji.
3. Löschen fragt nach.
4. Leerer Bestand zeigt eine hilfreiche Seite mit direkter Anlegen-Schaltfläche, keine leere
   Tabelle.
5. Ein Name mit mehr als 191 Zeichen wird mit Feldfehler abgewiesen, nicht mit einem
   Serverfehler.
6. Keine Komponente greift direkt auf den Speicher zu — alles über die Facade.

## Aufgaben

### Backend

- [x] `src/Repositories/CardGroupRepository.php`:
  - `all(): array`, `find(int $id): ?array`, `create(array $data): array`,
    `update(int $id, array $data): ?array`, `delete(int $id): bool`.
  - `formatCardGroup()` wandelt vor der Rückgabe nach camelCase (Regel „Wire-Format").
- [x] `src/Services/CardGroupService.php` — Fachlogik ohne HTTP-Wissen: keine besonderen
      Regeln über die Validierung hinaus, bewusst dünn — der Zweck dieser Phase ist das
      Muster, nicht Komplexität.
- [x] `src/Validators/CardGroupValidator.php` mit den Prüfhelfern aus `Support/Validator.php`
      (Phase 2) — `name` Pflicht, 1 bis 191 Zeichen; `description` optional, bis 2000
      Zeichen.
- [x] `src/Controllers/CardGroupController.php` — dünn, fünf Methoden entsprechend dem
      Kontrakt. Bei `PATCH` nur übergebene Felder ändern; ein fehlendes Feld ist keine
      Löschung.
- [x] Routen eintragen, Dienste im Einstiegspunkt einmalig erzeugen und teilen.
- [x] Von Hand prüfen (es gibt keine Tests): ein Name mit 192 Zeichen wird abgewiesen; ein
      Name mit Umlauten und einem Emoji kommt unverändert zurück. Ergebnisse ins
      Report-Back. **Noch offen:** Der Deploy-Lauf braucht einen echten Zugriff auf den
      Server und lässt sich hier nicht automatisiert auslösen — Sascha führt
      `deploy.cmd backend` von Hand aus, danach steht die Prüfung im Abnahme-Rundgang.

### Speicher-Abschnitt

- [x] `store/card-groups/` mit `card-groups.actions.ts`, `card-groups.feature.ts` (Reducer +
      Selektoren über `createFeature`, wie bei `tokens`/`auth`), `card-groups.effects.ts`,
      `card-groups.facade.ts`.
- [x] Zustand: `{ items, loaded, loading, error }`.
- [x] **Nur Erfolgs-Aktionen verändern den Zustand** — der dokumentierte Fallstrick aus
      `docs/conventions/state-management.md`. Kein vorgreifendes Aktualisieren im Reducer.
- [x] Facade mit `all`, `loaded`, `loading` als Signale, `byId(id)` mit Zwischenspeicher pro
      Kennung, sowie `ensureLoaded()`, `create()`, `update()`, `remove()`.
- [x] Ladeeffekt mit `withLatestFrom`-Absicherung auf `loaded`, wie in der Konvention gezeigt.

### Oberfläche

- [x] `features/card-groups/card-groups-list/` — Übersicht als Karten-Raster mit Name,
      Kurzfassung der Beschreibung. Suchfeld, das über den Namen filtert (rein im Browser,
      der Bestand ist klein). Schaltfläche „Neue Kartengruppe".
- [x] Leerer Bestand: eigene Ansicht mit einem Satz Erklärung, was eine Kartengruppe im
      CardMaker ist, und der Anlegen-Schaltfläche. Kein leerer Bildschirm.
- [x] `features/card-groups/card-groups-detail/` — Formular für Anlegen und Bearbeiten in
      einer
      Komponente, unterschieden über den Routenparameter. Adressen: `/card-groups/new` und
      `/card-groups/:id`.
- [x] Über dem Formular ein Satz Erklärung: „Kartengruppen organisieren gespeicherte Karten,
      z. B. eine Spiderman-Serie. Karten mit unterschiedlichen Bildern und Texten teilen sich
      dasselbe Template." Pflicht aus dem Bedienbarkeits-Gate — ohne diesen Satz ist nicht
      erkennbar, wozu eine Kartengruppe da ist, bevor es überhaupt Karten gibt.
- [x] Ungespeicherte Änderungen: beim Verlassen der Seite nachfragen (Routen-Absicherung
      `canDeactivate`).
- [x] Löschen mit Rückfragedialog über das CDK-Overlay, Text nennt den Namen.
- [x] Routen im Rahmen eintragen, Navigationspunkt „Kartengruppen" aktiv schalten.

### Dokumentation

- [x] `docs/code-map.md`: Zeile für das Feature `card-groups` mit den tatsächlich
      entstandenen Ordnern ergänzen — ordner-grob, keine Zeilennummern.

## Report-Back

Backend, Speicher-Slice und Oberfläche stehen — `npm run lint` und `npm run build` laufen
grün. Abweichungen vom Wortlaut der Aufgaben:

- **Namensschema Speicher-Slice:** Statt separater `reducer.ts`/`selectors.ts` folgt der
  Slice dem tatsächlichen Projektmuster (`tokens`, `auth`): Reducer und Selektoren leben
  zusammen in `card-groups.feature.ts` über `createFeature`.
- **Ladeeffekt-Absicherung:** `concatLatestFrom` statt `withLatestFrom` — das ist der
  NgRx-empfohlene Ersatz (vermeidet einen veralteten Closure-Snapshot) und exakt das Muster,
  das `tokens.effects.ts` schon nutzt. Gleiche Wirkung wie im Konventionsbeispiel.
- **Ordnernamen Oberfläche:** `card-groups-list/` und `card-groups-detail/` statt `list/`
  und `detail/` — folgt dem Sibling-Muster im Projekt (Ordnername = Dateiname, siehe
  `tokens-page/`, `login/`).
- **ConfirmDialog & canDeactivate-Guard bewusst als geteilte Bausteine gebaut:**
  `shared/components/confirm-dialog/` (CDK `Dialog`-Service) und
  `shared/guards/pending-changes-guard.ts` — beide sind generisch gehalten, weil die
  gleichen Muster laut `docs/conventions/state-management.md` bei `templates`, `cards` und
  `print-projects` wieder gebraucht werden.
- **Navigation nach Anlegen/Bearbeiten** läuft im Effect (`tap` vor dem Erfolgs-Mapping),
  genau wie beim Login-Effect. Der `canDeactivate`-Guard prüft zusätzlich ein lokales
  `submitting`-Flag, damit die eigene erfolgreiche Speicherung nicht selbst die
  Ungespeichert-Warnung auslöst.

**CDK-Overlay-Grundstyles ergänzt:** `@angular/cdk/overlay-prebuilt.css` fehlte in
`angular.json` — ohne diese Datei positioniert sich ein CDK-Dialog nicht korrekt. Jetzt
eingebunden.

**Von Hand geprüft — noch offen:** Backend-Deploy und der komplette Rundgang (192-Zeichen-
Name, Umlaute/Emoji, Löschen-Rückfrage, Formularverlassen mit ungespeicherten Änderungen)
brauchen einen echten Zugriff auf den Server bzw. den Browser. Das Deploy-Skript endet mit
einer Bestätigung per Tastendruck und lässt sich hier bewusst nicht automatisiert auslösen —
das war schon immer als dein manueller Doppelklick gedacht. Prüf-Checkliste unten im
Abnahme-Rundgang der README, Punkte 8–10.
