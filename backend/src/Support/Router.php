<?php

declare(strict_types=1);

namespace App\Support;

final class Router
{
    public const FOUND = 'found';
    public const NOT_FOUND = 'not_found';
    public const METHOD_NOT_ALLOWED = 'method_not_allowed';

    /** @var list<array{method: string, segments: string[], handler: array{0: class-string, 1: string}}> */
    private array $routes = [];

    /** @param array{0: class-string, 1: string} $handler */
    public function add(string $method, string $path, array $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'segments' => self::splitPath($path),
            'handler' => $handler,
        ];
    }

    /**
     * @return array{status: string, handler: ?array{0: class-string, 1: string}, parameters: array<string, string>}
     */
    public function resolve(string $method, string $path): array
    {
        $requestedSegments = self::splitPath($path);
        $requestedMethod = strtoupper($method);
        $pathExists = false;

        foreach ($this->routes as $route) {
            $parameters = self::matchSegments($route['segments'], $requestedSegments);

            if ($parameters === null) {
                continue;
            }

            $pathExists = true;

            if ($route['method'] === $requestedMethod) {
                return [
                    'status' => self::FOUND,
                    'handler' => $route['handler'],
                    'parameters' => $parameters,
                ];
            }
        }

        return [
            'status' => $pathExists ? self::METHOD_NOT_ALLOWED : self::NOT_FOUND,
            'handler' => null,
            'parameters' => [],
        ];
    }

    /**
     * @param string[] $routeSegments
     * @param string[] $requestedSegments
     * @return array<string, string>|null Parameter, oder null wenn der Pfad nicht passt
     */
    private static function matchSegments(array $routeSegments, array $requestedSegments): ?array
    {
        if (count($routeSegments) !== count($requestedSegments)) {
            return null;
        }

        $parameters = [];

        foreach ($routeSegments as $index => $routeSegment) {
            $requestedSegment = $requestedSegments[$index];

            if (str_starts_with($routeSegment, '{') && str_ends_with($routeSegment, '}')) {
                $parameters[substr($routeSegment, 1, -1)] = $requestedSegment;
                continue;
            }

            if ($routeSegment !== $requestedSegment) {
                return null;
            }
        }

        return $parameters;
    }

    /** @return string[] */
    private static function splitPath(string $path): array
    {
        return array_values(array_filter(
            explode('/', trim($path, '/')),
            static fn (string $segment): bool => $segment !== ''
        ));
    }
}
