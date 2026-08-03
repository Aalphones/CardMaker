<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M006CreateTemplates
{
    public function up(PDO $pdo): void
    {
        // `layers` ist ein Datenblock statt einer eigenen Ebenentabelle (ADR-014): Ein
        // Template wird immer als Ganzes gelesen und gespeichert, die Datenbank prüft an der
        // Ebenenstruktur nichts — das übernimmt vollständig LayerValidator im Backend.
        $pdo->exec(
            'CREATE TABLE templates ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'name VARCHAR(191) NOT NULL, '
            . 'description TEXT NULL, '
            . 'layers JSON NOT NULL, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL, '
            . 'INDEX idx_templates_name (name)'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
