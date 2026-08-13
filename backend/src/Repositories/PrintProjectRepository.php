<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use PDO;

final class PrintProjectRepository
{
    private const ITEM_COLUMNS = 'i.id, i.card_id, i.quantity, i.sort_order, '
        . 'c.name AS card_name, c.preview_updated_at';

    public function __construct(private readonly PDO $database)
    {
    }

    /**
     * Es gibt genau ein Druckprojekt (ADR-024). Die Zeile entsteht beim ersten Zugriff,
     * damit kein Setup-Schritt sie anlegen muss.
     *
     * @return array<string, mixed>
     */
    public function findOrCreateProject(): array
    {
        $row = $this->database->query(
            'SELECT id, cut_marks, bleed, created_at, updated_at FROM print_projects ORDER BY id ASC LIMIT 1'
        )->fetch();

        if (is_array($row)) {
            return $row;
        }

        $this->database->exec(
            'INSERT INTO print_projects (cut_marks, bleed, created_at, updated_at) '
            . 'VALUES (1, 0, UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );

        return $this->findOrCreateProject();
    }

    /**
     * @param array{cut_marks: bool, bleed: bool} $options
     * @return array<string, mixed>
     */
    public function updateOptions(int $projectId, array $options): array
    {
        $statement = $this->database->prepare(
            'UPDATE print_projects SET cut_marks = :cut_marks, bleed = :bleed, '
            . 'updated_at = UTC_TIMESTAMP() WHERE id = :id'
        );
        $statement->execute([
            'cut_marks' => $options['cut_marks'] ? 1 : 0,
            'bleed' => $options['bleed'] ? 1 : 0,
            'id' => $projectId,
        ]);

        return $this->findOrCreateProject();
    }

    /** @return array<int, array<string, mixed>> */
    public function listItems(int $projectId): array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::ITEM_COLUMNS . ' FROM print_project_items i '
            . 'INNER JOIN cards c ON c.id = i.card_id '
            . 'WHERE i.print_project_id = :project_id '
            . 'ORDER BY i.sort_order ASC, i.id ASC'
        );
        $statement->execute(['project_id' => $projectId]);

        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function findItem(int $itemId): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::ITEM_COLUMNS . ' FROM print_project_items i '
            . 'INNER JOIN cards c ON c.id = i.card_id '
            . 'WHERE i.id = :id'
        );
        $statement->execute(['id' => $itemId]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /** @return array<string, mixed>|null */
    public function findItemByCard(int $projectId, int $cardId): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::ITEM_COLUMNS . ' FROM print_project_items i '
            . 'INNER JOIN cards c ON c.id = i.card_id '
            . 'WHERE i.print_project_id = :project_id AND i.card_id = :card_id'
        );
        $statement->execute(['project_id' => $projectId, 'card_id' => $cardId]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /** @return array<string, mixed> */
    public function insertItem(int $projectId, int $cardId, int $quantity): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO print_project_items '
            . '(print_project_id, card_id, quantity, sort_order, created_at, updated_at) '
            . 'SELECT :project_id, :card_id, :quantity, '
            . 'COALESCE(MAX(sort_order), 0) + 1, UTC_TIMESTAMP(), UTC_TIMESTAMP() '
            . 'FROM print_project_items WHERE print_project_id = :sort_project_id'
        );
        $statement->execute([
            'project_id' => $projectId,
            'card_id' => $cardId,
            'quantity' => $quantity,
            'sort_project_id' => $projectId,
        ]);

        return $this->findItem((int) $this->database->lastInsertId()) ?? [];
    }

    /** @return array<string, mixed>|null */
    public function updateQuantity(int $itemId, int $quantity): ?array
    {
        $statement = $this->database->prepare(
            'UPDATE print_project_items SET quantity = :quantity, updated_at = UTC_TIMESTAMP() '
            . 'WHERE id = :id'
        );
        $statement->execute(['quantity' => $quantity, 'id' => $itemId]);

        return $this->findItem($itemId);
    }

    public function deleteItem(int $itemId): bool
    {
        $statement = $this->database->prepare('DELETE FROM print_project_items WHERE id = :id');
        $statement->execute(['id' => $itemId]);

        return $statement->rowCount() > 0;
    }

    public function deleteAllItems(int $projectId): void
    {
        $statement = $this->database->prepare(
            'DELETE FROM print_project_items WHERE print_project_id = :project_id'
        );
        $statement->execute(['project_id' => $projectId]);
    }

    /**
     * @param array<string, mixed> $row
     * @return array{cutMarks: bool, bleed: bool}
     */
    public static function formatOptions(array $row): array
    {
        return [
            'cutMarks' => (bool) $row['cut_marks'],
            'bleed' => (bool) $row['bleed'],
        ];
    }

    /**
     * @param array<string, mixed> $row
     * @return array{id: int, cardId: int, cardName: string, quantity: int, previewUpdatedAt: string|null}
     */
    public static function formatItem(array $row): array
    {
        $previewUpdatedAt = $row['preview_updated_at'] ?? null;

        return [
            'id' => (int) $row['id'],
            'cardId' => (int) $row['card_id'],
            'cardName' => (string) $row['card_name'],
            'quantity' => (int) $row['quantity'],
            'previewUpdatedAt' => is_string($previewUpdatedAt) ? Timestamps::toIso($previewUpdatedAt) : null,
        ];
    }
}
