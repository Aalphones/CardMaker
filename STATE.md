# STATE

**Aktiver Plan:** `docs/planning/2026-08-01_fundament-und-grundgeruest/`
**Phase:** 4/9 — Login & Zugriffstoken im Backend (als Nächstes, Rating: heikel → `opusplan` empfohlen)
**Nächster Schritt:** Phase 4 umsetzen — siehe `phase-4-auth-backend.md`. Grundlage steht:
Vier Tabellen live auf Strato angelegt (`users`, `sessions`, `personal_access_tokens`,
`card_groups`), `POST /api/migrate` scharf getestet (403 ohne Token, Migration angewandt,
zweiter Lauf leer). `Request` wird Controllern jetzt per Konstruktor gereicht, nicht als
Methodenparameter — der Wegweiser übergibt nur Pfad-Platzhalter.
