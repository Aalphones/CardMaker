<?php

declare(strict_types=1);

// Bruecke im ausgelieferten Bereich. Das Backend liegt als Nachbarordner daneben
// (www/backend/, gesperrt durch dessen .htaccess) und wird per Dateizugriff eingebunden.
// Diese Datei landet auf dem Server unter www/api/index.php (ADR-020).
require __DIR__ . '/../backend/public/index.php';
