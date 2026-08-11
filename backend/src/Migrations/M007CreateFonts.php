<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M007CreateFonts
{
    public function up(PDO $pdo): void
    {
        // Der Schriftname für CSS (`cmfont-<id>`) steht bewusst nicht in der Tabelle: er
        // ergibt sich aus der Kennung und hätte als zweite Spalte eine zweite Wahrheit.
        // `name` ist reine Beschriftung, `file_name` der selbst erzeugte Ablagename.
        $pdo->exec(
            'CREATE TABLE fonts ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'name VARCHAR(191) NOT NULL, '
            . 'format VARCHAR(8) NOT NULL, '
            . 'file_name VARCHAR(255) NOT NULL, '
            . 'byte_size INT UNSIGNED NOT NULL, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
