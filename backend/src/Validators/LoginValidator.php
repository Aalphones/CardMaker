<?php

declare(strict_types=1);

namespace App\Validators;

use App\Http\Response;
use Respect\Validation\ValidatorBuilder as v;

final class LoginValidator
{
    /**
     * Beim Anmelden wird nur auf „überhaupt ausgefüllt" geprüft. Eine Längen- oder
     * Formatregel hier würde verraten, wie das hinterlegte Passwort aussieht.
     *
     * @param array<string, mixed> $body
     * @return array{email: string, password: string}
     */
    public static function validate(array $body): array
    {
        $email = is_string($body['email'] ?? null) ? trim($body['email']) : '';
        $password = is_string($body['password'] ?? null) ? $body['password'] : '';

        $fields = [];

        if (!v::stringType()->length(v::greaterThanOrEqual(1))->isValid($email)) {
            $fields['email'] = 'Bitte die E-Mail-Adresse angeben.';
        }

        if (!v::stringType()->length(v::greaterThanOrEqual(1))->isValid($password)) {
            $fields['password'] = 'Bitte das Passwort angeben.';
        }

        if ($fields !== []) {
            Response::error(
                Response::ERROR_VALIDATION_FAILED,
                'Die Angaben sind unvollständig.',
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
