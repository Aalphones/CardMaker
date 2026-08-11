# Kartenschriften — Herkunft und Lizenz

Alle Dateien hier stammen aus dem Google-Fonts-Bestand
([github.com/google/fonts](https://github.com/google/fonts)) und sind auf das
`latin`-Zeichenset gekürzt (die Fassung, die Google selbst ausliefert). Sie dürfen frei
genutzt, verändert und mit der App weiterverbreitet werden.

| Datei | Schrift | Lizenz |
|---|---|---|
| `berkshire-swash-400.woff2` | Berkshire Swash | SIL Open Font License 1.1 |
| `great-vibes-400.woff2` | Great Vibes | SIL Open Font License 1.1 |
| `cinzel-400.woff2` | Cinzel | SIL Open Font License 1.1 |
| `medievalsharp-400.woff2` | MedievalSharp | SIL Open Font License 1.1 |
| `uncial-antiqua-400.woff2` | Uncial Antiqua | SIL Open Font License 1.1 |
| `bangers-400.woff2` | Bangers | SIL Open Font License 1.1 |
| `luckiest-guy-400.woff2` | Luckiest Guy | Apache License 2.0 |
| `bungee-400.woff2` | Bungee | SIL Open Font License 1.1 |
| `merriweather-400.woff2` | Merriweather | SIL Open Font License 1.1 |
| `lato-400.woff2` | Lato | SIL Open Font License 1.1 |

Die vollständigen Lizenztexte liegen daneben: `OFL.txt` und `LICENSE-Apache-2.0.txt`.

## Warum nur diese

Schriften, die mit Office oder Windows ausgeliefert werden (Matura MT Script Capitals,
Bradley Hand, Segoe Script …), gehören ihren Herstellern. Sie auf dem eigenen Server
mitauszuliefern ist Weiterverbreitung und von keiner Office-Lizenz gedeckt — deshalb stehen
sie hier nicht, auch wenn Seiten wie font.download sie zum Herunterladen anbieten.

## Neue Schrift aufnehmen

1. `.woff2` hier ablegen (Namensschema `<schrift>-400.woff2`), Lizenz oben eintragen.
2. `@font-face`-Eintrag in `frontend/src/styles/_kartenschriften.scss` ergänzen.
3. Familie in `frontend/src/app/shared/canvas/rendering/fonts.ts` eintragen
   (Sorte + Ersatzschrift).
4. Familie in `backend/src/Validators/LayerValidator.php` (`BUILT_IN_FONT_FAMILIES`) ergänzen —
   fehlt sie dort, weist das Backend jedes Template mit dieser Schrift beim Speichern ab.

Ab dem geplanten Schriften-Upload über die Oberfläche entfällt dieser Weg für neue Schriften.
