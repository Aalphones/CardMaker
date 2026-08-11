<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use App\Support\WireFormat;

/**
 * Prüft die Ebenenliste eines Templates gegen die Feldtabellen aus der Plan-README
 * („Templates" / „Die fünf Ebenentypen"). Weil das Layout als ein Datenblock ohne
 * Datenbankprüfung gespeichert wird (ADR-014), ist diese Klasse die einzige Stelle, die
 * kaputte Daten abfängt.
 *
 * Arbeitet komplett in snake_case (Wire-Format-Grenze, siehe `Request::camelToSnake`) —
 * `TemplateRepository::format()` dreht das beim Antworten wieder zurück. Fehler-Feldnamen
 * gehen trotzdem camelCase nach außen (`fieldKey()`), sonst würde die Grenze über die
 * `fields`-Angabe im Fehlerformat doch noch durchbrochen.
 */
final class LayerValidator
{
    private const MAX_LAYERS = 100;
    private const TYPES = ['image', 'shape', 'icon', 'frame', 'text'];
    private const SHAPES = ['rect', 'circle', 'line'];
    private const ICON_SOURCES = ['static', 'user'];
    private const TEXT_SOURCES = ['static', 'user'];
    private const ALIGNS = ['left', 'center', 'right'];
    private const VERTICAL_ALIGNS = ['top', 'middle', 'bottom'];
    /**
     * Die eingebauten Schriften: vom Gerät und mitgeliefert. Muss deckungsgleich mit
     * `frontend/src/app/shared/canvas/rendering/fonts.ts` bleiben — fehlt eine Schrift hier,
     * lässt sich ein Template mit ihr nicht speichern. Hochgeladene Schriften stehen nicht
     * hier, sondern kommen als `cmfont-<Kennung>` über den Konstruktor dazu.
     */
    private const BUILT_IN_FONT_FAMILIES = [
        // Vom Gerät
        'Arial', 'Verdana', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Courier New', 'Impact',
        // Mitgeliefert (frontend/public/fonts)
        'Berkshire Swash', 'Great Vibes',
        'Cinzel', 'MedievalSharp', 'Uncial Antiqua',
        'Bangers', 'Luckiest Guy', 'Bungee',
        'Merriweather', 'Lato',
    ];
    private const HEX_PATTERN = '/^#[0-9a-fA-F]{6}$/';
    private const KEY_PATTERN = '/^[a-z][a-z0-9_]{0,39}$/';

    /**
     * Der Prüfer selbst bleibt ohne Datenbankwissen: welche Schriften hochgeladen wurden,
     * reicht der Aufrufer als fertige Liste durch (`TemplateService`), damit hier keine
     * Abfrage pro Textebene entsteht.
     *
     * @param string[] $uploadedFontFamilies Namen der hochgeladenen Schriften (`cmfont-<id>`).
     */
    public function __construct(private readonly array $uploadedFontFamilies = [])
    {
    }

    /**
     * @return array<int, array<string, mixed>> Die geprüfte, normalisierte Ebenenliste.
     */
    public function validateAll(mixed $layers): array
    {
        $fields = [];
        $normalized = self::normalizeList($layers, $fields);

        if ($fields !== []) {
            self::fail($fields);
        }

        $seenIds = [];
        $seenKeys = [];
        $frameIndexes = [];
        $result = [];

        foreach ($normalized as $index => $layer) {
            $result[] = $this->validateLayer($layer, (int) $index, $fields, $seenIds, $seenKeys, $frameIndexes);
        }

        foreach (array_slice($frameIndexes, 1) as $extraIndex) {
            $fields[self::fieldKey("layers.$extraIndex.", 'type')] = 'Es darf höchstens eine Rahmen-Ebene geben.';
        }

        if ($fields !== []) {
            self::fail($fields);
        }

        return $result;
    }

    /** @param array<string, string> $fields */
    private static function normalizeList(mixed $layers, array &$fields): array
    {
        if (!is_array($layers)) {
            $fields['layers'] = 'Die Ebenenliste muss ein Array sein.';

            return [];
        }

        if ($layers !== [] && !array_is_list($layers)) {
            $fields['layers'] = 'Die Ebenenliste muss ein Array sein.';

            return [];
        }

        if (count($layers) > self::MAX_LAYERS) {
            $fields['layers'] = 'Höchstens ' . self::MAX_LAYERS . ' Ebenen sind erlaubt.';

            return [];
        }

        return $layers;
    }

