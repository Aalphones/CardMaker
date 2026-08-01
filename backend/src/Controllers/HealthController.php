<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Response;
use PDO;
use Throwable;

final class HealthController
{
    private const MIGRATIONS_TABLE = 'migrations';

    public function __construct(private readonly ?PDO $database)
    {
    }

    public function show(): void
    {
        Response::json([
            'status' => 'ok',
            'phpVersion' => PHP_VERSION,
            'dbConnected' => $this->database instanceof PDO,
            'migrationsApplied' => $this->countAppliedMigrations(),
        ]);
    }

    private function countAppliedMigrations(): int
    {
        if (!$this->database instanceof PDO) {
            return 0;
        }

        try {
            $statement = $this->database->query('SELECT COUNT(*) FROM ' . self::MIGRATIONS_TABLE);

            if ($statement === false) {
                return 0;
            }

            return (int) $statement->fetchColumn();
        } catch (Throwable) {
            // Die Verwaltungstabelle entsteht erst mit dem Migrations-Runner (Phase 3).
            return 0;
        }
    }
}
