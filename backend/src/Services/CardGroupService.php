<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\CardGroupRepository;

final class CardGroupService
{
    public function __construct(private readonly CardGroupRepository $cardGroups)
    {
    }

    /** @return array<int, array<string, mixed>> */
    public function list(): array
    {
        return array_map(
            static fn (array $row): array => CardGroupRepository::format($row),
            $this->cardGroups->all()
        );
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $row = $this->cardGroups->find($id);

        return $row === null ? null : CardGroupRepository::format($row);
    }

    /**
     * @param array{name: string, description: ?string} $data
     * @return array<string, mixed>
     */
    public function create(array $data): array
    {
        return CardGroupRepository::format($this->cardGroups->create($data));
    }

    /**
     * @param array{name?: string, description?: ?string} $data
     * @return array<string, mixed>|null
     */
    public function update(int $id, array $data): ?array
    {
        $row = $this->cardGroups->update($id, $data);

        return $row === null ? null : CardGroupRepository::format($row);
    }

    public function delete(int $id): bool
    {
        return $this->cardGroups->delete($id);
    }
}
