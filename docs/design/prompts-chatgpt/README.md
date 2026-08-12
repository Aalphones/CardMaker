# Bild-Prompts für ChatGPT

Ein Prompt je Bildsorte, die CardMaker aufnimmt. Jeder geht an **ChatGPT**
(Bildmodell `gpt-image-2`) und ist so gebaut, dass ChatGPT zuerst den Entwurf
beschreibt und **im selben Chat** das Bild erzeugt. Platzhalter in
`{GROSSBUCHSTABEN}` ersetzen, den Rest wörtlich kopieren.

| Datei | Wofür in CardMaker | Zielgröße |
|---|---|---|
| [rahmen.md](rahmen.md) | FrameLayer — einer pro Template, vollflächig | 630×880 PNG, transparent |
| [icons.md](icons.md) | IconLayer — Auswahl im Template hinterlegt | 512×512 PNG, transparent |
| [artwork.md](artwork.md) | Kartenbild der Karteninstanz | ≥1024 px lange Kante, deckend |

**Dieselben Prompts stehen in der Anwendung** unter „Bild-Prompts" (`/prompts`),
dort mit Kopieren-Knopf. Die Texte liegen doppelt: hier als Quelle und in
`frontend/src/app/features/prompts/prompt-texts.ts` — wer hier etwas ändert,
zieht sie dort nach.

Die Varianten für die lokalen Modelle (FLUX.2 klein, Krea 2 in ComfyUI) stehen
in [`../master-prompt-sammelkarten-design.md`](../master-prompt-sammelkarten-design.md)
— dort nur für den Rahmen.

---

## Was für alle drei gilt

- **Sätze statt Stichwortwolke.** `masterpiece`, `8k`, `award winning` bringen
  nichts. Material, Licht und räumliche Beziehungen beschreiben.
- **Kein Negativ-Prompt.** Bei ChatGPT gibt es das Feld gar nicht. Alles
  Unerwünschte positiv formulieren: statt „keine Schrift" → „alle Zierfelder
  sind leere, glatte Flächen".
- **Gegliederte Abschnitte**, nicht ein Prosa-Block — das ist die Form, die
  OpenAI für dieses Modell empfiehlt (der eine Prosa-Absatz ist die Form für
  die lokalen Modelle).
- **Pro Runde genau eine Änderung.** Alles auf einmal ändern macht die Ursache
  unauffindbar. Beim Nachschärfen ausdrücklich sagen, was **unverändert**
  bleiben soll — sonst driftet der Rest mit.
- **Kantenlängen müssen Vielfache von 16 sein**, sonst fliegt der Request raus.
  1024 / 1440 / 512 erfüllen das, 1432 nicht.
- **Nur PNG** landet in CardMaker (ADR-015) — kein SVG, auch nicht für Icons.
- **Geschützte Figuren** lehnt ChatGPT per Richtlinie ab — die Durchsetzung ist
  löchrig, aber unvorhersehbar. Für Fandom-Motive sind die lokalen Modelle der
  Weg.

🟡 **Transparenz:** Die Projekt-Doku hält fest, dass GPT Image deckend ausgibt
und ein Freistell-Schritt hinterher nötig ist — deshalb arbeiten Rahmen- und
Icon-Prompt mit einer Chroma-Fläche. Bietet deine Oberfläche einen Schalter für
transparenten Hintergrund an, nimm den und lass die Chroma-Fläche weg; das
spart den Freistell-Schritt und den Farbsaum.

---

## Abnahme (alle drei)

- Keine Schrift, keine Signatur, kein Wasserzeichen im Bild.
- Rahmen und Icons: sauberer Alphakanal, kein Chroma-Saum an hellen Kanten.
- Rahmen: 630×880, freie Flächen tatsächlich frei — mit einem Testbild und
  echten Texten in der Kartenvorschau gegengeprüft, nicht nach Augenmaß.
- Icons: bei tatsächlicher Kartengröße erkennbar, mindestens 512 px abgelegt.
- Artwork: nach Schieben und Zoomen in der Bildfläche schneidet nichts
  Wesentliches an.
