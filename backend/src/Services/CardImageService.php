<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\CardImageRepository;
use App\Repositories\CardRepository;
use App\Repositories\TemplateRepository;
use finfo;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Throwable;

final class CardImageService
{
    private const FALLBACK_MAX_BYTES = 8388608;

    /**
     * Kartenmotive sind meist Fotos oder KI-Bilder und kommen als JPEG — anders als der
     * Bildvorrat (nur PNG, wegen Transparenz für Rahmen/Icons), siehe ADR-015/017.
     */
    private const MIME_TO_IMAGETYPE = [
        'image/png' => IMAGETYPE_PNG,
        'image/jpeg' => IMAGETYPE_JPEG,
    ];
    private const IMAGETYPE_TO_EXTENSION = [
        IMAGETYPE_PNG => 'png',
        IMAGETYPE_JPEG => 'jpg',
    ];

    public function __construct(
        private readonly CardImageRepository $cardImages,
        private readonly CardRepository $cards,
        private readonly TemplateRepository $templates,
        private readonly string $uploadsDirectory,
        private readonly LoggerInterface $logger
    ) {
    }

    public function cardExists(int $cardId): bool
    {
        return $this->cards->exists($cardId);
    }

    /** @return array<int, array<string, mixed>> */
    public function listForCard(int $cardId): array
    {
        return array_map(
            static fn (array $row): array => CardImageRepository::format($row),
            $this->cardImages->findByCard($cardId)
        );
    }

    /**
     * @param array<string, mixed> $file Eintrag aus `$_FILES`
     * @return array<string, mixed>
     */
    public function upload(int $cardId, string $layerId, array $file): array
    {
        $this->guardImageLayer($cardId, $layerId);
        $this->guardUploadError($file);

        $temporaryPath = is_string($file['tmp_name'] ?? null) ? $file['tmp_name'] : '';

        if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
            throw new CardImageUploadException(CardImageUploadException::REASON_MISSING_FILE);
        }

        $byteSize = (int) ($file['size'] ?? 0);

        if ($byteSize > $this->maxBytes()) {
            throw new CardImageUploadException(CardImageUploadException::REASON_TOO_LARGE);
        }

        $image = $this->readImage($temporaryPath);

