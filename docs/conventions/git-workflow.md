# Git Workflow Conventions — CardMaker

## Branch-Strategie

Einzelner `main`-Branch. Kein Feature-Branch-Zwang (Solo-Projekt) — direkt auf `main`.
Ausnahme: riskante oder nicht umkehrbare Änderungen bekommen einen eigenen Branch zum
Gegenlesen.

## Conventional Commits

Siehe [`commits.md`](commits.md) für Format und Größenrichtwerte.

## Atomic-Commit-Regeln

1. **Ein Anliegen pro Commit.** Datenschicht ODER Service ODER Component — nicht alles auf
   einmal.
2. **Jeder Commit muss bauen.** Kein halbfertiges Feature, das `ng build` oder PHP-Syntax
   bricht.
3. **Erst refactoren, dann erweitern.** Extract/Rename im eigenen Commit, danach Verhalten
   obendrauf.
4. **Migrationen allein.** DB-Migrationen sind immer ihr eigener Commit.
5. **Keinen unbeteiligten Code umformatieren.** Lint-Staged-Auto-Formatierung auf nicht
   angefassten Dateien zurücknehmen.

## Pre-Commit-Hooks (Husky + lint-staged)

Am Repo-Root konfiguriert, läuft automatisch bei jedem `git commit`:

- `lint-staged` auf gestagte Dateien:
  - `frontend/**/*.{ts,html,scss}` → `prettier --write`
  - Kein Backend-Formatter — kein Composer, kein `vendor/bin/php-cs-fixer` (ADR-006)

Der Hook handhabt **nur Formatierung** — kein ESLint, kein Commitlint. Linting ist ein
separates Gate (`npx ng lint`, siehe [`linting.md`](linting.md)).

**`--no-verify` ist verboten.** Schlägt ein Hook fehl: zugrunde liegendes Problem fixen, nie
umgehen.

## STATE.md & Pläne

Sobald der erste Plan existiert, trägt der Projekt-Root eine `STATE.md` als
Wiedereinstiegs-Pointer (aktiver Plan, Phase, nächster Schritt). Nicht Teil des
Bootstrap-Commits — entsteht mit dem ersten Plan.
