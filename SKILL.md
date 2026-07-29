---
name: visual-cook
description: Iterate on visual work inside a live harness — labeled variants side by side, mounted from the real components, persisting as the durable spec and the record. Use when a UI feels off, when you want versions side by side to judge by eye ("show me a few versions", "which of these feels better", "iterate on this design"), when establishing or extending a visual system, or when polishing a single detail.
---

<what-to-do>

Build the instrument, don't hold a meeting. Mount the *current* thing as V1 in a live harness, add labeled variants beside it — each moving **one named axis** — and let me judge by looking; I iterate by pointing, you edit the named lane in place. Start building on my opening sentence; don't open with questions, and never make me classify my request first.

That is not "generate three options and let me pick", and three things keep it from degrading into that: **V1 is the incumbent**, so the question is always "does anything beat what already exists" rather than a taste vote between novelties; **lanes persist**, so a verdict is a direction ("V2, but the gap's too tight") rather than a terminal choice; and **every lane is an argument on a declared axis**, so the lineup reads as N arguments instead of one theme recoloured. A variant you can't name the axis of is slop — and you will notice, because you won't be able to write its line in the rationale panel.

**Kind questions get asked; degree questions get rendered.** What the thing *is*, and which variable a lane moves, are words — but pinned as a label and a rationale line *in the harness*, not extracted from me in an interview. How much (spacing, weight, radius, contrast, timing, density) is never words: two lanes settle it in a second, and asking me first makes me do the harness's job in my head, badly. So every vague term ("cleaner", "premium", "pop", "off", "like Linear") becomes lanes along the axes it could mean — render and let me point rather than argue in prose.

**The interview is a mode, not the identity.** It fires when a premise is wrong, which no variant can show — see "When to stop rendering and talk". When you do ask, ask in prose, one question at a time, always with your own recommended answer — never the structured question UI.

**The harness is the deliverable and the record.** You build the winning spec *in the harness*, with its rationale next to it — you do not re-encode it into prose design docs (that lineage is retired; see "The harness is the record"). When the design is settled, the default is to hand the harness to a separate implementer chat — cooking is token-heavy, and exploration and implementation are opposite modes. Apply inline only for a small cook decided early.

</what-to-do>

<supporting-info>

## Before you build

Two things, both inferred from my opening sentence rather than asked for:

1. **What the harness shows** — the real component, unless the work is about the vocabulary itself (type ramp, spacing scale, color roles), in which case a specimen of it.
2. **What reference I'm judging against** — any screenshot, URL, or product I supply; treat it as one more fuzzy word, i.e. as a lane to render rather than a question to ask.

**Material is supplied, never discovered.** Don't hunt the repo for design docs, Figma files, or brand systems — cook with whatever I hand you. The only thing you auto-locate is *code* (the real component to render).

**On resume, check whether we've cooked this before.** Read the cook index first (the `/dev/visual-cook` index page, backed by `index.ts` — see "The harness is the record") — it lists every prior cook, the real component it touched, what it settled, and its status. Past keeper harnesses are the memory of this work; an existing dir means you're resuming it, never overwrite it.

## During the session

### Fuzzy language becomes lanes, not questions
A vague word has readings that diverge, and *that divergence is the axis*: "cleaner" splits into more whitespace / fewer borders / lower contrast, so build all three labeled instead of asking which one I meant. A supplied reference is the same — "like Linear" is a lane (near-zero borders, one accent) rendered against what I have (three), and the reconciliation happens by looking. Ask only when the readings *wouldn't* diverge visually, i.e. when they'd change what the thing is rather than how much of it there is.

### Probe states, not just the happy path
The visual equivalent of edge cases is *states*: hover, focus, active, disabled, empty, loading, error, long text, dark mode, 320px wide. "Feels off" usually hides in an unconsidered one. **Honor `prefers-reduced-motion`** — it's a standing project rule; a motion variant that ignores it can't be judged and can't ship.

