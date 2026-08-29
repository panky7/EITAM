## Goal
Add a lightweight, client-side static password gate to the H&M EAM Scenario Modeller so that loading the app first shows a password prompt and hides the main UI until the correct password is entered.

## Assumptions
- The app remains a static, no-backend Vite build; "blocking public access" here means a casual access barrier, not cryptographically secure authentication.
- The user-supplied password (`{Yh_cb]0#nu{Kqg[2ol4jjoFj9W1Sz`) will **not** be stored in plain text. Instead, a SHA-256 hash of the password is stored in the client bundle, and the component hashes the user's input at runtime to compare.
- We will persist the "unlocked" state only for the current browser session (`sessionStorage`) so users aren't re-prompted on reload but are blocked again in a new session.
- Existing calculation logic and the v0/v1 routing in `App.tsx` must continue to work unchanged.

## Plan

### Step 1: Add the hashed password constant
- **Files:** `src/data/auth.ts` (new)
- **Change:** Export `PASSWORD_HASH` as the SHA-256 hex digest of the user-supplied password, plus an `AUTH_STORAGE_KEY` constant. No plaintext password appears in source.
- **Verify:** `npx tsc --noEmit` passes.

### Step 2: Build the PasswordGate component
- **Files:** `src/components/PasswordGate.tsx` (new)
- **Change:** Create a presentational component with a password input, submit button, and error state for wrong password. On submit, hash the input with the Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`), compare the hex digest to `PASSWORD_HASH`, and on match write `AUTH_STORAGE_KEY = 'unlocked'` to `sessionStorage`. Centered, on-brand card using existing Tailwind tokens.
- **Verify:** Component compiles and appears in a manual dev-server smoke test (`npm run dev`).

### Step 3: Wire the gate into App.tsx
- **Files:** `src/App.tsx`
- **Change:** Before rendering `LegacyApp`/`V1App`, read `sessionStorage` and render `<PasswordGate />` when locked. After unlock, render the normal app.
- **Verify:** `npx tsc --noEmit` and `npm run build` pass; app shows gate first, then reveals UI.

### Step 4: Regression test
- **Files:** existing test files
- **Change:** none
- **Verify:** `npm run test` still passes; calculation outputs remain unchanged.

### Step 5: Document the password gate
- **Files:** `README.md` (append a short "Access" section)
- **Change:** Add the default password and note that it is stored as a hash and is a static, client-side gate only.
- **Verify:** `npm run build` still passes.

## Risks & mitigations
- **Hash still exposed in bundle:** the SHA-256 digest is public, so a determined attacker can brute-force or rainbow-table the password. Mitigation: README clearly states this is a casual deterrent, not secure auth.
- **Web Crypto API availability:** `crypto.subtle` requires a secure context (HTTPS or localhost). Local dev and typical static hosts over HTTPS satisfy this.
- **Automated tests/UI tests fail because of the gate:** the existing test suite focuses on `lib/calculations.ts`, so it is unaffected. If UI tests are added later, they can set the storage key before mounting.
- **User forgets the password:** keep it documented in README.

## Rollback plan
1. Remove the `PasswordGate` usage from `src/App.tsx`.
2. Delete `src/components/PasswordGate.tsx` and `src/data/auth.ts`.
3. Remove the "Access" section from `README.md`.
4. Run `npm run build` and `npm run test` to confirm baseline is restored.
