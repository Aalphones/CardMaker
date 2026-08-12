<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class CardImageRepository
{
    private const COLUMNS = 'id, card_id, layer_id, file_name, mime_type, byte_size, width, height, '
        . 'offset_x, offset_y, scale, created_at, updated_at';

    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<int, array<string, mixed>> */
    public function findByCard(int $cardId): array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM card_images WHERE card_id = :card_id ORDER BY layer_id ASC'
        );
        $statement->execute(['card_id' => $cardId]);

        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function findOne(int $cardId, string $layerId): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM card_images WHERE card_id = :card_id AND layer_id = :layer_id'
        );
        $statement->execute(['card_id' => $cardId, 'layer_id' => $layerId]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /**
     * Ersetzt ein vorhandenes Bild derselben Ebene atomar über den eindeutigen Schlüssel
     * (`card_id`, `layer_id`) — Verschiebung und Maßstab werden dabei auf die
     * Grundstellung zurückgesetzt, weil sie sich auf das alte Bild bezogen (neue Maße,
     * neuer Ausschnitt).
     *
     * @param array{
     *     card_id: int, layer_id: string, file_name: string, mime_type: string,
     *     byte_size: int, width: int, height: int
     * } $data
     * @return array<string, mixed>
     */
    public function upsert(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO card_images (card_id, layer_id, file_name, mime_type, byte_size, width, height, '
            . 'created_at, updated_at) '
            . 'VALUES (:card_id, :layer_id, :file_name, :mime_type, :byte_size, :width, :height, '
            . 'UTC_TIMESTAMP(), UTC_TIMESTAMP()) '
            . 'ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), mime_type = VALUES(mime_type), '
            . 'byte_size = VALUES(byte_size), width = VALUES(width), height = VALUES(height), '
            . 'offset_x = 0, offset_y = 0, scale = 1, updated_at = UTC_TIMESTAMP()'
        );
        $statement->execute([
            'card_id' => $data['card_id'],
            'layer_id' => $data['layer_id'],
            'file_name' => $data['file_name'],
            'mime_type' => $data['mime_type'],
            'byte_size' => $data['byte_size'],
            'width' => $data['width'],
            'height' => $data['height'],
        ]);

        return $this->findOne($data['card_id'], $data['layer_id']) ?? [];
    }

    /**
     * Für das Duplizieren einer Karte: die Zeile wird 1:1 auf die neue Karte übernommen,
     * inklusive Verschiebung und Maßstab — anders als bei `upsert()` ist es dasselbe Bild,
     * nur unter neuem Dateinamen.
     *
     * @param array{
     *     card_id: int, layer_id: string, file_name: string, mime_type: string,
     *     byte_size: int, width: int, height: int, offset_x: float, offset_y: float, scale: float
     * } $data
     * @return array<string, mixed>
     */
    public function copy(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO card_images (card_id, layer_id, file_name, mime_type, byte_size, width, height, '
            . 'offset_x, offset_y, scale, created_at, updated_at) '
            . 'VALUES (:card_id, :layer_id, :file_name, :mime_type, :byte_size, :width, :height, '
            . ':offset_x, :offset_y, :scale, UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'card_id' => $data['card_id'],
            'layer_id' => $data['layer_id'],
            'file_name' => $data['file_name'],
            'mime_type' => $data['mime_type'],
            'byte_size' => $data['byte_size'],
            'width' => $data['width'],
            'height' => $data['height'],
            'offset_x' => $data['offset_x'],
            'offset_y' => $data['offset_y'],
            'scale' => $data['scale'],
        ]);

        return $this->findOne($data['card_id'], $data['layer_id']) ?? [];
    }

    /**
     * Nur übergebene Felder ändern sich — gleiches Muster wie `CardRepository::update()`.
     *
     * @param array{offset_x?: float, offset_y?: float, scale?: float} $data
     * @return array<string, mixed>|null
     */
    public function updatePlacement(int $cardId, string $layerId, array $data): ?array
    {
        if ($this->findOne($cardId, $layerId) === null) {
            return null;
        }

        $fields = [];
        $params = ['card_id' => $cardId, 'layer_id' => $layerId];

        if (array_key_exists('offset_x', $data)) {
            $fields[] = 'offset_x = :offset_x';
            $params['offset_x'] = $data['offset_x'];
        }

        if (array_key_exists('offset_y', $data)) {
            $fields[] = 'offset_y = :offset_y';
            $params['offset_y'] = $data['offset_y'];
        }

        if (array_key_exists('scale', $data)) {
            $fields[] = 'scale = :scale';
            $params['scale'] = $data['scale'];
        }

        if ($fields === []) {
            return $this->findOne($cardId, $layerId);
        }

        $fields[] = 'updated_at = UTC_TIMESTAMP()';

        $statement = $this->database->prepare(
            'UPDATE card_images SET ' . implode(', ', $fields) . ' WHERE card_id = :card_id AND layer_id = :layer_id'
        );
        $statement->execute($params);

        return $this->findOne($cardId, $layerId);
    }

    public function delete(int $cardId, string $layerId): bool
    {
        $statement = $this->database->prepare(
            'DELETE FROM card_images WHERE card_id = :card_id AND layer_id = :layer_id'
        );
        $statement->execute(['card_id' => $cardId, 'layer_id' => $layerId]);

        return $statement->rowCount() > 0;
    }

    /**
     * Löscht alle Bildzeilen einer Karte und liefert die Dateinamen zurück, damit der
     * Dienst die Dateien von der Platte entfernen kann — das würde `ON DELETE CASCADE`
     * beim Löschen der Karte selbst zwar auch für die Zeilen erledigen, aber nie für die
     * Dateien.
     *
     * @return string[]
     */
    public function deleteByCard(int $cardId): array
    {
        $statement = $this->database->prepare('SELECT file_name FROM card_images WHERE card_id = :card_id');
        $statement->execute(['card_id' => $cardId]);
        $fileNames = $statement->fetchAll(PDO::FETCH_COLUMN);

        $statement = $this->database->prepare('DELETE FROM card_images WHERE card_id = :card_id');
        $statement->execute(['card_id' => $cardId]);

        return array_map(static fn (mixed $name): string => (string) $name, $fileNames);
    }

    /**
     * @param array<string, mixed> $row
     * @return array{layerId: string, offsetX: float, offsetY: float, scale: float, width: int, height: int}
     */
    public static function format(array $row): array
    {
        return [
            'layerId' => (string) $row['layer_id'],
            'offsetX' => (float) $row['offset_x'],
            'offsetY' => (float) $row['offset_y'],
            'scale' => (float) $row['scale'],
            'width' => (int) $row['width'],
            'height' => (int) $row['height'],
        ];
    }
}
