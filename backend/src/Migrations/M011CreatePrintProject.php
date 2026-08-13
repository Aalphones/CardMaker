<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M011CreatePrintProject
{
    public function up(PDO $pdo): void
    {
        // `print_projects` trägt genau eine Zeile, weil es genau ein Druckprojekt gibt
        // (ADR-024). Die Tabelle existiert trotzdem, damit später mehrere benannte
        // Projekte möglich sind, ohne die Ablage umzubauen.
        $pdo->exec(
            'CREATE TABLE print_projects ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'cut_marks TINYINT(1) NOT NULL DEFAULT 1, '
            . 'bleed TINYINT(1) NOT NULL DEFAULT 0, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );

        // Eine Karte steht höchstens einmal in einem Projekt — mehrere Exemplare zählt
        // `quantity`, nicht mehrere Zeilen. Sonst würde derselbe Kartenentwurf beim
        // Export mehrfach gezeichnet.
        $pdo->exec(
            'CREATE TABLE print_project_items ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'print_project_id INT UNSIGNED NOT NULL, '
            . 'card_id INT UNSIGNED NOT NULL, '
            . 'quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1, '
            . 'sort_order INT NOT NULL DEFAULT 0, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL, '
            . 'UNIQUE KEY uq_print_project_items_card (print_project_id, card_id), '
            . 'CONSTRAINT fk_print_project_items_project FOREIGN KEY (print_project_id) '
            . 'REFERENCES print_projects(id) ON DELETE CASCADE, '
            . 'CONSTRAINT fk_print_project_items_card FOREIGN KEY (card_id) '
            . 'REFERENCES cards(id) ON DELETE CASCADE'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
