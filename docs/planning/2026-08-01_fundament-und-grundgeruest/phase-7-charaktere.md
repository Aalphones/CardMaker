# Phase 7 — Charakterverwaltung

**Rating:** standard · **Status:** pending

Erster vollständiger Durchstich durch alle Schichten: Datenbank → Backend → Speicher →
Oberfläche. Das Muster dieser Phase wird für Bilder und später für Templates kopiert — hier
sauber bauen zahlt sich mehrfach aus.

Ab hier gilt: nach jeder größeren Backend-Änderung `deploy.cmd backend` laufen lassen, sonst
spricht das Frontend gegen einen alten Stand. Das ist der Preis aus ADR-006.

## Kontext lesen

- ADR-007 aus Phase 1 (frei benannte Attribute)
- `docs/conventions/php.md` — Schichtenaufbau, Wire-Format
- `docs/conventions/state-management.md` — Aufbau einer Facade, Fallstrick
  „Reducer laufen vor Effects"
- `docs/conventions/angular.md`, `docs/conventions/css.md`
- README dieses Plans → Kontrakt, Abschnitt „Charaktere"
- Phase 3: Tabelle `characters`; Phase 4: Absicherung; Phase 5/6: Rahmen und Sperre

## Abnahmekriterien

1. Alle sechs Pfade aus dem Kontrakt antworten wie beschrieben.
2. Ein Charakter mit zwei eigenen Attributen überlebt Anlegen, Neuladen und Bearbeiten
   unverändert — auch Umlaute und Emoji.
3. Attributnamen aus vorhandenen Charakteren erscheinen beim Anlegen eines neuen als
   Vorschläge.
4. Löschen fragt nach und nennt dabei, wie viele Bilder mitgelöscht werden.
5. Leerer Bestand zeigt eine hilfreiche Seite mit direkter Anlegen-Schaltfläche, keine leere
   Tabelle.
6. Ein Name mit mehr als 191 Zeichen wird mit Feldfehler abgewiesen, nicht mit einem
   Serverfehler.
7. Keine Komponente greift direkt auf den Speicher zu — alles über die Facade.

## Aufgaben

### Backend

