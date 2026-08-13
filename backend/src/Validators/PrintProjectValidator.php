<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;

final class PrintProjectValidator
{
    private const QUANTITY_MIN = 1;
    private const QUANTITY_MAX = 99;

    /**
     * @param array<string, mixed> $body
     * @return array{cut_marks: bool, bleed: bool}
     */
    public static function validateOptions(array $body): array
    {
        $fields = [];

        $cutMarks = self::validatedFlag($body, 'cut_marks', 'cutMarks', 'Schnittmarken', $fields);
        $bleed = self::validatedFlag($body, 'bleed', 'bleed', 'Beschnitt', $fields);

        if ($fields !== []) {
            self::fail($fields);
        }

        return ['cut_marks' => $cutMarks, 'bleed' => $bleed];
    }

    /**
     * @param array<string, mixed> $body
     * @return array{card_id: int, quantity: int}
     */
    public static function validateNewItem(array $body): array
    {
        $fields = [];
        $cardId = $body['card_id'] ?? null;

        if (!is_int($cardId) || $cardId < 1) {
            $fields['cardId'] = 'Bitte eine gültige Karte angeben.';
        }

        $quantity = array_key_exists('quantity', $body)
            ? self::validatedQuantity($body['quantity'], $fields)
            : 1;

        if ($fields !== []) {
            self::fail($fields);
        }

        return ['card_id' => (int) $cardId, 'quantity' => $quantity];
    }

    /** @param array<string, mixed> $body */
    public static function validateQuantity(array $body): int
    {
        $fields = [];
        $quantity = self::validatedQuantity($body['quantity'] ?? null, $fields);

        if ($fields !== []) {
            self::fail($fields);
        }

        return $quantity;
    }

    /**
     * @param array<string, mixed> $body
     * @param array<string, string> $fields
     */
    private static function validatedFlag(
        array $body,
        string $key,
        string $fieldName,
        string $label,
        array &$fields
    ): bool {
        $value = $body[$key] ?? null;

        if (!is_bool($value)) {
            $fields[$fieldName] = $label . ': bitte an oder aus angeben.';

            return false;
        }

        return $value;
    }

    /** @param array<string, string> $fields */
    private static function validatedQuantity(mixed $raw, array &$fields): int
    {
        if (!is_int($raw) || $raw < self::QUANTITY_MIN || $raw > self::QUANTITY_MAX) {
            $fields['quantity'] = 'Die Anzahl muss zwischen ' . self::QUANTITY_MIN
                . ' und ' . self::QUANTITY_MAX . ' liegen.';

            return self::QUANTITY_MIN;
        }

        return (int) $raw;
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
