<?php

declare(strict_types=1);

namespace App\Database;

use PDO;
use RuntimeException;

final class Connection
{
    private static ?PDO $connection = null;

    public static function get(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $dataSourceName = sprintf(
            'mysql:host=%s;dbname=%s;charset=utf8mb4',
            self::setting('DB_HOST'),
            self::setting('DB_NAME')
        );

        self::$connection = new PDO(
            $dataSourceName,
            self::setting('DB_USER'),
            self::setting('DB_PASSWORD'),
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );

        return self::$connection;
    }

    private static function setting(string $key): string
    {
        $value = $_ENV[$key] ?? '';

        if (!is_string($value) || $value === '') {
            throw new RuntimeException('Konfigurationswert fehlt: ' . $key);
        }

        return $value;
    }
}