    /**
     * @param array<string, string> $fields
     * @param array<string, true> $seenIds
     * @param array<string, true> $seenKeys
     * @param int[] $frameIndexes
     * @return array<string, mixed>
     */
    private function validateLayer(
        mixed $layer,
        int $index,
        array &$fields,
        array &$seenIds,
        array &$seenKeys,
        array &$frameIndexes
    ): array {
        $prefix = "layers.$index.";

        if (!is_array($layer)) {
            $fields[self::fieldKey($prefix, 'type')] = 'Jede Ebene muss ein Objekt sein.';

            return [];
        }

        $id = self::requiredString($layer, 'id', $fields, $prefix);

        if ($id !== null) {
            if (isset($seenIds[$id])) {
                $fields[self::fieldKey($prefix, 'id')] = 'Diese Kennung wird schon von einer anderen Ebene benutzt.';
            } else {
                $seenIds[$id] = true;
            }
        }

        $type = self::requiredEnum($layer, 'type', self::TYPES, $fields, $prefix);
        $name = self::stringInRange($layer, 'name', 1, 80, $fields, $prefix);
        $visible = self::requiredBool($layer, 'visible', $fields, $prefix);

        $result = [
            'id' => $id ?? '',
            'type' => $type ?? '',
            'name' => $name ?? '',
            'visible' => $visible ?? false,
        ];

        if ($type === null) {
            return $result;
        }

        $typeFields = match ($type) {
            'image' => self::validateImage($layer, $fields, $prefix),
            'shape' => self::validateShape($layer, $fields, $prefix),
            'icon' => self::validateIcon($layer, $fields, $prefix),
            'frame' => self::validateFrame($layer, $fields, $prefix, $frameIndexes, $index),
            'text' => $this->validateText($layer, $fields, $prefix, $seenKeys),
        };

        return array_merge($result, $typeFields);
    }

    /**
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     * @return array<string, mixed>
     */
    private static function validateImage(array $layer, array &$fields, string $prefix): array
    {
        return array_merge(
            self::geometry($layer, $fields, $prefix),
            ['opacity' => self::numberInRange($layer, 'opacity', 0, 1, $fields, $prefix)]
        );
    }

    /**
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     * @return array<string, mixed>
     */
    private static function validateShape(array $layer, array &$fields, string $prefix): array
    {
        $shape = self::requiredEnum($layer, 'shape', self::SHAPES, $fields, $prefix);

        if ($shape === 'line') {
            return [
                'shape' => $shape,
                'points' => self::points($layer, $fields, $prefix),
                'stroke' => self::requiredHex($layer, 'stroke', $fields, $prefix),
                'stroke_width' => self::numberAtLeast($layer, 'stroke_width', 0, $fields, $prefix),
                'opacity' => self::numberInRange($layer, 'opacity', 0, 1, $fields, $prefix),
            ];
        }

        $result = array_merge(
            self::geometry($layer, $fields, $prefix),
            [
                'shape' => $shape,
                'fill' => self::hexOrNull($layer, 'fill', $fields, $prefix),
                'opacity' => self::numberInRange($layer, 'opacity', 0, 1, $fields, $prefix),
                'stroke' => self::hexOrNull($layer, 'stroke', $fields, $prefix),
                'stroke_width' => self::numberAtLeast($layer, 'stroke_width', 0, $fields, $prefix),
            ]
        );

        if ($shape === 'rect') {
            $result['corner_radius'] = self::numberAtLeast($layer, 'corner_radius', 0, $fields, $prefix);
        }

        return $result;
    }

    /**
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     * @return array<string, mixed>
     */
    private static function validateIcon(array $layer, array &$fields, string $prefix): array
    {
        $source = self::requiredEnum($layer, 'source', self::ICON_SOURCES, $fields, $prefix);
        $assetId = self::assetIdOrNull($layer, 'asset_id', $fields, $prefix);
        $choiceAssetIds = $source === 'user' ? self::assetIdList($layer, 'choice_asset_ids', $fields, $prefix) : [];

        return array_merge(
            self::geometry($layer, $fields, $prefix),
            [
                'opacity' => self::numberInRange($layer, 'opacity', 0, 1, $fields, $prefix),
                'source' => $source ?? '',
                'asset_id' => $assetId,
                'choice_asset_ids' => $choiceAssetIds,
            ]
        );
    }

