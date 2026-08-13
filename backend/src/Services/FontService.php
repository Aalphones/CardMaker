<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Response;
use App\Repositories\FontRepository;
use App\Repositories\TemplateRepository;
use Psr\Log\LoggerInterface;
use Throwable;

final class FontService
{
    /** Von {@see MetaService} als `uploads.fontMaxBytes` verwendet. */
    public const MAX_BYTES = 2097152;

    /**
     * Die ersten vier Bytes entscheiden, welche Schriftart vorliegt — die Dateiendung nie.
     * `\x00\x01\x00\x00` und `true` sind beides TrueType (Windows- und Mac-Prägung),
     * Sammlungen (`ttcf`) fehlen bewusst: sie enthalten mehrere Schriften und wären im
     * Browser nicht eindeutig ladbar.
     */
    private const SIGNATURES = [
        'wOF2' => 'woff2',
        "\x00\x01\x00\x00" => 'ttf',
        'true' => 'ttf',
        'OTTO' => 'otf',
    ];

    private const MIME_TYPES = [
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'otf' => 'font/otf',
    ];

    public function __construct(
        private readonly FontRepository $fonts,
        private readonly TemplateRepository $templates,
        private readonly string $uploadsDirectory,
        private readonly LoggerInterface $logger
    ) {
    }

    /** @return array<int, array<string, mixed>> */
    public function list(): array
    {
        return array_map(
            static fn (array $row): array => FontRepository::format($row),
            $this->fonts->all()
        );
    }

    /**
     * @param array<string, mixed> $file Eintrag aus `$_FILES`
     * @param array{name: string} $data
     * @return array<string, mixed>
     */
    public function create(array $file, array $data): array
    {
        $this->guardUploadError($file);

        $temporaryPath = is_string($file['tmp_name'] ?? null) ? $file['tmp_name'] : '';

        if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
            throw new FontUploadException(FontUploadException::REASON_MISSING_FILE);
        }

        $byteSize = (int) ($file['size'] ?? 0);

        if ($byteSize > self::MAX_BYTES) {
            throw new FontUploadException(FontUploadException::REASON_TOO_LARGE);
        }

