<?php

declare(strict_types=1);

namespace App\Http;

final class Response
{
    public const ERROR_UNAUTHORIZED = 'unauthorized';
    public const ERROR_FORBIDDEN = 'forbidden';
    public const ERROR_NOT_FOUND = 'not_found';
    public const ERROR_METHOD_NOT_ALLOWED = 'method_not_allowed';
    public const ERROR_VALIDATION_FAILED = 'validation_failed';
    public const ERROR_PAYLOAD_TOO_LARGE = 'payload_too_large';
    public const ERROR_CONFLICT = 'conflict';
    public const ERROR_SERVER_ERROR = 'server_error';
    public const ERROR_ALREADY_INITIALIZED = 'already_initialized';

    /** @param array<string, mixed> $data */
    public static function json(array $data, int $status = 200): void
    {
        self::sendHeaders($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function noContent(): void
    {
        self::sendHeaders(204);
        exit;
    }

    /**
     * Bewusst ohne `Content-Disposition`: der Anzeigename einer Hochladung kommt aus
     * Nutzereingabe und hätte in einer Kopfzeile nichts verloren.
     */
    public static function file(string $absolutePath, string $mimeType): void
    {
        http_response_code(200);

        if (!headers_sent()) {
            $byteSize = filesize($absolutePath);

            header('Content-Type: ' . $mimeType);

            if ($byteSize !== false) {
                header('Content-Length: ' . $byteSize);
            }

            header('X-Content-Type-Options: nosniff');
            header('Cache-Control: private, max-age=86400');
        }

        readfile($absolutePath);
        exit;
    }

    /** @param array<string, string> $fields */
    public static function error(string $code, string $message, int $status, array $fields = []): void
    {
        $payload = ['error' => $code, 'message' => $message];

        if ($fields !== []) {
            $payload['fields'] = $fields;
        }

        self::json($payload, $status);
    }

    private static function sendHeaders(int $status): void
    {
        http_response_code($status);

        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
    }
}
