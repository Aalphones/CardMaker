<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use PDO;

final class AccessTokenRepository
{
    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<string, mixed> */
    public function create(int $userId, string $name, string $tokenHash): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO personal_access_tokens (user_id, name, token_hash, created_at) '
            . 'VALUES (:user_id, :name, :token_hash, UTC_TIMESTAMP())'
        );
        $statement->execute([
            'user_id' => $userId,
            'name' => $name,
            'token_hash' => $tokenHash,
        ]);

        $tokenId = (int) $this->database->lastInsertId();

        return [
            'id' => $tokenId,
            'name' => $name,
        ];
    }

    /** @return array<string, mixed>|null */
    public function findByTokenHash(string $tokenHash): ?array
    {
        $statement = $this->database->prepare(
            'SELECT personal_access_tokens.id, personal_access_tokens.user_id, users.email '
            . 'FROM personal_access_tokens '
            . 'INNER JOIN users ON users.id = personal_access_tokens.user_id '
            . 'WHERE personal_access_tokens.token_hash = :token_hash '
            . 'LIMIT 1'
        );
        $statement->execute(['token_hash' => $tokenHash]);

        $row = $statement->fetch();

        if (!is_array($row)) {
            return null;
        }

        return $row;
    }

    public function touch(int $tokenId): void
    {
        $statement = $this->database->prepare(
            'UPDATE personal_access_tokens SET last_used_at = UTC_TIMESTAMP() WHERE id = :id'
        );
        $statement->execute(['id' => $tokenId]);
    }

    /** @return array<int, array<string, mixed>> */
    public function allForUser(int $userId): array
    {
        $statement = $this->database->prepare(
            'SELECT id, name, created_at, last_used_at FROM personal_access_tokens '
            . 'WHERE user_id = :user_id ORDER BY id ASC'
        );
        $statement->execute(['user_id' => $userId]);

        return $statement->fetchAll();
    }

    public function deleteForUser(int $userId, int $tokenId): bool
    {
        $statement = $this->database->prepare(
            'DELETE FROM personal_access_tokens WHERE id = :id AND user_id = :user_id'
        );
        $statement->execute([
            'id' => $tokenId,
            'user_id' => $userId,
        ]);

        return $statement->rowCount() > 0;
    }

    /**
     * @param array<string, mixed> $row
     * @return array{id: int, name: string, createdAt: string|null, lastUsedAt: string|null}
     */
    public static function format(array $row): array
    {
        $lastUsedAt = $row['last_used_at'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
            'lastUsedAt' => is_string($lastUsedAt) ? Timestamps::toIso($lastUsedAt) : null,
        ];
    }
}
