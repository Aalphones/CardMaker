# Clients — CardMaker Frontend

Es gibt keine eigene Client-Klasse pro Feature — jede NgRx-Effekt-Datei ruft den
generischen `Api`-Service (`frontend/src/app/core/services/api.ts`) direkt mit dem Pfad
auf. Diese Datei listet, welche Effekt-Datei welchen Endpunkt anspricht, mit den
verwendeten Antworttypen. Endpunkt-Details (Methode, Prüfregeln): `docs/routes.md`.

`Api` selbst: `get`, `getBlob`, `post`, `patch`, `postForm`, `delete` — jede Methode hängt
den Pfad an `environment.apiBaseUrl` an, sonst kein eigenes Verhalten.

## Auth (`store/auth/auth.effects.ts`)

| Aufruf | Endpunkt | Antworttyp |
|---|---|---|
| `post` | `/auth/login` | `StoredAuth` |
| `post` | `/auth/logout` | – |

`features/auth/login/login.ts` ruft zusätzlich `get('/health')` fürs Vorab-Prüfen.

## Zugriffstoken (`store/tokens/tokens.effects.ts`)

| Aufruf | Endpunkt | Antworttyp |
|---|---|---|
| `get` | `/tokens` | `TokensListResponse` |
| `post` | `/tokens` | `AccessTokenWithSecret` |
| `delete` | `/tokens/{id}` | – |

## Kartengruppen (`store/card-groups/card-groups.effects.ts`)

| Aufruf | Endpunkt | Antworttyp |
|---|---|---|
| `get` | `/card-groups` | `CardGroupsListResponse` |
| `post` | `/card-groups` | `CardGroup` |
| `patch` | `/card-groups/{id}` | `CardGroup` |
| `delete` | `/card-groups/{id}` | – |

## Bildvorrat (`store/assets/assets.effects.ts`)

| Aufruf | Endpunkt | Antworttyp |
|---|---|---|
| `get` | `/assets` | `AssetsListResponse` |
| `postForm` | `/assets` | `Asset` |
| `delete` | `/assets/{id}` | – |

`shared/canvas/asset-image-loader.ts` lädt zusätzlich `getBlob('/assets/{id}/file')` fürs
Canvas.

## Schriftvorrat (`store/fonts/fonts.effects.ts`)

| Aufruf | Endpunkt | Antworttyp |
|---|---|---|
| `get` | `/fonts` | `FontsListResponse` |
| `postForm` | `/fonts` | `Font` |
| `patch` | `/fonts/{id}` | `Font` |
| `delete` | `/fonts/{id}` | – |

`shared/canvas/font-loader.ts` lädt zusätzlich `getBlob('/fonts/{id}/file')` fürs Canvas.

## Templates (`store/templates/templates.effects.ts`)

| Aufruf | Endpunkt | Antworttyp |
|---|---|---|
| `get` | `/templates` | `TemplatesListResponse` |
| `get` | `/templates/{id}` | `Template` |
| `post` | `/templates` | `Template` |
| `patch` | `/templates/{id}` | `Template` |
| `delete` | `/templates/{id}` | – |

## Karten

Backend steht seit Phase 2 des Karteneditor-Plans (`docs/planning/2026-08-10_karteneditor/`),
der Frontend-Slice (`store/cards/`, Effekt-Datei) kommt erst in Phase 4. Sobald er existiert,
gehört hier eine Zeile pro Aufruf dazu — Kontrakt und Endpunkte: `docs/routes.md`.
