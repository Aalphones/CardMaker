<?php

declare(strict_types=1);

use App\Http\Response;
use App\Support\Autoloader;
use App\Support\Env;

require __DIR__ . '/../src/Support/Autoloader.php';

Autoloader::register(__DIR__ . '/../src');

error_reporting(E_ALL);
ini_set('display_errors', '0');

Env::load(dirname(__DIR__) . '/.env');

$expectedToken = Env::get('MIGRATE_TOKEN');
$providedToken = $_SERVER['HTTP_X_MIGRATE_TOKEN'] ?? '';

// Ohne gültiges Token verhält sich die Seite wie nicht vorhanden — sie soll nicht
// verraten, dass es hier etwas zu holen gibt.
if ($expectedToken === null || !is_string($providedToken) || !hash_equals($expectedToken, $providedToken)) {
    Response::error(Response::ERROR_NOT_FOUND, 'Diesen Pfad gibt es hier nicht.', 404);
}

$relevantExtensions = ['pdo_mysql', 'gd', 'imagick', 'fileinfo', 'mbstring'];
$extensions = [];

foreach ($relevantExtensions as $extensionName) {
    $extensions[$extensionName] = extension_loaded($extensionName);
}

Response::json([
    'phpVersion' => PHP_VERSION,
    'extensions' => $extensions,
    'limits' => [
        'uploadMaxFilesize' => ini_get('upload_max_filesize'),
        'postMaxSize' => ini_get('post_max_size'),
        'memoryLimit' => ini_get('memory_limit'),
        'maxExecutionTime' => ini_get('max_execution_time'),
    ],
    'documentRoot' => $_SERVER['DOCUMENT_ROOT'] ?? null,
    'scriptDirectory' => __DIR__,
]);
