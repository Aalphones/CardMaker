<?php

declare(strict_types=1);

namespace App\Support;

final class Autoloader
{
    private const NAMESPACE_PREFIX = 'App\\';

    public static function register(string $sourceDirectory): void
    {
        $sourceRoot = rtrim($sourceDirectory, '/\\');

        spl_autoload_register(static function (string $className) use ($sourceRoot): void {
            if (!str_starts_with($className, self::NAMESPACE_PREFIX)) {
                return;
            }

            $relativeClass = substr($className, strlen(self::NAMESPACE_PREFIX));
            $file = $sourceRoot . DIRECTORY_SEPARATOR
                . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';

            if (is_file($file)) {
                require $file;
            }
        });
    }
}
