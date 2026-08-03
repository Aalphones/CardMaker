<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Response;
use App\Repositories\AssetRepository;
use App\Repositories\TemplateRepository;

final class TemplateService
{
    public function __construct(
        private readonly TemplateRepository $templates,
        private readonly AssetRepository $assets
    ) {
    }

    /** @return array<int, array<string, mixed>> TemplateSummary-Liste, ohne Ebenen. */
    public function list(): array
    {
        return array_map(
            static fn (array $row): array => TemplateRepository::formatSummary($row),
            $this->templates->allSummaries()
        );
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $row = $this->templates->find($id);

        return $row === null ? null : TemplateRepository::format($row);
    }

    /**
     * @param array{name: string, description: ?string} $data
     * @return array<string, mixed>
     */
    public function create(array $data): array
    {
        return TemplateRepository::format($this->templates->insert($data));
    }

    /**
     * @param array{name?: string, description?: ?string, layers?: array<int, array<string, mixed>>} $data
     * @return array<string, mixed>|null
     */
    public function update(int $id, array $data): ?array
    {
        if (array_key_exists('layers', $data)) {
            $this->guardReferencedAssetsExist($data['layers']);
        }

        $row = $this->templates->update($id, $data);

        return $row === null ? null : TemplateRepository::format($row);
    }

    public function delete(int $id): bool
    {
        return $this->templates->delete($id);
    }

    /**
     * Jedes im Layout genannte Bild (Ebenen `icon` und `frame`, auch `choice_asset_ids`)
     * muss wirklich existieren — die Datenbank prüft das nicht (ADR-014), also hier davor.
     *
     * @param array<int, array<string, mixed>> $layers
     */
    private function guardReferencedAssetsExist(array $layers): void
    {
        $referencedIds = $this->referencedAssetIds($layers);

        if ($referencedIds === []) {
            return;
        }

        $existingIds = $this->assets->existingIds($referencedIds);
        $missingIds = array_values(array_diff($referencedIds, $existingIds));

        if ($missingIds !== []) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['layers' => 'Mindestens ein verwendetes Bild gibt es nicht (Kennung ' . implode(', ', $missingIds) . ').']
            );
        }
    }

    /**
     * @param array<int, array<string, mixed>> $layers
     * @return int[]
     */
    private function referencedAssetIds(array $layers): array
    {
        $ids = [];

        foreach ($layers as $layer) {
            $type = $layer['type'] ?? null;

            if ($type !== 'icon' && $type !== 'frame') {
                continue;
            }

            $assetId = $layer['asset_id'] ?? null;

            if (is_int($assetId)) {
                $ids[] = $assetId;
            }

            $choiceAssetIds = $layer['choice_asset_ids'] ?? [];

            if ($type === 'icon' && is_array($choiceAssetIds)) {
                foreach ($choiceAssetIds as $choiceAssetId) {
                    if (is_int($choiceAssetId)) {
                        $ids[] = $choiceAssetId;
                    }
                }
            }
        }

        return array_values(array_unique($ids));
    }
}
