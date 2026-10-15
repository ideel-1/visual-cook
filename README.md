# visual-cook

A [Claude Code](https://claude.com/claude-code) skill for iterating on visual work inside a live harness — labeled variants side by side, mounted from your **real** components, persisting as the durable spec and as an archive of every version you've tried.

Use it when:

- a UI "feels off" and you can't say why
- you want a few versions side by side to judge by eye, then keep iterating on whichever is closest
- you're setting up or extending a visual system
- you're polishing a single detail and want the trade-off rendered rather than described

## What it does

Instead of generating a design and asking "is this good?", `visual-cook` builds you an instrument: the current thing mounted as V1, labeled variants beside it, each moving **one named axis**, all in one viewport. You judge by looking and iterate by pointing — "V2, but the gap's too tight" edits V2 in place, and lanes are never collapsed into each other, so both the comparison and the history survive.

That is deliberately not "here are three options, pick one", and three rules keep it from becoming that: **V1 is the incumbent**, so the question is always whether anything beats what already exists rather than a taste vote between novelties; **lanes persist**, so a verdict is a direction instead of a terminal choice; and **every lane moves one named thing**, said in its label — a variant whose difference you can't name is slop, and you find out because you can't write its label.

Kind questions get asked; degree questions get rendered. What the thing *is* is worth words. How much of it — spacing, weight, radius, contrast, timing, density — never is: two lanes settle that in a second, and a vague word like "cleaner" becomes lanes along the axes it could mean (more whitespace / fewer borders / lower contrast) rather than a question about which you meant.

It leaves behind:

- **A permanent keeper harness** per topic at `/dev/visual-cook/<topic-slug>` — labeled lanes (current vs. variants), kept after the verdict, with the losers retired from the view but never deleted.
- **One cook index** — a small `index.ts` data file behind a `/dev/visual-cook` catalog page: one row per cook, its status (`settled · superseded · abandoned · wip`), what was ruled, and whether the verdict has actually landed in prod. This is the "have we cooked this before" memory that stops dead ideas being re-cooked.
- **One cook sidebar** — every cook in a project mounts the same sidebar from `harness/nextjs/`: the lanes, the pick-ones and the dials, the versions, what was decided and retired, and a pointing toolbar in its foot. Its state lives in the URL, so one link opens one state; what you save, decide or point at is written to a gitignored `.cook/` folder where Claude reads it.

## v4 — the sidebar

v3's chrome was a skeleton pasted into each cook, and every cook grew its own controls around it. v4 replaces that with one sidebar every cook mounts, shipped as real files in `harness/nextjs/`:

- **Lanes** — the options, as a list, or a menu with a step back and forward once there are more than six.
- **Pick-ones** — a choice among a few named things, each with one line saying what it is.
- **Dials** — [DialKit](https://www.npmjs.com/package/dialkit) sliders, switches, selects and colours set into the sidebar, each kept in the URL under a short name and left out of it when back at its start.
- **Versions** — "Save this one" keeps the whole cook (lane, picks, dials) as its URL, numbered per cook.
- **Pointing** — the [Agentation](https://www.npmjs.com/package/agentation) toolbar sits in the sidebar's foot; a note saved on an element is kept with the page, the words and the element, and listed in the sidebar.
- **Decide** — a pick-one is decided from the sidebar and moves to a Decided section, with Undo.
- **Retire** — a lane is retired from the sidebar and restored from the foot of the list; the first lane, what is live, cannot be retired.
- **The drift line** — a line under the header says when the files a cook imports changed since the cook was last committed, with the commits behind it.

Why: judging by eye works when answering is as cheap as looking. In v3 a verdict still had to be typed: which values, which lane, what was wrong where. Now the answer is a link, a version number, a decided pick or a pointed note, and each is written where Claude reads it next time, so a cook picks up where it was left instead of being described again. The skill itself got shorter: the rules stay, the skeleton moved out of the prose and into files that run.

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

Then, once per app, copy the harness into a Next.js App Router + Tailwind v4 app, from the app's root (the folder with `app/` in it):

```bash
mkdir -p components
cp -R /path/to/visual-cook/harness/nextjs/app/. app/
cp -R /path/to/visual-cook/harness/nextjs/components/. components/
npm install dialkit@1.2.0 agentation@3.0.2 lucide-react@1.16.0 motion@12
echo '/.cook/' >> .gitignore
```

Mount the pointing toolbar once, in `app/layout.tsx`:

```tsx
import { DevTools } from "@/components/dev/DevTools";

// inside <body>, after {children}:
<DevTools />
```

`DevTools` renders nothing in production, every page under `/dev/` answers 404 there, and the `.cook/` records are written by the dev server only. The `@/` alias must point at the app root (create-next-app's default without `src/`). With a `src/` dir, copy into `src/` instead and set `SRC = 'src/'` in `app/dev/cook-drift/route.ts`. The drift line needs the app to be in a git checkout.

## Use

Run the dev server and open `/dev/visual-cook`: the index lists the example cook, which shows every part of the sidebar on a plain card. Delete `app/dev/visual-cook/example/` and `components/ExampleCard.tsx` when you no longer need it, and its entry in `app/dev/visual-cook/index.ts`.

In any Claude Code session, point Claude at the work:

> "Let's visual-cook the empty state on the dashboard."

Claude builds a cook at `/dev/visual-cook/<topic>` with the current component as lane one, adds it to the index, and gives you the link. You answer in the sidebar: pick a lane, move a dial, save a version, decide, retire, or point at what is wrong; then tell Claude "2", "version 3", "I pointed", or paste the URL. Keyboard: H hides and shows the sidebar; its handle docks left, right or bottom.

The skill's rules hold on any stack; the harness is written for Next.js + Tailwind v4.

## Snapshot, not source

This repo is a **published snapshot**. The canon lives in a private brain repo, where the chrome is
edited canon-first (never forked per project) and a snapshot lands here when a cook settles. So the
skill is self-sufficient — copy the harness and you have the sidebar — but the part that makes the
practice compound isn't shippable: the accumulated archive of past lanes, in your own components, is
something you build by using it, not something a snapshot can hand you.

Current snapshot: **2026-10-15** — v4, the one sidebar every cook mounts, shipped as the
`harness/nextjs/` files with an example cook.

## Philosophy

Most visual work goes wrong in one of three ways: arguing about fuzzy words without referents, choosing between novelties with no incumbent to beat, or making decisions in a harness that vanish at handoff because nobody wrote them down. `visual-cook` is built around all three — *render, don't argue*, *lane one is what you already have*, and *the verdict is kept where it was given*: the link, the version, the decided pick and the pointed note are the record.