        return $this->store($cardId, $layerId, $temporaryPath, $byteSize, $image);
    }

    /**
     * @param array{offset_x?: float, offset_y?: float, scale?: float} $placement
     * @return array<string, mixed>|null
     */
    public function updatePlacement(int $cardId, string $layerId, array $placement): ?array
    {
        $row = $this->cardImages->updatePlacement($cardId, $layerId, $placement);

        return $row === null ? null : CardImageRepository::format($row);
    }

    /** Datensatz und Datei entfernen. Fehlt eines von beiden schon, ist das kein Fehler. */
    public function delete(int $cardId, string $layerId): bool
    {
        $row = $this->cardImages->findOne($cardId, $layerId);

        if ($row === null) {
            return false;
        }

        $this->removeFile($this->absolutePath($row));

        return $this->cardImages->delete($cardId, $layerId);
    }

    /** @return array{path: string, mimeType: string}|null */
    public function locateFile(int $cardId, string $layerId): ?array
    {
        $row = $this->cardImages->findOne($cardId, $layerId);

        if ($row === null) {
            return null;
        }

        $path = $this->absolutePath($row);

        if (!is_file($path)) {
            return null;
        }

        return ['path' => $path, 'mimeType' => (string) $row['mime_type']];
    }

    /** Vor dem Löschen der Karte aufgerufen (`CardService::delete()`): räumt die Dateien auf. */
    public function deleteAllForCard(int $cardId): void
    {
        foreach ($this->cardImages->deleteByCard($cardId) as $fileName) {
            $this->removeFile($this->uploadsDirectory . '/' . basename($fileName));
        }
    }

    /**
     * Kopiert alle Bilder einer Karte auf eine neue, mit neuen Zufallsnamen — löschen der
     * einen Karte darf die Datei der anderen nie mitreißen. Ein Bild, dessen Datei schon
     * fehlt (verwaist), wird stillschweigend übersprungen statt das Duplizieren scheitern
     * zu lassen.
     */
    public function duplicateForCard(int $sourceCardId, int $targetCardId): void
    {
        foreach ($this->cardImages->findByCard($sourceCardId) as $row) {
            $sourcePath = $this->absolutePath($row);

            if (!is_file($sourcePath)) {
                continue;
            }

            $extension = pathinfo((string) $row['file_name'], PATHINFO_EXTENSION);
            $fileName = bin2hex(random_bytes(16)) . '.' . $extension;
            $targetPath = $this->uploadsDirectory . '/' . $fileName;

            if (!copy($sourcePath, $targetPath)) {
                $this->logger->error('Kartenbild konnte beim Duplizieren nicht kopiert werden', [
                    'card_id' => $sourceCardId,
                    'layer_id' => $row['layer_id'],
                ]);

                continue;
            }

            $this->cardImages->copy([
                'card_id' => $targetCardId,
                'layer_id' => (string) $row['layer_id'],
                'file_name' => $fileName,
                'mime_type' => (string) $row['mime_type'],
                'byte_size' => (int) $row['byte_size'],
                'width' => (int) $row['width'],
                'height' => (int) $row['height'],
                'offset_x' => (float) $row['offset_x'],
                'offset_y' => (float) $row['offset_y'],
                'scale' => (float) $row['scale'],
            ]);
        }
    }

    /**
     * Nicht die Karte fehlt hier normalerweise (das prüft der Controller vorab über
     * `cardExists()`), sondern dass `layerId` wirklich eine Bildebene im Template dieser
     * Karte ist — sonst 422 statt eines rätselhaften Fremdschlüsselfehlers.
     */
    private function guardImageLayer(int $cardId, string $layerId): void
    {
        $templateId = $this->cards->findTemplateId($cardId);

        if ($templateId === null) {
            // Rennen: die Karte wurde zwischen der Prüfung im Controller und hier gelöscht.
            // Selten genug, dass ein 500 über den globalen Ausnahme-Handler reicht.
            throw new RuntimeException('Karte wurde während der Hochladung gelöscht.');
        }

        if (!$this->templates->hasImageLayer($templateId, $layerId)) {
            throw new CardImageUploadException(CardImageUploadException::REASON_UNKNOWN_LAYER);
        }
    }

    /** @param array<string, mixed> $file */
    private function guardUploadError(array $file): void
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_OK) {
            return;
        }

        if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
            throw new CardImageUploadException(CardImageUploadException::REASON_TOO_LARGE);
        }

        if ($error === UPLOAD_ERR_NO_FILE) {
            throw new CardImageUploadException(CardImageUploadException::REASON_MISSING_FILE);
        }

        $this->logger->error('Hochladung mit unerwartetem PHP-Fehlercode', ['code' => $error]);

        throw new CardImageUploadException(CardImageUploadException::REASON_STORAGE_FAILED);
    }

    /**
     * Zweimal prüfen wie beim Bildvorrat: `finfo` liest den Dateianfang, `getimagesize()`
     * die Bildstruktur. Die Endung des hochgeladenen Namens zählt nie.
     *
     * @return array{width: int, height: int, extension: string, mimeType: string}
     */
    private function readImage(string $temporaryPath): array
    {
        $detectedType = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);

        if (!is_string($detectedType) || !isset(self::MIME_TO_IMAGETYPE[$detectedType])) {
            throw new CardImageUploadException(CardImageUploadException::REASON_UNSUPPORTED_FORMAT);
        }

        // Der globale Fehler-Handler macht aus jeder Warnung eine Ausnahme, und
        // getimagesize() warnt bei beschädigten Dateien — hier ist das ein erwarteter
        // Fall und keine Störung.
        try {
            $imageInfo = getimagesize($temporaryPath);
        } catch (Throwable) {
            $imageInfo = false;
        }

        $expectedType = self::MIME_TO_IMAGETYPE[$detectedType];

        if (!is_array($imageInfo) || ($imageInfo[2] ?? null) !== $expectedType) {
            throw new CardImageUploadException(CardImageUploadException::REASON_UNSUPPORTED_FORMAT);
        }

        $width = (int) $imageInfo[0];
        $height = (int) $imageInfo[1];

        // Bei einer abgeschnittenen Datei liest getimagesize() den Kopf noch und meldet
        // 0 × 0 statt zu scheitern — als Bild wäre das im Editor eine unsichtbare Fläche.
        if ($width < 1 || $height < 1) {
            throw new CardImageUploadException(CardImageUploadException::REASON_UNSUPPORTED_FORMAT);
        }

        return [
            'width' => $width,
            'height' => $height,
            'extension' => self::IMAGETYPE_TO_EXTENSION[$expectedType],
            'mimeType' => $detectedType,
        ];
    }

    /**
     * @param array{width: int, height: int, extension: string, mimeType: string} $image
     * @return array<string, mixed>
     */
    private function store(int $cardId, string $layerId, string $temporaryPath, int $byteSize, array $image): array
    {
        $this->ensureUploadsDirectory();

        $previous = $this->cardImages->findOne($cardId, $layerId);

        // Der Zielname wird selbst erzeugt: der vom Browser gelieferte Name darf nie zum
        // Pfad werden, sonst bestimmt die Gegenseite, wo die Datei landet und wie sie heißt.
        $fileName = bin2hex(random_bytes(16)) . '.' . $image['extension'];
        $targetPath = $this->uploadsDirectory . '/' . $fileName;

        if (!move_uploaded_file($temporaryPath, $targetPath)) {
            $this->logger->error('Kartenbild konnte nicht abgelegt werden', ['target' => $fileName]);

            throw new CardImageUploadException(CardImageUploadException::REASON_STORAGE_FAILED);
        }

        try {
            $row = $this->cardImages->upsert([
                'card_id' => $cardId,
                'layer_id' => $layerId,
                'file_name' => $fileName,
                'mime_type' => $image['mimeType'],
                'byte_size' => $byteSize,
                'width' => $image['width'],
                'height' => $image['height'],
            ]);
        } catch (Throwable $exception) {
            // Ohne Datensatz ist die Datei nicht mehr auffindbar — sie bliebe für immer liegen.
            $this->removeFile($targetPath);

            $this->logger->error('Datensatz zum Kartenbild konnte nicht geschrieben werden', [
                'message' => $exception->getMessage(),
            ]);

            throw new CardImageUploadException(CardImageUploadException::REASON_STORAGE_FAILED);
        }

        // Erst jetzt, wo der neue Datensatz sicher steht, die alte Datei der ersetzten
        // Ebene entfernen — die räumt sonst niemand auf.
        if ($previous !== null && $previous['file_name'] !== $fileName) {
            $this->removeFile($this->uploadsDirectory . '/' . basename((string) $previous['file_name']));
        }

        return CardImageRepository::format($row);
    }

    private function ensureUploadsDirectory(): void
    {
        if (is_dir($this->uploadsDirectory)) {
            return;
        }

        if (!mkdir($this->uploadsDirectory, 0755, true) && !is_dir($this->uploadsDirectory)) {
            $this->logger->error('Ablageordner für Kartenbilder konnte nicht angelegt werden');

            throw new CardImageUploadException(CardImageUploadException::REASON_STORAGE_FAILED);
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
            $this->logger->warning('Kartenbild-Datei konnte nicht entfernt werden', [
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
