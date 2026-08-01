# STATE

**Aktiver Plan:** `docs/planning/2026-08-01_fundament-und-grundgeruest/`
**Phase:** 4/9 — Login & Zugriffstoken im Backend (gebaut, Prüfung am Server offen)
**Nächster Schritt:** Das erste und einzige Konto über `POST /api/setup` anlegen — dafür
fehlen E-Mail und Passwort von Sascha — und danach die offenen Handproben aus
`phase-4-auth-backend.md` fahren (Anmelden, Abrufen, Abmelden, abgelaufene Sitzung,
Zugriffstoken erzeugen/löschen, Protokolldatei ansehen). Backend liegt seit dem
Hochladen am 2026-08-01 auf Strato, elf Aufrufe ohne Konto sind grün — die Sperre
greift, die SQL läuft. Erst danach ist Phase 4 `complete` und Phase 5 (Frontend-Gerüst,
standard) dran.
