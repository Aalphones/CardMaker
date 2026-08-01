<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M004CreateCardGroups
{
    public function up(PDO $pdo): void
    {
        // Bewusst keine Spalte user_id: Mehrbenutzerbetrieb ist erklaertes Nicht-Ziel
        // (docs/PROJECT.md), eine nie ausgewertete Zuordnungsspalte waere Ballast.
        $pdo->exec(
            'CREATE TABLE card_groups ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'name VARCHAR(191) NOT NULL, '
            . 'description TEXT NULL, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL, '
            . 'INDEX idx_card_groups_name (name)'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
