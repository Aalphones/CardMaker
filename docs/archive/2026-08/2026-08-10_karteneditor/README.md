# Meilenstein 3 — Karteneditor

Karteninstanzen: ein Template auswählen, seine Felder befüllen, ein Bild hochladen und
zurechtschieben, einer Kartengruppe zuordnen, speichern — und alle gespeicherten Karten
in einer durchsuchbaren Liste wiederfinden.

**Setzt den Design-Plan voraus** (`2026-08-10_design-organic/`): dieser Plan baut direkt
im neuen Aussehen und benutzt dessen Bausteinklassen. Wird er vorher umgesetzt, entfällt
jedes Nachstylen.

**Setzt ab Phase 5 den Vorschaubild-Plan voraus** (`2026-08-12_template-vorschaubilder/`,
angelegt 2026-08-12): Karten-Kacheln zeigen ein gespeichertes Bild statt live zu zeichnen.
Betroffen sind Phase 5 (Kachel zeigt das Bild) und Phase 7 (Bild beim Speichern erzeugen);
beide Dateien sind entsprechend angepasst.

## Grundsatz

Eine Karte speichert **nie** ein fertiges Bild, sondern nur: welches Template, welche
Texte, welche Icon-Wahl, welches hochgeladene Bild an welcher Stelle. Damit bleibt jede
Karte jederzeit neu renderbar, auch wenn das Template sich später ändert
(`AGENTS.md`, Regel 1).

## Entscheidungen, die schon gefallen sind (2026-08-10)

- **Bildausschnitt** wird direkt in der Live-Vorschau gemacht: Bild ziehen und zoomen,
  keine eigene Zuschneide-Oberfläche, kein Moduswechsel. Löst die offene Frage aus
  `docs/PROJECT.md`. → ADR-018 in Phase 1.
- **Kartenbilder liegen getrennt vom Bildvorrat**: eigene Ablage, an die Karte gebunden,
  verschwinden mit ihr. Rahmen und Icons (`assets`) bleiben unberührt. → ADR-017.
- **Keine Seltenheit** als festes Kartenfeld — im Entwurf nur Beispielinhalt. Wer eine
  Seltenheit auf der Karte will, legt im Template ein Textfeld dafür an.

## Übersicht

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Entscheidungen und Datenmodell](phase-1-entscheidungen-und-datenmodell.md) | heikel | complete (Migrationslauf offen) |
| 2 | [Backend: Karten](phase-2-backend-karten.md) | standard | complete (Live-Rundlauf offen, s. Phase-Datei) |
| 3 | [Backend: Kartenbilder](phase-3-backend-kartenbilder.md) | standard | complete (Live-Rundlauf offen, s. Phase-Datei) |
| 4 | [Frontend: Speicher und Routen](phase-4-frontend-speicher.md) | standard | complete |
| 5 | [Alle Karten](phase-5-kartenliste.md) | standard | complete (Live-Rundlauf offen, s. Phase-Datei) |
| 6 | [Karteneditor: Formular](phase-6-editor-formular.md) | heikel | complete (Live-Rundlauf offen, s. Phase-Datei) |
| 7 | [Karteneditor: Live-Vorschau](phase-7-live-vorschau.md) | heikel | complete (Live-Rundlauf offen, s. Phase-Datei) |
| 8 | [Bild ziehen und zoomen](phase-8-bild-platzieren.md) | heikel | complete (Live-Rundlauf offen, s. Phase-Datei) |
| 9 | [Verknüpfungen, Doku, Abnahme](phase-9-abschluss.md) | mechanisch | complete (Bildschirm-Rundlauf gegen die finalen AK offen, s. Phase-Datei) |

## Kontrakt zwischen Backend und Frontend

Gilt ab Phase 1 als festgenagelt. Wire-Format wie im Bestand: intern `snake_case`,
nach außen `camelCase` (`App\Support\WireFormat`).

