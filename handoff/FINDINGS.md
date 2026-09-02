# Findings

Date: 2026-09-02. Context assumed: a designer (Rado) and one engineer, both on Claude
Code in the terminal, company on self-hosted GitLab, Claude Code organisation-wide,
some Cursor, some Gemini, a few Codex users, mostly Linux, some macOS, some Windows.
The designer ships a design system to the engineer, whose agent applies it to a
console for physical machines.

Tags: **verified** = checked against official docs. **secondary** = search summaries,
forum posts, vendor blogs. **assumed** = a guess about this team's situation that the
local session must check.

---

## 1. Watching another person's agent

### 1.1 What Claude Code does not do

- **verified** No feature lets one person watch another person's local Claude Code
  session live under their own login. Open requests: anthropics/claude-code issues
  40981 and 60082.
- **verified** Cross-session messaging (`ListAgents`, `SendMessage`) works between
  sessions of the *same account*: same machine over a Unix socket, other machines
  through Anthropic servers while Remote Control is connected. It does not cross
  accounts. Requires Claude Code v2.1.224+.
- **verified** Agent View (`claude agents`) lists only your own background sessions on
  your own machine.

### 1.2 Option: Remote Control + share link (zero setup)

- **verified** `claude --remote-control "name"` or `/remote-control` mirrors a local
  session to claude.ai/code and the Claude iOS/Android app. Execution stays local.
  Connected devices get the conversation and a diff pane of uncommitted changes.
