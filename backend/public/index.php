<?php

declare(strict_types=1);

use App\Controllers\AssetController;
use App\Controllers\AuthController;
use App\Controllers\CardController;
use App\Controllers\CardGroupController;
use App\Controllers\CardImageController;
use App\Controllers\CardPreviewController;
use App\Controllers\FontController;
use App\Controllers\HealthController;
use App\Controllers\MetaController;
use App\Controllers\MigrateController;
use App\Controllers\PrintProjectController;
use App\Controllers\SetupController;
use App\Controllers\TemplateController;
use App\Controllers\TemplatePreviewController;
use App\Controllers\TokenController;
use App\Database\Connection;
use App\Http\Request;
use App\Http\Response;
use App\Middleware\Auth;
use App\Middleware\Cors;
use App\Repositories\AccessTokenRepository;
use App\Repositories\AssetRepository;
use App\Repositories\CardGroupRepository;
use App\Repositories\CardImageRepository;
use App\Repositories\CardRepository;
use App\Repositories\FontRepository;
use App\Repositories\PrintProjectRepository;
use App\Repositories\SessionRepository;
use App\Repositories\TemplateRepository;
use App\Repositories\UserRepository;
use App\Services\AccessTokenService;
use App\Services\AssetService;
use App\Services\AuthService;
use App\Services\CardGroupService;
use App\Services\CardImageService;
use App\Services\CardPreviewService;
use App\Services\CardService;
use App\Services\FontService;
use App\Services\MetaService;
use App\Services\PreviewImageStorage;
use App\Services\PrintProjectService;
use App\Services\TemplatePreviewService;
use App\Services\TemplateService;
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
$fontService = null;
$templateService = null;
$cardService = null;
$cardImageService = null;
$templatePreviewService = null;
$cardPreviewService = null;
$printProjectService = null;
$metaService = null;

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

    // Reihenfolge bewusst: die Repositories zuerst, danach die Dienste, die sie teilen —
    // AssetService braucht das Template-Repository für die Löschsperre, TemplateService das
    // Bild-, das Schrift- und das Karten-Repository (Löschsperre bei vorhandenen Karten),
    // CardService alle drei Fach-Repositories für seine Existenzprüfungen.
    $assetRepository = new AssetRepository($database);
    $templateRepository = new TemplateRepository($database);
    $fontRepository = new FontRepository($database);
    $cardGroupRepository = new CardGroupRepository($database);
    $cardRepository = new CardRepository($database);
    $cardImageRepository = new CardImageRepository($database);

    $cardGroupService = new CardGroupService($cardGroupRepository, $cardRepository);
    $assetService = new AssetService(
        $assetRepository,
        $templateRepository,
        $backendRoot . '/uploads',
        $logger
    );
    $fontService = new FontService(
        $fontRepository,
        $templateRepository,
        $backendRoot . '/uploads/fonts',
        $logger
    );
    $templatePreviewStorage = new PreviewImageStorage($backendRoot . '/uploads/previews/templates', $logger);
    $cardPreviewStorage = new PreviewImageStorage($backendRoot . '/uploads/previews/cards', $logger);
    $templatePreviewService = new TemplatePreviewService($templateRepository, $templatePreviewStorage);
    $cardPreviewService = new CardPreviewService($cardRepository, $cardPreviewStorage);

    $templateService = new TemplateService(
        $templateRepository,
        $assetRepository,
        $fontRepository,
        $cardRepository,
        $templatePreviewService
    );
    $cardImageService = new CardImageService(
        $cardImageRepository,
        $cardRepository,
        $templateRepository,
        $backendRoot . '/uploads/cards',
        $logger
    );
    $cardService = new CardService(
        $cardRepository,
        $templateRepository,
        $cardGroupRepository,
        $assetRepository,
        $cardImageService,
        $cardPreviewService
    );
    $printProjectService = new PrintProjectService(
        new PrintProjectRepository($database),
        $cardRepository
    );
    $metaService = new MetaService($fontRepository);
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
    $routes->addRoute('GET', '/api/meta', [MetaController::class, 'show']);
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
    $routes->addRoute('GET', '/api/fonts', [FontController::class, 'index']);
    $routes->addRoute('POST', '/api/fonts', [FontController::class, 'create']);
    $routes->addRoute('GET', '/api/fonts/{id:\d+}/file', [FontController::class, 'file']);
    $routes->addRoute('PATCH', '/api/fonts/{id:\d+}', [FontController::class, 'update']);
    $routes->addRoute('DELETE', '/api/fonts/{id:\d+}', [FontController::class, 'destroy']);
    $routes->addRoute('GET', '/api/templates', [TemplateController::class, 'index']);
    $routes->addRoute('POST', '/api/templates', [TemplateController::class, 'create']);
    $routes->addRoute('GET', '/api/templates/{id:\d+}', [TemplateController::class, 'show']);
    $routes->addRoute('PATCH', '/api/templates/{id:\d+}', [TemplateController::class, 'update']);
    $routes->addRoute('DELETE', '/api/templates/{id:\d+}', [TemplateController::class, 'destroy']);
    $routes->addRoute('GET', '/api/cards', [CardController::class, 'index']);
    $routes->addRoute('POST', '/api/cards', [CardController::class, 'create']);
    $routes->addRoute('GET', '/api/cards/{id:\d+}', [CardController::class, 'show']);
    $routes->addRoute('PATCH', '/api/cards/{id:\d+}', [CardController::class, 'update']);
    $routes->addRoute('DELETE', '/api/cards/{id:\d+}', [CardController::class, 'destroy']);
    $routes->addRoute('POST', '/api/cards/{id:\d+}/duplicate', [CardController::class, 'duplicate']);
    $routes->addRoute('POST', '/api/cards/{id:\d+}/images', [CardImageController::class, 'upload']);
    $routes->addRoute(
        'PATCH',
        '/api/cards/{id:\d+}/images/{layerId:[a-zA-Z0-9\-]{1,64}}',
        [CardImageController::class, 'update']
    );
    $routes->addRoute(
        'DELETE',
        '/api/cards/{id:\d+}/images/{layerId:[a-zA-Z0-9\-]{1,64}}',
        [CardImageController::class, 'destroy']
    );
    $routes->addRoute(
        'GET',
        '/api/cards/{id:\d+}/images/{layerId:[a-zA-Z0-9\-]{1,64}}/file',
        [CardImageController::class, 'file']
    );
    $routes->addRoute('POST', '/api/templates/{id:\d+}/preview', [TemplatePreviewController::class, 'upload']);
    $routes->addRoute('GET', '/api/templates/{id:\d+}/preview/file', [TemplatePreviewController::class, 'file']);
    $routes->addRoute('POST', '/api/cards/{id:\d+}/preview', [CardPreviewController::class, 'upload']);
    $routes->addRoute('GET', '/api/cards/{id:\d+}/preview/file', [CardPreviewController::class, 'file']);
    $routes->addRoute('GET', '/api/print-project', [PrintProjectController::class, 'show']);
    $routes->addRoute('PUT', '/api/print-project/options', [PrintProjectController::class, 'updateOptions']);
    $routes->addRoute('POST', '/api/print-project/items', [PrintProjectController::class, 'addItem']);
    // Der feste Pfad steht vor dem mit Kennung: „alles entfernen" darf nicht als Position „items" gelesen werden.
    $routes->addRoute('DELETE', '/api/print-project/items', [PrintProjectController::class, 'clear']);
    $routes->addRoute('PATCH', '/api/print-project/items/{id:\d+}', [PrintProjectController::class, 'updateItem']);
    $routes->addRoute('DELETE', '/api/print-project/items/{id:\d+}', [PrintProjectController::class, 'destroyItem']);
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
    $assetService,
    $fontService,
    $templateService,
    $cardService,
    $cardImageService,
    $templatePreviewService,
    $cardPreviewService,
    $printProjectService,
    $metaService
): object {
    return match ($controllerClass) {
        HealthController::class => new HealthController($database),
        MetaController::class => new MetaController($metaService),
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
        FontController::class => new FontController($request, $fontService),
        TemplateController::class => new TemplateController($request, $templateService),
        CardController::class => new CardController($request, $cardService),
        CardImageController::class => new CardImageController($request, $cardImageService),
        TemplatePreviewController::class => new TemplatePreviewController($request, $templatePreviewService),
        CardPreviewController::class => new CardPreviewController($request, $cardPreviewService),
        PrintProjectController::class => new PrintProjectController($request, $printProjectService),
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
