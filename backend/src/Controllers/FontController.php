<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\FontService;
use App\Services\FontUploadException;
use App\Validators\FontValidator;

final class FontController
{
    public function __construct(
        private readonly Request $request,
        private readonly FontService $fonts
    ) {
    }

    public function index(): void
    {
        Response::json(['items' => $this->fonts->list()]);
    }

    public function create(): void
    {
        $file = $this->request->files()['file'] ?? null;

        if (!is_array($file)) {
            $this->failedUpload($this->missingFileReason());

            return;
        }

        $data = FontValidator::validate(['name' => $this->request->formField('name')]);

        try {
            $font = $this->fonts->create($file, $data);
        } catch (FontUploadException $exception) {
            $this->failedUpload($exception->reason());

            return;
        }

        Response::json($font, 201);
    }

    public function file(string $id): void
    {
        $location = $this->fonts->locateFile((int) $id);

        if ($location === null) {
            $this->notFound();

            return;
        }

        Response::file($location['path'], $location['mimeType']);
    }

    public function update(string $id): void
    {
        $data = FontValidator::validate((array) $this->request->body());
        $font = $this->fonts->rename((int) $id, $data['name']);

        if ($font === null) {
            $this->notFound();

            return;
        }

        Response::json($font);
    }

    public function destroy(string $id): void
    {
        if (!$this->fonts->delete((int) $id)) {
            $this->notFound();

            return;
        }

        Response::noContent();
    }

    /**
     * Überschreitet die Anfrage `post_max_size`, verwirft PHP `$_POST` **und** `$_FILES`
     * ersatzlos und meldet keinen Fehlercode. Erkennbar ist das nur daran, dass beide leer
     * sind, obwohl eine Länge angekündigt wurde.
     */
    private function missingFileReason(): string
    {
        $contentLength = (int) ($this->request->header('content-length') ?? '0');

        if ($contentLength > 0 && $this->request->form() === []) {
            return FontUploadException::REASON_TOO_LARGE;
        }

        return FontUploadException::REASON_MISSING_FILE;
    }

    private function failedUpload(string $reason): void
    {
        if ($reason === FontUploadException::REASON_TOO_LARGE) {
            $this->invalidFile('Die Schriftdatei ist zu groß. Erlaubt sind höchstens 2 MB.');

            return;
        }

        if ($reason === FontUploadException::REASON_UNSUPPORTED_FORMAT) {
            $this->invalidFile('Diese Datei ist keine Schrift. Erlaubt sind WOFF2, TTF und OTF.');

            return;
        }

        if ($reason === FontUploadException::REASON_MISSING_FILE) {
            $this->invalidFile('Bitte eine Schriftdatei auswählen.');

            return;
        }

        Response::error(
            Response::ERROR_SERVER_ERROR,
            'Die Schrift konnte nicht gespeichert werden.',
            500
        );
    }

    private function invalidFile(string $hint): void
    {
        Response::error(
            Response::ERROR_VALIDATION_FAILED,
            'Die Angaben sind unvollständig oder falsch.',
            422,
            ['file' => $hint]
        );
    }

    private function notFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Diese Schrift gibt es nicht.', 404);
    }
}
