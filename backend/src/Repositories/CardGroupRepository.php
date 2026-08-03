<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use PDO;

final class CardGroupRepository
{
    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        $statement = $this->database->query(
            'SELECT id, name, description, created_at, updated_at FROM card_groups ORDER BY name ASC'
        );

        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $statement = $this->database->prepare(
            'SELECT id, name, description, created_at, updated_at FROM card_groups WHERE id = :id'
        );
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /**
     * @param array{name: string, description: ?string} $data
     * @return array<string, mixed>
     */
    public function create(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO card_groups (name, description, created_at, updated_at) '
            . 'VALUES (:name, :description, UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'name' => $data['name'],
            'description' => $data['description'],
        ]);

        $id = (int) $this->database->lastInsertId();

        return $this->find($id) ?? [];
    }

    /**
     * @param array{name?: string, description?: ?string} $data
     * @return array<string, mixed>|null
     */
    public function update(int $id, array $data): ?array
    {
        if ($this->find($id) === null) {
            return null;
        }

        $fields = [];
        $params = ['id' => $id];

        if (array_key_exists('name', $data)) {
            $fields[] = 'name = :name';
            $params['name'] = $data['name'];
        }

        if (array_key_exists('description', $data)) {
            $fields[] = 'description = :description';
            $params['description'] = $data['description'];
        }

        if ($fields === []) {
            return $this->find($id);
        }

        $fields[] = 'updated_at = UTC_TIMESTAMP()';

        $statement = $this->database->prepare(
            'UPDATE card_groups SET ' . implode(', ', $fields) . ' WHERE id = :id'
        );
        $statement->execute($params);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->database->prepare('DELETE FROM card_groups WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    /**
     * @param array<string, mixed> $row
     * @return array{id: int, name: string, description: string|null, createdAt: string|null, updatedAt: string|null}
     */
    public static function format(array $row): array
    {
        $description = $row['description'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'description' => is_string($description) ? $description : null,
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
            'updatedAt' => Timestamps::toIso((string) $row['updated_at']),
        ];
    }
}
