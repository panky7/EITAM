# Finish summary: static password gate

## What changed
1. `src/data/auth.ts` â€” stores the SHA-256 hash of the static password and the session-storage key; no plaintext password in source.
2. `src/components/PasswordGate.tsx` â€” new password-gate UI that hashes the user's input with the Web Crypto API and compares it to the stored hash before unlocking.
3. `src/App.tsx` â€” checks session storage on mount and renders `PasswordGate` when the session is locked, then falls through to the existing `LegacyApp`/`V1App` routing after unlock.
4. `README.md` â€” added an "Access" section explaining the gate and noting that the password is shared separately and not stored in plain text.

## Verification run
- `npx tsc --noEmit` â€” passed
- `npm run build` â€” passed
- `npm run test` â€” passed (45 tests across 7 files)

## Manual validation steps
1. Run `npm run dev` and open the app.
2. Confirm the password prompt appears before the dashboard.
3. Enter the wrong password and confirm the error message appears.
4. Enter the correct password and confirm the dashboard loads.
5. Reload the page and confirm the dashboard remains unlocked for the same browser session.
6. Open the app in a new incognito/private window and confirm the password prompt appears again.

## Follow-ups
- If true server-side authentication is ever required, replace this static gate with a backend auth flow.
- Consider rotating the password periodically; doing so requires updating `PASSWORD_HASH` in `src/data/auth.ts`.
