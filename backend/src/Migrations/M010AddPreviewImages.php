<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M010AddPreviewImages
{
    public function up(PDO $pdo): void
    {
        // Das Vorschaubild liegt als Datei neben der Zeile, nicht als Datenblock in der
        // Spalte (ADR-021) — dasselbe Muster wie bei Kartenbildern (ADR-017): nur der
        // Dateiname und sein Zeitstempel werden hier gespeichert.
        $pdo->exec(
            'ALTER TABLE templates '
            . 'ADD COLUMN preview_file_name VARCHAR(191) NULL, '
            . 'ADD COLUMN preview_updated_at DATETIME NULL'
        );

        $pdo->exec(
            'ALTER TABLE cards '
            . 'ADD COLUMN preview_file_name VARCHAR(191) NULL, '
            . 'ADD COLUMN preview_updated_at DATETIME NULL'
        );
    }
}
