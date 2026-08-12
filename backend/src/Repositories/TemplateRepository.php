<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use App\Support\WireFormat;
use PDO;

final class TemplateRepository
{
    private const COLUMNS = 'id, name, description, layers, preview_file_name, preview_updated_at, '
        . 'created_at, updated_at';

    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<int, array<string, mixed>> Ohne `layers`, dafür mit `layer_count` und `card_count`. */
    public function allSummaries(): array
    {
        $statement = $this->database->query(
            'SELECT t.id, t.name, t.description, JSON_LENGTH(t.layers) AS layer_count, '
            . 't.preview_updated_at, t.created_at, t.updated_at, COUNT(c.id) AS card_count '
            . 'FROM templates t '
            . 'LEFT JOIN cards c ON c.template_id = t.id '
            . 'GROUP BY t.id '
            . 'ORDER BY t.name ASC'
        );

        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM templates WHERE id = :id'
        );
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /**
     * @param array{name: string, description: ?string} $data
     * @return array<string, mixed>
     */
    public function insert(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO templates (name, description, layers, created_at, updated_at) '
            . 'VALUES (:name, :description, :layers, UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'name' => $data['name'],
            'description' => $data['description'],
            'layers' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $id = (int) $this->database->lastInsertId();

        return $this->find($id) ?? [];
    }

    /**
     * @param array{name?: string, description?: ?string, layers?: array<int, array<string, mixed>>} $data
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

        if (array_key_exists('layers', $data)) {
            $fields[] = 'layers = :layers';
            $params['layers'] = json_encode($data['layers'], JSON_THROW_ON_ERROR);
        }

        if ($fields === []) {
            return $this->find($id);
        }

        $fields[] = 'updated_at = UTC_TIMESTAMP()';

        $statement = $this->database->prepare(
            'UPDATE templates SET ' . implode(', ', $fields) . ' WHERE id = :id'
        );
        $statement->execute($params);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->database->prepare('DELETE FROM templates WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    /**
     * Für die Löschsperre in `AssetService::delete()`: alle gespeicherten Layout-Blöcke roh
     * als JSON-Text, damit dort ohne Formatierung nach `asset_id`/`choice_asset_ids`
     * durchsucht werden kann.
     *
     * @return string[]
     */
    public function allLayerBlobs(): array
    {
        $statement = $this->database->query('SELECT layers FROM templates');

        return $statement->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Für `CardImageService::guardImageLayer()`: existiert diese Ebene im Template und ist
     * sie vom Typ „image"? Geprüft wird roh im JSON-Datenblock, genau wie bei den anderen
     * Löschsperren hier — eine Bildebene ist per Fremdschlüssel nicht absicherbar (ADR-014).
     */
    public function hasImageLayer(int $id, string $layerId): bool
    {
        $row = $this->find($id);

        if ($row === null) {
            return false;
        }

        $layers = json_decode((string) $row['layers'], true);

        if (!is_array($layers)) {
            return false;
        }

        foreach ($layers as $layer) {
            if (!is_array($layer)) {
                continue;
            }

            if (($layer['id'] ?? null) === $layerId && ($layer['type'] ?? null) === 'image') {
                return true;
            }
        }

        return false;
    }

    /**
     * Für die Löschsperre in `FontService::delete()`: dieselben Layout-Blöcke, aber mit dem
     * Templatenamen daneben — die Ablehnung soll sagen, wo die Schrift noch steckt.
     *
     * @return array<int, array{name: string, layers: string}>
     */
    public function allLayerBlobsWithName(): array
    {
        $statement = $this->database->query('SELECT name, layers FROM templates');

        return array_map(
            static fn (array $row): array => [
                'name' => (string) $row['name'],
                'layers' => (string) $row['layers'],
            ],
            $statement->fetchAll()
        );
    }

    /** Für `TemplatePreviewService`: `null`, wenn der Datensatz fehlt oder kein Bild gesetzt ist. */
    public function findPreviewFileName(int $id): ?string
    {
        $row = $this->find($id);
        $fileName = $row['preview_file_name'] ?? null;

        return is_string($fileName) && $fileName !== '' ? $fileName : null;
    }

    /** Setzt beide Vorschau-Spalten und liefert den neuen Zeitstempel als ISO-Text, `null` bei unbekanntem Datensatz. */
    public function updatePreview(int $id, string $fileName): ?string
    {
        if ($this->find($id) === null) {
            return null;
        }

        $statement = $this->database->prepare(
            'UPDATE templates SET preview_file_name = :file_name, preview_updated_at = UTC_TIMESTAMP() '
            . 'WHERE id = :id'
        );
        $statement->execute(['id' => $id, 'file_name' => $fileName]);

        $row = $this->find($id);

        return $row === null ? null : Timestamps::toIso((string) $row['preview_updated_at']);
    }

    public function clearPreview(int $id): void
    {
        $statement = $this->database->prepare(
            'UPDATE templates SET preview_file_name = NULL, preview_updated_at = NULL WHERE id = :id'
        );
        $statement->execute(['id' => $id]);
    }

    /**
     * @param array<string, mixed> $row
     * @return array{
     *     id: int,
     *     name: string,
     *     description: string|null,
     *     layerCount: int,
     *     cardCount: int,
     *     previewUpdatedAt: string|null,
     *     createdAt: string|null,
     *     updatedAt: string|null
     * }
     */
    public static function formatSummary(array $row): array
    {
        $description = $row['description'] ?? null;
        $previewUpdatedAt = $row['preview_updated_at'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'description' => is_string($description) ? $description : null,
            'layerCount' => (int) $row['layer_count'],
            'cardCount' => (int) $row['card_count'],
            'previewUpdatedAt' => is_string($previewUpdatedAt) ? Timestamps::toIso($previewUpdatedAt) : null,
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
            'updatedAt' => Timestamps::toIso((string) $row['updated_at']),
        ];
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function format(array $row): array
    {
        $description = $row['description'] ?? null;
        $layers = json_decode((string) $row['layers'], true);
        $previewUpdatedAt = $row['preview_updated_at'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'description' => is_string($description) ? $description : null,
            'layers' => is_array($layers) ? array_map(self::formatLayer(...), $layers) : [],
            'previewUpdatedAt' => is_string($previewUpdatedAt) ? Timestamps::toIso($previewUpdatedAt) : null,
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
            'updatedAt' => Timestamps::toIso((string) $row['updated_at']),
        ];
    }

    /**
     * Die Ebenen kommen aus dem Validator in snake_case (Wire-Format-Grenze) — hier geht es
     * rekursiv zurück nach camelCase, auch für verschachtelte Werte wie `points`.
     *
     * @param array<string, mixed> $layer
     * @return array<string, mixed>
     */
    private static function formatLayer(array $layer): array
    {
        $formatted = [];

        foreach ($layer as $key => $value) {
            $formatted[WireFormat::snakeToCamel((string) $key)] = is_array($value)
                ? self::formatLayerValue($value)
                : $value;
        }

        return $formatted;
    }

    /**
     * @param array<array-key, mixed> $value
     * @return array<array-key, mixed>
     */
    private static function formatLayerValue(array $value): array
    {
        if (array_is_list($value)) {
            return array_map(
                static fn (mixed $item): mixed => is_array($item) ? self::formatLayerValue($item) : $item,
                $value
            );
        }

        return self::formatLayer($value);
    }
}
