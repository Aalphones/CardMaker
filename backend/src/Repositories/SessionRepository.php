<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class SessionRepository
{
    public function __construct(private readonly PDO $database)
    {
    }

    /**
     * Die Laufzeit steht als ganzzahlige Konstante im SQL, weil MySQL für
     * `INTERVAL <n> DAY` je nach Version keinen Platzhalter annimmt. Der Wert stammt aus
     * dem Code, nie aus einer Anfrage — an der Prepared-Statement-Regel ändert das nichts.
     *
     * @return array{id: int, expires_at: string}
     */
    public function create(int $userId, string $tokenHash, int $lifetimeDays): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO sessions (user_id, token_hash, expires_at, created_at) '
            . 'VALUES (:user_id, :token_hash, '
            . 'DATE_ADD(UTC_TIMESTAMP(), INTERVAL ' . (int) $lifetimeDays . ' DAY), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
        ]);

        $sessionId = (int) $this->database->lastInsertId();

        $expiresStatement = $this->database->prepare(
            'SELECT expires_at FROM sessions WHERE id = :id'
        );
        $expiresStatement->execute(['id' => $sessionId]);

        return [
            'id' => $sessionId,
            'expires_at' => (string) $expiresStatement->fetchColumn(),
        ];
    }

    /**
     * Der Ablauf wird in der Abfrage geprüft, nicht in PHP — siehe `Support\Timestamps`.
     *
     * @return array<string, mixed>|null
     */
    public function findActiveByTokenHash(string $tokenHash): ?array
    {
        $statement = $this->database->prepare(
            'SELECT sessions.id, sessions.user_id, sessions.expires_at, users.email '
            . 'FROM sessions '
            . 'INNER JOIN users ON users.id = sessions.user_id '
            . 'WHERE sessions.token_hash = :token_hash AND sessions.expires_at > UTC_TIMESTAMP() '
            . 'LIMIT 1'
        );
        $statement->execute(['token_hash' => $tokenHash]);

        $row = $statement->fetch();

        if (!is_array($row)) {
            return null;
        }

        return $row;
    }

    public function touch(int $sessionId): void
    {
        $statement = $this->database->prepare(
            'UPDATE sessions SET last_used_at = UTC_TIMESTAMP() WHERE id = :id'
        );
        $statement->execute(['id' => $sessionId]);
    }

    public function deleteByTokenHash(string $tokenHash): void
    {
        $statement = $this->database->prepare('DELETE FROM sessions WHERE token_hash = :token_hash');
        $statement->execute(['token_hash' => $tokenHash]);
    }

    /**
     * Geteiltes Hosting kennt keinen zeitgesteuerten Dienst — abgelaufene Sitzungen
     * verschwinden hier oder nie.
     */
    public function deleteExpired(): void
    {
        $statement = $this->database->prepare('DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()');
        $statement->execute();
    }
}
