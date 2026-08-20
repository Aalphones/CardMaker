<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;

final class M012ExtendAssetKind
{
    public function up(PDO $pdo): void
    {
        // „artwork“ ist eine dritte Bildvorrat-Art neben Rahmen und Icons (ADR-027) —
        // verwaltet wie die anderen beiden, aber ohne eigenen Ebenen-Typ.
        $pdo->exec(
            "ALTER TABLE assets MODIFY kind ENUM('frame','icon','artwork') NOT NULL"
        );
    }
}
