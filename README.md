# visual-cook

A [Claude Code](https://claude.com/claude-code) skill for grilling visual work — pinning fuzzy design language ("cleaner", "premium", "pop", "like Linear") to concrete decisions, grounding disagreements in real renders, and recording the result in a durable visual vocabulary.

Use it when:

- a UI "feels off" and you can't say why
- you're setting up or extending a visual system
- you're polishing a single detail and want a real conversation about trade-offs

## What it does

Instead of generating a design and asking "is this good?", `visual-cook` interviews you. It walks the decision tree one question at a time, with its own recommended answer for each. Every vague word either gets pinned in a dictionary (`DESIGN.md`) or shown on screen via a scratch harness that imports the real component — so when the answer lives in the pixels, you point rather than argue in prose.

The skill **documents and decides; it does not edit your component code.** When a variant wins, the decision is recorded; a later session (or you) lands it.

It leaves behind:

- **`DESIGN.md`** at the repo root — a fuzzy→concrete dictionary (`Premium = one accent max, zero shadows. _Not_: more whitespace.`)
- **`docs/ddr/`** — Design Decision Records, but only for choices that are hard to reverse, surprising without context, and the result of a real trade-off.
- **`.visual-cook/<topic>/`** — a scratch harness showing current vs. 2–3 labeled variants in one viewport. Gets deleted once the implementer lands the values.

## Install

Drop the three files into a Claude Code skills directory:

```bash
# user-level (available in every project)
mkdir -p ~/.claude/skills/visual-cook
cp SKILL.md DDR-FORMAT.md DESIGN-FORMAT.md ~/.claude/skills/visual-cook/

# or project-level (committed alongside the repo)
mkdir -p .claude/skills/visual-cook
cp SKILL.md DDR-FORMAT.md DESIGN-FORMAT.md .claude/skills/visual-cook/
```

Claude Code auto-discovers skills in those locations. Restart your session and the skill is available.

## Use

In any Claude Code session, point Claude at the work:

> "Let's visual-cook the empty state on the dashboard — feels limp."

Claude will start the interview, spin up a harness at `.visual-cook/<topic>/`, announce the preview URL, and grill from there. No need to invoke a command — the skill description triggers on UI-feel and visual-system phrasing.

## Files

| File | What it is |
| --- | --- |
| [`SKILL.md`](./SKILL.md) | The skill itself — loaded by Claude Code when a session matches. |
| [`DESIGN-FORMAT.md`](./DESIGN-FORMAT.md) | Format reference for the `DESIGN.md` dictionary. |
| [`DDR-FORMAT.md`](./DDR-FORMAT.md) | Format reference for Design Decision Records. |

## Philosophy

Most visual work goes wrong in one of two ways: arguing about fuzzy words without referents, or making decisions in the harness that vanish at handoff because nobody wrote them down. `visual-cook` is structured around both failure modes — *pin or render, never argue in prose*, and *everything compositional gets a dictionary entry before the harness goes away*.
