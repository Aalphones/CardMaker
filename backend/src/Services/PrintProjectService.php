<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Response;
use App\Repositories\CardRepository;
use App\Repositories\PrintProjectRepository;

final class PrintProjectService
{
    private const QUANTITY_MAX = 99;

    public function __construct(
        private readonly PrintProjectRepository $printProjects,
        private readonly CardRepository $cards
    ) {
    }

    /** @return array{options: array{cutMarks: bool, bleed: bool}, items: array<int, array<string, mixed>>} */
    public function get(): array
    {
        $project = $this->printProjects->findOrCreateProject();

        return [
            'options' => PrintProjectRepository::formatOptions($project),
            'items' => $this->formattedItems((int) $project['id']),
        ];
    }

    /**
     * @param array{cut_marks: bool, bleed: bool} $options
     * @return array{cutMarks: bool, bleed: bool}
     */
    public function setOptions(array $options): array
    {
        $project = $this->printProjects->findOrCreateProject();

        return PrintProjectRepository::formatOptions(
            $this->printProjects->updateOptions((int) $project['id'], $options)
        );
    }

    /**
     * Eine schon enthaltene Karte bekommt keine zweite Position, sondern ein Exemplar mehr —
     * dasselbe Verhalten wie „Im Druckprojekt +1" in der Kartenliste.
     *
     * @param array{card_id: int, quantity: int} $data
     * @return array{item: array<string, mixed>, wasCreated: bool}
     */
    public function addItem(array $data): array
    {
        $this->guardCardExists($data['card_id']);

        $project = $this->printProjects->findOrCreateProject();
        $projectId = (int) $project['id'];
        $existing = $this->printProjects->findItemByCard($projectId, $data['card_id']);

        if ($existing !== null) {
            $increased = min((int) $existing['quantity'] + 1, self::QUANTITY_MAX);
            $updated = $this->printProjects->updateQuantity((int) $existing['id'], $increased);

            return ['item' => PrintProjectRepository::formatItem($updated ?? $existing), 'wasCreated' => false];
        }

        $inserted = $this->printProjects->insertItem($projectId, $data['card_id'], $data['quantity']);

        return ['item' => PrintProjectRepository::formatItem($inserted), 'wasCreated' => true];
    }

    /** @return array<string, mixed>|null */
    public function setQuantity(int $itemId, int $quantity): ?array
    {
        if ($this->printProjects->findItem($itemId) === null) {
            return null;
        }

        $updated = $this->printProjects->updateQuantity($itemId, $quantity);

        return $updated === null ? null : PrintProjectRepository::formatItem($updated);
    }

    public function removeItem(int $itemId): bool
    {
        return $this->printProjects->deleteItem($itemId);
    }

    public function clear(): void
    {
        $project = $this->printProjects->findOrCreateProject();

        $this->printProjects->deleteAllItems((int) $project['id']);
    }

    /** @return array<int, array<string, mixed>> */
    private function formattedItems(int $projectId): array
    {
        return array_map(
            static fn (array $row): array => PrintProjectRepository::formatItem($row),
            $this->printProjects->listItems($projectId)
        );
    }

    private function guardCardExists(int $cardId): void
    {
        if (!$this->cards->exists($cardId)) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['cardId' => 'Diese Karte gibt es nicht.']
            );
        }
    }
}
