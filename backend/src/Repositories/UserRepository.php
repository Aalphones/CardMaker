<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class UserRepository
{
    public function __construct(private readonly PDO $database)
    {
    }

    public function count(): int
    {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM users');
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    /** @return array<string, mixed>|null */
    public function findByEmail(string $email): ?array
    {
        $statement = $this->database->prepare(
            'SELECT id, email, password_hash FROM users WHERE email = :email LIMIT 1'
        );
        $statement->execute(['email' => $email]);

        $row = $statement->fetch();

        if (!is_array($row)) {
            return null;
        }

        return $row;
    }

    public function create(string $email, string $passwordHash): int
    {
        $statement = $this->database->prepare(
            'INSERT INTO users (email, password_hash, created_at) '
            . 'VALUES (:email, :password_hash, UTC_TIMESTAMP())'
        );
        $statement->execute([
            'email' => $email,
            'password_hash' => $passwordHash,
        ]);

        return (int) $this->database->lastInsertId();
    }

    /**
     * @param array<string, mixed> $row
     * @return array{id: int, email: string}
     */
    public static function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'email' => (string) $row['email'],
        ];
    }
}
