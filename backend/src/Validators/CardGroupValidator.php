<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class CardGroupValidator
{
    /** Von {@see \App\Services\MetaService} als `cardGroups.nameMaxLength` verwendet. */
    public const NAME_MAX_LENGTH = 191;
    /** Von {@see \App\Services\MetaService} als `cardGroups.descriptionMaxLength` verwendet. */
    public const DESCRIPTION_MAX_LENGTH = 2000;

    /**
     * @param array<string, mixed> $body
     * @return array{name: string, description: ?string}
     */
    public static function validate(array $body): array
    {
        $fields = [];

        $name = self::validatedName($body, $fields);
        $description = self::validatedDescription($body, $fields);

        if ($fields !== []) {
            self::fail($fields);
        }

        return ['name' => $name, 'description' => $description];
    }

    /**
     * Nur übergebene Felder werden geprüft — ein fehlendes Feld ist keine Löschung und
     * bleibt aus dem Ergebnis-Array draußen, ein explizit übergebenes `null` bei
     * `description` löscht die Beschreibung.
     *
     * @param array<string, mixed> $body
     * @return array{name?: string, description?: ?string}
     */
    public static function validateForUpdate(array $body): array
    {
        $fields = [];
        $result = [];

        if (array_key_exists('name', $body)) {
            $result['name'] = self::validatedName($body, $fields);
        }

        if (array_key_exists('description', $body)) {
            $result['description'] = self::validatedDescription($body, $fields);
        }

        if ($fields !== []) {
            self::fail($fields);
        }

        return $result;
    }

    /** @param array<string, mixed> $body */
    private static function validatedName(array $body, array &$fields): string
    {
        $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';

        if (!v::stringType()->length(v::between(1, self::NAME_MAX_LENGTH))->isValid($name)) {
            $fields['name'] = 'Bitte einen Namen mit höchstens ' . self::NAME_MAX_LENGTH . ' Zeichen angeben.';
        }

        return $name;
    }

    /** @param array<string, mixed> $body */
    private static function validatedDescription(array $body, array &$fields): ?string
    {
        $raw = $body['description'] ?? null;

        if ($raw === null) {
            return null;
        }

        $description = is_string($raw) ? trim($raw) : '';

        if ($description === '') {
            return null;
        }

        if (!v::stringType()->length(v::lessThanOrEqual(self::DESCRIPTION_MAX_LENGTH))->isValid($description)) {
            $fields['description'] = 'Die Beschreibung darf höchstens '
                . self::DESCRIPTION_MAX_LENGTH . ' Zeichen haben.';
        }

        return $description;
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
