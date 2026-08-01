<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M003CreatePersonalAccessTokens
{
    public function up(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE personal_access_tokens ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'user_id INT UNSIGNED NOT NULL, '
            . 'name VARCHAR(191) NOT NULL, '
            . 'token_hash CHAR(64) NOT NULL UNIQUE, '
            . 'created_at DATETIME NOT NULL, '
            . 'last_used_at DATETIME NULL, '
            . 'CONSTRAINT fk_personal_access_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
