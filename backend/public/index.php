<?php

declare(strict_types=1);

use App\Controllers\HealthController;
use App\Controllers\MigrateController;
use App\Database\Connection;
use App\Http\Request;
use App\Http\Response;
use App\Middleware\Cors;
use Dotenv\Dotenv;
use FastRoute\Dispatcher;
use FastRoute\RouteCollector;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;

require __DIR__ . '/../vendor/autoload.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

$backendRoot = dirname(__DIR__);

Dotenv::createImmutable($backendRoot)->safeLoad();

// Was hier hineingeht, steht im Klartext in der Logdatei: niemals Passwörter,
// Tokens, Token-Hashes oder Inhalte aus .env protokollieren.
$logger = new Logger('cardmaker');
$logger->pushHandler(new StreamHandler($backendRoot . '/storage/logs/app.log', Level::Warning));

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

// Ohne SSH ist die Logdatei die einzige Spur: Fatale Fehler (Speicher, Zeitlimit)
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

$corsOrigins = array_values(array_filter(
    array_map(
        static fn (string $origin): string => trim($origin),
        explode(',', $_ENV['CORS_ORIGINS'] ?? '')
    ),
    static fn (string $origin): bool => $origin !== ''
));

(new Cors($corsOrigins))->handle($request);

$database = null;

try {
    $database = Connection::get();
} catch (Throwable $exception) {
    $logger->error('Datenbankverbindung fehlgeschlagen', ['message' => $exception->getMessage()]);
}

$dispatcher = FastRoute\simpleDispatcher(static function (RouteCollector $routes): void {
    $routes->addRoute('GET', '/api/health', [HealthController::class, 'show']);
    $routes->addRoute('POST', '/api/migrate', [MigrateController::class, 'run']);
});

$migrationsDirectory = $backendRoot . '/src/Migrations';
$migrateToken = $_ENV['MIGRATE_TOKEN'] ?? '';

$makeController = static function (string $controllerClass) use (
    $database,
    $request,
    $migrationsDirectory,
    $migrateToken,
    $logger
): object {
    return match ($controllerClass) {
        HealthController::class => new HealthController($database),
        MigrateController::class => new MigrateController(
            $request,
            $database,
            $migrationsDirectory,
            $migrateToken,
            $logger
        ),
        default => throw new RuntimeException('Kein Bauplan für Controller: ' . $controllerClass),
    };
};

$route = $dispatcher->dispatch($request->method(), $request->path());

if ($route[0] === Dispatcher::NOT_FOUND) {
    Response::error(Response::ERROR_NOT_FOUND, 'Diesen Pfad gibt es hier nicht.', 404);
}

if ($route[0] === Dispatcher::METHOD_NOT_ALLOWED) {
    Response::error(
        Response::ERROR_METHOD_NOT_ALLOWED,
        'Diese Methode ist für diesen Pfad nicht erlaubt.',
        405
    );
}

[$controllerClass, $controllerMethod] = $route[1];

$controller = $makeController($controllerClass);
$controller->{$controllerMethod}(...array_values($route[2]));
