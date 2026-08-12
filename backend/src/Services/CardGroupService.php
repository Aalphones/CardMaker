<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\CardGroupRepository;
use App\Repositories\CardRepository;

final class CardGroupService
{
    public function __construct(
        private readonly CardGroupRepository $cardGroups,
        private readonly CardRepository $cards
    ) {
    }

    /** @return array<int, array<string, mixed>> Mit `cardCount` je Gruppe, für die Kachel-Fußzeile. */
    public function list(): array
    {
        return array_map(
            static fn (array $row): array => CardGroupRepository::formatWithCardCount($row),
            $this->cardGroups->allWithCardCount()
        );
    }

    /** @return array<string, mixed>|null Mit `cardCount`, wie {@see list()}. */
    public function find(int $id): ?array
    {
        $row = $this->cardGroups->find($id);

        return $row === null ? null : $this->formatWithCardCount($row, $id);
    }

    /**
     * @param array{name: string, description: ?string} $data
     * @return array<string, mixed> Immer `cardCount: 0` — eine frische Gruppe hat keine Karten.
     */
    public function create(array $data): array
    {
        return [...CardGroupRepository::format($this->cardGroups->create($data)), 'cardCount' => 0];
    }

    /**
     * @param array{name?: string, description?: ?string} $data
     * @return array<string, mixed>|null Mit `cardCount`, wie {@see list()}.
     */
    public function update(int $id, array $data): ?array
    {
        $row = $this->cardGroups->update($id, $data);

        return $row === null ? null : $this->formatWithCardCount($row, $id);
    }

    /**
     * `find()`/`update()` liefern nur eine Zeile ohne JOIN — der Zähler kommt hier per
     * Einzelabfrage dazu, spart sich aber den JOIN, den nur die Liste braucht.
     *
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function formatWithCardCount(array $row, int $id): array
    {
        return [...CardGroupRepository::format($row), 'cardCount' => $this->cards->countByGroup($id)];
    }

    public function delete(int $id): bool
    {
        return $this->cardGroups->delete($id);
    }
}
