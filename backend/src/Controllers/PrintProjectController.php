<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\PrintProjectService;
use App\Validators\PrintProjectValidator;

final class PrintProjectController
{
    public function __construct(
        private readonly Request $request,
        private readonly PrintProjectService $printProject
    ) {
    }

    public function show(): void
    {
        Response::json($this->printProject->get());
    }

    public function updateOptions(): void
    {
        $options = PrintProjectValidator::validateOptions((array) $this->request->body());

        Response::json($this->printProject->setOptions($options));
    }

    public function addItem(): void
    {
        $data = PrintProjectValidator::validateNewItem((array) $this->request->body());
        $result = $this->printProject->addItem($data);

        Response::json($result['item'], $result['wasCreated'] ? 201 : 200);
    }

    public function updateItem(string $id): void
    {
        $quantity = PrintProjectValidator::validateQuantity((array) $this->request->body());
        $item = $this->printProject->setQuantity((int) $id, $quantity);

        if ($item === null) {
            $this->notFound();

            return;
        }

        Response::json($item);
    }

    public function destroyItem(string $id): void
    {
        if (!$this->printProject->removeItem((int) $id)) {
            $this->notFound();

            return;
        }

        Response::noContent();
    }

    public function clear(): void
    {
        $this->printProject->clear();

        Response::noContent();
    }

    private function notFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Diese Position gibt es im Druckprojekt nicht.', 404);
    }
}
