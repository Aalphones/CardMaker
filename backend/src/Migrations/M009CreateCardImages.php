<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M009CreateCardImages
{
    public function up(PDO $pdo): void
    {
        // Kartenbilder liegen getrennt vom Bildvorrat `assets` (ADR-017): Einmal-Inhalt einer
        // Karte, kein wiederverwendbares Layout-Material. Sie verschwinden mit der Karte.
        //
        // `layer_id` zeigt auf eine Bildebene im Template-Datenblock und ist deshalb per
        // Fremdschluessel nicht absicherbar — dieselbe Folge wie bei ADR-014. Waechst die
        // Ebene aus dem Template heraus, bleibt die Zeile stehen und wird nicht gezeichnet.
        //
        // Das Bild wird nie beschnitten gespeichert (ADR-018): abgelegt wird die
        // Originaldatei, der Ausschnitt ergibt sich aus offset_x/offset_y/scale.
        $pdo->exec(
            'CREATE TABLE card_images ('
            . 'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, '
            . 'card_id INT UNSIGNED NOT NULL, '
            . 'layer_id VARCHAR(64) NOT NULL, '
            . 'file_name VARCHAR(191) NOT NULL, '
            . 'mime_type VARCHAR(64) NOT NULL, '
            . 'byte_size INT UNSIGNED NOT NULL, '
            . 'width INT UNSIGNED NOT NULL, '
            . 'height INT UNSIGNED NOT NULL, '
            . 'offset_x DECIMAL(8,2) NOT NULL DEFAULT 0, '
            . 'offset_y DECIMAL(8,2) NOT NULL DEFAULT 0, '
            . 'scale DECIMAL(6,3) NOT NULL DEFAULT 1, '
            . 'created_at DATETIME NOT NULL, '
            . 'updated_at DATETIME NOT NULL, '
            . 'UNIQUE KEY uq_card_images_card_id_layer_id (card_id, layer_id), '
            . 'CONSTRAINT fk_card_images_card_id FOREIGN KEY (card_id) '
            . 'REFERENCES cards(id) ON DELETE CASCADE'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }
}
