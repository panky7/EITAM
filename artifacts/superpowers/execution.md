# Execution notes: static password gate

## Step 1: Add the hashed password constant
- Files changed: `src/data/auth.ts` (created)
- Added `PASSWORD_HASH` (SHA-256 hex of user-supplied password) and `AUTH_STORAGE_KEY`.
- Verification: `npx tsc --noEmit` passed.

## Step 2: Build the PasswordGate component
- Files changed: `src/components/PasswordGate.tsx` (created)
- Added password input, submit handler, SHA-256 hashing via Web Crypto API, error state, and `sessionStorage` unlock persistence.
- Verification: `npx tsc --noEmit` passed.

## Step 3: Wire the gate into App.tsx
- Files changed: `src/App.tsx`
- Added `unlocked` state seeded from `sessionStorage`; renders `<PasswordGate />` until unlocked, then routes to `LegacyApp`/`V1App` as before.
- Verification: `npx tsc --noEmit` passed, `npm run build` passed.

## Step 4: Regression test
- Files changed: none
- Verification: `npm run test` passed (7 test files, 45 tests).

## Step 5: Document the password gate
- Files changed: `README.md`
- Added an "Access" section explaining the gate and noting that the password is shared separately and only its SHA-256 hash lives in source.
- Verification: `npm run build` passed.
