# 002 — Eigenständige App, keine Promptigofant-Integration

**Status:** Akzeptiert (2026-08-01)

## Kontext

Das ursprüngliche Konzept-Dokument beschreibt den Sammelkarten-Generator als Erweiterung
einer „bestehenden Webanwendung zur Verwaltung von Charakteren und Bildern" — das
beschreibt inhaltlich Promptigofant (Charakter-/Outfit-/Actor-Bibliothek, gleicher
Techstack). Zu entscheiden: CardMaker als Modul auf Promptigofants bestehender
Charakter-/Bild-API und -DB aufbauen, oder eine eigenständige neue App mit eigener
Charakter-/Bildverwaltung.

## Entscheidung

**Eigenständige App.** CardMaker bekommt eine eigene Charakter- und Bildverwaltung von
Grund auf — eigenes Repo, eigene Datenbank, kein geteiltes Backend mit Promptigofant. Eine
spätere Import-Option (Charaktere/Bilder aus Promptigofant übernehmen, z.B. via Export/API)
bleibt möglich, ist aber nicht Teil des Starts.

## Konsequenzen

- Kein Kopplungsrisiko zwischen den Projekten — ein Promptigofant-Schema-Change kann
  CardMaker nie brechen und umgekehrt
- Charakter-/Bild-CRUD muss in CardMaker komplett neu gebaut werden (Meilenstein 1), statt
  eine bestehende API wiederzuverwenden — höherer initialer Aufwand
- Zwei separate Datenbestände zu pflegen, falls dieselben Charaktere in beiden Projekten
  auftauchen sollen (kein Sync-Mechanismus vorgesehen)
