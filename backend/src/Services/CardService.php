<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Response;
use App\Repositories\AssetRepository;
use App\Repositories\CardGroupRepository;
use App\Repositories\CardRepository;
use App\Repositories\TemplateRepository;

final class CardService
{
    public function __construct(
        private readonly CardRepository $cards,
        private readonly TemplateRepository $templates,
        private readonly CardGroupRepository $cardGroups,
        private readonly AssetRepository $assets
    ) {
    }

    /** @return array<int, array<string, mixed>> CardSummary-Liste. */
    public function list(): array
    {
        return array_map(
            static fn (array $row): array => CardRepository::formatSummary($row),
            $this->cards->all()
        );
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $row = $this->cards->find($id);

        return $row === null ? null : CardRepository::format($row);
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
        $this->guardTemplateExists($data['template_id']);
        $this->guardCardGroupExists($data['card_group_id']);
        $this->guardIconAssetsExist($data['icon_choices']);

        return CardRepository::format($this->cards->create($data));
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
        if (array_key_exists('template_id', $data)) {
            $this->guardTemplateExists($data['template_id']);
        }

        if (array_key_exists('card_group_id', $data)) {
            $this->guardCardGroupExists($data['card_group_id']);
        }

        if (array_key_exists('icon_choices', $data)) {
            $this->guardIconAssetsExist($data['icon_choices']);
        }

        $row = $this->cards->update($id, $data);

        return $row === null ? null : CardRepository::format($row);
    }

    public function delete(int $id): bool
    {
        return $this->cards->delete($id);
    }

    /**
     * Name, Werte, Icon-Wahl und Abweichungen werden übernommen. Die Bilder werden
     * mitkopiert: Phase 3.
     *
     * @return array<string, mixed>|null
     */
    public function duplicate(int $id): ?array
    {
        $row = $this->cards->find($id);

        if ($row === null) {
            return null;
        }

        $original = CardRepository::format($row);

        $created = $this->cards->create([
            'name' => $original['name'] . ' (Kopie)',
            'template_id' => $original['templateId'],
            'card_group_id' => $original['cardGroupId'],
            'values' => $original['values'],
            'icon_choices' => $original['iconChoices'],
            'text_overrides' => $this->toSnakeTextOverrides($original['textOverrides']),
        ]);

        // Bilder: Phase 3.

        return CardRepository::format($created);
    }

    private function guardTemplateExists(int $templateId): void
    {
        if ($this->templates->find($templateId) === null) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['templateId' => 'Dieses Template gibt es nicht.']
            );
        }
    }

    private function guardCardGroupExists(?int $cardGroupId): void
    {
        if ($cardGroupId === null) {
            return;
        }

        if ($this->cardGroups->find($cardGroupId) === null) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['cardGroupId' => 'Diese Kartengruppe gibt es nicht.']
            );
        }
    }

    /** @param array<string, int> $iconChoices */
    private function guardIconAssetsExist(array $iconChoices): void
    {
        if ($iconChoices === []) {
            return;
        }

        $referencedIds = array_values(array_unique($iconChoices));
        $existingIds = $this->assets->existingIds($referencedIds);
        $missingIds = array_values(array_diff($referencedIds, $existingIds));

        if ($missingIds !== []) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['iconChoices' => 'Mindestens ein ausgewähltes Bild gibt es nicht (Kennung '
                    . implode(', ', $missingIds) . ').']
            );
        }
    }

    /**
     * `CardRepository::format()` liefert `textOverrides` schon in camelCase (`fontSize`)
     * fürs Wire-Format — beim erneuten Anlegen über `create()` muss es aber wieder in das
     * interne snake_case zurück, das die Repository-Schicht erwartet.
     *
     * @param array<string, array<string, mixed>> $textOverrides
     * @return array<string, array<string, mixed>>
     */
    private function toSnakeTextOverrides(array $textOverrides): array
    {
        $result = [];

        foreach ($textOverrides as $fieldKey => $override) {
            $entry = [];

            if (array_key_exists('fontSize', $override)) {
                $entry['font_size'] = $override['fontSize'];
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

            $result[$fieldKey] = $entry;
        }

        return $result;
    }
}
