# visual-cook

A [Claude Code](https://claude.com/claude-code) skill for grilling visual work — pinning fuzzy design language ("cleaner", "premium", "pop", "like Linear") to concrete decisions, grounding disagreements in real renders, and leaving a **self-documenting keeper harness** as the durable spec.

Use it when:

- a UI "feels off" and you can't say why
- you're setting up or extending a visual system
- you're polishing a single detail and want a real conversation about trade-offs

## What it does

Instead of generating a design and asking "is this good?", `visual-cook` interviews you. It walks the decision tree one question at a time, with its own recommended answer for each. Every vague word either gets decided on screen — via a harness that imports the **real** component, never a lookalike — or recorded as a decision *in* the harness, so when the answer lives in the pixels, you point rather than argue in prose.

It leaves behind:

- **A permanent keeper harness** per topic at `/dev/visual-cook/<topic-slug>` — labeled lanes (current vs. variants) plus a rendered verdict: what won, what was rejected and why, the exact settled values. The artifact carries its own rationale, so the record can't drift from the state.
- **One cook index** — a small `index.ts` data file behind a `/dev/visual-cook` catalog page: one row per cook, its status (`settled · superseded · abandoned · wip`), and whether the verdict has actually landed in prod. This is the "have we cooked this before" memory that stops dead ideas being re-cooked.
- **A canonical chrome** — every cook in every repo gets the same cook UI, from a copy-paste skeleton in `SKILL.md`. Zero resting footprint (collapsed is a grabber handle; the stage never reserves a margin, so full-width questions are judged against the real viewport), an overlay panel that never resizes the stage, two pinned palettes with polarity declared per cook (no host-repo tokens), pinned `system-ui` + radii, docked never floating, `?lane=` deep links, arrow-key lane cycling.

## v2 — the harness is the record

Earlier versions of this skill recorded decisions in a `DESIGN.md` vocabulary dictionary plus design-decision records, and deleted the harness after implementation. Real-world use showed that model is **lossy**: prose drifts from live state, flattens the reasoning, and drops the exact values — every implementation restarted from a worse place. v2 inverts it:

- the harness **is** the spec, with rationale rendered inside it
- harnesses are **permanent keepers** — committed, never deleted
- `DESIGN-FORMAT.md` and `DDR-FORMAT.md` are retired and removed

If you used v1: keep your `DESIGN.md` if it serves you, but new cooks record themselves.

## Install

Drop the skill into a Claude Code skills directory:

```bash
# user-level (available in every project)
mkdir -p ~/.claude/skills/visual-cook
cp SKILL.md ~/.claude/skills/visual-cook/

# or project-level (committed alongside the repo)
mkdir -p .claude/skills/visual-cook
cp SKILL.md .claude/skills/visual-cook/
```

Claude Code auto-discovers skills in those locations. Restart your session and the skill is available.

## Use

In any Claude Code session, point Claude at the work:

> "Let's visual-cook the empty state on the dashboard."

Claude will start the interview, stand up a keeper harness under your dev route, announce the preview URL, and grill from there. No need to invoke a command — the skill description triggers on UI-feel and visual-system phrasing.

The skeleton in `SKILL.md` assumes Next.js + Tailwind (v4); the principles — real components, keeper harnesses, the index, the zero-footprint overlay chrome — port to any stack.

## Snapshot, not source

This repo is a **published snapshot**. The canon lives in a private brain repo, where the chrome is
edited canon-first (never forked per project) and a snapshot lands here when a cook settles. So the
skill is self-sufficient — paste the skeleton and you have the chrome — but the living reference
harness it was judged in isn't public.

Current snapshot: **2026-07-29** — zero-footprint grabber chrome + declared polarity, superseding the
docked 44px rail.

## Philosophy

Most visual work goes wrong in one of two ways: arguing about fuzzy words without referents, or making decisions in a harness that vanish at handoff because nobody wrote them down. `visual-cook` is structured around both failure modes — *pin or render, never argue in prose*, and *the artifact carries its own rationale*, so the record and the pixels are the same thing and can't disagree.
