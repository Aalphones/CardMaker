<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Ergänzt `Request::camelToSnake()` um die Rückrichtung. Gebraucht überall dort, wo intern
 * snake_case erzeugte Schlüssel wieder nach außen gehen — Antwortdaten (siehe
 * `TemplateRepository::format()`) genauso wie Fehler-Feldnamen (siehe `LayerValidator`), denn
 * die Wire-Format-Grenze gilt für beides (`docs/conventions/php.md`).
 */
final class WireFormat
{
    public static function snakeToCamel(string $key): string
    {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $key))));
    }
}
