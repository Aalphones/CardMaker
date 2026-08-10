# Phase 3 — App-Rahmen, Anmeldung, Zugriffstoken

**Rating:** standard

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitte „1. Login" und „2. App shell"
- `frontend/src/app/layout/shell/` — heutige Hülle (Kopfzeile + Navigation)
- `frontend/src/app/features/auth/login/`
- `frontend/src/app/features/auth/tokens/tokens-page/`
- `frontend/src/styles/_bausteine.scss` (Phase 2)

## Abnahmekriterien

- **Kopfzeile**: Flächenfarbe, 1px Trennlinie unten. Links die Wortmarke „CardMaker" in
  Caprasimo in der Akzentfarbe, daneben die E-Mail des angemeldeten Kontos gedämpft in
  13px, rechtsbündig ein Zweitrang-Button „Abmelden" mit Abmelde-Icon (15px).
- **Seitenspalte**: Breite 216px, Innenabstand 17.6px, Abstand zwischen den Einträgen
  4.4px, Flächenfarbe, 1px Trennlinie rechts. Einträge als Zeile mit Icon und Text
  (14px, Innenabstand 8px/12px, Radius 12px).
  Aktiver Eintrag: Text `--color-accent-800` auf `--color-accent-200`.
  Inaktiv: normale Textfarbe, transparent, beim Überfahren `--color-neutral-200`.
- Die Einträge lauten **Alle Karten · Kartengruppen · Templates · Druckprojekte**.
  „Alle Karten" und „Druckprojekte" zeigen auf noch nicht existierende Screens und sind
  in dieser Phase **sichtbar, aber gesperrt** (45 % Deckkraft, nicht anklickbar, Titel
  „kommt mit dem Karteneditor" bzw. „kommt mit dem Druckprojekt"). Sie werden in
  Meilenstein 3 bzw. 5 scharf geschaltet.
- Der Zähler-Punkt an „Druckprojekte" (Pille, Mindestbreite 20px, Höhe 20px,
  Akzentfläche, 11px) wird als Baustein angelegt, bleibt aber ohne Wert unsichtbar.
- **Hauptbereich**: scrollt eigenständig, Innenabstand 26.4px, Inhaltsspalte maximal
  1100px breit und linksbündig.
- **Anmeldeseite**: volle Fensterhöhe, zentrierte Karte mit Breite `min(380px, 100%)`,
  Innenabstand 35.2px/26.4px, Abstand 17.6px, Flächenfarbe, mittlerer Schatten.
  Darin: runder Ausweis 56×56 (`--color-accent-200`) mit 26px-Kartensymbol in
  `--color-accent-700`, Überschrift „CardMaker" in Caprasimo 30px, gedämpfte Unterzeile
  „Sammelkarten anlegen & drucken", die beiden Felder als Pillen, Anmelde-Button über
  die volle Breite.
- Die Zugriffstoken-Seite nutzt Karte, Tabelle und Buttons aus der Bausteinschicht und
  hat keine eigenen Farbwerte mehr.

## Checkliste

- [ ] `layout/shell/shell.html` + `shell.scss` auf den beschriebenen Aufbau umstellen.
      Navigation als `<nav>` mit `<ul>`/`<li>`, aktiver Eintrag über
      `routerLinkActive` — kein `<div>` mit Klick-Handler.
- [ ] Icons: Lucide-Pfade **inline als SVG** in der Vorlage, Strichstärke 2.75,
      `currentColor` als Strichfarbe. Keine Icon-Bibliothek als Abhängigkeit aufnehmen.
      Benötigt: Karten-Symbol (Wortmarke/Anmeldung), Raster, Ordner, Ebenen, Drucker,
      Abmelden.
- [ ] Gesperrte Navigationseinträge umsetzen: `aria-disabled="true"`, kein `routerLink`,
      Titel-Text wie oben. Kein stiller toter Link.
- [ ] `features/auth/login/` umbauen (Vorlage + Stylesheet). Die vorhandene
      Formularlogik und Fehlerbehandlung bleibt unverändert.
- [ ] `features/auth/tokens/tokens-page/` auf Bausteinklassen umstellen; eigene
      Farb- und Rahmenregeln entfernen.
- [ ] Sichtprüfung bei schmalem Fenster (unter 900px): die Seitenspalte darf den
      Hauptbereich nicht zerdrücken — unterhalb von 900px klappt sie auf eine
      waagerechte Leiste über dem Inhalt um.
- [ ] `docs/code-map.md`: Zeile zu `layout/shell/` um den neuen Aufbau ergänzen
      (Kopfzeile + Seitenspalte mit vier Einträgen, zwei davon bis Meilenstein 3/5 gesperrt).

## Report-Back
