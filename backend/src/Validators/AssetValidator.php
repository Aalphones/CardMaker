<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class AssetValidator
{
    private const KINDS = ['frame', 'icon'];

    /**
     * @param array<string, mixed> $body
     * @return array{kind: string, name: string}
     */
    public static function validate(array $body): array
    {
        $fields = [];

        $kind = is_string($body['kind'] ?? null) ? trim($body['kind']) : '';
        $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';

        if (!in_array($kind, self::KINDS, true)) {
            $fields['kind'] = 'Bitte „frame“ oder „icon“ angeben.';
        }

        if (!v::stringType()->length(v::between(1, 191))->isValid($name)) {
            $fields['name'] = 'Bitte einen Namen mit höchstens 191 Zeichen angeben.';
        }

        if ($fields !== []) {
            self::fail($fields);
        }

        return ['kind' => $kind, 'name' => $name];
    }

    /** Der Filter der Liste: nicht gesetzt heißt „alle", ein unbekannter Wert ist ein Fehler. */
    public static function validateKindFilter(mixed $kind): ?string
    {
        if ($kind === null || $kind === '') {
            return null;
        }

        if (!is_string($kind) || !in_array($kind, self::KINDS, true)) {
            self::fail(['kind' => 'Bitte „frame“ oder „icon“ angeben.']);
        }

        return $kind;
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
