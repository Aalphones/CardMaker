# Findings — Vorschaubilder für Templates

Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis in einem Satz>
```

- [ ] → Phase 3: Nach dem Speichern läuft das Hochladen des Bildes **nebenher** — es ist noch
      unterwegs, wenn der Nutzer sofort zur Übersicht zurückgeht. Die Kachel muss ihr Bild
      also am `previewUpdatedAt` der Liste festmachen und nicht am Zeitpunkt des Speicherns,
      sonst zeigt sie kurz den alten Stand.
- [ ] → Phase 3 (und Karteneditor-Plan Phase 7): Der Dienst heißt
      `features/templates/template-preview.ts`, Klasse `TemplatePreview` — nicht
      `template-preview.service.ts` wie im Plan geschrieben. Das Gegenstück für Karten folgt
      demselben Muster.
