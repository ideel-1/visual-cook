# Handoff: agent monitoring + design-system distribution research

Research done in an isolated cloud session on 2026-09-02, without access to the real
design system or the console app. Everything here is a starting point for a local
Claude Code session that *does* have that context.

## What is in this folder

| File | What it is | Who reads it |
|---|---|---|
| `briefing.html` | The rendered briefing page (same as the published artifact). | You, in a browser. |
| `FINDINGS.md` | Every finding as Markdown, each marked **verified** / **secondary** / **assumed**. | The local agent. |
| `RECONCILE.md` | The prompt to run in a local session. Reads the design system, checks the assumptions, rewrites the plan, produces files. | You paste it; the agent runs it. |
| `SOURCES.md` | Every URL used. | Agent, for re-verification. |
| `research-raw/` | The unedited research reports the findings came from. More detail, some errors (noted at the top of each). | Agent, when FINDINGS.md is not enough. |

## Get it onto your Mac

From your existing visual-cook checkout, pull only this folder without merging the branch:

```bash
cd ~/path/to/visual-cook
git fetch origin claude/design-system-agent-monitoring-d5lqft
git checkout origin/claude/design-system-agent-monitoring-d5lqft -- handoff
git restore --staged handoff        # leave it untracked in this repo
mv handoff ~/path/to/design-system/docs/agent-monitoring
```

Or check the branch out normally and copy the folder. Either way the folder ends up
inside the design-system repo, next to the real thing.

## Run the reconciliation

```bash
cd ~/path/to/design-system
claude
```

Then, in the session:

```
Read docs/agent-monitoring/RECONCILE.md and do what it says.
```

The prompt tells the agent to read the design system first, then the findings, then
list every assumption that turned out wrong, then produce the adjusted plan and the
concrete files (rules file, hook config, issue template, check script scaffold).

## If you want a separate repo instead

This folder is self-contained. `git init` inside it, or push it as a new project on
your GitLab. Nothing here depends on visual-cook.
