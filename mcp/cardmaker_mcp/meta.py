"""Prüfung gegen die Auskunft `GET /api/meta`, bevor eine Anfrage rausgeht.

Bequemlichkeit, keine zweite Wahrheit: geprüft wird ausschließlich gegen Regeln, die
`/api/meta` beschreibt — also gegen die Backend-Prüfklassen selbst. Was Meta nicht
beschreibt, geht ungeprüft ans Backend. Der Gewinn ist die Fehlermeldung: sie nennt die
Regel im Klartext, statt eine Anfrage gegen ein `422` laufen zu lassen.

Nicht geprüft wird hier, ob ein Feldschlüssel im Template vorkommt — das prüft auch das
Backend nicht (Grundsatz in `docs/routes.md`). Dafür gibt es die Warnung in `server.py`.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from cardmaker_mcp.client import MULTIPART_CONTENT_TYPES

TEXT_OVERRIDE_KEYS = ("fontSize", "color", "bold", "italic")


def compile_pattern(pattern: str) -> re.Pattern[str]:
    """PHP-Muster in ein Python-Muster übersetzen.

    Die Auskunft reicht die Muster so durch, wie die Prüfklassen sie halten — inklusive
    der PHP-Trennzeichen (`/^…$/`). Python kennt keine Trennzeichen; blieben sie stehen,
    würde jeder gültige Wert abgelehnt.
    """
    if pattern.startswith("/") and pattern.rfind("/") > 0:
        closing = pattern.rfind("/")
        return re.compile(pattern[1:closing])

    return re.compile(pattern)


def validate_card_group_payload(meta: dict, payload: dict[str, Any]) -> None:
    """Namens- und Beschreibungslänge prüfen. Wirft `ValueError` mit Klartext."""
    rules = meta.get("cardGroups", {})

    _check_name(payload, rules.get("nameMaxLength"), "Kartengruppe")

    description = payload.get("description")
    max_length = rules.get("descriptionMaxLength")

    if isinstance(description, str) and isinstance(max_length, int) and len(description) > max_length:
        raise ValueError(
            f"Die Beschreibung ist {len(description)} Zeichen lang, erlaubt sind höchstens "
            f"{max_length} (Regel aus /api/meta)."
        )


def validate_card_payload(meta: dict, payload: dict[str, Any]) -> None:
    """Karten-Nutzlast gegen die Meta-Regeln prüfen. Wirft `ValueError` mit Klartext.

    Geprüft wird nur, was in der Nutzlast steht — die Nutzlast eines `update_card` trägt
    absichtlich nur die übergebenen Felder.
    """
    rules = meta.get("cards", {})
    key_pattern = compile_pattern(rules["valueKeyPattern"])

    _check_name(payload, rules.get("nameMaxLength"), "Karte")

    if "values" in payload:
        _check_values(payload["values"], key_pattern, rules.get("valueMaxLength"))

    if "iconChoices" in payload:
        icon_key_pattern = (
            compile_pattern(rules["iconChoiceKeyPattern"])
            if "iconChoiceKeyPattern" in rules
            else key_pattern
        )
        _check_icon_choices(payload["iconChoices"], icon_key_pattern)

    if "textOverrides" in payload:
        _check_text_overrides(payload["textOverrides"], key_pattern, rules.get("textOverrides", {}))


def _check_name(payload: dict[str, Any], max_length: int | None, subject: str) -> None:
    name = payload.get("name")

    if name is None:
        return

    if not isinstance(name, str) or not name.strip():
        raise ValueError(f"Der Name der {subject} darf nicht leer sein.")

    if isinstance(max_length, int) and len(name) > max_length:
        raise ValueError(
            f"Der Name ist {len(name)} Zeichen lang, erlaubt sind höchstens {max_length} "
            "(Regel aus /api/meta)."
        )


def _check_values(values: Any, key_pattern: re.Pattern[str], max_length: int | None) -> None:
    _require_mapping(values, "values")

    for key, text in values.items():
        _check_key(key, key_pattern, "Feldschlüssel in „values“")

        if not isinstance(text, str):
            raise ValueError(
                f"Der Wert zu „{key}“ muss Text sein, übergeben wurde {type(text).__name__}."
            )

        if isinstance(max_length, int) and len(text) > max_length:
            raise ValueError(
                f"Der Wert zu „{key}“ ist {len(text)} Zeichen lang, erlaubt sind höchstens "
                f"{max_length} (Regel aus /api/meta)."
            )


def _check_icon_choices(icon_choices: Any, key_pattern: re.Pattern[str]) -> None:
    _require_mapping(icon_choices, "iconChoices")

    for layer_id, asset_id in icon_choices.items():
        _check_key(layer_id, key_pattern, "Ebenen-Kennung in „iconChoices“")

        # `bool` ist in Python eine Ganzzahl — ohne die zweite Bedingung ginge `True` durch.
        if not isinstance(asset_id, int) or isinstance(asset_id, bool):
            raise ValueError(
                f"Die Icon-Auswahl zu „{layer_id}“ muss eine Bild-Kennung (Zahl) sein, "
                f"übergeben wurde {asset_id!r}. Kennungen liefert `list_assets`."
            )


def _check_text_overrides(
    text_overrides: Any, key_pattern: re.Pattern[str], rules: dict
) -> None:
    _require_mapping(text_overrides, "textOverrides")

    color_pattern = compile_pattern(rules["colorPattern"]) if "colorPattern" in rules else None
    font_size_min = rules.get("fontSizeMin")
    font_size_max = rules.get("fontSizeMax")

    for key, override in text_overrides.items():
        _check_key(key, key_pattern, "Feldschlüssel in „textOverrides“")
        _require_mapping(override, f"textOverrides[{key}]")

        unknown_keys = sorted(set(override) - set(TEXT_OVERRIDE_KEYS))
        if unknown_keys:
            # Das Backend würde solche Einträge stillschweigend verwerfen — dann sähe die
            # Abweichung gespeichert aus und wäre es nicht.
            raise ValueError(
                f"Unbekannte Angabe(n) in der Abweichung zu „{key}“: {unknown_keys}. "
                f"Erlaubt sind: {list(TEXT_OVERRIDE_KEYS)}."
            )

        _check_font_size(override, key, font_size_min, font_size_max)

        color = override.get("color")
        if color is not None and color_pattern is not None and not color_pattern.match(str(color)):
            raise ValueError(
                f"Die Farbe zu „{key}“ ist {color!r} — erwartet wird ein Farbwert der Form "
                "#rrggbb, zum Beispiel #1a2b3c (Regel aus /api/meta)."
            )

        for flag in ("bold", "italic"):
            if flag in override and not isinstance(override[flag], bool):
                raise ValueError(
                    f"„{flag}“ in der Abweichung zu „{key}“ muss true oder false sein, "
                    f"übergeben wurde {override[flag]!r}."
                )


def _check_font_size(
    override: dict, key: str, minimum: Any, maximum: Any
) -> None:
    font_size = override.get("fontSize")

    if font_size is None:
        return

    if not isinstance(font_size, (int, float)) or isinstance(font_size, bool):
        raise ValueError(
            f"Die Schriftgröße zu „{key}“ muss eine Zahl sein, übergeben wurde {font_size!r}."
        )

    if isinstance(minimum, (int, float)) and isinstance(maximum, (int, float)):
        if font_size < minimum or font_size > maximum:
            raise ValueError(
                f"Die Schriftgröße zu „{key}“ ist {font_size}, erlaubt ist {minimum} bis "
                f"{maximum} (Regel aus /api/meta)."
            )


def validate_image_file(meta: dict, file_path: Path) -> None:
    """Bilddatei vor dem Hochladen prüfen: Existenz, Größe, Dateiformat. Wirft `ValueError`.

    Ersetzt keine Serverprüfung (das Backend liest die echten Bildbytes über `finfo` und
    `getimagesize()`) — fängt nur die Fälle ab, die sich ohne Anfrage klären lassen: eine
    falsche Endung oder eine zu große Datei müssen nicht erst gegen die API laufen.
    """
    if not file_path.is_file():
        raise ValueError(f"Datei nicht gefunden: {file_path}")

    rules = meta.get("uploads", {})
    max_bytes = rules.get("imageMaxBytes")
    size = file_path.stat().st_size

    if isinstance(max_bytes, int) and size > max_bytes:
        raise ValueError(
            f"Die Datei ist {size} Bytes groß, erlaubt sind höchstens {max_bytes} Bytes "
            "(Regel aus /api/meta)."
        )

    extension = file_path.suffix.lower().lstrip(".")
    content_type = MULTIPART_CONTENT_TYPES.get(extension)
    allowed = set(rules.get("imageMimeTypes", [])) or set(MULTIPART_CONTENT_TYPES.values())

    if content_type is None or content_type not in allowed:
        raise ValueError(
            f"{file_path.name}: nicht unterstütztes Bildformat "
            f"{extension or '(keine Endung)'}. Erlaubt: {sorted(allowed)} (Regel aus /api/meta)."
        )


def validate_image_placement(meta: dict, payload: dict[str, Any]) -> None:
    """Verschiebung/Maßstab eines Kartenbilds gegen `/api/meta` prüfen. Wirft `ValueError`."""
    rules = meta.get("cards", {}).get("imagePlacement", {})

    for key, label in (("offsetX", "Verschiebung X"), ("offsetY", "Verschiebung Y")):
        if key in payload:
            _check_placement_range(
                payload[key], rules.get("offsetMin"), rules.get("offsetMax"), label
            )

    if "scale" in payload:
        _check_placement_range(payload["scale"], rules.get("scaleMin"), rules.get("scaleMax"), "Maßstab")


def _check_placement_range(value: Any, minimum: Any, maximum: Any, label: str) -> None:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"„{label}“ muss eine Zahl sein, übergeben wurde {value!r}.")

    if isinstance(minimum, (int, float)) and isinstance(maximum, (int, float)):
        if value < minimum or value > maximum:
            raise ValueError(
                f"„{label}“ ist {value}, erlaubt ist {minimum} bis {maximum} (Regel aus /api/meta)."
            )


def _require_mapping(value: Any, name: str) -> None:
    if not isinstance(value, dict):
        raise ValueError(f"„{name}“ muss ein Objekt sein, übergeben wurde {type(value).__name__}.")


def _check_key(key: Any, key_pattern: re.Pattern[str], subject: str) -> None:
    if not isinstance(key, str) or not key_pattern.match(key):
        raise ValueError(
            f"{subject} ist ungültig: {key!r}. Erlaubt sind Kleinbuchstabe am Anfang, danach "
            "Kleinbuchstaben, Ziffern und Unterstriche, höchstens 40 Zeichen "
            "(Regel aus /api/meta)."
        )
