# STATE

**Aktiver Plan:** `docs/planning/2026-08-01_fundament-und-grundgeruest/`
**Phase:** 7/9 — Kartengruppen (als Nächstes, Rating: standard → `sonnet` reicht)
**Nächster Schritt:** Phase 7 umsetzen — siehe `phase-7-kartengruppen.md`. Login-Flow steht:
Store-Slice `store/auth/` (Classic Store, Ausnahme von der Facade-Pflicht), `core/services/auth.ts`
mit Ablauf-Prüfung, Guard auf den Kindrouten des Rahmens, Anmeldeseite mit Einrichtungs-/
Ablauf-Hinweis, Zugriffstoken-Verwaltung unter `/tokens` mit eigener Facade
(`store/tokens/`). `npm run lint` und `npm run build` grün. Phase 7 ist der erste komplette
Durchstich Datenbank → Backend → Speicher → Oberfläche — ab hier vor jeder Backend-Prüfung
`deploy.cmd backend` laufen lassen (ADR-006, kein lokales PHP).
