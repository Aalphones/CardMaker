# Phase 2 — Schriftnamen prüfen

Heute steht die Liste erlaubter Schriften als feste Konstante im Prüfer. Sobald Schriften
hochgeladen werden können, ist diese Liste nicht mehr im Quelltext bekannt — sie steht zur
Hälfte in der Datenbank.

Warum das eine eigene Phase ist: `LayerValidator` ist die einzige Stelle, die verhindert,
dass Unsinn in `templates.layers` landet (der Datenblock ist von der Datenbank ungeprüft,
ADR-014). Ein Fehler hier fällt erst auf, wenn Templates schon kaputt gespeichert sind.

## Vorher lesen

- `backend/src/Validators/LayerValidator.php` — vor allem `FONT_FAMILIES` und die Stelle, an
  der `font_family` geprüft wird (`requiredEnum`, um Zeile 266)
- `backend/src/Services/TemplateService.php` — wer den Prüfer aufruft und woher der die
  Abhängigkeit bekommen könnte
- `backend/src/Repositories/FontRepository.php` (aus Phase 1)
- `docs/decisions/014-template-layout-als-datenblock.md`

## Abnahmekriterien

- Ein Template mit `font_family: "cmfont-7"` speichert, **wenn** Schrift 7 existiert.
- Dasselbe Template speichert **nicht**, wenn Schrift 7 nicht (mehr) existiert — Fehlermeldung
  nennt Ebene und Schriftname.
- Ein Template mit `font_family: "Arial"` speichert weiterhin.
- Ein Template mit `font_family: "Comic Sans MS"` (nie eingetragen) wird weiterhin abgelehnt.
- Der Prüfer stellt für ein Template mit 100 Textebenen **nicht** 100 Datenbankabfragen —
  die vorhandenen Schriftnummern werden einmal geholt.

## Checkliste

- [ ] `LayerValidator` von statischen Methoden auf eine Instanz mit Konstruktor umstellen,
      die die erlaubten hochgeladenen Familien als `array<string>` bekommt. **Nicht** das
      Repository in den Prüfer injizieren — der Prüfer bleibt ohne Datenbankwissen, der
      Aufrufer (`TemplateService`) holt die Liste einmal und reicht sie durch.
- [ ] `FONT_FAMILIES` bleibt als Konstante für die eingebauten Schriften und heißt
      `BUILT_IN_FONT_FAMILIES`. Geprüft wird gegen die Vereinigung beider Listen.
- [ ] Fehlermeldung bei unbekannter Schrift so formulieren, dass sie ohne Vorwissen trägt:
      „Die Schriftart dieser Ebene gibt es nicht (mehr)." — nicht der rohe Wert allein.
- [ ] Alle Aufrufer von `LayerValidator::validateAll()` nachziehen.
- [ ] Doku: `docs/models.md` bei `templates.layers` ergänzen, dass `font_family` entweder
      eine eingebaute Schrift oder `cmfont-<id>` ist.

## 🟡 Stolperstelle

Wird eine Schrift gelöscht, während ein Template sie benutzt, verweigert Phase 1 das Löschen.
Der umgekehrte Weg bleibt trotzdem offen: Datenbank von Hand aufgeräumt, Datei weg — dann
lässt sich ein bestehendes Template **nicht mehr speichern**, obwohl es sich öffnen lässt.
Das ist bewusst so (lieber Verweigerung als stille Änderung), gehört aber in die Meldung:
sie muss sagen, **welche** Ebene betroffen ist, damit man sie umstellen kann.

## Bericht

*(nach der Umsetzung füllen)*
