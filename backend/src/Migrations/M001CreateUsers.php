<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M001CreateUsers
{
    public function up(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE users ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'email VARCHAR(191) NOT NULL UNIQUE, '
            . 'password_hash VARCHAR(255) NOT NULL, '
            . 'created_at DATETIME NOT NULL'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
