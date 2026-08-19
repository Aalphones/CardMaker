<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

/**
 * Prüft nur die Form der Daten (Zeichenketten, Zahlenbereiche, Schlüsselmuster) — ob
 * `template_id`/`card_group_id` wirklich existieren und ob die Bild-Kennungen in
 * `icon_choices` echte Bilder sind, kann diese Klasse ohne Datenbankwissen nicht
 * entscheiden und prüft `CardService`, genau wie bei `TemplateService::update()`.
 */
final class CardValidator
{
    /** Von {@see \App\Services\MetaService} als `cards.valueKeyPattern` verwendet. */
    public const KEY_PATTERN = '/^[a-z][a-z0-9_]{0,39}$/';
    /**
     * Für `icon_choices`-Schlüssel: das sind rohe Layer-Kennungen (Konva-UUIDs wie
     * `a36520e5-2edf-4c86-a65f-255e7d3aea4e`), keine Feldschlüssel — `KEY_PATTERN` erlaubt
     * keine Bindestriche und würde jede Icon-Auswahl ablehnen. Von
     * {@see \App\Services\MetaService} als `cards.iconChoiceKeyPattern` verwendet.
     */
    public const ICON_CHOICE_KEY_PATTERN = '/^.{1,191}$/';
    /** Von {@see \App\Services\MetaService} als `cards.textOverrides.colorPattern` verwendet. */
    public const HEX_PATTERN = '/^#[0-9a-fA-F]{6}$/';
    /** Von {@see \App\Services\MetaService} als `cards.nameMaxLength` verwendet. */
    public const NAME_MAX_LENGTH = 191;
    /** Von {@see \App\Services\MetaService} als `cards.valueMaxLength` verwendet. */
    public const VALUE_MAX_LENGTH = 2000;
    /** Von {@see \App\Services\MetaService} als `cards.textOverrides.fontSizeMin` verwendet. */
    public const TEXT_OVERRIDE_FONT_SIZE_MIN = 4;
    /** Von {@see \App\Services\MetaService} als `cards.textOverrides.fontSizeMax` verwendet. */
    public const TEXT_OVERRIDE_FONT_SIZE_MAX = 200;
    /** Von {@see \App\Services\MetaService} als `cards.textOverrides.flags` verwendet. */
    public const TEXT_OVERRIDE_FLAGS = ['bold', 'italic'];

    /**
     * @param array<string, mixed> $body
     * @return array{
     *     name: string,
     *     template_id: int,
     *     card_group_id: ?int,
     *     values: array<string, string>,
     *     icon_choices: array<string, int>,
     *     text_overrides: array<string, array<string, mixed>>
     * }
     */
    public static function validate(array $body): array
    {
        $fields = [];

        $name = self::validatedName($body, $fields);
        $templateId = self::validatedTemplateId($body, $fields);
        $cardGroupId = self::validatedCardGroupId($body, $fields);
        $values = self::validatedValues($body, $fields);
        $iconChoices = self::validatedIconChoices($body, $fields);
        $textOverrides = self::validatedTextOverrides($body, $fields);

        if ($fields !== []) {
            self::fail($fields);
        }

        return [
            'name' => $name,
            'template_id' => $templateId ?? 0,
            'card_group_id' => $cardGroupId,
            'values' => $values,
            'icon_choices' => $iconChoices,
            'text_overrides' => $textOverrides,
        ];
    }

    /**
     * Nur übergebene Felder werden geprüft, gleiches Muster wie `TemplateValidator`.
     *
     * @param array<string, mixed> $body
     * @return array{
     *     name?: string,
     *     template_id?: int,
     *     card_group_id?: ?int,
     *     values?: array<string, string>,
     *     icon_choices?: array<string, int>,
     *     text_overrides?: array<string, array<string, mixed>>
     * }
     */
    public static function validateForUpdate(array $body): array
    {
        $fields = [];
        $result = [];

        if (array_key_exists('name', $body)) {
            $result['name'] = self::validatedName($body, $fields);
        }

        if (array_key_exists('template_id', $body)) {
            $result['template_id'] = self::validatedTemplateId($body, $fields) ?? 0;
        }

        if (array_key_exists('card_group_id', $body)) {
            $result['card_group_id'] = self::validatedCardGroupId($body, $fields);
        }

        if (array_key_exists('values', $body)) {
            $result['values'] = self::validatedValues($body, $fields);
        }

        if (array_key_exists('icon_choices', $body)) {
            $result['icon_choices'] = self::validatedIconChoices($body, $fields);
        }

        if (array_key_exists('text_overrides', $body)) {
            $result['text_overrides'] = self::validatedTextOverrides($body, $fields);
        }

        if ($fields !== []) {
            self::fail($fields);
        }

        return $result;
    }

    /** @param array<string, mixed> $body */
    private static function validatedName(array $body, array &$fields): string
    {
        $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';

        if (!v::stringType()->length(v::between(1, self::NAME_MAX_LENGTH))->isValid($name)) {
            $fields['name'] = 'Bitte einen Namen mit höchstens ' . self::NAME_MAX_LENGTH . ' Zeichen angeben.';
        }

        return $name;
    }

