<?php

declare(strict_types=1);

namespace App\Support;

final class Logger
{
    private const LEVEL_ERROR = 'ERROR';
    private const LEVEL_WARNING = 'WARNING';

    public function __construct(private readonly string $logFile)
    {
    }

    /** @param array<string, mixed> $context */
    public function error(string $message, array $context = []): void
    {
        $this->write(self::LEVEL_ERROR, $message, $context);
    }

    /** @param array<string, mixed> $context */
    public function warning(string $message, array $context = []): void
    {
        $this->write(self::LEVEL_WARNING, $message, $context);
    }

    /**
     * Der Kontext landet ungefiltert in der Datei: niemals Passwörter, Tokens,
     * Token-Hashes oder Inhalte aus .env hineingeben.
     *
     * @param array<string, mixed> $context
     */
    private function write(string $level, string $message, array $context): void
    {
        $directory = dirname($this->logFile);

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $line = sprintf(
            "[%s] %s %s %s\n",
            date('c'),
            $level,
            $message,
            $context === [] ? '{}' : (json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}')
        );

        file_put_contents($this->logFile, $line, FILE_APPEND | LOCK_EX);
    }
}
