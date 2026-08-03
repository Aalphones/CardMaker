<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\CardGroupService;
use App\Validators\CardGroupValidator;

final class CardGroupController
{
    public function __construct(
        private readonly Request $request,
        private readonly CardGroupService $cardGroups
    ) {
    }

    public function index(): void
    {
        Response::json(['items' => $this->cardGroups->list()]);
    }

    public function show(string $id): void
    {
        $cardGroup = $this->cardGroups->find((int) $id);

        if ($cardGroup === null) {
            $this->notFound();

            return;
        }

        Response::json($cardGroup);
    }

    public function create(): void
    {
        $data = CardGroupValidator::validate((array) $this->request->body());

        Response::json($this->cardGroups->create($data), 201);
    }

    public function update(string $id): void
    {
        $data = CardGroupValidator::validateForUpdate((array) $this->request->body());
        $cardGroup = $this->cardGroups->update((int) $id, $data);

        if ($cardGroup === null) {
            $this->notFound();

            return;
        }

        Response::json($cardGroup);
    }

    public function destroy(string $id): void
    {
        if (!$this->cardGroups->delete((int) $id)) {
            $this->notFound();

            return;
        }

        Response::noContent();
    }

    private function notFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Diese Kartengruppe gibt es nicht.', 404);
    }
}
