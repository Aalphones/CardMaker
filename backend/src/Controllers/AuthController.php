<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\AuthService;
use App\Validators\LoginValidator;

final class AuthController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthService $authService
    ) {
    }

    public function login(): void
    {
        $data = LoginValidator::validate((array) $this->request->body());

        $user = $this->authService->login($data['email'], $data['password']);

        if ($user === null) {
            // Immer dieselbe Meldung, egal ob die E-Mail existiert.
            Response::error(
                Response::ERROR_UNAUTHORIZED,
                'E-Mail-Adresse oder Passwort stimmt nicht.',
                401
            );

            return;
        }

        $session = $this->authService->startSession($user['id']);

        Response::json([
            'token' => $session['token'],
            'expiresAt' => $session['expiresAt'],
            'user' => $user,
        ]);
    }

    public function logout(): void
    {
        $token = $this->request->authToken();

        if ($token === null || $this->request->authKind() !== Request::AUTH_SESSION) {
            // Ein Zugriffstoken wird nicht durch Abmelden entwertet, sondern gelöscht —
            // sonst verlöre ein Skript seinen Zugang durch einen fremden Klick.
            Response::error(
                Response::ERROR_FORBIDDEN,
                'Mit einem Zugriffstoken kann man sich nicht abmelden.',
                403
            );

            return;
        }

        $this->authService->endSession($token);

        Response::noContent();
    }

    public function me(): void
    {
        Response::json(['user' => $this->request->user()]);
    }
}
