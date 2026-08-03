<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use PDO;

final class AssetRepository
{
    private const COLUMNS = 'id, kind, name, file_name, mime_type, byte_size, width, height, created_at, updated_at';

    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<int, array<string, mixed>> */
    public function all(?string $kind): array
    {
        if ($kind === null) {
            $statement = $this->database->query(
                'SELECT ' . self::COLUMNS . ' FROM assets ORDER BY name ASC'
            );

            return $statement->fetchAll();
        }

        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM assets WHERE kind = :kind ORDER BY name ASC'
        );
        $statement->execute(['kind' => $kind]);

        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM assets WHERE id = :id'
        );
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /**
     * @param array{
     *     kind: string,
     *     name: string,
     *     file_name: string,
     *     mime_type: string,
     *     byte_size: int,
     *     width: int,
     *     height: int
     * } $data
     * @return array<string, mixed>
     */
    public function insert(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO assets '
            . '(kind, name, file_name, mime_type, byte_size, width, height, created_at, updated_at) '
            . 'VALUES (:kind, :name, :fileName, :mimeType, :byteSize, :width, :height, '
            . 'UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'kind' => $data['kind'],
            'name' => $data['name'],
            'fileName' => $data['file_name'],
            'mimeType' => $data['mime_type'],
            'byteSize' => $data['byte_size'],
            'width' => $data['width'],
            'height' => $data['height'],
        ]);

        $id = (int) $this->database->lastInsertId();

        return $this->find($id) ?? [];
    }

    public function delete(int $id): bool
    {
        $statement = $this->database->prepare('DELETE FROM assets WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    /**
     * Für die Referenzprüfung beim Speichern eines Templates: welche der genannten
     * Bild-Kennungen gibt es wirklich.
     *
     * @param int[] $ids
     * @return int[]
     */
    public function existingIds(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($ids), '?'));
        $statement = $this->database->prepare("SELECT id FROM assets WHERE id IN ($placeholders)");
        $statement->execute(array_values($ids));

        return array_map(static fn (mixed $id): int => (int) $id, $statement->fetchAll(PDO::FETCH_COLUMN));
    }

    /**
     * `file_name` bleibt bewusst drinnen im Backend — nach außen geht nur die Kennung,
     * über die `GET /api/assets/{id}/file` die Datei ausliefert.
     *
     * @param array<string, mixed> $row
     * @return array{
     *     id: int,
     *     kind: string,
     *     name: string,
     *     mimeType: string,
     *     byteSize: int,
     *     width: int,
     *     height: int,
     *     createdAt: string|null
     * }
     */
    public static function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'kind' => (string) $row['kind'],
            'name' => (string) $row['name'],
            'mimeType' => (string) $row['mime_type'],
            'byteSize' => (int) $row['byte_size'],
            'width' => (int) $row['width'],
            'height' => (int) $row['height'],
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
        ];
    }
}
