# STATE

**Aktiver Plan:** `docs/planning/2026-08-01_fundament-und-grundgeruest/`
**Phase:** 6/9 — Login im Frontend (als Nächstes, Rating: standard → `sonnet` reicht)
**Nächster Schritt:** Phase 6 umsetzen — siehe `phase-6-auth-frontend.md`. Frontend-Gerüst
steht: Angular 21 (nicht 22, siehe Abweichungen in Phase 5 — NgRx/ng2-konva hatten noch keine
Angular-22-Version), App-Rahmen mit Kopfleiste/Sidebar, Routing, Backend-Verbindung
(Interceptoren, Fehlerbehandlung, Benachrichtigungen), NgRx eingerichtet. `npm run lint` und
`npm run build` grün, per Screenshot geprüft. `core/auth/auth-storage.ts` liest/löscht bereits
`localStorage['cardmaker.auth']` — Phase 6 baut darauf `core/services/auth.ts` (Schreiben,
Ablauf-Prüfung) und den Store.
