<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Http\Request;
use App\Http\Response;
use App\Services\AccessTokenService;
use App\Services\AuthService;

final class Auth
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly AccessTokenService $accessTokenService
    ) {
    }

    /**
     * Anmelde- und Zugriffstoken sind beide 64-stellige Hexzeichenketten und äußerlich
     * nicht zu unterscheiden — deshalb wird erst in den Sitzungen und dann in den
     * Zugriffstoken nachgesehen. Welche der beiden Prüfungen fehlschlug, verrät die
     * Antwort nicht.
     */
    public function handle(Request $request): void
    {
        $token = $this->readBearerToken($request);

        if ($token === null) {
            $this->reject();
        }

        $user = $this->authService->resolveSession($token);

        if ($user !== null) {
            $request->setUser($user);
            $request->setAuthToken($token, Request::AUTH_SESSION);

            return;
        }

        $user = $this->accessTokenService->resolve($token);

        if ($user !== null) {
            $request->setUser($user);
            $request->setAuthToken($token, Request::AUTH_ACCESS_TOKEN);

            return;
        }

        $this->reject();
    }

    private function readBearerToken(Request $request): ?string
    {
        $header = $request->header('Authorization');

        if ($header === null) {
            return null;
        }

        if (preg_match('/^Bearer\s+(\S+)$/i', trim($header), $matches) !== 1) {
            return null;
        }

        return $matches[1];
    }

    /**
     * Ein ungültiges Token ist ein normaler Vorgang, kein Zwischenfall — hier wird
     * bewusst nichts protokolliert.
     */
    private function reject(): never
    {
        Response::error(Response::ERROR_UNAUTHORIZED, 'Anmeldung erforderlich.', 401);
    }
}
