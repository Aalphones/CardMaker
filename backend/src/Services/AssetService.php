<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\AssetRepository;
use finfo;
use Psr\Log\LoggerInterface;
use Throwable;

final class AssetService
{
    private const FALLBACK_MAX_BYTES = 8388608;

    public function __construct(
        private readonly AssetRepository $assets,
        private readonly string $uploadsDirectory,
        private readonly LoggerInterface $logger
    ) {
    }

    /** @return array<int, array<string, mixed>> */
    public function list(?string $kind): array
    {
        return array_map(
            static fn (array $row): array => AssetRepository::format($row),
            $this->assets->all($kind)
        );
    }

    /**
     * @param array<string, mixed> $file Eintrag aus `$_FILES`
     * @param array{kind: string, name: string} $data
     * @return array<string, mixed>
     */
    public function create(array $file, array $data): array
    {
        $this->guardUploadError($file);

        $temporaryPath = is_string($file['tmp_name'] ?? null) ? $file['tmp_name'] : '';

        if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
            throw new AssetUploadException(AssetUploadException::REASON_MISSING_FILE);
        }

        $byteSize = (int) ($file['size'] ?? 0);

        if ($byteSize > $this->maxBytes()) {
            throw new AssetUploadException(AssetUploadException::REASON_TOO_LARGE);
        }

        $dimensions = $this->pngDimensions($temporaryPath);

        return $this->store($temporaryPath, $byteSize, $dimensions, $data);
    }

    /** Datensatz und Datei entfernen. Fehlt die Datei schon, ist das kein Fehler. */
    public function delete(int $id): bool
    {
        $row = $this->assets->find($id);

        if ($row === null) {
            return false;
        }

        $this->removeFile($this->absolutePath($row));

        return $this->assets->delete($id);
    }

    /** @return array{path: string, mimeType: string}|null */
    public function locateFile(int $id): ?array
    {
        $row = $this->assets->find($id);

        if ($row === null) {
            return null;
        }

        $path = $this->absolutePath($row);

        if (!is_file($path)) {
            return null;
        }

        return ['path' => $path, 'mimeType' => (string) $row['mime_type']];
    }

    /** @param array<string, mixed> $file */
    private function guardUploadError(array $file): void
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_OK) {
            return;
        }

        if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
            throw new AssetUploadException(AssetUploadException::REASON_TOO_LARGE);
        }

        if ($error === UPLOAD_ERR_NO_FILE) {
            throw new AssetUploadException(AssetUploadException::REASON_MISSING_FILE);
        }

        $this->logger->error('Hochladung mit unerwartetem PHP-Fehlercode', ['code' => $error]);

        throw new AssetUploadException(AssetUploadException::REASON_STORAGE_FAILED);
    }

    /**
     * Zweimal prüfen, weil beides etwas anderes ansieht: `finfo` liest den Dateianfang,
     * `getimagesize()` die Bildstruktur. Die Endung des hochgeladenen Namens zählt nie.
     *
     * @return array{width: int, height: int}
     */
    private function pngDimensions(string $temporaryPath): array
    {
        $detectedType = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);

        if ($detectedType !== 'image/png') {
            throw new AssetUploadException(AssetUploadException::REASON_NOT_PNG);
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
            throw new AssetUploadException(AssetUploadException::REASON_NOT_PNG);
        }

        $width = (int) $imageInfo[0];
        $height = (int) $imageInfo[1];

        // Bei einer abgeschnittenen Datei liest getimagesize() den Kopf noch und meldet
        // 0 × 0 statt zu scheitern — als Bild wäre das im Editor eine unsichtbare Fläche.
        if ($width < 1 || $height < 1) {
            throw new AssetUploadException(AssetUploadException::REASON_NOT_PNG);
        }

        return ['width' => $width, 'height' => $height];
    }

    /**
     * @param array{width: int, height: int} $dimensions
     * @param array{kind: string, name: string} $data
     * @return array<string, mixed>
     */
    private function store(string $temporaryPath, int $byteSize, array $dimensions, array $data): array
    {
        $this->ensureUploadsDirectory();

        // Der Zielname wird selbst erzeugt: der vom Browser gelieferte Name darf nie zum
        // Pfad werden, sonst bestimmt die Gegenseite, wo die Datei landet und wie sie heißt.
        $fileName = bin2hex(random_bytes(16)) . '.png';
        $targetPath = $this->uploadsDirectory . '/' . $fileName;

        if (!move_uploaded_file($temporaryPath, $targetPath)) {
            $this->logger->error('Hochladung konnte nicht abgelegt werden', ['target' => $fileName]);

            throw new AssetUploadException(AssetUploadException::REASON_STORAGE_FAILED);
        }

        try {
            $row = $this->assets->insert([
                'kind' => $data['kind'],
                'name' => $data['name'],
                'file_name' => $fileName,
                'mime_type' => 'image/png',
                'byte_size' => $byteSize,
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
            ]);
        } catch (Throwable $exception) {
            // Ohne Datensatz ist die Datei nicht mehr auffindbar — sie bliebe für immer liegen.
            $this->removeFile($targetPath);

            $this->logger->error('Datensatz zur Hochladung konnte nicht geschrieben werden', [
                'message' => $exception->getMessage(),
            ]);

            throw new AssetUploadException(AssetUploadException::REASON_STORAGE_FAILED);
        }

        return AssetRepository::format($row);
    }

    private function ensureUploadsDirectory(): void
    {
        if (is_dir($this->uploadsDirectory)) {
            return;
        }

        if (!mkdir($this->uploadsDirectory, 0755, true) && !is_dir($this->uploadsDirectory)) {
            $this->logger->error('Ablageordner konnte nicht angelegt werden');

            throw new AssetUploadException(AssetUploadException::REASON_STORAGE_FAILED);
        }
    }

    /**
     * Ein Rest, der sich nicht löschen lässt, darf den Datensatz nicht blockieren: eine
     * verwaiste Datei ist Ballast, ein unlöschbarer Eintrag wäre ein Defekt.
     */
    private function removeFile(string $path): void
    {
        if (!is_file($path)) {
            return;
        }

        try {
            unlink($path);
        } catch (Throwable $exception) {
            $this->logger->warning('Datei konnte nicht entfernt werden', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /** @param array<string, mixed> $row */
    private function absolutePath(array $row): string
    {
        // basename() ist die Rückversicherung: der Name stammt aus der Datenbank und wurde
        // von uns erzeugt, aber ein Pfadanteil dürfte dort nie zu einem Ausbruch führen.
        return $this->uploadsDirectory . '/' . basename((string) $row['file_name']);
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
