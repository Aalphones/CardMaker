<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class SetupValidator
{
    public const MINIMUM_PASSWORD_LENGTH = 12;

    /**
     * @param array<string, mixed> $body
     * @return array{email: string, password: string}
     */
    public static function validate(array $body): array
    {
        $email = is_string($body['email'] ?? null) ? trim($body['email']) : '';
        $password = is_string($body['password'] ?? null) ? $body['password'] : '';

        $fields = [];

        if (!v::stringType()->email()->length(v::lessThanOrEqual(191))->isValid($email)) {
            $fields['email'] = 'Bitte eine gültige E-Mail-Adresse angeben.';
        }

        if (!v::stringType()->length(v::greaterThanOrEqual(self::MINIMUM_PASSWORD_LENGTH))->isValid($password)) {
            $fields['password'] = 'Das Passwort braucht mindestens ' . self::MINIMUM_PASSWORD_LENGTH . ' Zeichen.';
        }

        if ($fields !== []) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig oder falsch.',
                422,
                $fields
            );
        }

        return [
            'email' => $email,
            'password' => $password,
        ];
    }
}