    /**
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     * @param int[] $frameIndexes
     * @return array<string, mixed>
     */
    private static function validateFrame(
        array $layer,
        array &$fields,
        string $prefix,
        array &$frameIndexes,
        int $index
    ): array {
        $frameIndexes[] = $index;

        return ['asset_id' => self::assetIdOrNull($layer, 'asset_id', $fields, $prefix)];
    }

    /**
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     * @param array<string, true> $seenKeys
     * @return array<string, mixed>
     */
    private function validateText(array $layer, array &$fields, string $prefix, array &$seenKeys): array
    {
        $key = self::requiredString($layer, 'key', $fields, $prefix);

        if ($key !== null) {
            if (preg_match(self::KEY_PATTERN, $key) !== 1) {
                $fields[self::fieldKey($prefix, 'key')] = 'Der Schlüssel muss mit einem Kleinbuchstaben beginnen '
                    . 'und darf nur a–z, 0–9 und _ enthalten (höchstens 40 Zeichen).';
                $key = null;
            } elseif (isset($seenKeys[$key])) {
                $fields[self::fieldKey($prefix, 'key')] = 'Dieser Schlüssel wird schon von einer anderen '
                    . 'Textebene benutzt.';
            } else {
                $seenKeys[$key] = true;
            }
        }

        $source = self::requiredEnum($layer, 'source', self::TEXT_SOURCES, $fields, $prefix);
        $defaultText = self::stringUpTo($layer, 'default_text', 500, $fields, $prefix);
        $fontFamily = $this->fontFamily($layer, $fields, $prefix);
        $fontSize = self::numberInRange($layer, 'font_size', 4, 200, $fields, $prefix);
        $minFontSize = self::numberInRange($layer, 'min_font_size', 4, 200, $fields, $prefix);

        if ($fontSize !== null && $minFontSize !== null && $minFontSize > $fontSize) {
            $fields[self::fieldKey($prefix, 'min_font_size')] =
                'Die Mindestschriftgröße darf die Schriftgröße nicht überschreiten.';
        }

        return array_merge(
            self::geometry($layer, $fields, $prefix),
            [
                'key' => $key ?? '',
                'source' => $source ?? '',
                'default_text' => $defaultText ?? '',
                'font_family' => $fontFamily ?? '',
                'font_size' => $fontSize,
                'min_font_size' => $minFontSize,
                'font_bold' => self::boolWithDefault($layer, 'font_bold', false, $fields, $prefix),
                'font_italic' => self::boolWithDefault($layer, 'font_italic', false, $fields, $prefix),
                'color' => self::requiredHex($layer, 'color', $fields, $prefix),
                'align' => self::requiredEnum($layer, 'align', self::ALIGNS, $fields, $prefix),
                'vertical_align' => self::requiredEnum($layer, 'vertical_align', self::VERTICAL_ALIGNS, $fields, $prefix),
                'line_height' => self::numberInRange($layer, 'line_height', 0.5, 3, $fields, $prefix),
                'outline_color' => self::hexOrNull($layer, 'outline_color', $fields, $prefix),
                'outline_width' => self::numberAtLeast($layer, 'outline_width', 0, $fields, $prefix),
                'shadow_color' => self::hexOrNull($layer, 'shadow_color', $fields, $prefix),
                'shadow_blur' => self::numberAtLeast($layer, 'shadow_blur', 0, $fields, $prefix),
                'shadow_offset_x' => self::requiredNumber($layer, 'shadow_offset_x', $fields, $prefix),
                'shadow_offset_y' => self::requiredNumber($layer, 'shadow_offset_y', $fields, $prefix),
                'auto_shrink' => self::requiredBool($layer, 'auto_shrink', $fields, $prefix),
                'opacity' => self::numberInRange($layer, 'opacity', 0, 1, $fields, $prefix),
            ]
        );
    }

