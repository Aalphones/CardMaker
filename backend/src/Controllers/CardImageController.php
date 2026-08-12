<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\CardImageService;
use App\Services\CardImageUploadException;
use App\Validators\CardImageValidator;

final class CardImageController
{
    public function __construct(
        private readonly Request $request,
        private readonly CardImageService $cardImages
    ) {
    }

    public function upload(string $id): void
    {
        $cardId = (int) $id;

        if (!$this->cardImages->cardExists($cardId)) {
            $this->cardNotFound();

            return;
        }

        $layerId = CardImageValidator::validateLayerId($this->request->formField('layer_id'));
        $file = $this->request->files()['file'] ?? null;

        if (!is_array($file)) {
            $this->failedUpload($this->missingFileReason());

            return;
        }

        try {
            $image = $this->cardImages->upload($cardId, $layerId, $file);
        } catch (CardImageUploadException $exception) {
            $this->failedUpload($exception->reason());

            return;
        }

        Response::json($image, 201);
    }

    public function update(string $id, string $layerId): void
    {
        $cardId = (int) $id;

        if (!$this->cardImages->cardExists($cardId)) {
            $this->cardNotFound();

            return;
        }

        $placement = CardImageValidator::validatePlacement((array) $this->request->body());
        $image = $this->cardImages->updatePlacement($cardId, $layerId, $placement);

        if ($image === null) {
            $this->imageNotFound();

            return;
        }

        Response::json($image);
    }

    public function destroy(string $id, string $layerId): void
    {
        $cardId = (int) $id;

        if (!$this->cardImages->cardExists($cardId)) {
            $this->cardNotFound();

            return;
        }

        if (!$this->cardImages->delete($cardId, $layerId)) {
            $this->imageNotFound();

            return;
        }

        Response::noContent();
    }

    public function file(string $id, string $layerId): void
    {
        $location = $this->cardImages->locateFile((int) $id, $layerId);

        if ($location === null) {
            $this->imageNotFound();

            return;
        }

        Response::file($location['path'], $location['mimeType']);
    }

    /**
     * Überschreitet die Anfrage `post_max_size`, verwirft PHP `$_POST` **und** `$_FILES`
     * ersatzlos und meldet keinen Fehlercode. Erkennbar ist das nur daran, dass beide
     * leer sind, obwohl eine Länge angekündigt wurde. Kamen dagegen Textfelder an, wurde
     * der Rumpf gelesen — dann fehlt schlicht die Datei, und das ist ein anderer Fehler.
     */
    private function missingFileReason(): string
    {
        $contentLength = (int) ($this->request->header('content-length') ?? '0');

        if ($contentLength > 0 && $this->request->form() === []) {
            return CardImageUploadException::REASON_TOO_LARGE;
        }

        return CardImageUploadException::REASON_MISSING_FILE;
    }

    private function failedUpload(string $reason): void
    {
        if ($reason === CardImageUploadException::REASON_TOO_LARGE) {
            Response::error(
                Response::ERROR_PAYLOAD_TOO_LARGE,
                'Das Bild ist zu groß. Bitte eine kleinere Datei wählen.',
                413
            );

            return;
        }

        if ($reason === CardImageUploadException::REASON_UNSUPPORTED_FORMAT) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['file' => 'Nur PNG- oder JPEG-Bilder sind erlaubt.']
            );

            return;
        }

        if ($reason === CardImageUploadException::REASON_MISSING_FILE) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['file' => 'Bitte eine PNG- oder JPEG-Datei auswählen.']
            );

            return;
        }

        if ($reason === CardImageUploadException::REASON_UNKNOWN_LAYER) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['layerId' => 'Diese Bildebene gibt es in diesem Template nicht.']
            );

            return;
        }

        Response::error(
            Response::ERROR_SERVER_ERROR,
            'Das Bild konnte nicht gespeichert werden.',
            500
        );
    }

    private function cardNotFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Diese Karte gibt es nicht.', 404);
    }

    private function imageNotFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Dieses Kartenbild gibt es nicht.', 404);
    }
}
