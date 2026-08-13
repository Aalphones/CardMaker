<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class FontValidator
{
    /** Von {@see \App\Services\MetaService} als `fonts.nameMaxLength` verwendet. */
    public const NAME_MAX_LENGTH = 191;

    /**
     * Die Datei selbst wird hier nicht geprüft — dafür müsste der Prüfer sie lesen, und das
     * gehört in den Dienst.
     *
     * @param array<string, mixed> $body
     * @return array{name: string}
     */
    public static function validate(array $body): array
    {
        $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';

        if (!v::stringType()->length(v::between(1, self::NAME_MAX_LENGTH))->isValid($name)) {
            self::fail(['name' => 'Bitte einen Namen mit höchstens ' . self::NAME_MAX_LENGTH . ' Zeichen angeben.']);
        }

        return ['name' => $name];
    }

    /** @param array<string, string> $fields */
    private static function fail(array $fields): never
    {
        Response::error(
            Response::ERROR_VALIDATION_FAILED,
            'Die Angaben sind unvollständig oder falsch.',
            422,
            $fields
        );
    }
}
