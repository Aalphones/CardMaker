<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class CardImageValidator
{
    public static function validateLayerId(?string $layerId): string
    {
        $value = $layerId !== null ? trim($layerId) : '';

        if (!v::stringType()->length(v::between(1, 64))->isValid($value)) {
            self::fail(['layerId' => 'Bitte eine gültige Ebenen-Kennung angeben.']);
        }

        return $value;
    }

    /**
     * Nur übergebene Felder werden geprüft und geändert — gleiches Muster wie
     * `CardValidator::validateForUpdate()`.
     *
     * @param array<string, mixed> $body
     * @return array{offset_x?: float, offset_y?: float, scale?: float}
     */
    public static function validatePlacement(array $body): array
    {
        $fields = [];
        $result = [];

        if (array_key_exists('offset_x', $body)) {
            $result['offset_x'] = self::numberInRange($body, 'offset_x', 'offsetX', -2000, 2000, $fields);
        }

        if (array_key_exists('offset_y', $body)) {
            $result['offset_y'] = self::numberInRange($body, 'offset_y', 'offsetY', -2000, 2000, $fields);
        }

        if (array_key_exists('scale', $body)) {
            $result['scale'] = self::numberInRange($body, 'scale', 'scale', 0.1, 10, $fields);
        }

        if ($fields !== []) {
            self::fail($fields);
        }

        return $result;
    }

    /** @param array<string, mixed> $body */
    private static function numberInRange(
        array $body,
        string $key,
        string $fieldName,
        float $min,
        float $max,
        array &$fields
    ): float {
        $value = $body[$key] ?? null;

        if ((!is_int($value) && !is_float($value)) || $value < $min || $value > $max) {
            $fields[$fieldName] = "Bitte einen Wert zwischen $min und $max angeben.";

            return 0.0;
        }

        return (float) $value;
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
