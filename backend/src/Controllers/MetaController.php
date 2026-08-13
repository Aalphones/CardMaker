<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Response;
use App\Services\MetaService;

final class MetaController
{
    public function __construct(private readonly MetaService $meta)
    {
    }

    public function show(): void
    {
        Response::json($this->meta->get());
    }
}
