# Raw report 2: ecosystem (research agent, 2026-09-02)

> Sourcing note from the agent: its egress proxy blocked docs.gitlab.com,
> storybook.js.org, grafana.com, chromatic.com, figma.com, vibekanban.com,
> linuxfoundation.org and several blogs; for those it used GitLab's docs source in the
> gitlab.com repo, Storybook's docs source on GitHub, and search-result summaries.
> Treat those items as secondary.

## 1. Agent observability dashboards for Claude Code

What Claude Code emits: hooks (~30 event types, HTTP hooks POST to any URL) and
OpenTelemetry (`CLAUDE_CODE_ENABLE_TELEMETRY=1`; metrics `session.count`,
`lines_of_code.count`, `cost.usage`, `token.usage`, `code_edit_tool.decision`; events
`user_prompt`, `tool_result`, `tool_decision`, `api_error`, `mcp_server_connection`;
content redacted unless `OTEL_LOG_TOOL_DETAILS=1`, `OTEL_LOG_USER_PROMPTS=1`,
`OTEL_LOG_TOOL_CONTENT=1`; tracing beta). Hooks carry tool inputs/outputs and failures,
so they are the better source for "what is the agent doing and where did it get stuck".

Hook-based dashboards:

| Project | Shows | Setup | Multi-machine | Phone |
|---|---|---|---|---|
| disler/claude-code-hooks-multi-agent-observability (1.5k stars, 385 forks, 16 commits) | Timeline with per-session swim lanes, live pulse chart, transcripts, filters by app/session/event; surfaces PostToolUseFailure/PermissionRequest | Bun server :4000 (SQLite + WebSocket) + Vue client :5173; copy `.claude/` hooks into the project, set `--source-app`; Python `send_event.py` via uv | Yes in principle, hooks POST to `/events` over HTTP; no auth | Responsive layout claimed, untested |
| simple10/agents-observe (665 stars, 891 commits, active) | Tool calls, file ops, subagent hierarchy, token stats, session replay, full payloads; installs as a plugin (`claude plugin install agents-observe`), :4981 | Docker + Node + Bash | Not documented; local SQLite; no auth | Web UI |
| cognoco/observatory | Fork of disler's | same | same | same |

OTel-based: Grafana Cloud "Claude Code integration" (March 2026) and community
dashboards 25052 and 25255 (cost, tokens, sessions, active time, LOC, commits, tool
decisions, cache-hit ratio, leaderboards); self-hosted Grafana + Prometheus/Loki/
VictoriaMetrics walkthroughs; NikiforovAll/ccdashboard. Datadog AI Agents Console
(Claude Code, Cursor, Copilot via OTLP). Honeycomb. o11y-dev/opentelemetry-hooks
converts hook events (Claude, Codex, Cursor, Copilot, Gemini) into OTel spans;
TechNickAI/claude_telemetry wraps `claude` as `claudia` and logs tool calls to
Logfire/Sentry/Honeycomb/Datadog. General Analysis guide covers metrics/events/traces/
hooks/MCP/SIEM.

Usage monitors (cost, not activity): ccusage (~16.5k stars), Claude-Code-Usage-Monitor
(~8.6k stars).

Multi-agent managers (single machine): Vibe Kanban (Bloop shut down 10 April 2026;
cloud pairing sunset; now community-maintained, local; Tailscale for phone; one
instance = one account), Conductor (macOS, closed), Crystal/Nimbalyst, claude-squad
(tmux). Claude Code `claude agents` is local only.

Verdict: hook → HTTP → LAN dashboard is the only thing that shows "what did the agent
try, what failed" in real time to another person; OTel/Grafana answers "how much".

## 2. Terminal session sharing

| Tool | Model | LAN self-host | Read-only | Phone | Status |
|---|---|---|---|---|---|
| ttyd (12.3k stars) | PTY as xterm.js page | `ttyd -i <ip> -c user:pass tmux attach` | default; `-W` allows input; `-S` TLS | best option; wide transcripts wrap | mature |
| gotty | same, Go | yes | flag | browser | unmaintained |
| tmux + tmate | SSH + read-only web link | self-host tmate server | yes | relay unless self-hosted | Homebrew disable date 2026-12-11 |
| upterm (1.3k) | SSH sharing, self-host uptermd | yes | limited | SSH app on phone | maintained |
| VS Code Live Share | editor + terminal share, web join | Microsoft relay | terminals read-only by default | impractical on phone | mature |
| Tuple / Pop | native screen share | no | viewer restriction | no mobile viewer | paid |

Anthropic-native: Remote Control (own account only); Channels (Telegram/Discord/
iMessage; allowlist per sender ID, so a colleague can be allowlisted; allowlisted
senders can approve permissions if relayed); a `Stop`/`Notification` hook to a
Slack/Discord webhook for "finished / needs input".

## 3. Packaging the design system

Mechanism: npm package in the self-hosted GitLab Package Registry (publish from CI with
`CI_JOB_TOKEN`, project-scoped `.npmrc`, semantic-release documented) > monorepo
package (best agent ergonomics, worst for a non-git designer) > git submodule (agents
handle badly; avoid). shadcn-style registry (`registry.json`, `shadcn registry:mcp`)
works if the system is React/Tailwind-shaped.