### When motion "looks wrong", separate geometry from raster before tuning anything
A complaint about a *transition* — "it enlarges, then somehow gets smaller", "something's wrong with the pixels" — has two unrelated suspects needing opposite fixes: the **geometry** (wrong numbers, overshoot, a re-render mid-flight) or the **raster** (the browser filtering a cached bitmap, or the landed state sitting off the device-pixel grid). rAF-sample the geometry first (see Verification) — it's cheap, and when the trace comes back monotonic and centred it *exonerates the math*, which stops you tuning easings and amounts that were never wrong. Three laws, all measured in the chrome meta-cook (2026-07-29):
- **Grow vector ink by its BOX, never by transforming it.** A CSS `transform: scale()` on an `<svg>` makes the browser scale a *cached bitmap* through the transition: a hairline reads soft and fatter mid-flight, then re-rasterises crisp at the end — which the eye reports as "it shrank after it grew". Animate the svg's CSS `width`/`height` and let the `viewBox` scale the content instead (a layout change re-renders from vectors every frame), and pin the weight with `vector-effect: non-scaling-stroke` so growth reads as *extent*, not weight. Same compositing law that makes a WebGL canvas soft under a CSS 3D transform — it bites hairlines too.
- **A few-percent scale of a hairline can't land crisp, and barely reads as size anyway.** 4px × 1.08 = 4.32px = 8.64 device px at DPR 2 — AA fringe down both edges, where the resting 4px sat on exactly 8. Almost all of a small scale lands in the stroke-*weight* channel, which is precisely the channel resampling corrupts (state-as-ramp-shift failing at the ramp's end again). If you must scale, pick an amount that lands the stroke back on the grid (4 → 4.5px at 1.125).
- **Two transform traps that cost a round each to find.** Tailwind v4's `scale-*`/`rotate-*` compile to the *standalone* `scale`/`rotate` CSS properties, which a `transition-transform` does **not** cover; and Firefox computes-but-never-*renders* a standalone `scale` on an SVG `<path>`. If you do transform an SVG, write the arbitrary `[transform:scale(…)]` on the `<svg>` root. Firefox also ignores `non-scaling-stroke` under an ancestor *scale* (it honours it under a translate).

