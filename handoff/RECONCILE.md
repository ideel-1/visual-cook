# Reconcile the research with the real design system

You are running inside the design-system repository. A previous session researched how a
designer can watch a co-worker's coding agent apply this design system, how the two
agents can communicate, how to package the system for agents, and how to roll it out to
a company. That session had no access to this repo. Its findings are in
`FINDINGS.md` next to this file. Your job is to correct them against reality and turn
them into work.

## Step 1. Learn the actual design system (before reading any findings)

Read the repo. Answer these in writing, with file paths:

1. What is the design system made of? Component library, tokens, docs, Storybook,
   Figma links, CSS, framework. What is the stack (React, Vue, Web Components, plain
   CSS, Tailwind, other)?
2. How is it currently delivered to the engineer? (The research assumed a zip file.)
3. What agent-facing files already exist: `CLAUDE.md`, `AGENTS.md`, `DESIGN.md`,
   `.claude/`, `.cursor/`, skills, hooks, MCP config, a `tokens.json`, a lint or check
   script?
4. What does versioning look like? Tags, changelog, package.json version, nothing?
5. Where is the consumer app (the machine console)? Same repo, another repo, unknown?
6. What can you find about the team's tooling: GitLab CI config, package registry,
   Storybook build, any CI at all?

Write this as `docs/agent-monitoring/CONTEXT.md`. Do not skip this step. The point of
the exercise is that the research was made without it.

## Step 2. Read `FINDINGS.md` and mark each assumption

`FINDINGS.md` tags claims as **verified** (checked against official docs), **secondary**
(from search summaries, forum posts, vendor blogs) or **assumed** (a guess about this
team's setup). For every **assumed** item, and any **secondary** item that matters to a
decision, write one of: `holds`, `wrong because …`, `unknown, needs a human`.

Put the list in `docs/agent-monitoring/ASSUMPTIONS.md`.

## Step 3. Rewrite the plan for this repo

Produce `docs/agent-monitoring/PLAN.md`. Same three rings as the findings (in the repo,
admin once, per person once), but with real file paths, real package names, the real
stack, and only the options that survive step 2. Keep it short. Say what to do today,
this week, and later. Name the pilot pass marks.

## Step 4. Produce the ring-0 files, as proposals

Create these, or propose diffs if they already exist. Do not overwrite existing files
without showing the diff first.

- `AGENTS.md` at the repo root with the rules an agent needs to apply this system
  correctly, written from the actual components and tokens. Keep it under 80 lines.
- `CLAUDE.md` containing `@AGENTS.md` and nothing else, unless one already exists, in
  which case add the import.
- `.claude/skills/apply-design-system/SKILL.md`: a step-by-step how-to for restyling a
  screen with this system, in the Agent Skills format (YAML front matter with `name`
  and `description`, then instructions).
- `.claude/settings.json` with `PostToolUse`, `PostToolUseFailure` and `Stop` HTTP
  hooks pointing at a placeholder URL `http://lan-box:4000/events`. Explain in a
  comment file next to it what the LAN box is and which dashboards accept that
  payload.
- `.gitlab/issue_templates/ds-feedback.md` with the fixed fields: Component, Where,
  Needed, Tried, Design-system version, Blocking.
- A check script scaffold at `scripts/ds-check` (or the equivalent for the stack)
  that fails on raw colour values and raw spacing outside the token set. If a linter
  config already exists, extend it instead.
- `tokens.json` in W3C DTCG format, generated from wherever the real values live, if
  no such file exists yet. If the values live in Figma or in CSS only, say so and
  generate what you can.

## Step 5. Report

Finish with a short summary: what you learned that the research got wrong, what you
created, what needs a human decision. List the human decisions as questions with your
recommended answer for each.

## Rules

- Read before writing. Every claim about this repo must cite a path.
- Prefer the existing conventions of this repo over the ones in the findings.
- Do not install anything. Do not change CI. Propose, then wait.
- Claude Code facts in `FINDINGS.md` were verified against docs on 2026-09-02. If you
  have web access, re-check anything marked secondary before relying on it.
