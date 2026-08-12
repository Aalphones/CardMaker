<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\CardRepository;

final class CardPreviewService
{
    public function __construct(
        private readonly CardRepository $cards,
        private readonly PreviewImageStorage $storage
    ) {
    }

    public function cardExists(int $cardId): bool
    {
        return $this->cards->exists($cardId);
    }

    /**
     * @param array<string, mixed> $file Eintrag aus `$_FILES`
     * @return array{previewUpdatedAt: string}|null `null` bei unbekannter Kennung.
     */
    public function store(int $cardId, array $file): ?array
    {
        $previousFileName = $this->cards->findPreviewFileName($cardId);
        $fileName = $this->storage->accept($file);

        $previewUpdatedAt = $this->cards->updatePreview($cardId, $fileName);

        if ($previewUpdatedAt === null) {
            // Ohne Datensatz ist die Datei nicht mehr auffindbar — sie bliebe für immer liegen.
            $this->storage->remove($fileName);

            return null;
        }

        // Erst jetzt, wo der neue Dateiname sicher in der Datenbank steht, die alte Datei
        // entfernen — die räumt sonst niemand auf.
        if ($previousFileName !== null && $previousFileName !== $fileName) {
            $this->storage->remove($previousFileName);
        }

        return ['previewUpdatedAt' => $previewUpdatedAt];
    }

    /** @return array{path: string, mimeType: string}|null */
    public function locateFile(int $cardId): ?array
    {
        return $this->storage->locate($this->cards->findPreviewFileName($cardId));
    }

    /** Vor dem Löschen der Karte aufgerufen (`CardService::delete()`): räumt die Datei auf. */
    public function delete(int $cardId): void
    {
        $this->storage->remove($this->cards->findPreviewFileName($cardId));
    }

    /**
     * Kopiert das Vorschaubild einer Karte auf eine neue, mit neuem Zufallsnamen — löschen
     * der einen Karte darf die Datei der anderen nie mitreißen. Fehlt die Quelldatei
     * (Template ohne gespeichertes Bild, oder verwaist), wird stillschweigend keins gesetzt.
     */
    public function duplicateFor(int $sourceCardId, int $targetCardId): void
    {
        $sourceFileName = $this->cards->findPreviewFileName($sourceCardId);

        if ($sourceFileName === null) {
            return;
        }

        $targetFileName = $this->storage->copy($sourceFileName);

        if ($targetFileName === null) {
            return;
        }

        $this->cards->updatePreview($targetCardId, $targetFileName);
    }
}
