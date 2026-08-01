<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M002CreateSessions
{
    public function up(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE sessions ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'user_id INT UNSIGNED NOT NULL, '
            . 'token_hash CHAR(64) NOT NULL UNIQUE, '
            . 'expires_at DATETIME NOT NULL, '
            . 'created_at DATETIME NOT NULL, '
            . 'last_used_at DATETIME NULL, '
            . 'INDEX idx_sessions_expires_at (expires_at), '
            . 'CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
