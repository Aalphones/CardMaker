# 004 — JWT + Personal Access Tokens für Auth

**Status:** Akzeptiert (2026-08-01)

## Kontext

CardMaker ist zwar ein Solo-Tool ohne Multi-User-Anspruch (siehe `docs/PROJECT.md` →
Nicht-Ziele), braucht aber Login: der geplante lokale MCP-Server (`mcp/`, Meilenstein 6)
greift skriptet auf dieselbe API zu wie das Browser-Frontend und braucht dafür einen von
Browser-Sessions unabhängigen Auth-Weg.

## Entscheidung

**JWT-Sessions für den Browser + Personal Access Tokens für skripteten Zugriff**, analog zu
Promptigofant. Kein Verzicht auf Auth trotz Single-User-Charakter — der MCP-Zugriff
rechtfertigt den Aufwand von Anfang an, ein Nachrüsten wäre teurer als das Vorziehen.

## Konsequenzen

- `firebase/php-jwt` als Backend-Dependency von Anfang an
- PAT-Scopes müssen beim Hinzufügen neuer Endpoints gepflegt werden (siehe
  `docs/conventions/mcp.md`, sobald `mcp/` existiert)
- Kein Aufwand für Multi-User-Rollen/Rechte — ein Account reicht, Auth dient hier primär der
  Trennung Browser-Session vs. Skript-Zugriff, nicht der Zugriffskontrolle zwischen Nutzern
