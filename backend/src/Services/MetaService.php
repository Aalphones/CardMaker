<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\FontRepository;
use App\Validators\AssetValidator;
use App\Validators\CardGroupValidator;
use App\Validators\CardImageValidator;
use App\Validators\CardValidator;
use App\Validators\LayerValidator;
use App\Validators\PrintProjectValidator;

/**
 * Baut die Auskunft über die laufende API zusammen (`GET /api/meta`) — die Schema-Quelle des
 * MCP-Servers (`docs/planning/2026-08-13_mcp-server/`). Jeder Wert kommt aus der Prüfklasse,
 * die ihn ohnehin durchsetzt; hier wird nichts neu getippt.
 *
 * Die Canvas-Konstanten (630×880 Einheiten, 63×88 mm, 300 dpi) haben im Backend sonst keine
 * Heimat — Gegenstück im Frontend: `frontend/src/app/shared/canvas/rendering/layer.ts`
 * (`CANVAS_WIDTH`/`CANVAS_HEIGHT`) und `print.ts` (`PRINT_DPI`).
 */
final class MetaService
{
    private const CANVAS_WIDTH = 630;
    private const CANVAS_HEIGHT = 880;
    private const CANVAS_UNITS_PER_MM = 10;
    private const CARD_WIDTH_MM = 63;
    private const CARD_HEIGHT_MM = 88;
    private const CANVAS_PRINT_DPI = 300;

    public function __construct(private readonly FontRepository $fonts)
    {
    }

    /** @return array<string, mixed> */
    public function get(): array
    {
        return [
            'canvas' => [
                'width' => self::CANVAS_WIDTH,
                'height' => self::CANVAS_HEIGHT,
                'unitsPerMm' => self::CANVAS_UNITS_PER_MM,
                'cardWidthMm' => self::CARD_WIDTH_MM,
                'cardHeightMm' => self::CARD_HEIGHT_MM,
                'printDpi' => self::CANVAS_PRINT_DPI,
            ],
            'layers' => [
                'maxLayers' => LayerValidator::MAX_LAYERS,
                'types' => LayerValidator::TYPES,
                'shapeKinds' => LayerValidator::SHAPES,
                'sources' => LayerValidator::ICON_SOURCES,
                'textAligns' => LayerValidator::ALIGNS,
                'textVerticalAligns' => LayerValidator::VERTICAL_ALIGNS,
                'fieldKeyPattern' => LayerValidator::KEY_PATTERN,
                'colorPattern' => LayerValidator::HEX_PATTERN,
            ],
            'fonts' => [
                'builtIn' => LayerValidator::BUILT_IN_FONT_FAMILIES,
                'uploaded' => $this->uploadedFonts(),
            ],
            'cards' => [
                'nameMaxLength' => CardValidator::NAME_MAX_LENGTH,
                'valueKeyPattern' => CardValidator::KEY_PATTERN,
                'iconChoiceKeyPattern' => CardValidator::ICON_CHOICE_KEY_PATTERN,
                'valueMaxLength' => CardValidator::VALUE_MAX_LENGTH,
                'textOverrides' => [
                    'fontSizeMin' => CardValidator::TEXT_OVERRIDE_FONT_SIZE_MIN,
                    'fontSizeMax' => CardValidator::TEXT_OVERRIDE_FONT_SIZE_MAX,
                    'colorPattern' => CardValidator::HEX_PATTERN,
                    'flags' => CardValidator::TEXT_OVERRIDE_FLAGS,
                ],
                'imagePlacement' => [
                    'offsetMin' => CardImageValidator::OFFSET_MIN,
                    'offsetMax' => CardImageValidator::OFFSET_MAX,
                    'scaleMin' => CardImageValidator::SCALE_MIN,
                    'scaleMax' => CardImageValidator::SCALE_MAX,
                ],
            ],
            'cardGroups' => [
                'nameMaxLength' => CardGroupValidator::NAME_MAX_LENGTH,
                'descriptionMaxLength' => CardGroupValidator::DESCRIPTION_MAX_LENGTH,
            ],
            'assets' => [
                'kinds' => AssetValidator::KINDS,
            ],
            'uploads' => [
                'imageMaxBytes' => $this->imageMaxBytes(),
                'imageMimeTypes' => array_keys(CardImageService::MIME_TO_IMAGETYPE),
                'fontMaxBytes' => FontService::MAX_BYTES,
            ],
            'printProject' => [
                'quantityMin' => PrintProjectValidator::QUANTITY_MIN,
                'quantityMax' => PrintProjectValidator::QUANTITY_MAX,
            ],
        ];
    }

    /** @return array<int, array{id: int, name: string, family: string}> */
    private function uploadedFonts(): array
    {
        return array_map(
            static fn (array $row): array => [
                'id' => (int) $row['id'],
                'name' => (string) $row['name'],
                'family' => FontRepository::family((int) $row['id']),
            ],
            $this->fonts->all()
        );
    }

    /** Rückfallwert wie in {@see CardImageService::maxBytes()} — dieselbe Umgebungsvariable. */
    private function imageMaxBytes(): int
    {
        $configured = $_ENV['UPLOAD_MAX_BYTES'] ?? null;

        if (is_string($configured) && ctype_digit($configured) && (int) $configured > 0) {
            return (int) $configured;
        }

        return CardImageService::FALLBACK_MAX_BYTES;
    }
}
