<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;

final class Validator
{
    public const REQUIRED = 'required';
    public const STRING = 'string';
    public const EMAIL = 'email';
    public const INTEGER = 'integer';
    public const IN_LIST = 'in_list';
    public const FLAT_STRING_MAP = 'flat_string_map';

    /**
     * Regeln je Feld, erste verletzte Regel gewinnt:
     *   ['name' => [Validator::REQUIRED, [Validator::STRING, 1, 120]]]
     *
     * @param array<string, mixed> $data
     * @param array<string, list<string|array<int, mixed>>> $rules
     * @return array<string, string> Feldfehler im Format aus dem Kontrakt
     */
    public static function check(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;

            foreach ($fieldRules as $rule) {
                $ruleName = is_array($rule) ? (string) ($rule[0] ?? '') : $rule;
                $arguments = is_array($rule) ? array_slice($rule, 1) : [];
                $error = self::apply($ruleName, $value, $arguments);

                if ($error !== null) {
                    $errors[$field] = $error;
                    break;
                }
            }
        }

        return $errors;
    }

    public static function required(mixed $value): ?string
    {
        if ($value === null) {
            return 'Pflichtfeld.';
        }

        if (is_string($value) && trim($value) === '') {
            return 'Pflichtfeld.';
        }

        if (is_array($value) && $value === []) {
            return 'Pflichtfeld.';
        }

        return null;
    }

    public static function string(mixed $value, int $minLength = 0, ?int $maxLength = null): ?string
    {
        if (!is_string($value)) {
            return 'Muss Text sein.';
        }

        $length = mb_strlen($value);

        if ($length < $minLength) {
            return sprintf('Mindestens %d Zeichen.', $minLength);
        }

        if ($maxLength !== null && $length > $maxLength) {
            return sprintf('Höchstens %d Zeichen.', $maxLength);
        }

        return null;
    }

    public static function email(mixed $value): ?string
    {
        if (!is_string($value) || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            return 'Keine gültige E-Mail-Adresse.';
        }

        return null;
    }

    public static function integer(mixed $value, ?int $minimum = null, ?int $maximum = null): ?string
    {
        if (is_string($value) && preg_match('/^-?\d+$/', $value) === 1) {
            $value = (int) $value;
        }

        if (!is_int($value)) {
            return 'Muss eine ganze Zahl sein.';
        }

        if ($minimum !== null && $value < $minimum) {
            return sprintf('Muss mindestens %d sein.', $minimum);
        }

        if ($maximum !== null && $value > $maximum) {
            return sprintf('Darf höchstens %d sein.', $maximum);
        }

        return null;
    }

    /** @param list<mixed> $allowedValues */
    public static function inList(mixed $value, array $allowedValues): ?string
    {
        if (!in_array($value, $allowedValues, true)) {
            return 'Unzulässiger Wert.';
        }

        return null;
    }

    public static function flatStringMap(
        mixed $value,
        int $maxEntries,
        int $maxKeyLength,
        int $maxValueLength
    ): ?string {
        if (!is_array($value)) {
            return 'Muss ein Objekt aus Schlüssel und Text sein.';
        }

        if (count($value) > $maxEntries) {
            return sprintf('Höchstens %d Einträge.', $maxEntries);
        }

        foreach ($value as $key => $entry) {
            if (!is_string($key) || mb_strlen($key) > $maxKeyLength) {
                return sprintf('Schlüssel müssen Text mit höchstens %d Zeichen sein.', $maxKeyLength);
            }

            if (!is_string($entry) || mb_strlen($entry) > $maxValueLength) {
                return sprintf('Werte müssen Text mit höchstens %d Zeichen sein.', $maxValueLength);
            }
        }

        return null;
    }

    /** @param array<int, mixed> $arguments */
    private static function apply(string $ruleName, mixed $value, array $arguments): ?string
    {
        if ($ruleName !== self::REQUIRED && $value === null) {
            return null;
        }

        return match ($ruleName) {
            self::REQUIRED => self::required($value),
            self::STRING => self::string($value, (int) ($arguments[0] ?? 0), isset($arguments[1]) ? (int) $arguments[1] : null),
            self::EMAIL => self::email($value),
            self::INTEGER => self::integer(
                $value,
                isset($arguments[0]) ? (int) $arguments[0] : null,
                isset($arguments[1]) ? (int) $arguments[1] : null
            ),
            self::IN_LIST => self::inList($value, is_array($arguments[0] ?? null) ? $arguments[0] : []),
            self::FLAT_STRING_MAP => self::flatStringMap(
                $value,
                (int) ($arguments[0] ?? 0),
                (int) ($arguments[1] ?? 0),
                (int) ($arguments[2] ?? 0)
            ),
            default => throw new InvalidArgumentException('Unbekannte Pruefregel: ' . $ruleName),
        };
    }
}
