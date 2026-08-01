<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Gemeinsame Grundlage für Anmelde- und Zugriffstoken (ADR-008): 32 Zufallsbytes als
 * Hexzeichenkette, gespeichert wird nur der SHA-256-Wert. Kein Salz und keine
 * Schlüsselstreckung — der Wert ist bereits zufällig und lang genug; der Hash sorgt nur
 * dafür, dass ein Datenbankleck nicht sofort gültige Token liefert.
 */
final class TokenService
{
    public function generate(): string
    {
        return bin2hex(random_bytes(32));
    }

    public function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
