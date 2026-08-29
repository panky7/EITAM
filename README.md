# H&M EAM Scenario Modeller

Client-side React + TypeScript scenario modeller for 12-month EAM budget and benefit planning.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run test
npm run build
```

## Access

The deployed app is protected by a static password gate. Enter the password on the landing prompt to unlock the dashboard for the current browser session.

The password is shared separately and is not stored in plain text in the repository. The app keeps only its SHA-256 hash in `src/data/auth.ts`.

This is a client-side deterrent only; the SHA-256 hash of the password is stored in the built bundle and can be brute-forced by a determined attacker. It is not a substitute for server-side authentication.