- **verified** Requirements: claude.ai login (Pro, Max, Team, Enterprise), not an API
  key; not Bedrock/Vertex/Foundry; `ANTHROPIC_BASE_URL` must be api.anthropic.com
  (no LLM gateway). On Team/Enterprise an Owner enables the toggle in admin settings.
  `DISABLE_TELEMETRY`, `DO_NOT_TRACK`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`,
  `DISABLE_GROWTHBOOK` each break it.
- **verified** Sessions at claude.ai/code have a visibility toggle. Team/Enterprise:
  Private or Team (visible to org members). Pro/Max: Private or Public. "Recipients
  see the latest state when they open the link, but their view doesn't update in
  real time." Repository access verification and name hiding are configurable.
- **assumed** That the visibility toggle appears on a Remote Control-backed session,
  not only on cloud-started sessions. The docs describe sharing under cloud sessions;
  Remote Control sessions appear in the same list. Five-minute test.
- **verified** `/export [file]` writes the conversation as readable text.
  `claude -p --resume <session-id> "question"` asks a finished transcript a question
  on the machine that holds it. Transcripts live in `~/.claude/projects/<dir>/*.jsonl`,
  internal format, 30-day default retention (`cleanupPeriodDays`).

### 1.3 Option: Entire checkpoints (session transcripts in git)

- **verified (repo README)** entireio/cli, MIT, ~5k stars, ~8k commits. `entire enable`
  in a repo hooks the agent. At each commit the session (transcript, prompts, tool
  calls, files touched, tokens) is stored as a checkpoint under
  `refs/entire/checkpoints/<shard>/<id>`, linked by an `Entire-Checkpoint` commit
  trailer. Never commits on the working branch. Shadow branches
  `entire/<commit7>-<worktree6>` during a session.
- **verified (repo README)** Works with any git host including GitLab. Teammates read
  with `entire checkpoint list`, `entire checkpoint explain <id>`, `entire search`,
  no account needed. Supports Claude Code, Codex, Copilot CLI, Cursor, Factory Droid,
  Gemini CLI, OpenCode, Pi. Homebrew (`brew tap entireio/tap && brew install --cask
  entire`) and Scoop.
- **secondary** No web viewer; entire.io syncs to a hosted view for display if you
  log in. CLI is enough for this use.
- **assumed** That committing transcripts into the console repo is acceptable to the
  engineer and the company. Alternative: a fork or a dedicated repo.

### 1.4 Option: hooks → LAN dashboard (live, everyone)

- **verified** Hook events include `SessionStart`, `UserPromptSubmit`, `PreToolUse`,
  `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`/`Notification`, `Stop`,
  `SubagentStart/Stop`, `SessionEnd`, and about 20 more. Input JSON carries
  `hook_event_name`, `session_id`, `cwd`, `transcript_path`, and for tool events
  `tool_name`, `tool_input`, tool output/error.
- **verified** Hook type `"http"` POSTs the input JSON to `url` with
  `Content-Type: application/json`; optional `headers` with `$ENV` interpolation
  gated by `allowedEnvVars`; `timeout` default 600 s. Response uses the normal hook
  output format, so an endpoint can also block.
- **verified** Hooks in a project's `.claude/settings.json` are shareable, run for
  every teammate who opens the repo after workspace trust, and also run in
  `claude -p` (unless `--bare`). Plugins can ship hooks in `hooks/hooks.json`.
- **secondary** Dashboards consuming this feed:
  - disler/claude-code-hooks-multi-agent-observability (~1.5k stars): Bun server on
    :4000 + Vue client on :5173, SQLite, WebSocket; swim lane per session, live pulse
    chart, filters, transcripts. Hooks are scripts that POST to `/events`, so the
    server can be another machine. No auth. Demo-grade (16 commits).
  - simple10/agents-observe (~650 stars, active): installs as a Claude Code plugin,
    dashboard on :4981 with tool calls, file ops, subagent tree, replay. Local-only
    by default.
  - o11y-dev/opentelemetry-hooks: turns hook events from Claude Code, Codex, Cursor,
    Copilot and Gemini into OpenTelemetry spans. Bridge from hooks to a collector.
- **assumed** A spare machine on the office LAN exists to host this, and the LAN is
  trusted enough for an unauthenticated dashboard.

Example config (project `.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [{ "matcher": "Edit|Write|Bash",
      "hooks": [{ "type": "http", "url": "http://lan-box:4000/events" }] }],
    "PostToolUseFailure": [{ "hooks": [{ "type": "http", "url": "http://lan-box:4000/events" }] }],
    "Stop": [{ "hooks": [{ "type": "http", "url": "http://lan-box:4000/events" }] }]
  }
}
```

### 1.5 Option: OpenTelemetry export (fleet view)

- **verified** Built in. `CLAUDE_CODE_ENABLE_TELEMETRY=1`, `OTEL_METRICS_EXPORTER`
  (otlp|prometheus|console), `OTEL_LOGS_EXPORTER` (otlp|console),
  `OTEL_EXPORTER_OTLP_PROTOCOL` (grpc|http/json|http/protobuf),
  `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`. Traces beta behind
  `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`. Export intervals: metrics 60 s, logs 5 s.
- **verified** Metrics: `claude_code.session.count`, `lines_of_code.count`,
  `pull_request.count`, `commit.count`, `cost.usage`, `token.usage`,
  `code_edit_tool.decision`, `active_time.total`.
- **verified** Events: `claude_code.user_prompt`, `assistant_response`, `tool_result`
  (`tool_name`, `success`, `duration_ms`, `error_type`), `tool_decision`,
  `api_request` (cost, tokens, model), `api_error`, `api_refusal`,
  `permission_mode_changed`, `auth`, `mcp_server_connection`. All carry `session.id`,
  `user.email` when authenticated, `prompt.id`, and `OTEL_RESOURCE_ATTRIBUTES`.
- **verified** Content is redacted unless enabled: `OTEL_LOG_USER_PROMPTS`,
  `OTEL_LOG_ASSISTANT_RESPONSES`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT`,
  `OTEL_LOG_RAW_API_BODIES`. Managed settings can set all of this org-wide and lock
  the destination.
- **secondary** Grafana Cloud has a Claude Code integration; community dashboards
  25052 and 25255 (Prometheus). Datadog AI Agents Console and Honeycomb support the
  same feed. Gemini CLI has its own OTel export that can target the same collector.

### 1.6 Option: GitLab runs the agent

- **verified** Claude Code for GitLab CI/CD is beta, maintained by GitLab (support
  issue gitlab-org/gitlab#573776). One job installs the CLI and runs
  `claude -p "$AI_FLOW_INPUT" --permission-mode acceptEdits --allowedTools "Bash Read
  Edit Write mcp__gitlab"`. Triggers: manual/web, MR events, or a webhook listener you
  host that calls the pipeline trigger API with `AI_FLOW_INPUT/CONTEXT/EVENT` on
  `@claude` comments. Claude API, Bedrock or Vertex. Self-managed GitLab supported.
  Uses `CI_JOB_TOKEN` or a project access token.
- **secondary** RealMikeChong/claude-code-for-gitlab ships the webhook listener as a
  Docker service.
- **secondary** GitLab Duo Agent Platform (GA in 18.8, Premium/Ultimate) adds external
  agents (Claude Code Agent as a service account you @-mention) and a Sessions page
  showing each run step by step with approve/reject checkpoints.
- **assumed** Whether the company's GitLab tier includes Duo, and whether a runner
  with network access to the Anthropic API exists.

### 1.7 Option: channels / chat pings

- **verified** Channels are a research preview: an MCP server pushes events into a
  running session; Telegram, Discord, iMessage plugins; `claude --channels
  plugin:telegram@claude-plugins-official`; per-sender allowlist via pairing codes.
  Team/Enterprise need `channelsEnabled: true` from an Owner. Not on Bedrock/Vertex/
  Foundry. Anyone on the allowlist can approve permission prompts if relayed.
- **verified** Simpler: a `Stop` or `Notification` hook that POSTs to a Slack/Discord
  webhook.

### 1.8 Option: terminal in a browser

- **secondary** ttyd (tsl0922/ttyd, ~12k stars): `ttyd -i 0.0.0.0 -c user:pass tmux
  attach -t name`, read-only by default, `-W` to allow input. tmate is effectively
  abandoned (Homebrew disable date 2026-12). VS Code Live Share works but through
  Microsoft's relay. Tuple has no mobile viewer.

---

## 2. Products built for multiple people's agents

All **secondary** unless noted.

| Product | Teammate can | Runs | Self-hosted GitLab | Notes |
|---|---|---|---|---|
| Amp (Sourcegraph) | Read. Threads shared with the workspace by default; visibility levels public/unlisted/workspace/group/private; Thread Map. | Local CLI, threads sync to ampcode.com | n/a | Different agent and model mix. |
| Warp / Oz | Read + steer. "All" tab shows teammates' shared cloud sessions; authorized teammates attach to a running task. Local session sharing exists too. | Warp cloud or Warp terminal | check | Warp's agent, not Claude Code. Oz name until 2026-09-15. |
| Cursor Cloud Agents | Read others' cloud agents; steer if admin enables "team follow-ups". | Cursor cloud | Teams/Enterprise; GitLab Premium/Ultimate needed for tokens; forum reports of bugs on self-hosted | |
| Devin | Read via "Session Subscribers"; Devin Local "Share Conversation" gives a team-visible sanitised transcript link. | Devin cloud / local | Enterprise, VPC | |
| OpenAI Codex cloud | Admin monitoring and analytics; GitLab support incl. self-managed 19.0+. | OpenAI cloud | Yes | |
| Factory Droids | Org analytics, not session viewing. | Local + cloud | Enterprise plan | |
| GitHub Copilot coding agent | Read sessions on PRs. | GitHub | No | Not applicable. |
| Claude Code on the web / Claude in Slack | **verified** Team visibility on cloud sessions; Slack-started sessions Team-visible by default; self-hosted runners (Team/Enterprise beta) run sessions inside your network. | Anthropic cloud or your runners | **verified** No: "sessions check out repositories from GitHub", also on self-hosted runners. GitLab is issue 70565. | Least disruptive if GitLab lands. |
| Omnara, Happy | Per-user command center for your own Claude Code/Codex sessions across machines; Happy self-hosts with Docker Compose. | Laptop + relay | n/a | Solves phone access to your own sessions. |
| Coder Tasks | Was the self-hosted team task board for Claude Code. Being removed from Coder from v2.37 (2026-09). | | | Dead end. |
| Entire | Read any session whose commit you can pull. | Laptops + git | Yes | See 1.3. |

Conclusion drawn: for two people on Claude Code with self-hosted GitLab, none is worth
switching for. The shared-thread idea is had via Entire; the live board via hooks.

---

## 3. Agent-to-agent

- **verified** No cross-account messaging in Claude Code. Agent Teams are experimental
  (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), single machine.
- **secondary** A2A protocol reached 1.0 in 2026 under the Linux Foundation; no
  evidence Claude Code speaks it.
- Pattern proposed: a GitLab issue labelled `ds-feedback` with fixed fields
  (Component, Where, Needed, Tried, Design-system version, Blocking). The engineer's
  agent files it when blocked (rule in CLAUDE.md/AGENTS.md; posts via GitLab MCP server
  or `glab`). The designer's agent reads open issues at session start. With Entire the
  issue links commit links checkpoint.
- **assumed** The engineer's repo has a CLAUDE.md the designer may add a rule to, and
  the GitLab MCP server or `glab` is available to his agent.

---

## 4. Packaging the design system for agents

- **assumed** The system is currently delivered as a zip of components plus docs.
- **assumed** Stack is React/TypeScript. (visual-cook's own skeleton assumes Next.js +
  Tailwind v4, which is the only hint.)
- **secondary** DESIGN.md (google-labs-code/design.md, alpha, ~28k stars, March 2026):
  YAML front matter of tokens + eight prose sections; `npx @google/design.md lint |
  diff | export | spec`; export emits Tailwind config, CSS, DTCG tokens.json; lint
  checks token refs and WCAG contrast with JSON output; read by Claude Code, Cursor,
  Gemini CLI, Antigravity.
- **secondary** W3C DTCG Design Tokens Format Module first stable version 2025.10
  (28 Oct 2025). Style Dictionary v4+ reads it; Tokens Studio exports it.
- **verified** Claude Code reads `CLAUDE.md`, not `AGENTS.md`, unless imported with
  `@AGENTS.md`. **secondary** Cursor, Codex and Gemini CLI read `AGENTS.md`.
- **secondary** Agent Skills (SKILL.md, agentskills.io) is an open standard adopted by
  Cursor, Codex, Gemini CLI, Claude Code and ~40 tools. Codex reads `.agents/skills/`;
  Claude reads `.claude/skills/`; symlink one to the other.
- **verified** Claude Code plugins bundle skills, hooks, agents, MCP servers in
  `.claude-plugin/plugin.json`; a private marketplace is a git repo with
  `.claude-plugin/marketplace.json`, can live on self-hosted GitLab; installed with
  `/plugin marketplace add` + `/plugin install name@marketplace`, or pre-enabled by
  managed settings (`extraKnownMarketplaces`, `enabledPlugins`).
- **secondary** Storybook 10.3 `@storybook/addon-mcp` / standalone `@storybook/mcp`
  serves component docs (`list-all-documentation`, `get-documentation`), dev tools and
  `run-story-tests` from a static build; Chromatic hosts it. Storybook's own experiment
  found a plain component list with descriptions measurably improves agent output.
- **secondary** Token linting: stylelint `declaration-strict-value` /
  stylelint-design-tokens-plugin; Atlassian `ensure-design-token-usage` ESLint rule as
  reference; ds-lint (Rust, new, unproven).
- **secondary** GitLab package registry: publish npm from CI with `CI_JOB_TOKEN`;
  project-scoped `.npmrc`.
- Proposed layout:

```
design-system/
├── DESIGN.md
├── tokens.json                (DTCG)
├── AGENTS.md                  (rules; Cursor/Codex/Gemini)
├── CLAUDE.md                  (@AGENTS.md)
├── src/                       (components)
├── stories/                   (optional, Storybook + MCP)
├── scripts/ds-check           (token lint)
├── .claude/skills/apply-design-system/SKILL.md
├── .claude/settings.json      (hooks)
├── .agents/skills -> ../.claude/skills
├── .gitlab/issue_templates/ds-feedback.md
└── CHANGELOG.md
```

---

## 5. Company rollout

- **verified** Managed settings apply above user/project/local settings and cannot be
  overridden. Delivery: server-managed settings from the claude.ai admin console
  (Team/Enterprise; fetched at startup, polled hourly; a hook or `env` change waits
  for the developer to accept a dialog once in an interactive session), or a file:
  `/etc/claude-code/managed-settings.json` (Linux, WSL),
  `/Library/Application Support/ClaudeCode/managed-settings.json` (macOS),
  `C:\Program Files\ClaudeCode\managed-settings.json` (Windows; the old ProgramData
  path is no longer read), plus `managed-settings.d/*.json` drop-ins, or an MDM
  profile (`com.anthropic.claudecode`). Keys include `env`, `hooks`, `permissions`,
  `extraKnownMarketplaces`, `strictKnownMarketplaces`, `allowManagedHooksOnly`,
  `channelsEnabled`, `crossSessionInbound`.
- **verified** Cloud sessions in Anthropic-hosted environments read only
  server-managed settings.
- Proposed rings: (0) files in the repo, nobody installs anything, this is the pilot;
  (1) admin console once: OTel env, failure/stop hooks, marketplace + enabledPlugins;
  (2) per person once: `entire enable`, `claude --remote-control`.
- **assumed** Someone has Owner access to the claude.ai admin console, or a way to
  place files on laptops.
- **assumed** Cursor users are on a plan with hooks; the opentelemetry-hooks bridge
  is the path for them and for Gemini/Codex.
- Pilot pass marks proposed: never needed to sit at his desk; every block became a
  ds-feedback issue closed by a version bump; MR passes ds-check without hand fixes;
  he would keep the hooks and rules file.

---

## 6. Things the research got wrong or could not check

- The first research pass claimed Claude Code has no OpenTelemetry export. It does;
  section 1.5 is from the official docs.
- Warp, Devin, GitLab docs and Grafana docs were blocked from the research
  environment; those rows rest on search summaries.
- Two spawned research agents died on a rate limit; the products table came from
  direct searches and is narrower than the first pass.
- Nothing here was checked against the actual design system, the console app, the
  company's GitLab tier, or the Claude plan in use.
