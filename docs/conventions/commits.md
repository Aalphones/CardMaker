# Commit Conventions — CardMaker

> Gilt beim Committen im Auftrag des Users. Solo-Projekt — kein Commitlint-Hook.

## Logische Einheit pro Commit

Ein Commit pro abgeschlossener, verifizierbarer Änderung — Implementierung und
Doku-Updates zusammen.

**Wann committen:** wenn die Änderung fertig ist — abgeschlossene Plan-Phase, fertiger
Bugfix, ein Refactor, das den Baum konsistent zurücklässt. Nie mitten in einer Phase oder
„um Fortschritt zu sichern" committen.

**Was zusammengehört:** alles, was die Änderung End-to-End funktionsfähig macht (z.B.
Migration + Model + Service + Route + Doku-Update). Unabhängige Fixes, die dabei auffallen,
kommen in einen eigenen Commit. Aufteilen, wenn eine Änderung klar unabhängige Seiten
berührt (Backend vs. Frontend) und jede Seite für sich landen kann.

## Conventional-Commits-Format

```
<type>(<scope>): <subject>

<body — das WARUM>
```

- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`, `build`, `style`, `ci`, `test`
- Scope-Beispiele: `auth`, `characters`, `images`, `templates`, `cards`, `print-projects`,
  `rendering`, `canvas`, `db`, `build`
- Subject: Imperativ, kleingeschrieben, kein Punkt am Ende, ≤72 Zeichen — beschreibt das
  Ergebnis
- Body: erklärt das Warum, nicht das Was (der Diff zeigt das Was)

**Reviewability:** wer nur Message + Diff liest, versteht die Änderung ohne externen
Kontext. Betroffene Docs werden im selben Commit aktualisiert, nicht später.

## Pushen

Nach dem Commit explizit mit Branch-Namen pushen (`git push origin <branch>`), nie blankes
`git push`.

**Pre-Commit-Hooks nie mit `--no-verify` umgehen.**
