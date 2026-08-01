# Linting Conventions — CardMaker

> **Source-of-truth references:**
> - Promptigofant `docs/conventions/linting.md` (gleiche Policy, Selector-Prefix angepasst)

## Policy

- **Kein Baseline „bekannter" Fehler.** Ein grüner Lint-Lauf ist der einzig akzeptable
  Zustand. Wer den Baum anfasst, fixt vorhandene Lint-Findings mit, statt sie als
  „pre-existing" stehen zu lassen.
- **Ursache fixen, nicht Symptom.** `eslint-disable` nur bei echten False-Positives für ein
  bewusst korrektes Pattern — jedes Disable trägt einen Ein-Zeiler-Kommentar mit dem Warum.
- **Generierte Dateien nie von Hand für Lint anpassen** — sie sind von der Lint-Config
  ausgeschlossen.
- Der Pre-Commit-Hook läuft **nur Prettier** (Formatierung), **nicht** ESLint. Linting ist ein
  separates Gate: `npx ng lint` (aus `frontend/`) manuell laufen lassen, zero errors.

## Config-Entscheidungen (`frontend/eslint.config.js`)

- **Selector-Prefixes: `['app', 'cm']`.** `app` für Feature-Components, `cm` für geteilte
  Design-System-Primitives (`cm-input`, `cm-btn`, …), falls/sobald solche entstehen — noch
  nicht Teil des Starts, hier nur die Konvention vorab festgelegt.
- **`frontend/src/app/core/api/generated.ts` ist ausgeschlossen**, sobald ein
  OpenAPI-Codegen-Schritt existiert (analog Promptigofant) — Platzhalter-Regel, greift erst,
  wenn der Generator eingerichtet ist.

## Wann `eslint-disable` akzeptabel ist

Template-A11y-Regeln (`@angular-eslint/template/*`) nehmen die einfachste Widget-Form an.
Bekannte korrekte Ausnahmen (mit Begründungskommentar disablen):

- **Roving-Tabindex-Container** (`role="tablist"`, `role="menu"`): `(keydown)` auf dem
  Container, Fokus/`tabindex="0"` auf dem aktiven Kind — `interactive-supports-focus` flags
  den Container fälschlich.
- **Backdrop/Scrim-Dismiss**: Vollbild-Overlay, das per Klick schließt. Tastatur-User
  schließen per Escape oder explizitem Close-Button — das `aria-hidden`-Scrim ist kein
  Control.

Ein Click-Handler, der nur `$event.stopPropagation()` aufruft und der Ancestor selbst nicht
interaktiv ist → Handler ist tot, **löschen** statt disablen.

## Häufige echte Fixes (keine Disables)

- Ungenutzte Imports/Parameter → entfernen.
- Leere `ControlValueAccessor`-Stubs → Kommentar im Arrow-Body (`() => { /* replaced via
  registerOnChange */ }`).
- Verwaistes `<label>` → mit `for`/`id` verknüpfen oder `<span>` bei reinem Display-Label.
- Leeres Interface, das ein Supertype erweitert → `type`-Alias statt `interface`.
- Ternary als Statement → `if/else`.

## Critical Rules

1. **`npx ng lint` vor jedem Commit, der Frontend-Code berührt, manuell laufen lassen** —
   der Pre-Commit-Hook prüft es nicht.
2. **Jedes `eslint-disable` trägt einen Begründungskommentar** — ohne Begründung ist es ein
   verstecktes Symptom, kein dokumentierter Grenzfall.
