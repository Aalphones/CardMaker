# Architecture Decision Records — CardMaker

Nummeriert, chronologisch. Jede ADR ist unveränderlich, sobald akzeptiert — eine spätere
Kurskorrektur bekommt eine neue ADR, die auf die alte verweist, statt die alte zu editieren.

| # | Titel | Status |
|---|---|---|
| 001 | [Canvas-Rendering mit Konva.js](001-canvas-rendering-konva.md) | Akzeptiert |
| 002 | [Eigenständige App, keine Promptigofant-Integration](002-standalone-app-no-promptigofant-integration.md) | Akzeptiert |
| 003 | [Kein Offline-Modus](003-no-offline-mode.md) | Akzeptiert |
| 004 | [JWT + Personal Access Tokens für Auth](004-jwt-plus-pat-auth.md) | Abgelöst durch ADR-008 |
| 005 | [Client-seitiges Rendering statt Server-Rendering](005-client-side-rendering.md) | Akzeptiert |
| 006 | [Kein Composer, keine Bau-Automatik, Deploy per Skript](006-deployment-und-abhaengigkeiten.md) | Teilweise abgelöst durch ADR-012 (Composer-Verzicht), Rest gilt |
| 007 | [Charaktere: feste Kernfelder plus frei benannte Attribute](007-character-attributes.md) | Abgelöst durch ADR-011 |
| 008 | [Zufallstoken in der Datenbank statt JWT](008-opaque-tokens.md) | Akzeptiert |
| 009 | [Keine automatisierten Tests](009-keine-automatisierten-tests.md) | Akzeptiert |
| 010 | [Semantic CSS statt Tailwind](010-semantic-css-statt-tailwind.md) | Akzeptiert |
| 011 | [Keine Charakterverwaltung: Karten speichern ausgefüllte Templatefelder direkt](011-keine-charakterverwaltung.md) | Akzeptiert |
| 012 | [Composer und lokale PHP-Umgebung](012-composer-und-lokale-php-umgebung.md) | Akzeptiert |
| 013 | [Backend außerhalb des ausgelieferten Bereichs](013-backend-ausserhalb-des-webbereichs.md) | Akzeptiert |
| 014 | [Template-Layout als Datenblock statt Ebenentabelle](014-template-layout-als-datenblock.md) | Akzeptiert |
| 015 | [Bildablage außerhalb des Webbereichs, nur PNG](015-bildablage-und-dateiformate.md) | Akzeptiert |
| 016 | [Organic-Gestaltung als verbindliches Erscheinungsbild](016-organic-design-system.md) | Akzeptiert |
| 019 | [Eigene Schriften: berechneter Name, Blob statt CSS-Adresse](019-eigene-schriften.md) | Akzeptiert |