Agent-readable: W3C DTCG tokens (stable 2025.10, 28 Oct 2025; Style Dictionary v4+;
Tokens Studio via `@tokens-studio/sd-transforms`). DESIGN.md (Google, March 2026,
alpha, Apache-2.0, ~27.7k stars; YAML front matter + eight sections; `npx
@google/design.md lint|diff|export|spec`; export → Tailwind config, CSS, DTCG
tokens.json; lint → token refs + WCAG contrast, JSON output; read by Claude Code,
Cursor, Gemini CLI, Antigravity). AGENTS.md / CLAUDE.md (Claude reads CLAUDE.md; import
AGENTS.md with `@AGENTS.md`). Storybook MCP (Storybook 10.3, `@storybook/addon-mcp`
0.7 / `@storybook/mcp` 0.8; docs toolset backed by a build-time component manifest;
dev toolset `get-changed-stories`, `preview-stories`; test toolset `run-story-tests`;
standalone server can serve a static build; Chromatic hosts it; the Storybook team's
experiment found even a plain component list with descriptions measurably improves
agent output). Figma MCP + Code Connect (14 tools as of Feb 2026; paid seats).
southleft/design-systems-mcp is generic DS knowledge, not "your DS".

Practitioner guidance: always-on foundations in rules files, MCP for on-demand
component detail, AGENTS.md as orchestration layer (intodesignsystems.com/agentic-
design-systems); Figma → DTCG → Style Dictionary → AGENTS.md (atomize.tools).

Verdict: versioned npm package (GitLab registry) with components + `tokens.json` +
`DESIGN.md`, plus a published Storybook with `@storybook/mcp`.

## 4. Agent-to-agent protocols

MCP: donated to the Linux Foundation's Agentic AI Foundation Dec 2025; ~97M monthly
SDK downloads by Feb 2026; tool access, not orchestration. A2A: donated June 2025;
v1.0 March 2026; 150+ orgs; reportedly joined AAIF 20 Aug 2026 (secondary); no
evidence Claude Code speaks it. Claude Code Agent Teams: one machine, one user.
Cross-session messaging: same account only; hooks/scripts can post into a session's
inbox socket (`CLAUDE_CODE_MESSAGING_SOCKET`).

Patterns in use: OpenMOSS/claude-codex-handoff (`.handoff/` JSONL streams, 37 stars);
HANDOFF.md / findings docs committed to the branch; a shared issue tracker as the queue
(GitLab issues labelled `ds-feedback` filed via GitLab MCP or `glab`); MR review by an
agent.

## 5. GitLab-native

GitLab Duo Agent Platform: GA in 18.8 (Jan 2026) on GitLab.com, Self-Managed,
Dedicated; flows (Developer, Fix CI/CD pipeline, Code Review); Agentic Chat; Premium or
Ultimate; fully self-hosted needs a self-hosted AI Gateway. External agents (Claude
Code Agent, Codex Agent) from 18.6: admins add via UI/rake/REST; users @-mention,
assign, or request review from the agent's service account; `injectGatewayToken: true`
routes through GitLab's AI Gateway. Sessions UI (Automate/AI → Sessions): every run
with status, steps, tool calls, logs; checkpoints with Approve/Reject/Modify; cancel.
Claude Code in GitLab CI (official, beta, GitLab-maintained). Community:
RealMikeChong/claude-code-for-gitlab (120 stars) ships the webhook service and a CI
include. MR review bots: Qodo PR-Agent (open source, self-hostable), CodeRabbit (SaaS).
Claude Code on the web / Slack: GitHub only; self-managed GitLab is
anthropics/claude-code#70565. GitLab has no official mobile app; the web UI handles
issues, MR comments, pipeline Run, Sessions.

## 6. Feedback loops

Visual regression: Chromatic (SaaS, GitLab supported); Playwright `toHaveScreenshot`
(free, flaky baselines); Argos (open core; self-managed GitLab needs Enterprise);
BackstopJS (MIT, local); Lost Pixel shut down April 2026; Storybook Vitest addon has no
built-in screenshot matcher (community addons fill it).

Token/compliance linting: stylelint `declaration-strict-value` /
stylelint-design-tokens-plugin; Atlassian `@atlaskit/eslint-plugin-design-system`
`ensure-design-token-usage`; ds-lint (Rust, 244 rules, new, unproven);
@lapidist/design-lint (DTIF, tiny); DESIGN.md linter; Storybook MCP `run-story-tests`.

Wiring: run the lint + story tests in GitLab CI on the engineer's MRs; publish
JUnit/Code Quality reports so violations show inline in the MR; have the agent's
`Stop` hook or a CI job open a `ds-feedback` issue when a rule cannot be satisfied.

## Synthesis (agent's own)

1. DS repo on self-hosted GitLab → CI publishes `@org/ds` (components + DTCG
   tokens.json + DESIGN.md) to the GitLab npm registry and a static Storybook with
   `@storybook/mcp`.
2. Engineer's agent: CLAUDE.md imports DESIGN.md and points at the Storybook MCP;
   stylelint/ds-lint gate in CI; a hook posts failures/stops to a LAN observability
   server and opens `ds-feedback` issues.
3. Designer observing: live via ttyd or the disler dashboard on LAN; async via GitLab
   MR/pipeline/Sessions pages; pings via a Discord channel or webhook hook.
4. Agents "talking": GitLab issues/MR threads with a fixed template as the mailbox.