### Ground the spec against reality before locking
Never settle a decision against a guess about the real component. Mount the real thing and check the real values — a cook that settles on a fantasy (e.g. "the panel is fixed-height" when it's actually fluid) hands the implementer a broken spec. If you can't render the real component honestly, you can't lock.

### When to stop rendering and talk (interview mode)
The interview's one irreplaceable job is catching a *wrong premise*, which no variant can show — e.g. realizing the thing being designed isn't what it's for ("this isn't a bio — it just shows their favorite books"). A wrong frame kills every variant at once, and rendering more *hides* it: every lane inherits the bad premise, so a lineup that all reads wrong looks like a taste problem instead of a frame problem.

**The trigger is observable, so watch for it instead of guessing up front:** every lane is getting rejected, or a rejection names nothing that's on screen. Then stop building and name the real case out loud — that is the move, not another round of variants. Also enter this mode on request ("grill me on this"), and there walk each branch of the decision tree one question at a time, in prose, always with your own recommended answer.

## The harness

Four hard rules, in priority order:

1. **Labeled lanes on named axes, V1 = the incumbent.** Show current vs. 2–3 variants **in one viewport** so the eye compares without scrolling, each labeled, each moving one axis you can name in the rationale panel. Lanes **persist across iterations within a topic** — "V1 but tighter" edits V1 in place. Never collapse V1/V2 into a new V3 unasked: I judge against stable labels, and the archive of past lanes is half of what makes the harness worth more than a screenshot.
2. **Real, in context, sized right.** Show the real artifact whole, inside a correctly-sized window of its real context — never clipped, never trapped behind a nested scrollbar, never shrunk to fit. Scope the *view* to the *question*: a component-level question ("how does this control read?") → isolate that component plus only the neighbors its interaction can collide with; a between-regions question ("does it fit / does this fix disturb the layout?") → the full app at real viewports. A device-frame that renders the actual page chrome and resizes is the gold standard. Never freeze a component's real in-context motion just to pin a layout.
3. **No fakes.** Any supporting component you put on screen must be the *real* one, imported or mounted from source. A hand-built lookalike is a bug, not a shortcut. If the real component needs auth or data, mount it behind a throwaway page with seeded data — that is the only sanctioned way to get it rendering.
4. **Real interactivity, verified.** Wire real `useState`/`onChange`/CSS transitions only when the question is about transition, timing, or state-change — and then verify it actually works (clickable, fires) before handing it over. Layout, spacing, type, and color are static; a specimen settles those faster. A static replica with hardcoded values posing as interactive is the classic failure.

Conventions:
- Scratch dir at the repo root mirror, served live under a namespaced route — `/visual-cook/<topic-slug>` (or the repo's existing dev-route convention, e.g. `dev/visual-cook/<topic-slug>`), using the **same slug**. Never a bare top-level route. Announce the dir path when you create it and the preview URL once it's serving.
- **Keep the harness tracked in git — never gitignore it.** In Next + Tailwind v4 + Turbopack, a gitignored dir gets no generated CSS and no HMR (novel utilities silently resolve to nothing). Tracked, never ignored.
- **Live dials (DialKit), if present:** label one **primary** dial; mark the rest as guardrails (I shouldn't have to guess what each does). Dials coexist with labeled variants — I tune the chosen variant. Dialed numbers are *not* the spec; the landed value is.
- Build with the repo's existing stack; don't impose one.

## The harness is the record (this replaces DESIGN.md + DDRs)

The old DESIGN.md-dictionary + design-decision-record framing is retired — it came from a prose-is-the-artifact paradigm and was lossy: it drifted from live state, flattened the reasoning, and dropped the exact values and cascade mechanics, so every implementation restarted from a worse place. Instead:

- **Rationale lives in the harness, rendered next to what it's about** — a notes panel beside the lanes: what won, what was rejected and why, the exact settled values. It must be *rendered in the harness* so it's visible the moment the page opens and can't be skipped; a co-located `NOTES.md` is optional overflow only for what's too long to sit on screen. An artifact that carries its own rationale can't drift from its own state.
- **One cook index** across the repo — a `/dev/visual-cook` index page backed by a small `index.ts` data file (one entry per cook: `date · topic · real component · what settled · status · applied? · route`). The page maps the array to a table with each row linking into its live harness; the agent appends one entry at handoff. Statuses: settled · superseded · abandoned · wip — the superseded/abandoned rows are what stop a dead idea or wrong frame from being re-cooked. `applied` tracks the separate dimension of *did the verdict land in prod* (see the canonical harness section). This is the "have we worked on this before" memory, and the single data source any richer history view reads from.
- **Heavy, architectural "why" → project ADRs**, where it already lives richer than any cook doc.
- **Keepers are permanent.** Never delete a harness dir — not at handoff, not as cleanup, not after the values land in code. Commit them. They're the visual spec, the memory, and a playground to return to.

## Canonical harness (the skeleton)

Settled across two meta-cooks — cooks whose judged artifact was the cook UI itself: `cook-chrome` (2026-07-06, the docked rail) and `chrome-grabber` (2026-07-29), which **supersedes the rail** with a zero-footprint grabber + overlay panel and replaces dark-only chrome with declared polarity. **Living reference:** keep the meta-cook harness that settled the chrome in your own repo and diff against it when chrome anywhere feels off; the predecessor cook stays as the rail's record. There is deliberately **no generator**: the skeleton below is the propagation mechanism — paste it verbatim, then build the stage. Chrome improvements are made **canon-first** (living reference + this file), never as per-repo forks. Old non-conforming harnesses, and any repo still on the rail, stay as-is — no retrofit.

**Layout.** `<app-root>/dev/visual-cook/` holds: `index.ts` (the frozen `CookEntry` type below — created with cook #1 in every repo), a root `page.tsx` catalog (maps `COOK_INDEX` to a plain linked table, prod-guarded like any cook page — copy it from the living reference's parent dir), and per cook `<topic-slug>/page.tsx` (guard) + `<Topic>Cook.tsx`. Lanes are **one typed array** `{id, note, cfg}` rendered by one component — **route-per-variant is banned**. Label vocab: `CUR` / `V1..Vn`, with `LEAD` / `FAVE` / `FINAL` markers in the id; rejected lanes are kept as dimmed refs, never deleted. Three stage layout modes — `strip | stack | grid` — picked by the question and declared in the chrome.

**Chrome invariants** (auditable — check any cook against these):
- **ZERO resting footprint — the panel overlays, the stage keeps no margin, ever.** The old rail reserved 44px even collapsed, so every full-width question was judged against a viewport that lied by 44px. Collapsed is now *the handle only*: the page exactly as it ships, at every breakpoint. The open panel overlays and never resizes the stage — a stage-margin change fires ResizeObservers, which re-measures/remounts GL content mid-judgment (the "open the panel → refresh needed" bug). Cooks **start collapsed**. Put a full-width **edge ruler** in the stage while cooking chrome: if its right tick is hidden, the chrome is lying.
- **Desktop trigger = a GRABBER handle on the mid-right edge** (`right-[5px]`, `top-1/2`), because every corner is taken in a real repo (Next dev indicator bottom-left, Agentation FAB bottom-right, perf HUD bottom-center at z-99999) and the mid-edge is the one uncontested spot. It is `cursor-pointer`, never `cursor-grab` — nothing here is draggable. **Hover grows the whole handle ~12.5%; click opens. That's the entire contract** — the handle must not bend, deform, or invite a pull (an elastic drag mechanic was built and killed: a control that deforms under the pointer reads as a mechanism demanding operation, when this one only needs to be ignorable until clicked). Grow it by its **box**, not a transform — see "separate geometry from raster".
- **Phone-collapsed = ONE corner button** (settled in a mobile-shelf cook, 2026-07-08). Below `sm` the mid-edge grabber gives way to a single bottom-right button riding `env(safe-area-inset-bottom)`. Same zero-footprint rule, different trigger — thumb reach, not edge precision.
- **Collapse animates INTO the handle** so it's apparent where the panel went: `scale(0.94)` with `transform-origin` pinned at the handle's spot, 200ms ease-out (Emil Kowalski's tip — never animate from `scale(0)`; start at 0.9+, it reads gentler). A full scale-to-point *funnel* was the rival and lost: too cartoon for a panel you open dozens of times a session.
- **Killing the rail removed the collapsed lane readout, so it's compensated:** a **transient lane chip** fades in beside the handle on arrow-cycle while collapsed and self-dismisses (~800ms hold, ~500ms fade). The full-bleed judgment loop keeps its bearings at zero resting pixels. (A constraint is a design problem — fill the hole, don't just accept the loss.)
- **Two PINNED palettes, polarity declared per cook — never host tokens, never dark-only.** "Fixed neutral values" had fused two intents: *pinned* (no host tokens, so the chrome is identical in every repo — keep) and *dark* (an accident of the first stage it was judged on being dark — drop). The panel surface **matches the page's polarity**; the handle is ink on the page, so it takes the matching palette's ink and therefore **inverts** against the page (dark handle on light page, light on dark) — a black handle on a black page disappears. Dark: surface `#131211/97` · hairline `#ffffff14` · ink `#E8E6E3` / `#B8B4AE` / `#7A756D`. Light: surface `#F6F4F1/97` · hairline `#00000014` · ink `#262320` / `#5A554D` / `#8B857B`. Active = `bg-[#ffffff0a]` / `bg-[#0000000a]` + `font-medium` (weight carries active, not a bright fill). Mid-cook override is a **WORD** in the meta line (`chrome: dark`), **never a sun/moon glyph** — that icon universally means "toggle the PAGE theme" and would collide with a stage's own theme switch.
- **The close control is a minimize DASH**, not a panel icon or chevron — the plain window-minimize convention. (A mini-grabber was rejected as too clever; chevrons as ambiguous about direction.) The rect-with-divider panel icon survives only on the phone FAB, where "open a panel" is the message.
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
// Chrome: canonical (grabber chrome settled 2026-07-29, superseding the rail; phone-collapsed = single
// corner button, mobile-shelf 2026-07-08) — edit canon-first, never per-repo.
// Stage values copied from prod on <date> (frozen — spec of the settle date, not a live link).

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Polarity = 'dark' | 'light';
const POLARITY: Polarity = 'dark'; // the STAGE's polarity — the chrome matches it, handle ink inverts

// PINNED (no host tokens ⇒ identical chrome in every repo) and TWO (⇒ not dark by accident).
// Every class string is a COMPLETE literal — Tailwind's scanner can't see assembled ones.
const PAL = {
  dark: {
    aside: 'bg-[#131211]/97 border-[#ffffff14]',
    meta: 'text-[#B8B4AE]', metaSub: 'text-[#7A756D]', metaLink: 'hover:text-[#E8E6E3]',
    itemOn: 'bg-[#ffffff0a] text-[#F2F0ED] font-medium',
    itemOff: 'text-[#B8B4AE] hover:bg-[#ffffff0a] hover:text-[#E8E6E3]',
    laneNote: 'text-[#7A756D]', micro: 'text-[#7A756D]', microHover: 'hover:text-[#E8E6E3]',
    inkHi: 'text-[#E8E6E3]', inkMid: 'text-[#B8B4AE]',
    toggleBtn: 'text-[#7A756D] hover:text-[#E8E6E3] hover:bg-[#ffffff0d]',
    handle: 'text-[#B8B4AE] group-hover:text-[#E8E6E3]',
    chip: 'bg-[#131211]/95 text-[#E8E6E3] shadow-[0_0_0_1px_#ffffff1f,0_2px_10px_rgba(0,0,0,0.4)]',
    fab: 'bg-[#131211]/80 text-[#7A756D] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.35)]',
  },
  light: {
    aside: 'bg-[#F6F4F1]/97 border-[#00000014]',
    meta: 'text-[#5A554D]', metaSub: 'text-[#8B857B]', metaLink: 'hover:text-[#262320]',
    itemOn: 'bg-[#0000000a] text-[#1F1D1A] font-medium',
    itemOff: 'text-[#5A554D] hover:bg-[#0000000a] hover:text-[#262320]',
    laneNote: 'text-[#8B857B]', micro: 'text-[#8B857B]', microHover: 'hover:text-[#262320]',
    inkHi: 'text-[#262320]', inkMid: 'text-[#5A554D]',
    toggleBtn: 'text-[#8B857B] hover:text-[#262320] hover:bg-[#0000000d]',
    handle: 'text-[#5A554D] group-hover:text-[#262320]',
    chip: 'bg-[#F6F4F1]/95 text-[#262320] shadow-[0_0_0_1px_#0000001f,0_2px_10px_rgba(0,0,0,0.12)]',
    fab: 'bg-[#F6F4F1]/85 text-[#8B857B] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.18)]',
  },
} as const;
// `as const` makes each palette's strings literal types, so PAL.light is NOT assignable to
// `typeof PAL.dark` — take the union, or every consumer of PAL[polarity] is a type error.
type Pal = (typeof PAL)[Polarity];

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

// Phone FAB only — "open a panel" is the message there.
function PanelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><line x1="14.5" y1="4" x2="14.5" y2="20" />
    </svg>
  );
}

// The panel's close control: a minimize DASH (plain window-minimize convention).
function CollapseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

// HOVER grows the handle +12.5%; CLICK opens. Growth is a LAYOUT change (CSS w/h, viewBox scales
// the content, stroke pinned) — a `transform: scale()` filters a cached bitmap mid-flight and
// reads as "enlarged, then shrank". Literal classes: the amount can't be interpolated in.
const GROW = 'transition-[width,height] group-hover:w-[18px] group-hover:h-[94.5px]';

function Grabber({ pal, onOpen }: { pal: Pal; onOpen: () => void }) {
  return (
    <button onClick={onOpen} aria-label="expand cook sidebar"
      className="group hidden sm:flex fixed right-[5px] top-1/2 -translate-y-1/2 z-[300] w-10 h-32 items-center justify-center cursor-pointer">
      <svg width="16" height="84" viewBox="0 0 16 84" fill="none"
        className={`overflow-visible duration-200 ease-out motion-reduce:transition-none ${GROW}`}>
        <path d="M 13 6 Q 12.5 42 13 78" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className={`transition-colors duration-200 ease-out motion-reduce:transition-none ${pal.handle}`} />
      </svg>
    </button>
  );
}

export default function TopicCook() {
  const [lane, setLane] = useState(LANE_IDS[0]);
  const [open, setOpen] = useState(false); // start collapsed — zero footprint IS the shipped page
  const [verdictOpen, setVerdictOpen] = useState(false);
  const [chromePol, setChromePol] = useState<Polarity>(POLARITY);
  const [flash, setFlash] = useState<{ id: string; key: number; fading: boolean } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const first = useRef(true);
  const pal = PAL[chromePol];

  useEffect(() => { // ?lane= deep link — read once on mount…
    const q = new URLSearchParams(window.location.search).get('lane');
    if (q && LANE_IDS.includes(q)) setLane(q);
  }, []);
  useEffect(() => { // …mirror on change
    const url = new URL(window.location.href);
    url.searchParams.set('lane', lane);
    window.history.replaceState(null, '', url);
  }, [lane]);

  useEffect(() => { // arrow keys cycle lanes, even (especially) while collapsed
    const onKey = (e: KeyboardEvent) => {
      const i = LANE_IDS.indexOf(lane);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setLane(LANE_IDS[(i + 1) % LANE_IDS.length]); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setLane(LANE_IDS[(i - 1 + LANE_IDS.length) % LANE_IDS.length]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lane]);

  useEffect(() => { // transient lane chip — the rail's readout, reborn at zero resting pixels
    if (first.current) { first.current = false; return; }
    if (open) return;
    timers.current.forEach(clearTimeout);
    setFlash({ id: lane, key: performance.now(), fading: false });
    timers.current = [
      setTimeout(() => setFlash(f => (f ? { ...f, fading: true } : f)), 800),
      setTimeout(() => setFlash(null), 1300),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lane]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const active = LANES.find(l => l.id === lane) ?? LANES[0];
  const item = 'text-left rounded-[6px] px-3 py-2 [font-family:system-ui] text-[13px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none';

  return (
    <div className="min-h-screen">
      {/* STAGE — the real composition in the repo's real system; mode declared in META.mode.
          NO MARGIN, EVER: the panel overlays. A stage-margin change fires ResizeObservers and
          remounts GL mid-judgment, and a reserved rail makes every full-width question a lie. */}
      <main>
        {/* render the real artifact from active.cfg */}
      </main>

      {/* CHROME — canonical: pinned palettes, zero resting footprint, overlay panel.
          Collapsed = the trigger only. Desktop: mid-right GRABBER (the one uncontested edge).
          Phone (<sm): ONE corner button riding the home-indicator safe-area (mobile-shelf,
          2026-07-08) — suppress a repo's own FAB on the route if it collides. */}
      {!open && <Grabber pal={pal} onOpen={() => setOpen(true)} />}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="expand cook sidebar"
          className={`sm:hidden fixed right-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-[300] w-10 h-10 flex items-center justify-center rounded-full active:scale-[0.96] cursor-pointer touch-manipulation transition-[scale,color] duration-150 motion-reduce:transition-none ${pal.fab}`}>
          <PanelIcon />
        </button>
      )}

      {/* transient lane chip — compensates for the dead rail readout, at zero resting pixels */}
      {!open && flash && (
        <div key={flash.key}
          className={`fixed right-[40px] top-1/2 -translate-y-1/2 z-[300] pointer-events-none rounded-[6px] px-2.5 py-1.5 [font-family:system-ui] text-[12px] transition-opacity duration-500 motion-reduce:transition-none ${pal.chip} ${flash.fading ? 'opacity-0' : 'opacity-100'}`}>
          {flash.id}
        </div>
      )}

      {/* Collapse animates INTO the handle: transform-origin pinned at its spot, scale 0.94
          (never from scale(0) — start 0.9+, it reads gentler), 200ms ease-out. */}
      <aside className={`fixed inset-y-0 right-0 z-[300] w-[300px] border-l flex flex-col overflow-hidden [transform-origin:calc(100%-15px)_50%] motion-reduce:transition-none ${pal.aside} ${open
        ? '[transition:transform_200ms_cubic-bezier(0,0,0.2,1),opacity_160ms_ease-out]'
        : '[transform:scale(0.94)] opacity-0 pointer-events-none [transition:transform_200ms_ease-out,opacity_160ms_ease-out]'}`}>
        <div className="flex items-center gap-2.5 pt-3 pb-1 px-3.5 shrink-0">
          <button onClick={() => setOpen(false)} aria-label="collapse cook sidebar"
            className={`w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none shrink-0 ${pal.toggleBtn}`}>
            <CollapseIcon />
          </button>
          <div className="min-w-0">
            <div className={`[font-family:system-ui] text-[12px] truncate ${pal.meta}`}>{META.topic} · {META.date}</div>
            <div className={`[font-family:system-ui] text-[11px] truncate ${pal.metaSub}`}>
              {META.status} · {META.mode} · <Link href="/dev/visual-cook" className={`cursor-pointer ${pal.metaLink}`}>‹ index</Link> · ←/→ ·{' '}
              {/* polarity override: a WORD, chrome-scoped by its own label — never a sun/moon */}
              <button onClick={() => setChromePol(chromePol === 'dark' ? 'light' : 'dark')}
                className={`cursor-pointer ${pal.metaLink}`} aria-label="invert chrome polarity">
                chrome: {chromePol}{chromePol !== POLARITY ? ' *' : ''}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full w-[300px] pb-4 pt-2 px-3.5 gap-6 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {LANES.filter(l => !REJECTED_REFS.includes(l.id)).map(l => (
              <button key={l.id} onClick={() => setLane(l.id)} className={`${item} ${lane === l.id ? pal.itemOn : pal.itemOff}`}>
                <div>{l.id}</div>
                {lane === l.id && <div className={`[font-family:system-ui] text-[12px] leading-[1.55] mt-1 font-normal ${pal.laneNote}`}>{l.note}</div>}
              </button>
            ))}
            {REJECTED_REFS.length > 0 && <div className={`[font-family:system-ui] text-[11px] mt-2 mb-0.5 px-3 ${pal.micro}`}>rejected refs</div>}
            {REJECTED_REFS.map(id => (
              <button key={id} onClick={() => setLane(id)} className={`${item} ${lane === id ? pal.itemOn : pal.itemOff}`}>{id}</button>
            ))}
          </div>
          {/* this cook's own levers (dials, toggles, copy-length switches) go here */}
          <div className="mt-auto px-1">
            <button onClick={() => setVerdictOpen(o => !o)}
              className={`w-full text-left [font-family:system-ui] text-[11px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${pal.micro} ${pal.microHover}`}>
              {verdictOpen ? '▾' : '▸'} verdict{VERDICT.won ? ` — why “${VERDICT.won.split(' — ')[0]}” shipped` : ' — open'}
            </button>
            {verdictOpen && (
              <div className="mt-2.5 [font-family:system-ui]">
                <div className={`text-[11px] mb-1 ${pal.micro}`}>shipped</div>
                <p className={`text-[12px] leading-[1.55] m-0 mb-3 ${pal.inkHi}`}>{VERDICT.won || '— not settled yet'}</p>
                <div className={`text-[11px] mb-1 ${pal.micro}`}>rejected — and why</div>
                {VERDICT.rejected.map(r => <p key={r} className={`text-[12px] leading-[1.5] m-0 mb-1 ${pal.inkMid}`}>{r}</p>)}
                <div className={`text-[11px] mt-3 mb-1 ${pal.micro}`}>final values</div>
                <p className={`text-[12px] leading-[1.6] m-0 ${pal.inkMid}`}>{VERDICT.values}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
```

## Verification (Playwright) — opt-in, measurement-only

Feel, motion, and state are judged by *me*, in the browser. Hand over the live URL; never substitute a screenshot for it — a still can't answer "is this snappy?".

Playwright has two justified jobs, both **headless measurement**: (a) confirming the real component renders the cooked values (computed styles, box dimensions) or serves without crashing; (b) **frame-sampling a transition** when I report a motion artifact — a `requestAnimationFrame` loop inside one `evaluate`, pushing computed transform / box / centre into an array — so geometry is convicted or exonerated *before* anything gets tuned. Launch it *only* for a specific question of one of those two shapes; otherwise don't launch it at all. Two traps when measuring hover: Playwright's pointer **persists across `navigate`**, so a stale hover silently poisons the "at rest" reading — park it on a neutral element first and read rest, then hover; and read `getComputedStyle` on the element that carries the property, not its child. **No screenshots in the default loop** (they're the token-heavy part and carry little of the value, and feel isn't judged from them). Use the known-good bundled-Firefox path; auth-gated routes need a seeded session, not a guess. Take a screenshot only when I ask for a saved record.

## Handoff

Leave the harness in place (keeper) and **append one entry to the cook index** (`index.ts`). Then, by default, **hand off to a separate implementer chat with a pointer prompt** — not a prose dump of the decisions:

> The spec is the harness at `<path>` — read it top to bottom. Task: `<one line>`. Recommended model: `<Opus for mechanical / Fable for taste>`.

Because the harness is self-documenting, the handoff carries a pointer, not the cook. Apply inline instead only when the cook was small and decided early in a still-fresh context.

If the repo's index now has ≥~5 cooks and no `/dev/arc`, **offer** `/to-arc` — never auto-run it.

</supporting-info>
