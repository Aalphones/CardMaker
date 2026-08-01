# Phase 7 — Kartengruppen

**Rating:** standard · **Status:** pending

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

- [ ] `src/Repositories/CardGroupRepository.php`:
  - `all(): array`, `find(int $id): ?array`, `create(array $data): array`,
    `update(int $id, array $data): ?array`, `delete(int $id): bool`.
  - `formatCardGroup()` wandelt vor der Rückgabe nach camelCase (Regel „Wire-Format").
- [ ] `src/Services/CardGroupService.php` — Fachlogik ohne HTTP-Wissen: keine besonderen
      Regeln über die Validierung hinaus, bewusst dünn — der Zweck dieser Phase ist das
      Muster, nicht Komplexität.
- [ ] `src/Validators/CardGroupValidator.php` mit den Prüfhelfern aus `Support/Validator.php`
      (Phase 2) — `name` Pflicht, 1 bis 191 Zeichen; `description` optional, bis 2000
      Zeichen.
- [ ] `src/Controllers/CardGroupController.php` — dünn, fünf Methoden entsprechend dem
      Kontrakt. Bei `PATCH` nur übergebene Felder ändern; ein fehlendes Feld ist keine
      Löschung.
- [ ] Routen eintragen, Dienste im Einstiegspunkt einmalig erzeugen und teilen.
- [ ] Von Hand prüfen (es gibt keine Tests): ein Name mit 192 Zeichen wird abgewiesen; ein
      Name mit Umlauten und einem Emoji kommt unverändert zurück. Ergebnisse ins
      Report-Back.

### Speicher-Abschnitt

- [ ] `store/card-groups/` mit `actions`, `reducer`, `effects`, `selectors`, `facade`.
- [ ] Zustand: `{ items, loaded, loading, error }`.
- [ ] **Nur Erfolgs-Aktionen verändern den Zustand** — der dokumentierte Fallstrick aus
      `docs/conventions/state-management.md`. Kein vorgreifendes Aktualisieren im Reducer.
- [ ] Facade mit `all`, `loaded`, `loading` als Signale, `byId(id)` mit Zwischenspeicher pro
      Kennung, sowie `ensureLoaded()`, `create()`, `update()`, `remove()`.
- [ ] Ladeeffekt mit `withLatestFrom`-Absicherung auf `loaded`, wie in der Konvention gezeigt.

### Oberfläche

- [ ] `features/card-groups/list/` — Übersicht als Karten-Raster mit Name, Kurzfassung der
      Beschreibung. Suchfeld, das über den Namen filtert (rein im Browser, der Bestand ist
      klein). Schaltfläche „Neue Kartengruppe".
- [ ] Leerer Bestand: eigene Ansicht mit einem Satz Erklärung, was eine Kartengruppe im
      CardMaker ist, und der Anlegen-Schaltfläche. Kein leerer Bildschirm.
- [ ] `features/card-groups/detail/` — Formular für Anlegen und Bearbeiten in einer
      Komponente, unterschieden über den Routenparameter. Adressen: `/card-groups/new` und
      `/card-groups/:id`.
- [ ] Über dem Formular ein Satz Erklärung: „Kartengruppen organisieren gespeicherte Karten,
      z. B. eine Spiderman-Serie. Karten mit unterschiedlichen Bildern und Texten teilen sich
      dasselbe Template." Pflicht aus dem Bedienbarkeits-Gate — ohne diesen Satz ist nicht
      erkennbar, wozu eine Kartengruppe da ist, bevor es überhaupt Karten gibt.
- [ ] Ungespeicherte Änderungen: beim Verlassen der Seite nachfragen (Routen-Absicherung
      `canDeactivate`).
- [ ] Löschen mit Rückfragedialog über das CDK-Overlay, Text nennt den Namen.
- [ ] Routen im Rahmen eintragen, Navigationspunkt „Kartengruppen" aktiv schalten.

### Dokumentation

- [ ] `docs/code-map.md`: Zeile für das Feature `card-groups` mit den tatsächlich
      entstandenen Ordnern ergänzen — ordner-grob, keine Zeilennummern.

## Report-Back
