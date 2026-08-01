<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\AccessTokenRepository;

final class AccessTokenService
{
    public function __construct(
        private readonly AccessTokenRepository $accessTokens,
        private readonly TokenService $tokens
    ) {
    }

    /**
     * Der Klartext verlässt das Backend genau einmal — hier. Danach existiert nur noch
     * der Hashwert in der Datenbank.
     *
     * @return array{id: int, name: string, token: string}
     */
    public function create(int $userId, string $name): array
    {
        $token = $this->tokens->generate();
        $created = $this->accessTokens->create($userId, $name, $this->tokens->hash($token));

        return [
            'id' => (int) $created['id'],
            'name' => (string) $created['name'],
            'token' => $token,
        ];
    }

    /** @return array{id: int, email: string}|null */
    public function resolve(string $token): ?array
    {
        $accessToken = $this->accessTokens->findByTokenHash($this->tokens->hash($token));

        if ($accessToken === null) {
            return null;
        }

        $this->accessTokens->touch((int) $accessToken['id']);

        return [
            'id' => (int) $accessToken['user_id'],
            'email' => (string) $accessToken['email'],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public function list(int $userId): array
    {
        return array_map(
            static fn (array $row): array => AccessTokenRepository::format($row),
            $this->accessTokens->allForUser($userId)
        );
    }

    public function delete(int $userId, int $tokenId): bool
    {
        return $this->accessTokens->deleteForUser($userId, $tokenId);
    }
}