### Karte

```ts
type Card = {
  id: number;
  name: string;                          // 1–191 Zeichen
  templateId: number;                    // muss existieren
  cardGroupId: number | null;
  values: Record<string, string>;        // Feldschlüssel der Textebene → Text
  iconChoices: Record<string, number>;   // Ebenen-Id → Asset-Id
  textOverrides: Record<string, {        // Feldschlüssel → Abweichung
    fontSize?: number;                   // 4–200
    color?: string;                      // #rrggbb
    bold?: boolean;                      // siehe Hinweis unter der Tabelle
    italic?: boolean;
  }>;
  images: CardImage[];
  createdAt: string;
  updatedAt: string;
};

type CardImage = {
  layerId: string;    // Id der Bildebene im Template
  offsetX: number;    // Canvas-Einheiten, Verschiebung des Bildes in seiner Fläche
  offsetY: number;
  scale: number;      // 0.1–10, 1 = das Bild füllt die kürzere Seite der Fläche
  width: number;      // Originalmaße der hochgeladenen Datei, in Pixeln
  height: number;
};
```

### Endpunkte

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/cards` | Kurzfassungen aller Karten (ohne `values`/`images`), für die Liste |
| POST | `/api/cards` | Karte anlegen |
| GET | `/api/cards/{id}` | Karte vollständig |
| PATCH | `/api/cards/{id}` | Karte ändern (nur übergebene Felder) |
| DELETE | `/api/cards/{id}` | Karte löschen, Bilder mit |
| POST | `/api/cards/{id}/duplicate` | Karte kopieren (Name + „ (Kopie)"), Bilder mit — in Phase 2 gebaut, hier nachgetragen |
| POST | `/api/cards/{id}/images` | Bild hochladen (mehrteilig: `layerId`, `file`), ersetzt ein vorhandenes derselben Ebene |
| PATCH | `/api/cards/{id}/images/{layerId}` | Verschiebung und Maßstab ändern |
| DELETE | `/api/cards/{id}/images/{layerId}` | Bild dieser Ebene entfernen |
| GET | `/api/cards/{id}/images/{layerId}/file` | Bilddatei, hinter der Anmeldung |

Kurzfassung für die Liste (`GET /api/cards`):
`{ id, name, templateId, templateName, cardGroupId, cardGroupName, updatedAt }`.

**Zu `bold`/`italic` in den Abweichungen (Entscheidung 2026-08-11):** Fett und Kursiv als
Eigenschaft einer Textebene entstehen im Plan „Eigene Schriften hochladen"
(inzwischen umgesetzt und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/phase-5-fett-und-kursiv.md`). Dass eine
einzelne Karte sie überschreiben darf, steht hier bewusst schon im Kontrakt — es sind zwei
Wahrheitswerte neben Schriftgröße und Farbe, die ohnehin überschreibbar sind. Sie jetzt
mitzuführen kostet nichts; sie nachträglich zu ergänzen hieße, ein Datenformat zu ändern,
in dem schon Karten liegen.

**Erledigt (Stand 2026-08-12):** Der Schriften-Plan ist durch, das Canvas zeichnet Fett und
Kursiv bereits. Der Vorbehalt „wird nur gespeichert, noch nicht gezeichnet" ist damit weg —
die zwei Felder wirken ab Phase 7 wie Schriftgröße und Farbe auch.

## Finale Abnahmekriterien

1. Eine neue Karte lässt sich von Grund auf anlegen: Template wählen → Felder erscheinen →
   Texte eingeben → Bild ablegen → zurechtschieben → Gruppe wählen → speichern.
2. Die Formularfelder ergeben sich **aus dem Template**: nur Textebenen und Icon-Ebenen
   mit „Wird pro Karte ausgefüllt/gewählt" tauchen auf, plus je ein Ablagefeld pro
   Bildfläche.