- [ ] `src/Repositories/CharacterRepository.php`:
  - `all(): array`, `find(int $id): ?array`, `create(array $data): array`,
    `update(int $id, array $data): ?array`, `delete(int $id): bool`,
    `attributeKeys(): array`.
  - `attributes` wird beim Schreiben mit `json_encode(..., JSON_UNESCAPED_UNICODE)` abgelegt
    und beim Lesen dekodiert. Ein leeres Attributobjekt ist `{}`, niemals `null`.
  - `imageCount` über eine Unterabfrage auf `images` mitliefern — nicht pro Zeile
    nachfragen.
  - `formatCharacter()` wandelt vor der Rückgabe nach camelCase (Regel „Wire-Format").
  - `attributeKeys()` liest alle Attributspalten, sammelt die Schlüssel in PHP, gibt sie
    einmalig und alphabetisch zurück. Bewusst einfach gehalten: Bei der zu erwartenden
    Datenmenge (dreistellig) ist das unkritisch, und eine JSON-Abfrage in SQL wäre schwerer zu
    lesen als der Gewinn wert. Diesen Grund als Kommentar hinterlegen.
- [ ] `src/Services/CharacterService.php` — Fachlogik ohne HTTP-Wissen: prüft beim Anlegen,
      dass Attributnamen nicht leer und höchstens 64 Zeichen lang sind, verwirft Attribute
      mit leerem Wert, statt sie zu speichern.
- [ ] `src/Validators/CharacterValidator.php` mit den Prüfhelfern aus `Support/Validator.php`
      (Phase 2) — `name` Pflicht, 1 bis 191 Zeichen;
      `description` optional, bis 5000 Zeichen; `attributes` optional, flaches Objekt aus
      Text zu Text, höchstens 50 Einträge, jeder Wert bis 500 Zeichen. Verschachtelte
      Objekte werden abgewiesen — ADR-007 legt eine flache Zuordnung fest, und ein
      durchgerutschtes verschachteltes Objekt bricht später den Template-Editor.
- [ ] `src/Controllers/CharacterController.php` — dünn, sechs Methoden entsprechend dem
      Kontrakt. Bei `PATCH` nur übergebene Felder ändern; ein fehlendes Feld ist keine
      Löschung.
- [ ] Routen eintragen, Dienste im Einstiegspunkt einmalig erzeugen und teilen.
- [ ] Von Hand prüfen (es gibt keine Tests): Attribut mit leerem Wert fällt weg; Attributname
      mit 65 Zeichen wird abgewiesen; ein Name mit Umlauten und einem Emoji kommt unverändert
      zurück. Ergebnisse ins Report-Back.

### Speicher-Abschnitt

- [ ] `store/characters/` mit `actions`, `reducer`, `effects`, `selectors`, `facade`.
- [ ] Zustand: `{ items, loaded, loading, error, attributeKeys }`.
- [ ] **Nur Erfolgs-Aktionen verändern den Zustand** — der dokumentierte Fallstrick aus
      `docs/conventions/state-management.md`. Kein vorgreifendes Aktualisieren im Reducer.
- [ ] Facade mit `all`, `loaded`, `loading`, `attributeKeys` als Signale,
      `byId(id)` mit Zwischenspeicher pro Kennung, sowie `ensureLoaded()`, `create()`,
      `update()`, `remove()`.
- [ ] Ladeeffekt mit `withLatestFrom`-Absicherung auf `loaded`, wie in der Konvention gezeigt.
- [ ] Nach erfolgreichem Anlegen oder Ändern die Attributnamen neu laden — sonst fehlt ein
      frisch erfundener Name in der Vorschlagsliste des nächsten Formulars.

### Oberfläche

- [ ] `features/characters/list/` — Übersicht als Karten-Raster mit Name, Kurzfassung der
      Beschreibung, Anzahl Bilder. Suchfeld, das über Namen und Attributwerte filtert
      (rein im Browser, der Bestand ist klein). Schaltfläche „Neuer Charakter".
- [ ] Leerer Bestand: eigene Ansicht mit einem Satz Erklärung, was ein Charakter im
      CardMaker ist, und der Anlegen-Schaltfläche. Kein leerer Bildschirm.
- [ ] `features/characters/detail/` — Formular für Anlegen und Bearbeiten in einer
      Komponente, unterschieden über den Routenparameter. Adressen: `/characters/new` und
      `/characters/:id`.
- [ ] Attribut-Bearbeitung: Zeilenliste aus Name und Wert mit Hinzufügen- und
      Entfernen-Schaltfläche. Das Namensfeld ist ein Eingabefeld mit Vorschlagsliste
      (`<datalist>`) aus den bekannten Attributnamen — Vorschlag, kein Zwang, und ohne
      zusätzliches Bedienelement.
- [ ] Über der Attributliste ein Satz Erklärung: „Attribute sind frei wählbar. Templates
      greifen später darauf zu, zum Beispiel `element` oder `faction`." Pflicht aus dem
      Bedienbarkeits-Gate — ohne diesen Satz ist nicht erkennbar, wozu die Felder da sind.
- [ ] Ungespeicherte Änderungen: beim Verlassen der Seite nachfragen (Routen-Absicherung
      `canDeactivate`).
- [ ] Löschen mit Rückfragedialog über das CDK-Overlay, Text nennt Name und Anzahl der
      mitgelöschten Bilder.
- [ ] Routen im Rahmen eintragen, Navigationspunkt „Charaktere" aktiv schalten.

### Dokumentation

- [ ] `docs/code-map.md`: Zeile für das Feature `characters` mit den tatsächlich entstandenen
      Ordnern ergänzen — ordner-grob, keine Zeilennummern.

## Report-Back
