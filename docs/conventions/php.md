# PHP Conventions — CardMaker

> **Source-of-truth references:**
> - Promptigofant `docs/conventions/coding-style.md` (gleicher Stack, adaptiert)
> - [PSR-12](https://www.php-fig.org/psr/psr-12/)
>
> Projekt-Overrides unten haben Vorrang vor allgemeinen Coding-Style-Regeln.

## Stack

| Layer | Choice |
|---|---|
| PHP | 8.5, `declare(strict_types=1)` in jeder Datei |
| DB | MySQL 8.x, ausschließlich Prepared Statements |
| Package Manager | Composer |

## Regeln

- **PSR-12**, typisierte Properties und Return-Types überall — kein implizites `mixed`
- Prepared Statements für jede DB-Query — keine String-Interpolation in SQL
- Constructor Promotion für einfache DTOs; `readonly` für Werte, die sich nach Konstruktion
  nie ändern
- Kein `@`-Error-Suppression — Fehler explizit behandeln
- Namespace: `App\`-Root, spiegelt `backend/src/`-Ordnerstruktur

## File Layout

```
backend/src/
  Controllers/    ← dünn: validieren → Service aufrufen → JSON zurückgeben
  Services/       ← Business-Logik, kein HTTP-Wissen
  Repositories/   ← rohe DB-Queries, typisierte Arrays/Objekte
  Validators/     ← respect/validation-Ketten, eine Klasse pro Endpoint
  Rendering/       ← Karten-/Druckbogen-Rendering (Layer-Kompositing)
  Database/       ← Connection-Singleton, MigrationRunner
  Migrations/     ← nummerierte Migrationsdateien
  Middleware/     ← CORS, Auth, RateLimit
```

## Fehlerantworten immer JSON

```php
http_response_code(422);
echo json_encode(['error' => 'validation_failed', 'fields' => $errors]);
exit;
```

## Composition Root (`backend/public/index.php`)

Services, die sowohl in der `$makeController`-Closure **als auch** im Dispatch-Abschnitt
gebraucht werden (z.B. für Middleware), als geteilte Top-Level-Variable deklarieren — nicht
zweimal instanziieren. In die Closure per `use` hineinreichen.

```php
// richtig — eine Instanz, überall geteilt
$sharedFooService = $db ? new FooService(new FooRepository($db)) : null;
$makeController = function (string $class) use (..., $sharedFooService) { ... };

// falsch — zwei Instanzen pro Request (einmal in makeController, einmal im Dispatch)
```

## Wire-Format

CamelCase rein, camelCase raus — snake_case nur innerhalb des Backends:

- `Request::camelToSnake()` läuft im Constructor, konvertiert jeden eingehenden JSON-Key zu
  `snake_case`, bevor Controller/Validator ihn sehen
- Controller und Validatoren nutzen **immer** snake_case: `$body['image_ids']`, nicht
  `$body['imageIds']`
- Response-Formatter (`Repository::format*()`) konvertieren vor dem Zurückgeben wieder zu
  camelCase

```
Frontend sendet:  { "imageIds": [1, 2, 3] }
Backend speichert: $body['image_ids'] = [1, 2, 3]
Backend liefert:   { "imageIds": [1, 2, 3] }
```

## Rendering-Layer (`Rendering/`)

Karten- und Druckbogen-Rendering ist reine Business-Logik ohne HTTP-Wissen — testbar wie
jeder andere Service (siehe [`testing.md`](testing.md)). Layer-Kompositing folgt der
Render-Reihenfolge ImageLayer → ShapeLayer → IconLayer → FrameLayer → TextLayer, immer
bezogen auf das interne 630×880-Canvas, skaliert erst am Ende auf Zielauflösung.

## Comments

Default: **keine Kommentare**. Nur wenn das WARUM nicht offensichtlich ist: eine Constraint,
eine subtile Invariante, ein Strato-spezifischer Workaround.

## Critical Rules

1. **`declare(strict_types=1)` in jeder Datei** — sonst PHP-Typjonglage in einer Domäne mit
   Fließkommapositionen (Canvas-Einheiten), wo das leise falsche Werte erzeugt.
2. **Prepared Statements ausnahmslos** — auch für interne/Admin-Queries.
3. **Wire-Format-Grenze nie durchbrechen** — camelCase existiert innerhalb des Backends nie,
   snake_case nie außerhalb.
4. **Rendering-Logik bleibt HTTP-frei** — `Rendering/`-Klassen kennen kein `$_SERVER`, keine
   Response-Objekte, damit sie ohne Webserver-Kontext unit-testbar bleiben.
