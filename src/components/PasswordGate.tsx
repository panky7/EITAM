import { useState, type FormEvent } from 'react';
import { AUTH_STORAGE_KEY, PASSWORD_HASH } from '../data/auth';
import { INK, PAPER } from '../lib/format';

interface PasswordGateProps {
  onUnlock: () => void;
}

async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setBusy(true);
    setError(false);

    try {
      const hash = await sha256Hex(password.trim());
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'unlocked');
        onUnlock();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            H&M Enterprise Asset Management
          </div>
          <h1 className="mt-2 text-xl font-semibold">Restricted Access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the password to open the modeller.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              disabled={busy}
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#1B4B66] focus:ring-1 focus:ring-[#1B4B66] disabled:opacity-60"
              placeholder="Password"
            />
            {error ? (
              <p className="mt-2 text-sm text-[#C4432B]">
                Incorrect password. Please try again.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={busy || !password.trim()}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#1B4B66' }}
          >
            {busy ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
