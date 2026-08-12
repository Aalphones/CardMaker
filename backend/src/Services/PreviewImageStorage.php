<?php

declare(strict_types=1);

namespace App\Services;

use finfo;
use Psr\Log\LoggerInterface;
use Throwable;

/**
 * Kennt nur den Ablageordner, keine Tabelle — `TemplatePreviewService` und
 * `CardPreviewService` schreiben den Dateinamen jeweils in ihre eigene Tabelle. Anders als
 * `CardImageService` (PNG oder JPEG) nimmt dieser Baustein **nur** PNG entgegen: das
 * Vorschaubild kommt immer aus dem Editor-Export, nie von einer Nutzerin hochgeladen.
 */
final class PreviewImageStorage
{
    private const FALLBACK_MAX_BYTES = 8388608;

    public function __construct(
        private readonly string $directory,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * @param array<string, mixed> $file Eintrag aus `$_FILES`
     * @return string Der selbst erzeugte Dateiname.
     */
    public function accept(array $file): string
    {
        $this->guardUploadError($file);

        $temporaryPath = is_string($file['tmp_name'] ?? null) ? $file['tmp_name'] : '';

        if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_MISSING_FILE);
        }

        $byteSize = (int) ($file['size'] ?? 0);

        if ($byteSize > $this->maxBytes()) {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_TOO_LARGE);
        }

        $this->guardIsPng($temporaryPath);

        $this->ensureDirectory();

        $fileName = bin2hex(random_bytes(16)) . '.png';
        $targetPath = $this->directory . '/' . $fileName;

        if (!move_uploaded_file($temporaryPath, $targetPath)) {
            $this->logger->error('Vorschaubild konnte nicht abgelegt werden', ['target' => $fileName]);

            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_STORAGE_FAILED);
        }

        return $fileName;
    }

    /** @return array{path: string, mimeType: string}|null */
    public function locate(?string $fileName): ?array
    {
        if ($fileName === null || $fileName === '') {
            return null;
        }

        // basename() ist die Rückversicherung: der Name stammt aus der Datenbank und wurde
        // von uns erzeugt, aber ein Pfadanteil dürfte dort nie zu einem Ausbruch führen.
        $path = $this->directory . '/' . basename($fileName);

        if (!is_file($path)) {
            return null;
        }

        return ['path' => $path, 'mimeType' => 'image/png'];
    }

    /** Ein Rest, der sich nicht löschen lässt, wird nur protokolliert (Muster `CardImageService::removeFile()`). */
    public function remove(?string $fileName): void
    {
        if ($fileName === null || $fileName === '') {
            return;
        }

        $path = $this->directory . '/' . basename($fileName);

        if (!is_file($path)) {
            return;
        }

        try {
            unlink($path);
        } catch (Throwable $exception) {
            $this->logger->warning('Vorschaubild-Datei konnte nicht entfernt werden', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /** Für das Duplizieren einer Karte: kopiert unter neuem Namen, `null` wenn die Quelldatei fehlt. */
    public function copy(string $fileName): ?string
    {
        $sourcePath = $this->directory . '/' . basename($fileName);

        if (!is_file($sourcePath)) {
            return null;
        }

        $this->ensureDirectory();

        $targetFileName = bin2hex(random_bytes(16)) . '.png';
        $targetPath = $this->directory . '/' . $targetFileName;

        if (!copy($sourcePath, $targetPath)) {
            $this->logger->error('Vorschaubild konnte beim Duplizieren nicht kopiert werden', [
                'source' => $fileName,
            ]);

            return null;
        }

        return $targetFileName;
    }

    /** @param array<string, mixed> $file */
    private function guardUploadError(array $file): void
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_OK) {
            return;
        }

        if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_TOO_LARGE);
        }

        if ($error === UPLOAD_ERR_NO_FILE) {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_MISSING_FILE);
        }

        $this->logger->error('Hochladung mit unerwartetem PHP-Fehlercode', ['code' => $error]);

        throw new PreviewImageUploadException(PreviewImageUploadException::REASON_STORAGE_FAILED);
    }

    /**
     * Zweimal prüfen wie beim Kartenbild: `finfo` liest den Dateianfang, `getimagesize()`
     * die Bildstruktur. Die Endung des hochgeladenen Namens zählt nie.
     */
    private function guardIsPng(string $temporaryPath): void
    {
        $detectedType = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);

        if ($detectedType !== 'image/png') {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_UNSUPPORTED_FORMAT);
        }

        // Der globale Fehler-Handler macht aus jeder Warnung eine Ausnahme, und
        // getimagesize() warnt bei beschädigten Dateien — hier ist das ein erwarteter
        // Fall und keine Störung.
        try {
            $imageInfo = getimagesize($temporaryPath);
        } catch (Throwable) {
            $imageInfo = false;
        }

        if (!is_array($imageInfo) || ($imageInfo[2] ?? null) !== IMAGETYPE_PNG) {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_UNSUPPORTED_FORMAT);
        }

        // Bei einer abgeschnittenen Datei liest getimagesize() den Kopf noch und meldet
        // 0 × 0 statt zu scheitern.
        if ((int) $imageInfo[0] < 1 || (int) $imageInfo[1] < 1) {
            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_UNSUPPORTED_FORMAT);
        }
    }

    private function ensureDirectory(): void
    {
        if (is_dir($this->directory)) {
            return;
        }

        if (!mkdir($this->directory, 0755, true) && !is_dir($this->directory)) {
            $this->logger->error('Ablageordner für Vorschaubilder konnte nicht angelegt werden');

            throw new PreviewImageUploadException(PreviewImageUploadException::REASON_STORAGE_FAILED);
        }
    }

    private function maxBytes(): int
    {
        $configured = $_ENV['UPLOAD_MAX_BYTES'] ?? null;

        if (is_string($configured) && ctype_digit($configured) && (int) $configured > 0) {
            return (int) $configured;
        }

        return self::FALLBACK_MAX_BYTES;
    }
}