    /**
     * Erlaubt sind die eingebauten Schriften und die hochgeladenen. Der Fall „gab es mal,
     * gibt es nicht mehr" ist der wahrscheinlichste (Schrift von Hand aus der Ablage
     * entfernt) — deshalb nennt die Meldung die betroffene Ebene, damit man weiß, wo man
     * umstellen muss, statt nur zu erfahren, dass irgendetwas ungültig ist.
     *
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     */
    private function fontFamily(array $layer, array &$fields, string $prefix): ?string
    {
        $value = $layer['font_family'] ?? null;

        if (!is_string($value) || $value === '') {
            $fields[self::fieldKey($prefix, 'font_family')] = 'Bitte eine Schriftart angeben.';

            return null;
        }

        if (
            in_array($value, self::BUILT_IN_FONT_FAMILIES, true)
            || in_array($value, $this->uploadedFontFamilies, true)
        ) {
            return $value;
        }

        $name = is_string($layer['name'] ?? null) && trim((string) $layer['name']) !== ''
            ? 'der Ebene „' . $layer['name'] . '"'
            : 'dieser Ebene';
        $fields[self::fieldKey($prefix, 'font_family')] = "Die Schriftart $name gibt es nicht (mehr). "
            . 'Bitte dort eine andere Schrift auswählen.';

        return null;
    }

    /**
     * @param array<string, mixed> $layer
     * @param array<string, string> $fields
     * @return array{x: int|float|null, y: int|float|null, width: int|float|null, height: int|float|null, rotation: int|float|null}
     */
    private static function geometry(array $layer, array &$fields, string $prefix): array
    {
        return [
            'x' => self::requiredNumber($layer, 'x', $fields, $prefix),
            'y' => self::requiredNumber($layer, 'y', $fields, $prefix),
            'width' => self::requiredNumber($layer, 'width', $fields, $prefix),
            'height' => self::requiredNumber($layer, 'height', $fields, $prefix),
            'rotation' => self::numberInRange($layer, 'rotation', -360, 360, $fields, $prefix),
        ];
    }

    /**
     * @param array<string, mixed> $layer
     * @return int[]|null
     */
    private static function points(array $layer, array &$fields, string $prefix): ?array
    {
        $value = $layer['points'] ?? null;

        if (!is_array($value) || count($value) !== 4 || !array_is_list($value)) {
            $fields[self::fieldKey($prefix, 'points')] = 'Bitte genau vier Zahlen (x1, y1, x2, y2) angeben.';

            return null;
        }

        foreach ($value as $number) {
            if (!is_int($number) && !is_float($number)) {
                $fields[self::fieldKey($prefix, 'points')] = 'Bitte genau vier Zahlen (x1, y1, x2, y2) angeben.';

                return null;
            }
        }

        return array_values($value);
    }

