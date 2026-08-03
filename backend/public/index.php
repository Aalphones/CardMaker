<?php

declare(strict_types=1);

use App\Controllers\AssetController;
use App\Controllers\AuthController;
use App\Controllers\CardGroupController;
use App\Controllers\HealthController;
use App\Controllers\MigrateController;
use App\Controllers\SetupController;
use App\Controllers\TokenController;
use App\Database\Connection;
use App\Http\Request;
use App\Http\Response;
use App\Middleware\Auth;
use App\Middleware\Cors;
use App\Repositories\AccessTokenRepository;
use App\Repositories\AssetRepository;
use App\Repositories\CardGroupRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use App\Services\AccessTokenService;
use App\Services\AssetService;
use App\Services\AuthService;
use App\Services\CardGroupService;
use App\Services\TokenService;
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

// Alles außer der Auskunft braucht die Datenbank — ohne sie hätte keine Antwort Bestand.
if ($request->path() !== '/api/health' && !$database instanceof PDO) {
    Response::error(Response::ERROR_SERVER_ERROR, 'Keine Datenbankverbindung.', 500);
}

$authService = null;
$accessTokenService = null;
$cardGroupService = null;
$assetService = null;

if ($database instanceof PDO) {
    $tokenService = new TokenService();

    $authService = new AuthService(
        new UserRepository($database),
        new SessionRepository($database),
        $tokenService
    );
    $accessTokenService = new AccessTokenService(
        new AccessTokenRepository($database),
        $tokenService
    );
    $cardGroupService = new CardGroupService(new CardGroupRepository($database));
    $assetService = new AssetService(
        new AssetRepository($database),
        $backendRoot . '/uploads',
        $logger
    );
}

// Positivliste der offenen Pfade. Die Sperre ist die Vorgabe, nicht die Ausnahme: Ein
// neuer Pfad, den jemand hier einzutragen vergisst, ist damit geschlossen, nicht offen.
// Vorabanfragen (OPTIONS) sind schon in der Herkunftssperre oben beendet worden.
$openPaths = [
    '/api/health',
    '/api/setup',
    '/api/auth/login',
    '/api/migrate',
];

if (!in_array($request->path(), $openPaths, true)) {
    // Die Dienste können hier nicht fehlen — die Datenbank-Sperre oben hat schon
    // abgebrochen. Wäre es doch so, endet das im 500 des Ausnahme-Handlers, also zu.
    (new Auth($authService, $accessTokenService))->handle($request);
}

$dispatcher = FastRoute\simpleDispatcher(static function (RouteCollector $routes): void {
    $routes->addRoute('GET', '/api/health', [HealthController::class, 'show']);
    $routes->addRoute('POST', '/api/migrate', [MigrateController::class, 'run']);
    $routes->addRoute('POST', '/api/setup', [SetupController::class, 'create']);
    $routes->addRoute('POST', '/api/auth/login', [AuthController::class, 'login']);
    $routes->addRoute('POST', '/api/auth/logout', [AuthController::class, 'logout']);
    $routes->addRoute('GET', '/api/auth/me', [AuthController::class, 'me']);
    $routes->addRoute('GET', '/api/tokens', [TokenController::class, 'index']);
    $routes->addRoute('POST', '/api/tokens', [TokenController::class, 'create']);
    $routes->addRoute('DELETE', '/api/tokens/{id:\d+}', [TokenController::class, 'destroy']);
    $routes->addRoute('GET', '/api/card-groups', [CardGroupController::class, 'index']);
    $routes->addRoute('POST', '/api/card-groups', [CardGroupController::class, 'create']);
    $routes->addRoute('GET', '/api/card-groups/{id:\d+}', [CardGroupController::class, 'show']);
    $routes->addRoute('PATCH', '/api/card-groups/{id:\d+}', [CardGroupController::class, 'update']);
    $routes->addRoute('DELETE', '/api/card-groups/{id:\d+}', [CardGroupController::class, 'destroy']);
    $routes->addRoute('GET', '/api/assets', [AssetController::class, 'index']);
    $routes->addRoute('POST', '/api/assets', [AssetController::class, 'create']);
    $routes->addRoute('GET', '/api/assets/{id:\d+}/file', [AssetController::class, 'file']);
    $routes->addRoute('DELETE', '/api/assets/{id:\d+}', [AssetController::class, 'destroy']);
});

$migrationsDirectory = $backendRoot . '/src/Migrations';
$migrateToken = $_ENV['MIGRATE_TOKEN'] ?? '';

$makeController = static function (string $controllerClass) use (
    $database,
    $request,
    $migrationsDirectory,
    $migrateToken,
    $logger,
    $authService,
    $accessTokenService,
    $cardGroupService,
    $assetService
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
        SetupController::class => new SetupController($request, $authService),
        AuthController::class => new AuthController($request, $authService),
        TokenController::class => new TokenController($request, $accessTokenService),
        CardGroupController::class => new CardGroupController($request, $cardGroupService),
        AssetController::class => new AssetController($request, $assetService),
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
