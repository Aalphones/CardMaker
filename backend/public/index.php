<?php

declare(strict_types=1);

use App\Controllers\HealthController;
use App\Database\Connection;
use App\Http\Request;
use App\Http\Response;
use App\Middleware\Cors;
use App\Support\Autoloader;
use App\Support\Env;
use App\Support\Logger;
use App\Support\Router;

require __DIR__ . '/../src/Support/Autoloader.php';

Autoloader::register(__DIR__ . '/../src');

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

$backendRoot = dirname(__DIR__);

Env::load($backendRoot . '/.env');

$logger = new Logger($backendRoot . '/storage/logs/app.log');

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if ((error_reporting() & $severity) === 0) {
        return false;
    }

    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(static function (Throwable $exception) use ($logger): void {
    $logger->error('Unbehandelte Ausnahme', [
        'type' => $exception::class,
        'message' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
    ]);

    Response::error(Response::ERROR_SERVER_ERROR, 'Interner Serverfehler.', 500);
});

// Ohne SSH ist die Logdatei die einzige Spur: Fatale Fehler (Parse, Speicher, Zeitlimit)
// gehen an keinem der beiden Handler oben vorbei, sondern nur hier durch.
register_shutdown_function(static function () use ($logger): void {
    $lastError = error_get_last();

    if ($lastError === null) {
        return;
    }

    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];

    if (!in_array($lastError['type'], $fatalTypes, true)) {
        return;
    }

    $logger->error('Schwerer Fehler', [
        'message' => $lastError['message'],
        'file' => $lastError['file'],
        'line' => $lastError['line'],
    ]);

    if (!headers_sent()) {
        Response::error(Response::ERROR_SERVER_ERROR, 'Interner Serverfehler.', 500);
    }
});

$request = new Request();

$cors = new Cors(Env::asList('CORS_ORIGINS'));
$cors->handle($request);

$database = null;

try {
    $database = Connection::get();
} catch (Throwable $exception) {
    $logger->error('Datenbankverbindung fehlgeschlagen', ['message' => $exception->getMessage()]);
}

$router = new Router();
$router->add('GET', '/api/health', [HealthController::class, 'show']);

$makeController = static function (string $controllerClass) use ($database): object {
    return match ($controllerClass) {
        HealthController::class => new HealthController($database),
        default => throw new RuntimeException('Kein Bauplan für Controller: ' . $controllerClass),
    };
};

$route = $router->resolve($request->method(), $request->path());

if ($route['status'] === Router::NOT_FOUND) {
    Response::error(Response::ERROR_NOT_FOUND, 'Diesen Pfad gibt es hier nicht.', 404);
}

if ($route['status'] === Router::METHOD_NOT_ALLOWED) {
    Response::error(
        Response::ERROR_METHOD_NOT_ALLOWED,
        'Diese Methode ist für diesen Pfad nicht erlaubt.',
        405
    );
}

[$controllerClass, $controllerMethod] = $route['handler'];

$controller = $makeController($controllerClass);
$controller->{$controllerMethod}(...array_values($route['parameters']));
