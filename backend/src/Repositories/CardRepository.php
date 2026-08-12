<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Timestamps;
use PDO;

final class CardRepository
{
    private const COLUMNS = 'id, name, template_id, card_group_id, `values`, icon_choices, text_overrides, '
        . 'created_at, updated_at';

    public function __construct(private readonly PDO $database)
    {
    }

    /** @return array<int, array<string, mixed>> Ohne `values`/`iconChoices`/`textOverrides`, mit Namen der Bezüge. */
    public function all(): array
    {
        $statement = $this->database->query(
            'SELECT c.id, c.name, c.template_id, t.name AS template_name, c.card_group_id, '
            . 'cg.name AS card_group_name, c.updated_at '
            . 'FROM cards c '
            . 'JOIN templates t ON t.id = c.template_id '
            . 'LEFT JOIN card_groups cg ON cg.id = c.card_group_id '
            . 'ORDER BY c.name ASC'
        );

        return $statement->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $statement = $this->database->prepare(
            'SELECT ' . self::COLUMNS . ' FROM cards WHERE id = :id'
        );
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /** Leichte Existenzprüfung für `CardImageController`, ohne die drei JSON-Blöcke zu laden. */
    public function exists(int $id): bool
    {
        $statement = $this->database->prepare('SELECT 1 FROM cards WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->fetchColumn() !== false;
    }

    /** Für `CardImageService::guardImageLayer()`: welches Template diese Karte benutzt. */
    public function findTemplateId(int $id): ?int
    {
        $statement = $this->database->prepare('SELECT template_id FROM cards WHERE id = :id');
        $statement->execute(['id' => $id]);
        $value = $statement->fetchColumn();

        return $value === false ? null : (int) $value;
    }

    /**
     * @param array{
     *     name: string,
     *     template_id: int,
     *     card_group_id: ?int,
     *     values: array<string, string>,
     *     icon_choices: array<string, int>,
     *     text_overrides: array<string, array<string, mixed>>
     * } $data
     * @return array<string, mixed>
     */
    public function create(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO cards (name, template_id, card_group_id, `values`, icon_choices, text_overrides, '
            . 'created_at, updated_at) '
            . 'VALUES (:name, :template_id, :card_group_id, :values, :icon_choices, :text_overrides, '
            . 'UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'name' => $data['name'],
            'template_id' => $data['template_id'],
            'card_group_id' => $data['card_group_id'],
            'values' => json_encode($data['values'], JSON_THROW_ON_ERROR),
            'icon_choices' => json_encode($data['icon_choices'], JSON_THROW_ON_ERROR),
            'text_overrides' => json_encode($data['text_overrides'], JSON_THROW_ON_ERROR),
        ]);

        $id = (int) $this->database->lastInsertId();

        return $this->find($id) ?? [];
    }

    /**
     * @param array{
     *     name?: string,
     *     template_id?: int,
     *     card_group_id?: ?int,
     *     values?: array<string, string>,
     *     icon_choices?: array<string, int>,
     *     text_overrides?: array<string, array<string, mixed>>
     * } $data
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

        if (array_key_exists('template_id', $data)) {
            $fields[] = 'template_id = :template_id';
            $params['template_id'] = $data['template_id'];
        }

        if (array_key_exists('card_group_id', $data)) {
            $fields[] = 'card_group_id = :card_group_id';
            $params['card_group_id'] = $data['card_group_id'];
        }

        if (array_key_exists('values', $data)) {
            $fields[] = '`values` = :values';
            $params['values'] = json_encode($data['values'], JSON_THROW_ON_ERROR);
        }

        if (array_key_exists('icon_choices', $data)) {
            $fields[] = 'icon_choices = :icon_choices';
            $params['icon_choices'] = json_encode($data['icon_choices'], JSON_THROW_ON_ERROR);
        }

        if (array_key_exists('text_overrides', $data)) {
            $fields[] = 'text_overrides = :text_overrides';
            $params['text_overrides'] = json_encode($data['text_overrides'], JSON_THROW_ON_ERROR);
        }

        if ($fields === []) {
            return $this->find($id);
        }

        $fields[] = 'updated_at = UTC_TIMESTAMP()';

        $statement = $this->database->prepare(
            'UPDATE cards SET ' . implode(', ', $fields) . ' WHERE id = :id'
        );
        $statement->execute($params);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->database->prepare('DELETE FROM cards WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    /** Für die Löschsperre in `TemplateService::delete()`. */
    public function countByTemplate(int $templateId): int
    {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM cards WHERE template_id = :template_id');
        $statement->execute(['template_id' => $templateId]);

        return (int) $statement->fetchColumn();
    }

    public function countByGroup(int $groupId): int
    {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM cards WHERE card_group_id = :group_id');
        $statement->execute(['group_id' => $groupId]);

        return (int) $statement->fetchColumn();
    }

    /**
     * @param array<string, mixed> $row
     * @return array{
     *     id: int,
     *     name: string,
     *     templateId: int,
     *     templateName: string,
     *     cardGroupId: int|null,
     *     cardGroupName: string|null,
     *     updatedAt: string|null
     * }
     */
    public static function formatSummary(array $row): array
    {
        $cardGroupId = $row['card_group_id'] ?? null;
        $cardGroupName = $row['card_group_name'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'templateId' => (int) $row['template_id'],
            'templateName' => (string) $row['template_name'],
            'cardGroupId' => $cardGroupId === null ? null : (int) $cardGroupId,
            'cardGroupName' => is_string($cardGroupName) ? $cardGroupName : null,
            'updatedAt' => Timestamps::toIso((string) $row['updated_at']),
        ];
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function format(array $row): array
    {
        $cardGroupId = $row['card_group_id'] ?? null;
        $values = json_decode((string) $row['values'], true);
        $iconChoices = json_decode((string) $row['icon_choices'], true);
        $textOverrides = json_decode((string) $row['text_overrides'], true);

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'templateId' => (int) $row['template_id'],
            'cardGroupId' => $cardGroupId === null ? null : (int) $cardGroupId,
            'values' => is_array($values) ? $values : [],
            'iconChoices' => is_array($iconChoices) ? $iconChoices : [],
            'textOverrides' => is_array($textOverrides) ? self::formatTextOverrides($textOverrides) : [],
            'createdAt' => Timestamps::toIso((string) $row['created_at']),
            'updatedAt' => Timestamps::toIso((string) $row['updated_at']),
        ];
    }

    /**
     * Nur die vier bekannten Unterschlüssel drehen von snake_case zurück nach camelCase
     * (`font_size` → `fontSize`) — der äußere Schlüssel ist ein Feldschlüssel aus dem
     * Template und bleibt unverändert, anders als bei `TemplateRepository::formatLayer()`.
     *
     * @param array<string, mixed> $textOverrides
     * @return array<string, array<string, mixed>>
     */
    private static function formatTextOverrides(array $textOverrides): array
    {
        $formatted = [];

        foreach ($textOverrides as $fieldKey => $override) {
            if (!is_array($override)) {
                continue;
            }

            $entry = [];

            if (array_key_exists('font_size', $override)) {
                $entry['fontSize'] = $override['font_size'];
            }

            if (array_key_exists('color', $override)) {
                $entry['color'] = $override['color'];
            }

            if (array_key_exists('bold', $override)) {
                $entry['bold'] = $override['bold'];
            }

            if (array_key_exists('italic', $override)) {
                $entry['italic'] = $override['italic'];
            }

            $formatted[(string) $fieldKey] = $entry;
        }

        return $formatted;
    }
}
