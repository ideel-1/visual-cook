# visual-cook

A [Claude Code](https://claude.com/claude-code) skill for iterating on visual work inside a live harness — labeled variants side by side, mounted from your **real** components, persisting as the durable spec and as an archive of every version you've tried.

Use it when:

- a UI "feels off" and you can't say why
- you want a few versions side by side to judge by eye, then keep iterating on whichever is closest
- you're setting up or extending a visual system
- you're polishing a single detail and want the trade-off rendered rather than described

## What it does

Instead of generating a design and asking "is this good?", `visual-cook` builds you an instrument: the current thing mounted as V1, labeled variants beside it, each moving **one named axis**, all in one viewport. You judge by looking and iterate by pointing — "V2, but the gap's too tight" edits V2 in place, and lanes are never collapsed into each other, so both the comparison and the history survive.

That is deliberately not "here are three options, pick one", and three rules keep it from becoming that: **V1 is the incumbent**, so the question is always whether anything beats what already exists rather than a taste vote between novelties; **lanes persist**, so a verdict is a direction instead of a terminal choice; and **every lane argues one declared axis**, written into the rationale panel next to it — a variant whose axis you can't name is slop, and you find out because you can't write its line.

Kind questions get asked; degree questions get rendered. What the thing *is* is worth words. How much of it — spacing, weight, radius, contrast, timing, density — never is: two lanes settle that in a second, and a vague word like "cleaner" becomes lanes along the axes it could mean (more whitespace / fewer borders / lower contrast) rather than a question about which you meant.

It leaves behind:

- **A permanent keeper harness** per topic at `/dev/visual-cook/<topic-slug>` — labeled lanes (current vs. variants) plus a rendered verdict: what won, what was rejected and why, the exact settled values. The artifact carries its own rationale, so the record can't drift from the state.
- **One cook index** — a small `index.ts` data file behind a `/dev/visual-cook` catalog page: one row per cook, its status (`settled · superseded · abandoned · wip`), and whether the verdict has actually landed in prod. This is the "have we cooked this before" memory that stops dead ideas being re-cooked.
- **A canonical chrome** — every cook in every repo gets the same cook UI, from a copy-paste skeleton in `SKILL.md`. Zero resting footprint (collapsed is a grabber handle; the stage never reserves a margin, so full-width questions are judged against the real viewport), an overlay panel that never resizes the stage, two pinned palettes with polarity declared per cook (no host-repo tokens), pinned `system-ui` + radii, docked never floating, `?lane=` deep links, arrow-key lane cycling.

## v3 — the instrument, not the interview

v1 and v2 called this a grilling session: the skill interviewed you and pinned every fuzzy word by asking. Real use moved elsewhere. What carries the value is the persistent labeled lineup you iterate *inside*; the interview turned out to matter for exactly one thing rendering cannot do — catching a **wrong premise**, which kills every variant at once and which more variants actively hide. So v3 makes the instrument the spine and keeps the interview as a mode with an observable trigger: every lane getting rejected, or a rejection that names nothing on screen. If you liked being interviewed, ask for it — "grill me on this" still enters that mode.

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

Claude will stand up a keeper harness under your dev route, mount the current component as V1, announce the preview URL, and iterate from there. No need to invoke a command — the skill description triggers on UI-feel, side-by-side, and visual-system phrasing.

The skeleton in `SKILL.md` assumes Next.js + Tailwind (v4); the principles — real components, keeper harnesses, the index, the zero-footprint overlay chrome — port to any stack.

## Snapshot, not source

This repo is a **published snapshot**. The canon lives in a private brain repo, where the chrome is
edited canon-first (never forked per project) and a snapshot lands here when a cook settles. So the
skill is self-sufficient — paste the skeleton and you have the chrome — but the part that makes the
practice compound isn't shippable: the accumulated archive of past lanes, in your own components, is
something you build by using it, not something a snapshot can hand you.

Current snapshot: **2026-07-29** — the v3 instrument-first spine, plus the zero-footprint grabber
chrome with declared polarity that superseded the docked 44px rail.

## Philosophy

Most visual work goes wrong in one of three ways: arguing about fuzzy words without referents, choosing between novelties with no incumbent to beat, or making decisions in a harness that vanish at handoff because nobody wrote them down. `visual-cook` is built around all three — *render, don't argue*, *V1 is what you already have*, and *the artifact carries its own rationale*, so the record and the pixels are the same thing and can't disagree.
