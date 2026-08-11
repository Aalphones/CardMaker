<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use PDO;

final class FontRepository
{
    private const COLUMNS = 'id, name, format, file_name, byte_size, created_at, updated_at';

    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        $statement = $this->database->query(
            'SELECT ' . self::COLUMNS . ' FROM fonts ORDER BY name ASC'
        );

        return $statement->fetchAll();
    }

    /**
     * Die Schriftnamen aller abgelegten Schriften — eine Abfrage, unabhängig davon, wie viele
     * Textebenen ein Template prüfen lässt.
     *
     * @return string[]
     */
    public function existingFamilies(): array
    {
        $statement = $this->database->query('SELECT id FROM fonts');

        return array_map(
            static fn (array $row): string => self::family((int) $row['id']),
            $statement->fetchAll()
        );
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM fonts WHERE id = :id'
        );
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /**
     * Legt den Datensatz noch ohne Ablagenamen an: der besteht aus der Kennung, und die
     * vergibt erst die Datenbank. Der Dienst reicht ihn direkt danach per `setFileName()`
     * nach — bis dahin gilt der Eintrag als unfertig.
     *
     * @param array{name: string, format: string, byte_size: int} $data
     * @return array<string, mixed>
     */
    public function insert(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO fonts (name, format, file_name, byte_size, created_at, updated_at) '
            . "VALUES (:name, :format, '', :byteSize, UTC_TIMESTAMP(), UTC_TIMESTAMP())"
        );
        $statement->execute([
            'name' => $data['name'],
            'format' => $data['format'],
            'byteSize' => $data['byte_size'],
        ]);

        $id = (int) $this->database->lastInsertId();

        return $this->find($id) ?? [];
    }

    /** @return array<string, mixed>|null */
    public function setFileName(int $id, string $fileName): ?array
    {
        $statement = $this->database->prepare(
            'UPDATE fonts SET file_name = :fileName, updated_at = UTC_TIMESTAMP() WHERE id = :id'
        );
        $statement->execute(['fileName' => $fileName, 'id' => $id]);

        return $this->find($id);
    }

    /** @return array<string, mixed>|null */
    public function updateName(int $id, string $name): ?array
    {
        if ($this->find($id) === null) {
            return null;
        }

        $statement = $this->database->prepare(
            'UPDATE fonts SET name = :name, updated_at = UTC_TIMESTAMP() WHERE id = :id'
        );
        $statement->execute(['name' => $name, 'id' => $id]);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->database->prepare('DELETE FROM fonts WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    /** Der Schriftname für CSS und für `fontFamily` einer Textebene. */
    public static function family(int $id): string
    {
        return 'cmfont-' . $id;
    }

    /**
     * `file_name` bleibt im Backend — nach außen geht die Kennung, über die
     * `GET /api/fonts/{id}/file` die Datei ausliefert. `family` wird berechnet und nicht
     * gespeichert: es gibt keine zweite Wahrheit über den Namen.
     *
     * @param array<string, mixed> $row
     * @return array{
     *     id: int,
     *     name: string,
     *     family: string,
     *     format: string,
     *     byteSize: int,
     *     createdAt: string|null
     * }
     */
    public static function format(array $row): array
    {
        $id = (int) $row['id'];

        return [
            'id' => $id,
            'name' => (string) $row['name'],
            'family' => self::family($id),
            'format' => (string) $row['format'],
            'byteSize' => (int) $row['byte_size'],
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
        ];
    }
}
