<?php

declare(strict_types=1);

// Bruecke im ausgelieferten Bereich. Der eigentliche Programmcode samt .env und
// vendor/ liegt eine Ebene darueber, ausserhalb dessen, was der Webserver
// herausgibt. Diese Datei landet auf dem Server unter public/api/index.php.
require __DIR__ . '/../../backend/public/index.php';
