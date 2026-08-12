<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M008CreateCards
{
    public function up(PDO $pdo): void
    {
        // `values`, `icon_choices` und `text_overrides` sind Datenbloecke statt eigener
        // Tabellen (ADR-020): eine Karte wird immer als Ganzes gelesen und gespeichert,
        // geprueft wird vollstaendig im Backend, nicht von der Datenbank.
        //
        // ON DELETE RESTRICT beim Template ist Absicht: ein Template mit Karten darf nicht
        // verschwinden, sonst sind die Karten nicht mehr renderbar. Bei der Kartengruppe
        // dagegen SET NULL — eine Gruppe ist nur eine Zuordnung, kein Teil des Inhalts.
        //
        // `values` ist in MySQL ein reserviertes Wort und braucht ueberall Backticks.
        $pdo->exec(
            'CREATE TABLE cards ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'name VARCHAR(191) NOT NULL, '
            . 'template_id INT UNSIGNED NOT NULL, '
            . 'card_group_id INT UNSIGNED NULL, '
            . '`values` JSON NOT NULL, '
            . 'icon_choices JSON NOT NULL, '
            . 'text_overrides JSON NOT NULL, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL, '
            . 'INDEX idx_cards_name (name), '
            . 'INDEX idx_cards_template_id (template_id), '
            . 'INDEX idx_cards_card_group_id (card_group_id), '
            . 'CONSTRAINT fk_cards_template_id FOREIGN KEY (template_id) '
            . 'REFERENCES templates(id) ON DELETE RESTRICT, '
            . 'CONSTRAINT fk_cards_card_group_id FOREIGN KEY (card_group_id) '
            . 'REFERENCES card_groups(id) ON DELETE SET NULL'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
