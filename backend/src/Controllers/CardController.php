<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\CardService;
use App\Validators\CardValidator;

final class CardController
{
    public function __construct(
        private readonly Request $request,
        private readonly CardService $cards
    ) {
    }

    public function index(): void
    {
        Response::json(['items' => $this->cards->list()]);
    }

    public function show(string $id): void
    {
        $card = $this->cards->find((int) $id);

        if ($card === null) {
            $this->notFound();

            return;
        }

        Response::json($card);
    }

    public function create(): void
    {
        $data = CardValidator::validate((array) $this->request->body());

        Response::json($this->cards->create($data), 201);
    }

    public function update(string $id): void
    {
        $data = CardValidator::validateForUpdate((array) $this->request->body());
        $card = $this->cards->update((int) $id, $data);

        if ($card === null) {
            $this->notFound();

            return;
        }

        Response::json($card);
    }

    public function destroy(string $id): void
    {
        if (!$this->cards->delete((int) $id)) {
            $this->notFound();

            return;
        }

        Response::noContent();
    }

    public function duplicate(string $id): void
    {
        $card = $this->cards->duplicate((int) $id);

        if ($card === null) {
            $this->notFound();

            return;
        }

        Response::json($card, 201);
    }

    private function notFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Diese Karte gibt es nicht.', 404);
    }
}
