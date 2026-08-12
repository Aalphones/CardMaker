<?php

declare(strict_types=1);

namespace App\Services;

use RuntimeException;

/**
 * Trennt den Grund vom HTTP-Ergebnis: der Dienst nennt, was schiefging, der Controller
 * entscheidet, welcher Statuscode und welche Meldung daraus wird. Gleiches Muster wie
 * `AssetUploadException`/`FontUploadException`.
 */
final class CardImageUploadException extends RuntimeException
{
    public const REASON_MISSING_FILE = 'missing_file';
    public const REASON_TOO_LARGE = 'too_large';
    public const REASON_UNSUPPORTED_FORMAT = 'unsupported_format';
    public const REASON_UNKNOWN_LAYER = 'unknown_layer';
    public const REASON_STORAGE_FAILED = 'storage_failed';

    public function __construct(private readonly string $reason)
    {
        parent::__construct('Hochladung fehlgeschlagen: ' . $reason);
    }

    public function reason(): string
    {
        return $this->reason;
    }
}
