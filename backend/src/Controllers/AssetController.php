<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\AssetService;
use App\Services\AssetUploadException;
use App\Validators\AssetValidator;

final class AssetController
{
    public function __construct(
        private readonly Request $request,
        private readonly AssetService $assets
    ) {
    }

    public function index(): void
    {
        $kind = AssetValidator::validateKindFilter($this->request->query('kind'));

        Response::json(['items' => $this->assets->list($kind)]);
    }

    public function create(): void
    {
        $file = $this->request->files()['file'] ?? null;

        if (!is_array($file)) {
            $this->failedUpload($this->missingFileReason());

            return;
        }

        $data = AssetValidator::validate([
            'kind' => $this->request->formField('kind'),
            'name' => $this->request->formField('name'),
        ]);

        try {
            $asset = $this->assets->create($file, $data);
        } catch (AssetUploadException $exception) {
            $this->failedUpload($exception->reason());

            return;
        }

        Response::json($asset, 201);
    }

    public function file(string $id): void
    {
        $location = $this->assets->locateFile((int) $id);

        if ($location === null) {
            $this->notFound();

            return;
        }

        Response::file($location['path'], $location['mimeType']);
    }

    public function destroy(string $id): void
    {
        if (!$this->assets->delete((int) $id)) {
            $this->notFound();

            return;
        }

        Response::noContent();
    }

    /**
     * Überschreitet die Anfrage `post_max_size`, verwirft PHP `$_POST` und `$_FILES`
     * ersatzlos und meldet keinen Fehlercode — die angekündigte Länge ist dann der
     * einzige Hinweis darauf, dass überhaupt etwas gesendet wurde.
     */
    private function missingFileReason(): string
    {
        $contentLength = (int) ($this->request->header('content-length') ?? '0');

        if ($contentLength > 0) {
            return AssetUploadException::REASON_TOO_LARGE;
        }

        return AssetUploadException::REASON_MISSING_FILE;
    }

    private function failedUpload(string $reason): void
    {
        if ($reason === AssetUploadException::REASON_TOO_LARGE) {
            Response::error(
                Response::ERROR_PAYLOAD_TOO_LARGE,
                'Das Bild ist zu groß. Bitte eine kleinere PNG-Datei wählen.',
                413
            );

            return;
        }

        if ($reason === AssetUploadException::REASON_NOT_PNG) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                ['file' => 'Nur PNG-Bilder sind erlaubt.']
            );

            return;
        }

        if ($reason === AssetUploadException::REASON_MISSING_FILE) {
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
        Response::error(Response::ERROR_NOT_FOUND, 'Dieses Bild gibt es nicht.', 404);
    }
}
