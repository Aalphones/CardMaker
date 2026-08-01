<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\AccountAlreadyExistsException;
use App\Services\AuthService;
use App\Validators\SetupValidator;

final class SetupController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthService $authService
    ) {
    }

    /**
     * Der Einrichtungsaufruf versiegelt sich selbst: Sobald ein Konto existiert, legt er
     * nichts mehr an — und zwar bevor er die Angaben überhaupt ansieht.
     */
    public function create(): void
    {
        if ($this->authService->accountExists()) {
            $this->sealed();
        }

        $data = SetupValidator::validate((array) $this->request->body());

        try {
            $user = $this->authService->createInitialUser($data['email'], $data['password']);
        } catch (AccountAlreadyExistsException) {
            $this->sealed();
        }

        Response::json(['user' => $user], 201);
    }

    private function sealed(): never
    {
        Response::error(
            Response::ERROR_ALREADY_INITIALIZED,
            'Die Einrichtung ist bereits abgeschlossen.',
            410
        );
    }
}
