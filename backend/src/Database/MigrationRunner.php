<?php

declare(strict_types=1);

namespace App\Database;

use DateTimeImmutable;
use PDO;
use Throwable;

final class MigrationRunner
{
    private const MIGRATIONS_TABLE = 'migrations';

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $migrationsDirectory
    ) {
    }

    /**
     * Führt alle noch offenen Migrationen in Dateinamen-Reihenfolge aus.
     *
     * @return string[] Versionen, die in diesem Durchlauf neu angewandt wurden.
     *
     * @throws MigrationFailedException Bricht beim ersten Fehler ab.
     */
    public function run(): array
    {
        $this->ensureMigrationsTable();

        $appliedAlready = $this->appliedVersions();
        $applied = [];

        foreach ($this->availableVersions() as $version) {
            if (in_array($version, $appliedAlready, true)) {
                continue;
            }

            try {
                $this->applyMigration($version);
            } catch (Throwable $exception) {
                throw new MigrationFailedException($applied, $version, $exception);
            }

            $applied[] = $version;
        }

        return $applied;
    }

    private function ensureMigrationsTable(): void
    {
        $this->pdo->exec(
            'CREATE TABLE IF NOT EXISTS ' . self::MIGRATIONS_TABLE . ' ('
            . 'version VARCHAR(191) PRIMARY KEY, '
            . 'applied_at DATETIME NOT NULL'
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }

    /** @return string[] */
    private function appliedVersions(): array
    {
        $statement = $this->pdo->query('SELECT version FROM ' . self::MIGRATIONS_TABLE);

        if ($statement === false) {
            return [];
        }

        return $statement->fetchAll(PDO::FETCH_COLUMN);
    }

    /** @return string[] Dateinamen (ohne `.php`), aufsteigend sortiert. */
    private function availableVersions(): array
    {
        $files = glob($this->migrationsDirectory . '/M*.php') ?: [];
        sort($files);

        return array_map(
            static fn (string $file): string => basename($file, '.php'),
            $files
        );
    }

    private function applyMigration(string $version): void
    {
        $className = 'App\\Migrations\\' . $version;
        $migration = new $className();
        $migration->up($this->pdo);

        $insert = $this->pdo->prepare(
            'INSERT INTO ' . self::MIGRATIONS_TABLE . ' (version, applied_at) VALUES (:version, :appliedAt)'
        );
        $insert->execute([
            'version' => $version,
            'appliedAt' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
        ]);
    }
}
