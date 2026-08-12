<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\TemplateRepository;

final class TemplatePreviewService
{
    public function __construct(
        private readonly TemplateRepository $templates,
        private readonly PreviewImageStorage $storage
    ) {
    }

    public function templateExists(int $templateId): bool
    {
        return $this->templates->find($templateId) !== null;
    }

    /**
     * @param array<string, mixed> $file Eintrag aus `$_FILES`
     * @return array{previewUpdatedAt: string}|null `null` bei unbekannter Kennung.
     */
    public function store(int $templateId, array $file): ?array
    {
        $previousFileName = $this->templates->findPreviewFileName($templateId);
        $fileName = $this->storage->accept($file);

        $previewUpdatedAt = $this->templates->updatePreview($templateId, $fileName);

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
    public function locateFile(int $templateId): ?array
    {
        return $this->storage->locate($this->templates->findPreviewFileName($templateId));
    }

    /** Vor dem Löschen des Templates aufgerufen (`TemplateService::delete()`): räumt die Datei auf. */
    public function delete(int $templateId): void
    {
        $this->storage->remove($this->templates->findPreviewFileName($templateId));
    }
}
