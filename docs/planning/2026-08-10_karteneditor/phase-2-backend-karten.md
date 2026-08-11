# Phase 2 — Backend: Karten

**Rating:** standard (1:1 nach dem Muster von `templates`)

## Kontext — vorher lesen

- `README.md` dieses Plans → Kontrakt
- `backend/src/Controllers/TemplateController.php`
- `backend/src/Services/TemplateService.php`
- `backend/src/Repositories/TemplateRepository.php`
- `backend/src/Validators/TemplateValidator.php` und `LayerValidator.php`
- `backend/public/index.php` — Routen und die Verdrahtung der Dienste von Hand
- `backend/src/Support/WireFormat.php` — die Grenze snake_case ↔ camelCase
- `docs/conventions/php.md`

## Abnahmekriterien

- Alle Endpunkte aus dem Kontrakt (ohne die Bild-Endpunkte, die kommen in Phase 3) sind
  vorhanden und liefern das vereinbarte Format.
- `GET /api/cards` liefert die Kurzfassung inklusive `templateName` und `cardGroupName`
  (per JOIN, nicht per Nachladen je Zeile).
- Anlegen und Ändern prüfen:
  - `name` 1–191 Zeichen, nicht leer
  - `templateId` existiert
  - `cardGroupId` ist null oder existiert
  - `values`: Objekt, Schlüssel entsprechen dem Muster der Feldschlüssel
    (`^[a-z][a-z0-9_]{0,39}$`), Werte sind Zeichenketten bis 2000 Zeichen
  - `iconChoices`: Objekt, Werte sind Asset-Ids, die existieren
  - `textOverrides`: Objekt, je Eintrag optional `fontSize` (4–200), `color`
    (`#rrggbb`), `bold` und `italic` (Wahrheitswerte). Alle vier sind einzeln
    weglassbar — weggelassen heißt „so wie im Template", nicht „aus".
- **Werte werden nicht gegen das Template abgeglichen**: ein Feldschlüssel, den das
  Template (noch oder nicht mehr) kennt, ist kein Fehler. Ohne diese Regel würde jede
  Template-Änderung bestehende Karten unspeicherbar machen.
- Löschen eines Templates mit Karten schlägt mit Status 409 und klarer Meldung fehl
  („Dieses Template wird noch von N Karten benutzt.").
- Fehlerfeldnamen gehen in camelCase raus, wie im Bestand.

## Checkliste

- [ ] `backend/src/Repositories/CardRepository.php`: `all()` (Kurzfassung mit JOIN),
      `find(int $id)`, `create(array $data)`, `update(int $id, array $data)`,
      `delete(int $id)`, `countByTemplate(int $templateId)`, `countByGroup(int $groupId)`.
      JSON-Spalten beim Lesen dekodieren, beim Schreiben kodieren.
      Formatierung fürs Wire-Format wie in `TemplateRepository::format()`.
- [ ] `backend/src/Validators/CardValidator.php`: `validate()` (Anlegen),
      `validateForUpdate()` (nur übergebene Felder), plus private Prüfer für die drei
      JSON-Blöcke.
- [ ] `backend/src/Services/CardService.php`: Existenzprüfung von Template und Gruppe,
      Anlegen/Ändern/Löschen, `duplicate(int $id)` (Name mit Zusatz „ (Kopie)", Werte,
      Icon-Wahl und Abweichungen übernehmen — die **Bilder werden mitkopiert**, dazu
      Phase 3; hier eine Stelle vorsehen und mit `// Bilder: Phase 3` markieren).
- [ ] `backend/src/Controllers/CardController.php`: `index`, `show`, `create`, `update`,
      `destroy`, `duplicate` — dünn, kein SQL.
- [ ] `TemplateService::delete()` um die Sperre bei vorhandenen Karten erweitern
      (409 mit Anzahl). Analog zur bestehenden Sperre beim Löschen von Bildvorrats-Bildern.
- [ ] Routen in `backend/public/index.php` registrieren, inklusive
      `POST /api/cards/{id:\d+}/duplicate`. Dienste oben von Hand verdrahten, wie bei
      `templates`.
- [ ] Von Hand gegen die laufende lokale API prüfen: anlegen, lesen, ändern, duplizieren,
      löschen, Template mit Karte löschen (muss scheitern), Gruppe mit Karten löschen
      (Karten bleiben, Zuordnung wird leer).
- [ ] `docs/routes.md` und `docs/clients.md` um die neuen Endpunkte ergänzen (Dateien
      anlegen, falls noch nicht vorhanden).
- [ ] `docs/code-map.md`: Zeile `cards` von „existiert noch nicht" auf den Ist-Stand
      umschreiben.

## Report-Back
