<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M005CreateAssets
{
    public function up(PDO $pdo): void
    {
        // file_name ist der selbst erzeugte Ablagename in backend/uploads/, nie der vom
        // Browser gelieferte: der geht als Anzeigename in `name` und wird nie zum Pfad.
        $pdo->exec(
            'CREATE TABLE assets ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . "kind ENUM('frame','icon') NOT NULL, "
            . 'name VARCHAR(191) NOT NULL, '
            . 'file_name VARCHAR(191) NOT NULL, '
            . 'mime_type VARCHAR(64) NOT NULL, '
            . 'byte_size INT UNSIGNED NOT NULL, '
            . 'width INT UNSIGNED NOT NULL, '
            . 'height INT UNSIGNED NOT NULL, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL, '
            . 'INDEX idx_assets_kind (kind)'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
