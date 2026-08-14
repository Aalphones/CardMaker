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
        $byteSize = filesize($absolutePath);
        $entityTag = self::entityTag($absolutePath, $byteSize);

        // Bilder liegen unter einer festen Adresse, ihr Inhalt wechselt aber (Bild ersetzen,
        // Vorschau neu erzeugt). Ein Ablaufdatum würde die alte Datei weiter ausliefern —
        // deshalb Rückfrage bei jedem Abruf und nur bei unverändertem Kennzeichen 304.
        if (!headers_sent()) {
            header('Content-Type: ' . $mimeType);
            header('X-Content-Type-Options: nosniff');
            header('Cache-Control: private, no-cache, max-age=0, must-revalidate');

            if ($entityTag !== null) {
                header('ETag: ' . $entityTag);
            }
        }

        if ($entityTag !== null && self::matchesRequestedTag($entityTag)) {
            http_response_code(304);
            exit;
        }

        http_response_code(200);

        if ($byteSize !== false && !headers_sent()) {
            header('Content-Length: ' . $byteSize);
        }

        readfile($absolutePath);
        exit;
    }

    /** Kennzeichnet den Dateistand über Änderungszeit und Größe. */
    private static function entityTag(string $absolutePath, int|false $byteSize): ?string
    {
        $modifiedAt = filemtime($absolutePath);

        if ($modifiedAt === false || $byteSize === false) {
            return null;
        }

        return '"' . dechex($modifiedAt) . '-' . dechex($byteSize) . '"';
    }

    private static function matchesRequestedTag(string $entityTag): bool
    {
        $requested = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';

        if (!is_string($requested) || $requested === '') {
            return false;
        }

        foreach (explode(',', $requested) as $candidate) {
            // Ein Zwischenspeicher darf das Kennzeichen als schwach markieren („W/") —
            // für den Vergleich zählt nur der Teil dahinter.
            $normalized = ltrim(trim($candidate), 'W/');

            if ($normalized === $entityTag) {
                return true;
            }
        }

        return false;
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
