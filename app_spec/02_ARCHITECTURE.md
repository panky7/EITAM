# 02 — Architecture & Tech Spec

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Matches the validated prototype; TS gives Codex/devs a typed data model to work against (see doc 03) |
| Build tool | Vite | Fast local dev, minimal config, no need for SSR/routing complexity — this is a single-page tool |
| Styling | Tailwind CSS | Matches the prototype's utility-class approach; no custom CSS files needed beyond `index.css` for Tailwind directives |
| Charts | Recharts | Used in the prototype for the cost/benefit bar charts; keep for consistency |
| Icons | lucide-react | Used in the prototype for workstream icons and nav icons |
| State | React `useState`/`useMemo` only | App is small and single-user; no Redux/Zustand/Context needed — see §3 |
| Routing | None | 3 views are tab state (`useState<'dashboard'|'budget'|'workstream'>`), not routes — no back-button/deep-link requirement in v1 |

No backend. No environment variables required for v1 (nothing to configure — all data is local
constants per doc 03).

## 2. Folder structure

```
eam-scenario-modeller/
├── src/
│   ├── data/
│   │   ├── workstreams.ts        # WORKSTREAMS array + Workstream type
│   │   ├── partners.ts           # Partner rate card constants + partner share tables
│   │   └── derived.ts            # TOTAL_FULL_COST, TOTAL_FULL_BENEFIT, FULL_MULTIPLE, LAST_YEAR_COST
│   ├── lib/
│   │   ├── calculations.ts       # computeAllocation(), partnerBreakdownFor(), pure functions only
│   │   └── format.ts             # fmtM(), fmtX(), color helpers (multipleColor, coverageColor, coverageLabel)
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── CoverageBar.tsx
│   │   ├── WorkstreamTile.tsx
│   │   ├── TabNav.tsx
│   │   ├── views/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BudgetWhatIf.tsx
│   │   │   └── WorkstreamWhatIf.tsx
│   ├── App.tsx                   # shell: header + TabNav + active view
│   ├── main.tsx                  # ReactDOM.createRoot entry point
│   └── index.css                 # Tailwind directives only
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md                     # short "npm install && npm run dev" — not this spec package
```

**Why `lib/calculations.ts` is separated from components:** every formula in doc 03 must be a pure
function with no React dependency, so it can be unit-tested directly (see doc 03 §5 test checklist)
without rendering anything. Components call these functions; they never reimplement the math inline.

## 3. State management

All app state lives in the 3 view components plus one piece of shell state:

```ts
// App.tsx
const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'workstream'>('dashboard');

// BudgetWhatIf.tsx
const [budgetM, setBudgetM] = useState<number>(TOTAL_FULL_COST / 1_000_000 / 2); // default: half of full plan, in millions
const [strategy, setStrategy] = useState<'priority' | 'even'>('priority');

// WorkstreamWhatIf.tsx
const [selected, setSelected] = useState<Set<WorkstreamId>>(new Set());
```

Derived values (allocation results, totals, chart data) are computed with `useMemo`, recalculated from
the above state plus the constants in `data/`. Nothing async, nothing needs `useEffect` in v1 — this
is a pure-calculation UI, not a data-fetching one. **If a Codex change introduces `useEffect` for
recomputing displayed numbers, that's a signal something's been modeled wrong — recomputation should
happen inline via `useMemo`, not as a side effect.**

## 4. Build & run

```bash
npm create vite@latest eam-scenario-modeller -- --template react-ts
cd eam-scenario-modeller
npm install recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# configure tailwind.config.ts content paths to ./src/**/*.{ts,tsx}
npm run dev
```

## 5. Testing approach

- Unit tests for every function in `lib/calculations.ts` against the expected values in doc 03 §5 —
  use Vitest (ships with Vite) or Jest, either is fine, pick one and be consistent.
- No component/integration test framework is required for v1 given the small surface area, but if one
  is added, React Testing Library is the natural choice given the stack.

## 6. Deployment

Static build output (`npm run build` → `dist/`) — deployable to any static host (internal H&M
intranet, Netlify, Vercel static, S3+CloudFront, etc.). No server-side requirements. This is a
decision for whoever owns hosting; not prescribed further here.
