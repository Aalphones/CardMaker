# Definition-of-Done Verification — CardMaker

**Pflicht, bevor eine Task `- [x]` markiert wird.**

Tasks in Plänen tragen eine `**DoD**`-Checkliste. Nicht nach Bauchgefühl abhaken. Jeden
DoD-Punkt einzeln durchgehen und im Abschlussbericht sagen, was konkret geprüft wurde —
Dateipfad kontrolliert, Seite im Browser geöffnet, Konsolen-Output geprüft.

Steht ein Punkt „Seite rendert mit Header und Sidebar" — einzig akzeptabler Beleg ist, dass
die Seite tatsächlich geöffnet wurde. „Der Build war grün" ist kein Beleg dafür.

## Nur eine Ebene: manuell

CardMaker hat keine automatisierten Tests (siehe
[ADR-009](../decisions/009-keine-automatisierten-tests.md)). DoD-Verifikation ist damit die
**einzige** Prüfebene dieses Projekts — kein automatisierter Testlauf ergänzt sie. DoD-Punkte
werden einzeln smoke-getestet, besonders alles, was ein grüner Build/Type-Check nicht sieht
(Component tatsächlich eingebunden, Route tatsächlich verlinkt, Canvas tatsächlich
interaktiv, Endpoint tatsächlich erreichbar).

## Warum das wichtig ist

Stille Auslassungen lassen Build und Type-Check grün — sie fallen erst auf, wenn ein Mensch
hinschaut:

- leere SCSS-Stubs
- importierte, aber nie verdrahtete Components
- deklarierte, aber nie erreichbare Endpoints
- registrierte, aber nie verlinkte Routes

## Wenn in dieser Umgebung nicht verifizierbar

Erfordert ein DoD-Punkt einen echten Strato-Deploy oder Daten, die nur der User hat:

- Das explizit sagen.
- User bitten, diesen Punkt vor der Archivierung zu bestätigen.
- Task nicht im Namen des Users als erledigt markieren.

Bei Unsicherheit, ob ein Feature korrekt funktioniert: **User um Smoke-Test bitten** — es
gibt kein automatisiertes Mittel, es „zu beweisen".