    /** @param array<string, mixed> $layer */
    private static function assetIdOrNull(array $layer, string $key, array &$fields, string $prefix): ?int
    {
        $value = $layer[$key] ?? null;

        if ($value === null) {
            return null;
        }

        if (!is_int($value)) {
            $fields[self::fieldKey($prefix, $key)] = 'Bitte eine Bild-Kennung angeben.';

            return null;
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $layer
     * @return int[]
     */
    private static function assetIdList(array $layer, string $key, array &$fields, string $prefix): array
    {
        $value = $layer[$key] ?? [];

        if (!is_array($value)) {
            $fields[self::fieldKey($prefix, $key)] = 'Bitte eine Liste von Bild-Kennungen angeben.';

            return [];
        }

        $ids = [];

        foreach ($value as $item) {
            if (!is_int($item)) {
                $fields[self::fieldKey($prefix, $key)] = 'Bitte eine Liste von Bild-Kennungen angeben.';

                return [];
            }

            $ids[] = $item;
        }

        return $ids;
    }

    /** @param array<string, mixed> $layer */
    private static function requiredString(array $layer, string $key, array &$fields, string $prefix): ?string
    {
        $value = $layer[$key] ?? null;

        if (!is_string($value) || trim($value) === '') {
            $fields[self::fieldKey($prefix, $key)] = 'Pflichtfeld fehlt oder ist leer.';

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function stringInRange(
        array $layer,
        string $key,
        int $min,
        int $max,
        array &$fields,
        string $prefix
    ): ?string {
        $value = $layer[$key] ?? null;

        if (!is_string($value) || mb_strlen($value) < $min || mb_strlen($value) > $max) {
            $fields[self::fieldKey($prefix, $key)] = "Bitte einen Text mit {$min}–{$max} Zeichen angeben.";

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function stringUpTo(array $layer, string $key, int $max, array &$fields, string $prefix): ?string
    {
        $value = $layer[$key] ?? null;

        if (!is_string($value) || mb_strlen($value) > $max) {
            $fields[self::fieldKey($prefix, $key)] = "Bitte höchstens $max Zeichen angeben.";

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function requiredBool(array $layer, string $key, array &$fields, string $prefix): ?bool
    {
        $value = $layer[$key] ?? null;

        if (!is_bool($value)) {
            $fields[self::fieldKey($prefix, $key)] = 'Bitte einen echten Wahrheitswert angeben.';

            return null;
        }

        return $value;
    }

    /**
     * Wie {@see requiredBool}, aber fehlt der Schlüssel ganz (bestehendes Template ohne
     * dieses Feld), gilt der Standardwert statt eines Fehlers — sonst würde jedes ältere
     * Template beim nächsten Speichern zurückgewiesen.
     *
     * @param array<string, mixed> $layer
     */
    private static function boolWithDefault(
        array $layer,
        string $key,
        bool $default,
        array &$fields,
        string $prefix,
    ): ?bool {
        if (!array_key_exists($key, $layer)) {
            return $default;
        }

        return self::requiredBool($layer, $key, $fields, $prefix);
    }

    /** @param array<string, mixed> $layer */
    private static function requiredNumber(array $layer, string $key, array &$fields, string $prefix): int|float|null
    {
        $value = $layer[$key] ?? null;

        if (!is_int($value) && !is_float($value)) {
            $fields[self::fieldKey($prefix, $key)] = 'Bitte eine Zahl angeben.';

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function numberInRange(
        array $layer,
        string $key,
        float $min,
        float $max,
        array &$fields,
        string $prefix
    ): int|float|null {
        $value = self::requiredNumber($layer, $key, $fields, $prefix);

        if ($value === null) {
            return null;
        }

        if ($value < $min || $value > $max) {
            $fields[self::fieldKey($prefix, $key)] = "Bitte einen Wert zwischen $min und $max angeben.";

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function numberAtLeast(
        array $layer,
        string $key,
        float $min,
        array &$fields,
        string $prefix
    ): int|float|null {
        $value = self::requiredNumber($layer, $key, $fields, $prefix);

        if ($value === null) {
            return null;
        }

        if ($value < $min) {
            $fields[self::fieldKey($prefix, $key)] = "Bitte einen Wert ab $min angeben.";

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function requiredHex(array $layer, string $key, array &$fields, string $prefix): ?string
    {
        $value = $layer[$key] ?? null;

        if (!is_string($value) || preg_match(self::HEX_PATTERN, $value) !== 1) {
            $fields[self::fieldKey($prefix, $key)] = 'Bitte eine Farbe im Format #rrggbb angeben.';

            return null;
        }

        return $value;
    }

    /** @param array<string, mixed> $layer */
    private static function hexOrNull(array $layer, string $key, array &$fields, string $prefix): ?string
    {
        $value = $layer[$key] ?? null;

        if ($value === null) {
            return null;
        }

        if (!is_string($value) || preg_match(self::HEX_PATTERN, $value) !== 1) {
            $fields[self::fieldKey($prefix, $key)] = 'Bitte eine Farbe im Format #rrggbb angeben oder das Feld '
                . 'leer lassen.';

            return null;
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $layer
     * @param string[] $allowed
     */
    private static function requiredEnum(array $layer, string $key, array $allowed, array &$fields, string $prefix): ?string
    {
        $value = $layer[$key] ?? null;

        if (!is_string($value) || !in_array($value, $allowed, true)) {
            $fields[self::fieldKey($prefix, $key)] = 'Ungültiger Wert.';

            return null;
        }

        return $value;
    }

    /** Baut den nach außen gehenden Fehler-Feldnamen — snake_case rein, camelCase raus. */
    private static function fieldKey(string $prefix, string $key): string
    {
        return $prefix . WireFormat::snakeToCamel($key);
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