    /** @param array<string, mixed> $body */
    private static function validatedTemplateId(array $body, array &$fields): ?int
    {
        $value = $body['template_id'] ?? null;

        if (!is_int($value)) {
            $fields['templateId'] = 'Bitte ein Template auswählen.';

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $body */
    private static function validatedCardGroupId(array $body, array &$fields): ?int
    {
        $value = $body['card_group_id'] ?? null;

        if ($value === null) {
            return null;
        }

        if (!is_int($value)) {
            $fields['cardGroupId'] = 'Bitte eine gültige Kartengruppe angeben oder das Feld leer lassen.';

            return null;
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, string>
     */
    private static function validatedValues(array $body, array &$fields): array
    {
        $value = $body['values'] ?? [];

        if (!is_array($value) || array_is_list($value) && $value !== []) {
            $fields['values'] = 'Die Werte müssen ein Objekt sein.';

            return [];
        }

        $result = [];

        foreach ($value as $key => $text) {
            if (!is_string($key) || preg_match(self::KEY_PATTERN, $key) !== 1) {
                $fields['values'] = 'Mindestens ein Feldschlüssel ist ungültig.';

                return [];
            }

            if (!is_string($text) || mb_strlen($text) > self::VALUE_MAX_LENGTH) {
                $fields['values'] = "Der Wert zu „$key\" darf höchstens " . self::VALUE_MAX_LENGTH . ' Zeichen haben.';

                return [];
            }

            $result[$key] = $text;
        }

        return $result;
    }

    /**
     * Ob die Bild-Kennungen wirklich existieren, prüft `CardService` — hier geht es nur um
     * die Form (Objekt, Werte sind Zahlen).
     *
     * @param array<string, mixed> $body
     * @return array<string, int>
     */
    private static function validatedIconChoices(array $body, array &$fields): array
    {
        $value = $body['icon_choices'] ?? [];

        if (!is_array($value) || array_is_list($value) && $value !== []) {
            $fields['iconChoices'] = 'Die Icon-Auswahl muss ein Objekt sein.';

            return [];
        }

        $result = [];

        foreach ($value as $key => $assetId) {
            if (!is_string($key) || preg_match(self::ICON_CHOICE_KEY_PATTERN, $key) !== 1) {
                $fields['iconChoices'] = 'Mindestens eine Ebenen-Kennung ist ungültig.';

                return [];
            }

            if (!is_int($assetId)) {
                $fields['iconChoices'] = "Die Auswahl zu „$key\" muss eine Bild-Kennung sein.";

                return [];
            }

            $result[$key] = $assetId;
        }

        return $result;
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, array<string, mixed>>
     */
    private static function validatedTextOverrides(array $body, array &$fields): array
    {
        $value = $body['text_overrides'] ?? [];

        if (!is_array($value) || array_is_list($value) && $value !== []) {
            $fields['textOverrides'] = 'Die Abweichungen müssen ein Objekt sein.';

            return [];
        }

        $result = [];

        foreach ($value as $key => $override) {
            if (!is_string($key) || preg_match(self::KEY_PATTERN, $key) !== 1) {
                $fields['textOverrides'] = 'Mindestens ein Feldschlüssel ist ungültig.';

                return [];
            }

            if (!is_array($override)) {
                $fields['textOverrides'] = "Die Abweichung zu „$key\" muss ein Objekt sein.";

                return [];
            }

            $result[$key] = self::validatedTextOverride($override, $key, $fields);
        }

        return $result;
    }

    /**
     * Alle vier Felder sind einzeln weglassbar — weggelassen heißt „so wie im Template",
     * nicht „aus" (siehe Kontrakt in der Plan-README).
     *
     * @param array<string, mixed> $override
     * @return array<string, mixed>
     */
    private static function validatedTextOverride(array $override, string $fieldKey, array &$fields): array
    {
        $result = [];

        if (array_key_exists('font_size', $override)) {
            $fontSize = $override['font_size'];

            if (
                (!is_int($fontSize) && !is_float($fontSize))
                || $fontSize < self::TEXT_OVERRIDE_FONT_SIZE_MIN
                || $fontSize > self::TEXT_OVERRIDE_FONT_SIZE_MAX
            ) {
                $fields['textOverrides'] = "Die Schriftgröße zu „$fieldKey\" muss zwischen "
                    . self::TEXT_OVERRIDE_FONT_SIZE_MIN . ' und ' . self::TEXT_OVERRIDE_FONT_SIZE_MAX . ' liegen.';
            } else {
                $result['font_size'] = $fontSize;
            }
        }

        if (array_key_exists('color', $override)) {
            $color = $override['color'];

            if (!is_string($color) || preg_match(self::HEX_PATTERN, $color) !== 1) {
                $fields['textOverrides'] = "Die Farbe zu „$fieldKey\" muss im Format #rrggbb sein.";
            } else {
                $result['color'] = $color;
            }
        }

        if (array_key_exists('bold', $override)) {
            $bold = $override['bold'];

            if (!is_bool($bold)) {
                $fields['textOverrides'] = "Fett zu „$fieldKey\" muss ein echter Wahrheitswert sein.";
            } else {
                $result['bold'] = $bold;
            }
        }

        if (array_key_exists('italic', $override)) {
            $italic = $override['italic'];

            if (!is_bool($italic)) {
                $fields['textOverrides'] = "Kursiv zu „$fieldKey\" muss ein echter Wahrheitswert sein.";
            } else {
                $result['italic'] = $italic;
            }
        }

        return $result;
    }

    /** @param array<string, string> $fields */
    private static function fail(array $fields): never
    {
        Response::error(
            Response::ERROR_VALIDATION_FAILED,
            'Die Angaben sind unvollständig oder falsch.',
            422,
            $fields
        );
    }
}
