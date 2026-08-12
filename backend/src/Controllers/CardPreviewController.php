<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\CardPreviewService;
use App\Services\PreviewImageUploadException;

final class CardPreviewController
{
    public function __construct(
        private readonly Request $request,
        private readonly CardPreviewService $previews
    ) {
    }

    public function upload(string $id): void
    {
        $cardId = (int) $id;

        if (!$this->previews->cardExists($cardId)) {
            $this->notFound();

            return;
        }

        $file = $this->request->files()['file'] ?? null;

        if (!is_array($file)) {
            $this->failedUpload($this->missingFileReason());

            return;
        }

        try {
            $result = $this->previews->store($cardId, $file);
        } catch (PreviewImageUploadException $exception) {
            $this->failedUpload($exception->reason());

            return;
        }

        if ($result === null) {
            $this->notFound();

            return;
        }

        Response::json($result, 201);
    }

    public function file(string $id): void
    {
        $location = $this->previews->locateFile((int) $id);

        if ($location === null) {
            $this->fileNotFound();

            return;
        }

        Response::file($location['path'], $location['mimeType']);
    }

    /**
     * Überschreitet die Anfrage `post_max_size`, verwirft PHP `$_POST` **und** `$_FILES`
     * ersatzlos und meldet keinen Fehlercode. Erkennbar ist das nur daran, dass beide
     * leer sind, obwohl eine Länge angekündigt wurde.
     */
    private function missingFileReason(): string
    {
        $contentLength = (int) ($this->request->header('content-length') ?? '0');

        if ($contentLength > 0 && $this->request->form() === []) {
            return PreviewImageUploadException::REASON_TOO_LARGE;
        }

        return PreviewImageUploadException::REASON_MISSING_FILE;
    }

    private function failedUpload(string $reason): void
    {
        if ($reason === PreviewImageUploadException::REASON_TOO_LARGE) {
            Response::error(
                Response::ERROR_PAYLOAD_TOO_LARGE,
                'Das Bild ist zu groß. Bitte eine kleinere Datei wählen.',
                413
            );

            return;
        }

        if ($reason === PreviewImageUploadException::REASON_UNSUPPORTED_FORMAT) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['file' => 'Nur PNG-Bilder sind erlaubt.']
            );

            return;
        }

        if ($reason === PreviewImageUploadException::REASON_MISSING_FILE) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['file' => 'Bitte eine PNG-Datei auswählen.']
            );

            return;
        }

        Response::error(
            Response::ERROR_SERVER_ERROR,
            'Das Bild konnte nicht gespeichert werden.',
            500
        );
    }

    private function notFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Diese Karte gibt es nicht.', 404);
    }

    private function fileNotFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Für diese Karte gibt es kein Vorschaubild.', 404);
    }
}
