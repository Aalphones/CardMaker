<?php

declare(strict_types=1);

namespace App\Http;

final class Request
{
    public const AUTH_SESSION = 'session';
    public const AUTH_ACCESS_TOKEN = 'access_token';

    private string $method;
    private string $path;
    /** @var array<string, string> */
    private array $headers;
    /** @var array<string, mixed>|null */
    private ?array $body = null;
    /** @var array<string, mixed>|null */
    private ?array $formFields = null;
    /** @var array<string, mixed> */
    private array $query;
    /** @var array<string, mixed> */
    private array $files;
    /** @var array<string, mixed>|null */
    private ?array $user = null;
    private ?string $authToken = null;
    private ?string $authKind = null;

    public function __construct()
    {
        $this->method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
        $this->path = (string) (parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/');
        $this->headers = self::readHeaders();
        $this->query = $_GET;
        $this->files = $_FILES;
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function header(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    /**
     * Der Rumpf wird beim ersten Zugriff gelesen, nicht im Konstruktor: sonst
     * käme eine JSON-Fehlermeldung raus, bevor die Herkunftssperre ihre
     * Kopfzeilen gesetzt hat, und der Browser würde sie verschlucken.
     *
     * @return array<string, mixed>|mixed
     */
    public function body(?string $key = null): mixed
    {
        $this->body ??= self::snakeCaseKeys($this->readJsonBody());

        if ($key === null) {
            return $this->body;
        }

        return $this->body[$key] ?? null;
    }

    /** @return array<string, mixed>|mixed */
    public function query(?string $key = null): mixed
    {
        if ($key === null) {
            return $this->query;
        }

        return $this->query[$key] ?? null;
    }

    /**
     * Textfelder einer Hochladung. Bei `multipart/form-data` ist `php://input` leer,
     * `body()` liefert also nichts — die Felder stehen dann in `$_POST`. Die Schlüssel
     * werden wie beim JSON-Rumpf nach snake_case gewandelt, damit die Wire-Format-Grenze
     * an derselben Stelle liegt.
     *
     * @return array<string, mixed>
     */
    public function form(): array
    {
        $this->formFields ??= self::snakeCaseKeys($_POST);

        return $this->formFields;
    }

    public function formField(string $key): ?string
    {
        $value = $this->form()[$key] ?? null;

        return is_string($value) ? $value : null;
    }

    /** @return array<string, mixed> */
    public function files(): array
    {
        return $this->files;
    }

    /** @param array<string, mixed> $user */
    public function setUser(array $user): void
    {
        $this->user = $user;
    }

    /** @return array<string, mixed>|null */
    public function user(): ?array
    {
        return $this->user;
    }

    /** Das verwendete Token wird fürs Abmelden gebraucht — deshalb hier und nicht global. */
    public function setAuthToken(string $token, string $kind): void
    {
        $this->authToken = $token;
        $this->authKind = $kind;
    }

    public function authToken(): ?string
    {
        return $this->authToken;
    }

    public function authKind(): ?string
    {
        return $this->authKind;
    }

    /** @return array<string, mixed> */
    private function readJsonBody(): array
    {
        if ($this->method === 'GET' || $this->method === 'OPTIONS') {
            return [];
        }

        $rawBody = file_get_contents('php://input');

        if ($rawBody === false || trim($rawBody) === '') {
            return [];
        }

        $decoded = json_decode($rawBody, true);

        if (!is_array($decoded)) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Der Anfragetext ist kein gültiges JSON-Objekt.',
                422
            );
        }

        return $decoded;
    }

    /** @return array<string, string> */
    private static function readHeaders(): array
    {
        $headers = [];

        foreach ($_SERVER as $key => $value) {
            if (!is_string($key) || !is_string($value)) {
                continue;
            }

            if (str_starts_with($key, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$name] = $value;
                continue;
            }

            if ($key === 'CONTENT_TYPE' || $key === 'CONTENT_LENGTH') {
                $headers[strtolower(str_replace('_', '-', $key))] = $value;
            }
        }

        // Strato/CGI reicht den Authorization-Header nur über die Umschreibung aus
        // public/.htaccess durch; ohne diesen Rückfall bleibt die Anmeldung leer.
        if (!isset($headers['authorization'])) {
            $forwarded = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;

            if (is_string($forwarded) && $forwarded !== '') {
                $headers['authorization'] = $forwarded;
            }
        }

        return $headers;
    }

    /**
     * @param array<array-key, mixed> $data
     * @return array<array-key, mixed>
     */
    private static function snakeCaseKeys(array $data): array
    {
        $converted = [];

        foreach ($data as $key => $value) {
            $convertedKey = is_string($key) ? self::camelToSnake($key) : $key;
            $converted[$convertedKey] = is_array($value) ? self::snakeCaseKeys($value) : $value;
        }

        return $converted;
    }

    private static function camelToSnake(string $key): string
    {
        return strtolower((string) preg_replace('/(?<!^)[A-Z]/', '_$0', $key));
    }
}
