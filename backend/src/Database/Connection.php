<?php

declare(strict_types=1);

namespace App\Database;

use App\Support\Env;
use PDO;

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
            Env::require('DB_HOST'),
            Env::require('DB_NAME')
        );

        self::$connection = new PDO(
            $dataSourceName,
            Env::require('DB_USER'),
            Env::require('DB_PASSWORD'),
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );

        return self::$connection;
    }
}
