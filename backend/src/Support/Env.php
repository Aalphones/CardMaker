<?php

declare(strict_types=1);

namespace App\Support;

use RuntimeException;

final class Env
{
    /** @var array<string, string> */
    private static array $values = [];

    public static function load(string $file): void
    {
        self::$values = [];

        if (!is_file($file)) {
            return;
        }

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $trimmedLine = trim($line);

            if ($trimmedLine === '' || str_starts_with($trimmedLine, '#')) {
                continue;
            }

            $separatorPosition = strpos($trimmedLine, '=');

            if ($separatorPosition === false) {
                continue;
            }

            $key = trim(substr($trimmedLine, 0, $separatorPosition));
            $value = trim(substr($trimmedLine, $separatorPosition + 1));

            if ($key === '') {
                continue;
            }

            self::$values[$key] = self::stripSurroundingQuotes($value);
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = self::$values[$key] ?? null;

        if ($value === null || $value === '') {
            return $default;
        }

        return $value;
    }

    public static function require(string $key): string
    {
        $value = self::get($key);

        if ($value === null) {
            throw new RuntimeException('Konfigurationswert fehlt: ' . $key);
        }

        return $value;
    }

    /** @return string[] */
    public static function asList(string $key, string $separator = ','): array
    {
        $value = self::get($key);

        if ($value === null) {
            return [];
        }

        $entries = array_map(
            static fn (string $entry): string => trim($entry),
            explode($separator, $value)
        );

        return array_values(array_filter(
            $entries,
            static fn (string $entry): bool => $entry !== ''
        ));
    }

    private static function stripSurroundingQuotes(string $value): string
    {
        if (strlen($value) < 2) {
            return $value;
        }

        $firstCharacter = $value[0];
        $lastCharacter = $value[strlen($value) - 1];

        if ($firstCharacter === $lastCharacter && ($firstCharacter === '"' || $firstCharacter === "'")) {
            return substr($value, 1, -1);
        }

        return $value;
    }
}
