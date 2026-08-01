<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use App\Support\Timestamps;

final class AuthService
{
    public const SESSION_LIFETIME_DAYS = 30;

    /**
     * Vergleichswert für den Fall, dass die E-Mail unbekannt ist: `password_verify()` läuft
     * trotzdem, damit die Antwortdauer nicht verrät, ob ein Konto existiert.
     */
    private const BLIND_HASH = '$2y$12$r.Z5V.iBCkxFMfk3g9hml.idBt3Hl2c7.zFyPhIClZBQdz3ZiuMIK';

    public function __construct(
        private readonly UserRepository $users,
        private readonly SessionRepository $sessions,
        private readonly TokenService $tokens
    ) {
    }

    /** @return array{id: int, email: string} */
    public function createInitialUser(string $email, string $password): array
    {
        if ($this->users->count() > 0) {
            throw new AccountAlreadyExistsException('Es gibt bereits ein Konto.');
        }

        $userId = $this->users->create($email, password_hash($password, PASSWORD_DEFAULT));

        return [
            'id' => $userId,
            'email' => $email,
        ];
    }

    public function accountExists(): bool
    {
        return $this->users->count() > 0;
    }

    /** @return array{id: int, email: string}|null */
    public function login(string $email, string $password): ?array
    {
        $user = $this->users->findByEmail($email);

        if ($user === null) {
            password_verify($password, self::BLIND_HASH);

            return null;
        }

        if (!password_verify($password, (string) $user['password_hash'])) {
            return null;
        }

        return UserRepository::format($user);
    }

    /** @return array{token: string, expiresAt: string|null} */
    public function startSession(int $userId): array
    {
        $this->sessions->deleteExpired();

        $token = $this->tokens->generate();
        $session = $this->sessions->create($userId, $this->tokens->hash($token), self::SESSION_LIFETIME_DAYS);

        return [
            'token' => $token,
            'expiresAt' => Timestamps::toIso($session['expires_at']),
        ];
    }

    public function endSession(string $token): void
    {
        $this->sessions->deleteByTokenHash($this->tokens->hash($token));
    }

    /** @return array{id: int, email: string}|null */
    public function resolveSession(string $token): ?array
    {
        $session = $this->sessions->findActiveByTokenHash($this->tokens->hash($token));

        if ($session === null) {
            return null;
        }

        $this->sessions->touch((int) $session['id']);

        return [
            'id' => (int) $session['user_id'],
            'email' => (string) $session['email'],
        ];
    }
}
