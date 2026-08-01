<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database\MigrationFailedException;
use App\Database\MigrationRunner;
use App\Http\Request;
use App\Http\Response;
use PDO;
use Psr\Log\LoggerInterface;

final class MigrateController
{
    public function __construct(
        private readonly Request $request,
        private readonly ?PDO $database,
        private readonly string $migrationsDirectory,
        private readonly string $expectedToken,
        private readonly LoggerInterface $logger
    ) {
    }

    public function run(): void
    {
        $providedToken = $this->request->header('X-Migrate-Token') ?? '';

        if ($this->expectedToken === '' || !hash_equals($this->expectedToken, $providedToken)) {
            Response::error(Response::ERROR_FORBIDDEN, 'Zugriff verweigert.', 403);
        }

        if (!$this->database instanceof PDO) {
            Response::error(Response::ERROR_SERVER_ERROR, 'Keine Datenbankverbindung.', 500);
        }

        $runner = new MigrationRunner($this->database, $this->migrationsDirectory);

        try {
            $applied = $runner->run();
        } catch (MigrationFailedException $exception) {
            $this->logger->error('Migration fehlgeschlagen', [
                'appliedVersions' => $exception->appliedVersions(),
                'failedVersion' => $exception->failedVersion(),
                'message' => $exception->getPrevious()?->getMessage(),
            ]);

            Response::error(
                Response::ERROR_SERVER_ERROR,
                'Migration fehlgeschlagen: ' . $exception->failedVersion(),
                500
            );

            return;
        }

        Response::json(['applied' => $applied]);
    }
}
