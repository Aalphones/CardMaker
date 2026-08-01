<?php

declare(strict_types=1);

namespace App\Database;

use RuntimeException;
use Throwable;

final class MigrationFailedException extends RuntimeException
{
    /** @param string[] $appliedVersions */
    public function __construct(
        private readonly array $appliedVersions,
        private readonly string $failedVersion,
        Throwable $previous
    ) {
        parent::__construct(
            sprintf('Migration %s fehlgeschlagen: %s', $failedVersion, $previous->getMessage()),
            0,
            $previous
        );
    }

    /** @return string[] Versionen, die vor dem Fehler bereits angewandt wurden. */
    public function appliedVersions(): array
    {
        return $this->appliedVersions;
    }

    public function failedVersion(): string
    {
        return $this->failedVersion;
    }
}
