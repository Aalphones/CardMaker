"""Leitet aus den Ebenen eines Templates ab, was pro Karte ausgefüllt wird.

1:1-Übersetzung von `frontend/src/app/features/cards/card-editor/card-fields.ts`
(`describeCardFields`) — Reihenfolge der Ebenen bleibt erhalten, Doppel-Schlüssel bei
Textebenen erscheinen nur einmal, `image`-Ebenen zählen unabhängig von `source` (sie
tragen gar kein `source`-Feld), `text`/`icon` nur mit `source: "user"`. Ändert sich die
TypeScript-Fassung, muss diese Datei mitziehen.
"""
from __future__ import annotations


def describe_card_fields(layers: list[dict]) -> dict:
    images: list[dict] = []
    texts: list[dict] = []
    icons: list[dict] = []
    seen_text_keys: set[str] = set()

    for layer in layers:
        layer_type = layer.get("type")

        if layer_type == "image":
            images.append({"layerId": layer["id"], "label": layer["name"]})

        if layer_type == "text" and layer.get("source") == "user":
            key = layer["key"]
            if key not in seen_text_keys:
                seen_text_keys.add(key)
                texts.append(
                    {
                        "key": key,
                        "layerId": layer["id"],
                        "label": layer["name"],
                        "defaultText": layer.get("defaultText", ""),
                        "templateFontSize": layer.get("fontSize"),
                        "templateColor": layer.get("color"),
                        "templateBold": layer.get("bold", False),
                        "templateItalic": layer.get("italic", False),
                    }
                )

        if layer_type == "icon" and layer.get("source") == "user":
            icons.append(
                {
                    "layerId": layer["id"],
                    "label": layer["name"],
                    "choiceAssetIds": list(layer.get("choiceAssetIds", [])),
                }
            )

    return {"images": images, "texts": texts, "icons": icons}
