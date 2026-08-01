<?php

declare(strict_types=1);

namespace App\Support;

use DateTimeImmutable;
use DateTimeZone;

/**
 * Alle Zeitstempel werden mit `UTC_TIMESTAMP()` geschrieben und verglichen. Sonst hinge
 * jeder Ablaufvergleich an der Zeitzone des PHP-Prozesses, und die stimmt auf geteiltem
 * Hosting selten mit der der Datenbank überein.
 */
final class Timestamps
{
    public static function toIso(?string $databaseValue): ?string
    {
        if ($databaseValue === null || $databaseValue === '') {
            return null;
        }

        $moment = DateTimeImmutable::createFromFormat(
            'Y-m-d H:i:s',
            $databaseValue,
            new DateTimeZone('UTC')
        );

        if ($moment === false) {
            return null;
        }

        return $moment->format('Y-m-d\TH:i:s\Z');
    }
}
