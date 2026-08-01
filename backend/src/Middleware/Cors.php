<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Http\Request;

final class Cors
{
    private const ALLOWED_HEADERS = 'Content-Type, Authorization, X-Migrate-Token';
    private const ALLOWED_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS';
    private const PREFLIGHT_CACHE_SECONDS = 86400;

    /** @param string[] $allowedOrigins */
    public function __construct(private readonly array $allowedOrigins)
    {
    }

    public function handle(Request $request): void
    {
        $origin = $request->header('Origin');

        header('Vary: Origin');

        if ($origin !== null && in_array($origin, $this->allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Headers: ' . self::ALLOWED_HEADERS);
            header('Access-Control-Allow-Methods: ' . self::ALLOWED_METHODS);
            header('Access-Control-Max-Age: ' . self::PREFLIGHT_CACHE_SECONDS);
        }

        if ($request->method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
