---
name: visual-cook
description: Grilling session for visual work that pins fuzzy design language to concrete decisions, grounds disagreements in real renders, and leaves a self-documenting keeper harness as the durable spec. Use when a UI feels off, when establishing or extending a visual system, or when polishing a single detail.
---

<what-to-do>

Interview me relentlessly about the visual work until we share a concrete understanding. Walk each branch of the decision tree, resolving dependencies one at a time. Ask one question at a time, wait for my answer, and give your own recommended answer with each. Ask in prose — never the structured question UI.

No fuzzy word survives un-pinned. Every vague term ("cleaner", "premium", "pop", "off", "like Linear") ends up either decided on screen via a render or recorded as a decision in the harness — when the answer lives in the pixels, render and let me point rather than argue in prose.

**The harness is the deliverable and the record.** You build the winning spec *in the harness*, with its rationale next to it — you do not re-encode it into prose design docs (that lineage is retired; see "The harness is the record"). When the design is settled, the default is to hand the harness to a separate implementer chat — cooking is token-heavy, and exploration and implementation are opposite modes. Apply inline only for a small cook decided early.

</what-to-do>

<supporting-info>

## Orientation (the opening move)

You need two things before rendering, inferring the first from my opening sentence — never make me classify my request:

1. **What the harness shows** — the real component, unless the work is about the vocabulary itself (type ramp, spacing scale, color roles), in which case a specimen of it.
2. **What reference I'm grilling against** — any screenshot, URL, or product I supply; treat it as one more fuzzy word to pin.

**Material is supplied, never discovered.** Don't hunt the repo for design docs, Figma files, or brand systems — grill with whatever I hand you. The only thing you auto-locate is *code* (the real component to render).

**On resume, check whether we've cooked this before.** Read the cook index first (the `/dev/visual-cook` index page, backed by `index.ts` — see "The harness is the record") — it lists every prior cook, the real component it touched, what it settled, and its status. Past keeper harnesses are the memory of this work; an existing dir means you're resuming it, never overwrite it.

## During the session

### Sharpen fuzzy language (the core move)
Every vague word gets one counter-question forcing a concrete referent. "*Cleaner* — more whitespace, fewer borders, or lower contrast? Those diverge." A supplied reference is just another fuzzy word: "*Like Linear* — it uses near-zero borders and one accent; you want three. Reconcile?"

### Challenge the frame, not just the appearance
The interview's highest value is catching a *wrong premise* that no variant can show — e.g. realizing the thing being designed isn't what it's for ("this isn't a bio — it just shows their favorite books"). A wrong frame kills every variant at once. Surface it by naming the real case out loud, not by rendering more options.

### Probe states, not just the happy path
The visual equivalent of edge cases is *states*: hover, focus, active, disabled, empty, loading, error, long text, dark mode, 320px wide. "Feels off" usually hides in an unconsidered one. **Honor `prefers-reduced-motion`** — a motion variant that ignores it can't be judged and can't ship.

