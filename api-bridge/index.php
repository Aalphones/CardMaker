<?php

declare(strict_types=1);

// Bruecke im ausgelieferten Bereich. Der eigentliche Programmcode samt .env und
// vendor/ liegt ausserhalb dessen, was der Webserver herausgibt: Diese Datei landet
// auf dem Server unter www/api/index.php, das Backend unter cardMaker/backend/ —
// beide Ordner liegen im selben uebergeordneten Ordner (ADR-020).
require __DIR__ . '/../../cardMaker/backend/public/index.php';