3. Die Live-Vorschau zeigt jede Eingabe sofort, inklusive automatischem Verkleinern zu
   langer Texte und der Abweichungen bei Schriftgröße, Farbe, Fett und Kursiv.
4. Ein hochgeladenes Bild lässt sich in seiner Fläche ziehen und mit dem Mausrad zoomen;
   der Ausschnitt bleibt nach dem Speichern und erneuten Öffnen erhalten.
5. „Alle Karten" listet alle Karten als Raster oder Tabelle, mit Suche nach Namen,
   Filter nach Template, Filter nach Gruppe und drei Sortierungen. Duplizieren und
   Löschen funktionieren.
6. Wird ein Template gelöscht, das noch Karten hat, wird das mit klarer Meldung
   verweigert. Wird eine Kartengruppe gelöscht, verlieren ihre Karten nur die Zuordnung.
7. Ändert sich ein Template nachträglich (Feld umbenannt, Ebene gelöscht), bleibt die
   Karte ladbar; verwaiste Werte gehen nicht verloren, werden aber nicht gerendert.
8. `npm run lint` und `npm run build` laufen sauber; die Migrationen laufen auf dem
   Server durch.

## Summary

Meilenstein 3 ist fertig: eine Karte lässt sich von Grund auf anlegen (Template wählen,
Textfelder befüllen, Bild hochladen/zurechtschieben/zoomen, Gruppe zuordnen, speichern), alle
gespeicherten Karten finden sich durchsuchbar/filterbar/sortierbar in „Alle Karten" wieder,
und die Verknüpfungen aus den anderen Screens (Gruppen-Kachel, Template-Überzeile,
„Karte erstellen" im Template-Editor) sind scharf geschaltet.

## Files touched

Backend: `Controllers/CardController.php`, `Controllers/CardImageController.php`,
`Services/CardService.php`, `Services/CardImageService.php`, `Services/CardGroupService.php`,
`Services/TemplateService.php`, `Repositories/CardRepository.php`,
`Repositories/CardImageRepository.php`, `Repositories/CardGroupRepository.php`,
`Repositories/TemplateRepository.php`, `Validators/CardValidator.php`,
`Validators/CardImageValidator.php`, `Migrations/M008CreateCards.php`,
`Migrations/M009CreateCardImages.php`.

Frontend: `features/cards/` (komplett neu — `cards-list/`, `card-editor/`, `image-drop/`),
`store/cards/`, `shared/canvas/card-image-loader.ts`,
`shared/canvas/rendering/card-content.ts`, `shared/canvas/card-canvas/*` (Kartenbild-Modus,
Zieh-/Zoom-Geste), `layout/shell/shell.html`, `features/card-groups/card-groups-list/*`,
`features/templates/templates-list/*`, `features/templates/template-editor/*`.

Doku: `docs/PROJECT.md`, `docs/code-map.md`, `docs/routes.md`, `docs/models.md`,
`docs/decisions/017…`, `docs/decisions/018…`.

## Commits

`da0bdf9` … `f26ebe3` (Phasen 1–8, siehe `git log --oneline`) plus der Abschluss-Commit dieser
Phase 9.

## Deviations from plan

Keine wesentlichen Abweichungen vom README-Kontrakt. Phase 9 hat zusätzlich die
`CardGroupService`/`TemplateService`-Einzelabfragen (`find`/`create`/`update`) um `cardCount`
ergänzt, damit die Kachel nach dem Bearbeiten einer Gruppe nicht kurz eine falsche Zahl zeigt
— im Plan stand nur der Listen-Endpunkt, das war eine notwendige Konsequenz daraus.

## Follow-ups

Der komplette Bildschirm-Rundlauf gegen die acht finalen Abnahmekriterien ist nie gefahren
worden (zieht sich seit Phase 2 durch die STATE.md-Historie) — steht beim Nutzer aus, siehe
Prüfliste im Abschluss-Bericht des Chats.