        return $this->store($temporaryPath, $byteSize, $this->detectFormat($temporaryPath), $data);
    }

    /** @return array<string, mixed>|null */
    public function rename(int $id, string $name): ?array
    {
        $row = $this->fonts->updateName($id, $name);

        return $row === null ? null : FontRepository::format($row);
    }

    /** Datensatz und Datei entfernen. Fehlt die Datei schon, ist das kein Fehler. */
    public function delete(int $id): bool
    {
        $row = $this->fonts->find($id);

        if ($row === null) {
            return false;
        }

        $usingTemplate = $this->findUsingTemplate($id);

        if ($usingTemplate !== null) {
            Response::error(
                Response::ERROR_CONFLICT,
                'Diese Schrift wird noch im Template „' . $usingTemplate
                . '" benutzt und kann deshalb nicht gelöscht werden.',
                409
            );
        }

        $this->removeFile($this->absolutePath($row));

        return $this->fonts->delete($id);
    }

    /**
     * Löschsperre wie bei den Bildern: die Layout-Blöcke laden und in PHP durchsehen, statt
     * per SQL im JSON zu suchen — bei der Menge an Templates eines Einzelplatz-Werkzeugs
     * bringt eine DB-seitige Suche keinen messbaren Vorteil.
     *
     * @return string|null Name des ersten Templates, das die Schrift benutzt.
     */
    private function findUsingTemplate(int $fontId): ?string
    {
        $family = FontRepository::family($fontId);

        foreach ($this->templates->allLayerBlobsWithName() as $template) {
            $layers = json_decode($template['layers'], true);

            if (!is_array($layers)) {
                continue;
            }

            foreach ($layers as $layer) {
                if (is_array($layer) && ($layer['font_family'] ?? null) === $family) {
                    return $template['name'];
                }
            }
        }

        return null;
    }

    /** @return array{path: string, mimeType: string}|null */
    public function locateFile(int $id): ?array
    {
        $row = $this->fonts->find($id);

        if ($row === null) {
            return null;
        }

        $path = $this->absolutePath($row);

        if (!is_file($path)) {
            return null;
        }

        return ['path' => $path, 'mimeType' => self::MIME_TYPES[(string) $row['format']] ?? 'font/ttf'];
    }

    /** @param array<string, mixed> $file */
    private function guardUploadError(array $file): void
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_OK) {
            return;
        }

        if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
            throw new FontUploadException(FontUploadException::REASON_TOO_LARGE);
        }

        if ($error === UPLOAD_ERR_NO_FILE) {
            throw new FontUploadException(FontUploadException::REASON_MISSING_FILE);
        }

        $this->logger->error('Hochladung mit unerwartetem PHP-Fehlercode', ['code' => $error]);

        throw new FontUploadException(FontUploadException::REASON_STORAGE_FAILED);
    }

    /** Nur der Dateianfang zählt; ein umbenanntes PNG fällt hier durch. */
    private function detectFormat(string $temporaryPath): string
    {
        $handle = fopen($temporaryPath, 'rb');

        if ($handle === false) {
            throw new FontUploadException(FontUploadException::REASON_STORAGE_FAILED);
        }

        $signature = fread($handle, 4);
        fclose($handle);

        if (!is_string($signature) || !isset(self::SIGNATURES[$signature])) {
            throw new FontUploadException(FontUploadException::REASON_UNSUPPORTED_FORMAT);
        }

        return self::SIGNATURES[$signature];
    }

    /**
     * @param array{name: string} $data
     * @return array<string, mixed>
     */
    private function store(string $temporaryPath, int $byteSize, string $format, array $data): array
    {
        $this->ensureUploadsDirectory();

        // Erst der Datensatz, dann die Datei: der Ablagename ist die Kennung, und die
        // vergibt die Datenbank. Der vom Browser gelieferte Name wird nie zum Pfad.
        $row = $this->fonts->insert([
            'name' => $data['name'],
            'format' => $format,
            'byte_size' => $byteSize,
        ]);

        $id = (int) ($row['id'] ?? 0);
        $fileName = $id . '.' . $format;

        try {
            if (!move_uploaded_file($temporaryPath, $this->uploadsDirectory . '/' . $fileName)) {
                throw new FontUploadException(FontUploadException::REASON_STORAGE_FAILED);
            }

            $stored = $this->fonts->setFileName($id, $fileName);
        } catch (Throwable $exception) {
            // Ein Eintrag ohne Datei wäre eine Schrift, die in der Liste steht und beim
            // Laden still scheitert — lieber gar keiner.
            $this->removeFile($this->uploadsDirectory . '/' . $fileName);
            $this->fonts->delete($id);

            $this->logger->error('Schriftdatei konnte nicht abgelegt werden', [
                'message' => $exception->getMessage(),
            ]);

            throw new FontUploadException(FontUploadException::REASON_STORAGE_FAILED);
        }

        return FontRepository::format($stored ?? $row);
    }

    private function ensureUploadsDirectory(): void
    {
        if (is_dir($this->uploadsDirectory)) {
            return;
        }

        if (!mkdir($this->uploadsDirectory, 0755, true) && !is_dir($this->uploadsDirectory)) {
            $this->logger->error('Ablageordner für Schriften konnte nicht angelegt werden');

            throw new FontUploadException(FontUploadException::REASON_STORAGE_FAILED);
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
            $this->logger->warning('Schriftdatei konnte nicht entfernt werden', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /** @param array<string, mixed> $row */
    private function absolutePath(array $row): string
    {
        return $this->uploadsDirectory . '/' . basename((string) $row['file_name']);
    }
}
