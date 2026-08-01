<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\AccessTokenService;
use App\Validators\AccessTokenValidator;

final class TokenController
{
    public function __construct(
        private readonly Request $request,
        private readonly AccessTokenService $accessTokenService
    ) {
    }

    public function index(): void
    {
        Response::json(['items' => $this->accessTokenService->list($this->userId())]);
    }

    public function create(): void
    {
        $data = AccessTokenValidator::validate((array) $this->request->body());

        Response::json($this->accessTokenService->create($this->userId(), $data['name']), 201);
    }

    /**
     * Ein fremdes Token wird mit `404` beantwortet, nicht mit `403` — sonst verriete die
     * Antwort, welche Kennungen es gibt.
     */
    public function destroy(string $id): void
    {
        if (!$this->accessTokenService->delete($this->userId(), (int) $id)) {
            Response::error(Response::ERROR_NOT_FOUND, 'Dieses Zugriffstoken gibt es nicht.', 404);

            return;
        }

        Response::noContent();
    }

    private function userId(): int
    {
        $user = $this->request->user();

        return (int) ($user['id'] ?? 0);
    }
}
