<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class AssetValidator
{
    /** Von {@see \App\Services\MetaService} als `assets.kinds` verwendet. */
    public const KINDS = ['frame', 'icon', 'artwork'];

    /** Von {@see \App\Services\MetaService} als `assets.nameMaxLength` verwendet. */
    public const NAME_MAX_LENGTH = 191;

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
            $fields['kind'] = self::kindMessage();
        }

        if (!v::stringType()->length(v::between(1, self::NAME_MAX_LENGTH))->isValid($name)) {
            $fields['name'] = self::nameMessage();
        }

        if ($fields !== []) {
            self::fail($fields);
        }

        return ['kind' => $kind, 'name' => $name];
    }

    /**
     * Umbenennen ändert nur den Namen — `kind` und die Datei bleiben, wie sie sind. Deshalb
     * eine eigene Prüfung: {@see validate()} verlangt zusätzlich `kind`.
     *
     * @param array<string, mixed> $body
     * @return array{name: string}
     */
    public static function validateRename(array $body): array
    {
        $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';

        if (!v::stringType()->length(v::between(1, self::NAME_MAX_LENGTH))->isValid($name)) {
            self::fail(['name' => self::nameMessage()]);
        }

        return ['name' => $name];
    }

    /** Der Filter der Liste: nicht gesetzt heißt „alle", ein unbekannter Wert ist ein Fehler. */
    public static function validateKindFilter(mixed $kind): ?string
    {
        if ($kind === null || $kind === '') {
            return null;
        }

        if (!is_string($kind) || !in_array($kind, self::KINDS, true)) {
            self::fail(['kind' => self::kindMessage()]);
        }

        return $kind;
    }

    /** Zählt die erlaubten Arten aus {@see KINDS} auf, damit die Meldung nie veraltet. */
    private static function kindMessage(): string
    {
        $quoted = array_map(static fn (string $kind): string => '„' . $kind . '“', self::KINDS);

        return 'Bitte ' . implode(' oder ', $quoted) . ' angeben.';
    }

    private static function nameMessage(): string
    {
        return 'Bitte einen Namen mit höchstens ' . self::NAME_MAX_LENGTH . ' Zeichen angeben.';
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