### Ground the spec against reality before locking
Never settle a decision against a guess about the real component. Mount the real thing and check the real values — a cook that settles on a fantasy (e.g. "the panel is fixed-height" when it's actually fluid) hands the implementer a broken spec. If you can't render the real component honestly, you can't lock.

## The harness

Three hard rules, in priority order:

1. **Real, in context, sized right.** Show the real artifact whole, inside a correctly-sized window of its real context — never clipped, never trapped behind a nested scrollbar, never shrunk to fit. Scope the *view* to the *question*: a component-level question ("how does this control read?") → isolate that component plus only the neighbors its interaction can collide with; a between-regions question ("does it fit / does this fix disturb the layout?") → the full app at real viewports. A device-frame that renders the actual page chrome and resizes is the gold standard. Never freeze a component's real in-context motion just to pin a layout.
2. **No fakes.** Any supporting component you put on screen must be the *real* one, imported or mounted from source. A hand-built lookalike is a bug, not a shortcut. If the real component needs auth or data, mount it behind a throwaway page with seeded data — that is the only sanctioned way to get it rendering.
3. **Real interactivity, verified.** Wire real `useState`/`onChange`/CSS transitions only when the question is about transition, timing, or state-change — and then verify it actually works (clickable, fires) before handing it over. Layout, spacing, type, and color are static; a specimen settles those faster. A static replica with hardcoded values posing as interactive is the classic failure.

Conventions:
- Scratch dir at the repo root mirror, served live under a namespaced route — `/visual-cook/<topic-slug>` (or the repo's existing dev-route convention, e.g. `dev/visual-cook/<topic-slug>`), using the **same slug**. Never a bare top-level route. Announce the dir path when you create it and the preview URL once it's serving.
- **Keep the harness tracked in git — never gitignore it.** In Next + Tailwind v4 + Turbopack, a gitignored dir gets no generated CSS and no HMR (novel utilities silently resolve to nothing). Tracked, never ignored.
- Show **current vs. 2–3 variants in one viewport**, labeled. Lanes **persist across iterations within a topic** — "V1 but tighter" edits V1 in place. Never collapse V1/V2 into a new V3 unasked; I judge against the labels.
- **Live dials, if present:** label one **primary** dial; mark the rest as guardrails (I shouldn't have to guess what each does). Dials coexist with labeled variants — I tune the chosen variant. Dialed numbers are *not* the spec; the landed value is.
- Build with the repo's existing stack; don't impose one.

## The harness is the record (this replaces DESIGN.md + DDRs)

The old DESIGN.md-dictionary + design-decision-record framing is retired — it came from a prose-is-the-artifact paradigm and was lossy: it drifted from live state, flattened the reasoning, and dropped the exact values and cascade mechanics, so every implementation restarted from a worse place. Instead:

- **Rationale lives in the harness, rendered next to what it's about** — a notes panel beside the lanes: what won, what was rejected and why, the exact settled values. It must be *rendered in the harness* so it's visible the moment the page opens and can't be skipped; a co-located `NOTES.md` is optional overflow only for what's too long to sit on screen. An artifact that carries its own rationale can't drift from its own state.
- **One cook index** across the repo — a `/dev/visual-cook` index page backed by a small `index.ts` data file (one entry per cook: `date · topic · real component · what settled · status · applied? · route`). The page maps the array to a table with each row linking into its live harness; the agent appends one entry at handoff. Statuses: settled · superseded · abandoned · wip — the superseded/abandoned rows are what stop a dead idea or wrong frame from being re-cooked. `applied` tracks the separate dimension of *did the verdict land in prod* (see the canonical harness section). This is the "have we worked on this before" memory, and the single data source any richer history view reads from.
- **Heavy, architectural "why" → project ADRs**, where it already lives richer than any cook doc.
- **Keepers are permanent.** Never delete a harness dir — not at handoff, not as cleanup, not after the values land in code. Commit them. They're the visual spec, the memory, and a playground to return to.

## Canonical harness (the skeleton)

Settled 2026-07-06 in a meta-cook whose judged artifact was the cook UI itself. There is deliberately **no generator**: the skeleton below is the canon and the propagation mechanism — paste it verbatim, then build the stage. The first conformant harness in a repo becomes that repo's living reference; chrome improvements are made **canon-first** (this file + that reference), never as per-repo forks. Old non-conforming harnesses stay as-is — no retrofit.

**Layout.** `<app-root>/dev/visual-cook/` holds: `index.ts` (the frozen `CookEntry` type below — created with cook #1 in every repo), a root `page.tsx` catalog (maps `COOK_INDEX` to a plain linked table, prod-guarded like any cook page — skeleton below), and per cook `<topic-slug>/page.tsx` (guard) + `<Topic>Cook.tsx`. Lanes are **one typed array** `{id, note, cfg}` rendered by one component — **route-per-variant is banned**. Label vocab: `CUR` / `V1..Vn`, with `LEAD` / `FAVE` / `FINAL` markers in the id; rejected lanes are kept as dimmed refs, never deleted. Three stage layout modes — `strip | stack | grid` — picked by the question and declared in the chrome.

**Chrome invariants** (auditable — check any cook against these):
- **Docked, never floating.** Every floating corner is taken in a real repo (Next dev indicator bottom-left, floating action buttons bottom-right, perf HUDs bottom-center at high z). The chrome is a collapsible **right sidebar**: panel-icon toggle at top, 44px rail when collapsed (vertical active-lane label), no internal dividers, collapsed `▸ verdict` section at the bottom, `‹ index` link.
- **Fixed neutral values, never host tokens** — identical chrome in every repo while the artifact renders in the repo's real system: surface `#131211/97` · hairline `#ffffff14` · ink `#E8E6E3` / `#B8B4AE` / `#7A756D` · active = `bg-[#ffffff0a] font-medium` (weight carries active, not a bright fill).
- **Type + radius are pinned, not themed.** `font-sans` resolves to the host repo's brand font and `rounded-md` rides its radius theme — both silently re-skin the chrome per repo. The canon uses `[font-family:system-ui]` (**one font, no mono anywhere** in the chrome, normal tracking) and `rounded-[6px]` / `rounded-[4px]` literals. Accepted residual leak: spacing utilities are rem-based, so a repo that changes root font-size scales chrome padding — rare; flag it, don't fix it.
- **`?lane=` deep link.** The URL mirrors the active lane so handoffs and index verdicts can point at a lane, not just a page. ←/→ + ↑/↓ cycle lanes even while collapsed.
- **Tailwind v4 resets buttons to `cursor:default`** — every chrome button carries `cursor-pointer` + a hover state. All transitions carry `motion-reduce:transition-none`.
- **Copied-not-linked honesty.** Stage values copied from prod (glow cfgs, springs, constants) are frozen — the harness header declares them as *copied*. Once the verdict ships and prod evolves, the keeper is the spec *of its settle date*, by design: importing live values would let prod refactors break keepers.
- **`applied` discipline.** A settled cook whose verdict needs a separate implement step gets `applied: 'pending'` in its index entry, flipped to the date it lands. The catalog renders it, so unshipped verdicts stay visible instead of rotting in prose.

**The skeleton** (paste verbatim, then build the stage):

```ts
// dev/visual-cook/index.ts — the catalog data. One entry per keeper cook; append at handoff.
export type CookStatus = 'settled' | 'superseded' | 'abandoned' | 'wip';

export type CookEntry = {
  date: string;      // YYYY-MM-DD — when the cook started
  topic: string;     // short slug-ish name of the cook
  component: string; // the real component / region it touched
  settled: string;   // ONE LINE — section title only; depth stays in the cook
  status: CookStatus;
  applied?: string;  // settled cooks with a separate implement step: YYYY-MM-DD it landed, or 'pending'
  route: string;     // the live keeper harness route
};

export const COOK_INDEX: CookEntry[] = [];
```

```tsx
// dev/visual-cook/page.tsx — the catalog: COOK_INDEX as a plain linked table (prod-guarded)
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COOK_INDEX, type CookStatus } from './index';

export const metadata = {
  title: 'visual-cook index',
  robots: { index: false, follow: false },
};

const STATUS_INK: Record<CookStatus, string> = {
  settled: 'text-[#E8E6E3]',
  wip: 'text-[#B8B4AE]',
  superseded: 'text-[#7A756D]',
  abandoned: 'text-[#7A756D] line-through',
};

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  const cooks = [...COOK_INDEX].reverse(); // newest first
  return (
    <main className="min-h-screen bg-[#0D0B0A] px-8 py-10 [font-family:system-ui]">
      <h1 className="text-[13px] font-medium text-[#E8E6E3] m-0">visual-cook — keeper harnesses</h1>
      <p className="text-[12px] text-[#7A756D] mt-1 mb-8">
        one row per cook · the row links the live harness · depth lives in each cook's own chrome, not here
      </p>
      <table className="w-full max-w-[1100px] border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-[#7A756D] font-normal">
            <th className="font-normal pb-2 pr-6">date</th>
            <th className="font-normal pb-2 pr-6">cook</th>
            <th className="font-normal pb-2 pr-6">status</th>
            <th className="font-normal pb-2">settled</th>
          </tr>
        </thead>
        <tbody className="align-top">
          {cooks.map(c => (
            <tr key={c.route} className="border-t border-[#ffffff14]">
              <td className="py-2.5 pr-6 whitespace-nowrap text-[#7A756D]">{c.date}</td>
              <td className="py-2.5 pr-6 whitespace-nowrap">
                <Link href={c.route} className="font-medium text-[#E8E6E3] hover:underline underline-offset-4 cursor-pointer">
                  {c.topic}
                </Link>
                <div className="text-[11px] text-[#7A756D] mt-0.5 max-w-[28ch] whitespace-normal">{c.component}</div>
              </td>
              <td className={`py-2.5 pr-6 whitespace-nowrap ${STATUS_INK[c.status]}`}>
                {c.status}
                {c.applied && (
                  <div className={`text-[11px] mt-0.5 ${c.applied === 'pending' ? 'text-[#B8B4AE] font-medium' : 'text-[#7A756D]'}`}>
                    prod: {c.applied}
                  </div>
                )}
              </td>
              <td className="py-2.5 leading-[1.55] text-[#B8B4AE]">{c.settled}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

```tsx
// dev/visual-cook/<topic-slug>/page.tsx — prod-guarded mount
import { notFound } from 'next/navigation';
import TopicCook from './TopicCook';

export const metadata = {
  title: '<repo> — <topic-slug> visual cook',
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <TopicCook />;
}
```

```tsx
'use client';

// <topic> visual-cook — <the question, one line>. KEEPER — never delete.
// Chrome: canonical (see the visual-cook skill) — edit canon-first, never per-repo.
// Stage values copied from prod on <date> (frozen — spec of the settle date, not a live link).

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Lane = { id: string; note: string; cfg: Record<string, unknown> };
const LANES: Lane[] = [
  { id: 'CUR', note: 'prod today, verbatim', cfg: {} },
  { id: 'V1 · <name>', note: '<what this lane tries>', cfg: {} },
];
const LANE_IDS = LANES.map(l => l.id);
const REJECTED_REFS: string[] = []; // lane ids moved here when rejected — kept, dimmed, still mountable

// Filled at settle — rendered in the chrome so the record can't drift from the artifact.
const VERDICT = { won: '', rejected: [] as string[], values: '' };
const META = { topic: '<topic-slug>', date: '<YYYY-MM-DD>', status: 'wip', mode: 'strip' }; // strip|stack|grid

function PanelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><line x1="14.5" y1="4" x2="14.5" y2="20" />
    </svg>
  );
}

export default function TopicCook() {
  const [lane, setLane] = useState(LANE_IDS[0]);
  const [open, setOpen] = useState(true);
  const [verdictOpen, setVerdictOpen] = useState(false);

  useEffect(() => { // ?lane= deep link — read once on mount…
    const q = new URLSearchParams(window.location.search).get('lane');
    if (q && LANE_IDS.includes(q)) setLane(q);
  }, []);
  useEffect(() => { // …mirror on change
    const url = new URL(window.location.href);
    url.searchParams.set('lane', lane);
    window.history.replaceState(null, '', url);
  }, [lane]);

  useEffect(() => { // arrow keys cycle lanes, even while collapsed
    const onKey = (e: KeyboardEvent) => {
      const i = LANE_IDS.indexOf(lane);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setLane(LANE_IDS[(i + 1) % LANE_IDS.length]); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setLane(LANE_IDS[(i - 1 + LANE_IDS.length) % LANE_IDS.length]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lane]);

  const active = LANES.find(l => l.id === lane) ?? LANES[0];
  const item = 'text-left rounded-[6px] px-3 py-2 [font-family:system-ui] text-[13px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none';
  const on = 'bg-[#ffffff0a] text-[#F2F0ED] font-medium';
  const off = 'text-[#B8B4AE] hover:bg-[#ffffff0a] hover:text-[#E8E6E3]';

  return (
    <div className="min-h-screen">
      {/* STAGE — the real composition in the repo's real system; mode declared in META.mode */}
      <main className={open ? 'mr-[300px]' : 'mr-11'}>
        {/* render the real artifact from active.cfg */}
      </main>

      {/* CHROME — canonical: fixed neutral values, docked right, never floating */}
      <aside className={`fixed inset-y-0 right-0 z-[300] bg-[#131211]/97 border-l border-[#ffffff14] flex flex-col transition-[width] duration-300 motion-reduce:transition-none overflow-hidden ${open ? 'w-[300px]' : 'w-11'}`}>
        <div className={`flex items-center gap-2.5 pt-3 pb-1 shrink-0 ${open ? 'px-3.5' : 'px-2.5'}`}>
          <button onClick={() => setOpen(!open)} aria-label={open ? 'collapse cook sidebar' : 'expand cook sidebar'}
            className="w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer text-[#7A756D] hover:text-[#E8E6E3] hover:bg-[#ffffff0d] transition-colors duration-150 motion-reduce:transition-none shrink-0">
            <PanelIcon />
          </button>
          {open && (
            <div className="min-w-0">
              <div className="[font-family:system-ui] text-[12px] text-[#B8B4AE] truncate">{META.topic} · {META.date}</div>
              <div className="[font-family:system-ui] text-[11px] text-[#7A756D] truncate">
                {META.status} · {META.mode} · <Link href="/dev/visual-cook" className="hover:text-[#E8E6E3] cursor-pointer">‹ index</Link> · ←/→
              </div>
            </div>
          )}
        </div>
        {!open && (
          <div className="mt-3 self-center [font-family:system-ui] text-[11px] text-[#B8B4AE] [writing-mode:vertical-rl]">{lane} · ←/→</div>
        )}
        {open && (
          <div className="flex flex-col h-full w-[300px] pb-4 pt-2 px-3.5 gap-6 overflow-y-auto">
            <div className="flex flex-col gap-0.5">
              {LANES.filter(l => !REJECTED_REFS.includes(l.id)).map(l => (
                <button key={l.id} onClick={() => setLane(l.id)} className={`${item} ${lane === l.id ? on : off}`}>
                  <div>{l.id}</div>
                  {lane === l.id && <div className="[font-family:system-ui] text-[12px] leading-[1.55] text-[#7A756D] mt-1 font-normal">{l.note}</div>}
                </button>
              ))}
              {REJECTED_REFS.length > 0 && <div className="[font-family:system-ui] text-[11px] text-[#7A756D] mt-2 mb-0.5 px-3">rejected refs</div>}
              {REJECTED_REFS.map(id => (
                <button key={id} onClick={() => setLane(id)} className={`${item} ${lane === id ? on : off}`}>{id}</button>
              ))}
            </div>
            {/* this cook's own levers (dials, toggles, copy-length switches) go here */}
            <div className="mt-auto px-1">
              <button onClick={() => setVerdictOpen(o => !o)}
                className="w-full text-left [font-family:system-ui] text-[11px] cursor-pointer text-[#7A756D] hover:text-[#E8E6E3] transition-colors duration-150 motion-reduce:transition-none">
                {verdictOpen ? '▾' : '▸'} verdict{VERDICT.won ? ` — why "${VERDICT.won.split(' — ')[0]}" shipped` : ' — open'}
              </button>
              {verdictOpen && (
                <div className="mt-2.5 [font-family:system-ui]">
                  <div className="text-[11px] text-[#7A756D] mb-1">shipped</div>
                  <p className="text-[12px] leading-[1.55] text-[#E8E6E3] m-0 mb-3">{VERDICT.won || '— not settled yet'}</p>
                  <div className="text-[11px] text-[#7A756D] mb-1">rejected — and why</div>
                  {VERDICT.rejected.map(r => <p key={r} className="text-[12px] leading-[1.5] text-[#B8B4AE] m-0 mb-1">{r}</p>)}
                  <div className="text-[11px] text-[#7A756D] mt-3 mb-1">final values</div>
                  <p className="text-[12px] leading-[1.6] text-[#B8B4AE] m-0">{VERDICT.values}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
```

## Verification (Playwright) — opt-in, measurement-only

Feel, motion, and state are judged by *me*, in the browser. Hand over the live URL; never substitute a screenshot for it — a still can't answer "is this snappy?".

Playwright has exactly one justified job: **headless DOM measurement** — confirming the real component renders the cooked values (computed styles, box dimensions) or serves without crashing. Launch it *only* when there's a specific "did the real value actually land?" question; otherwise don't launch it at all. **No screenshots in the default loop** (they're the token-heavy part and carry little of the value, and feel isn't judged from them). Use Playwright's bundled browser, never a custom system-browser executable path; auth-gated routes need a seeded session, not a guess. Take a screenshot only when I ask for a saved record.

## Handoff

Leave the harness in place (keeper) and **append one entry to the cook index** (`index.ts`). Then, by default, **hand off to a separate implementer chat with a pointer prompt** — not a prose dump of the decisions:

> The spec is the harness at `<path>` — read it top to bottom. Task: `<one line>`. Recommended model: `<a cheaper model for mechanical / a stronger model for taste>`.

Because the harness is self-documenting, the handoff carries a pointer, not the cook. Apply inline instead only when the cook was small and decided early in a still-fresh context.

Once the index has a handful of cooks, a `/dev/arc` timeline that embeds the keepers chronologically is a natural second view of the same `index.ts` — offer it, never auto-build it.

</supporting-info>
