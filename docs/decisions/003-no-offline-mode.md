# 003 — Kein Offline-Modus

**Status:** Akzeptiert (2026-08-01)

## Kontext

Promptigofant ist Offline-First (PWA, IndexedDB-Sync, Service Worker) — als Nachschlagewerk
für unterwegs sinnvoll. Zu entscheiden: übernimmt CardMaker dieselbe Architektur oder bleibt
es ein klassisches Online-Tool.

## Entscheidung

**Kein Offline-Modus, keine PWA.** CardMaker ist ein kreatives Desktop-Tool
(Template-/Karteneditor) — die Nutzungssituation ist nicht „unterwegs nachschlagen", sondern
„am Rechner gestalten". Ein Sync-Layer würde Komplexität hinzufügen, ohne einen realen
Anwendungsfall zu bedienen.

## Konsequenzen

- Kein `@angular/pwa`, kein `idb`, kein Service Worker, kein Sync-Layer im Store
- Einfachere Architektur: NgRx Effects sprechen direkt mit der API, kein
  Offline-Write-Queue-Mechanismus wie bei Promptigofants ADR-027/032
- CardMaker funktioniert nicht ohne Internetverbindung — akzeptiert, siehe Kontext
- Nachrüsten später möglich, aber nur nach expliziter Revision dieser ADR (siehe
  `docs/conventions/stack.md` → Critical Rules)
