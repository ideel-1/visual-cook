# Raw report 1: Claude Code features (research agent, 2026-09-02)

> Corrections applied after the fact:
> - Section 3 below is WRONG. Claude Code has full OpenTelemetry export
>   (`CLAUDE_CODE_ENABLE_TELEMETRY=1`, `OTEL_*` variables, metrics and log events).
>   See FINDINGS.md 1.5 and https://code.claude.com/docs/en/monitoring-usage.
> - Session sharing: claude.ai/code sessions DO have a Private/Team (or Public)
>   visibility toggle. The report missed it. See FINDINGS.md 1.2.
> - The "PostToolBatch" hook name in the original's example scripts does not exist;
>   that section was removed.
> Everything else was consistent with the docs where checked.

## 1. Session transcripts and export

- Stored as JSONL at `~/.claude/projects/<project>/<session-id>.jsonl`; `<project>` is
  the working directory path with non-alphanumerics replaced by `-`. Configurable via
  `CLAUDE_CONFIG_DIR`. Retention 30 days by default (`cleanupPeriodDays`).
- `claude --continue`, `claude --resume`, `claude --resume <id>`, `/resume`.
- `/export` and `/export <filename>` write the rendered conversation as text.
- `claude -p --resume <session-id> --output-format json "summarize what we changed"`.
- Hooks receive `transcript_path`, so a SessionEnd hook can archive transcripts.
- JSONL format is internal and changes between versions.
- No `/share` command in the CLI. Resumed sessions restore history, model, agent,
  permission mode, but not all flags (`--mcp-config`, `--settings`, `--plugin-dir`,
  `--add-dir` must be re-passed).
- Docs: https://code.claude.com/docs/en/sessions

## 2. Hooks

Events (27+): SessionStart, UserPromptSubmit, PreToolUse, PostToolUse,
PostToolUseFailure, Stop, SessionEnd, SubagentStart, SubagentStop, TeammateIdle,
TaskCreated, TaskCompleted, MessageDisplay, Notification, Elicitation,
ElicitationResult, ConfigChange, CwdChanged, FileChanged, DirectoryAdded, PreCompact,
PostCompact, PreModelSwitch, PostModelSwitch, WorktreeCreate, WorktreeRemove,
InstructionsLoaded, StopFailure, Setup.

Common input: `hook_event_name`, `session_id`, `cwd`, `transcript_path`, then
event-specific fields (`tool_name`, `tool_input`, ...).

Output: exit 0 (stdout added as context), exit 2 (block; stderr is feedback), or exit 0
with JSON (`hookSpecificOutput.permissionDecision`, `additionalContext`,
`decision: "block"`, `ok`/`reason` for prompt/agent hooks).

Hook types: `command`, `http` (POST input JSON to `url`; `headers` with `$VAR`
interpolation gated by `allowedEnvVars`; response uses the same output format),
`prompt`, `agent`, `mcp_tool`.

Limits: hooks run only while Claude Code is active; default timeout 10 minutes; HTTP
hooks are request/response, no streaming channel.

Docs: https://code.claude.com/docs/en/hooks-guide , https://code.claude.com/docs/en/hooks

## 3. OpenTelemetry (ORIGINAL TEXT, INCORRECT, KEPT FOR THE RECORD)

Claude Code does NOT expose built-in OpenTelemetry metrics or OTEL-compatible event
streams. (…) Built-in dashboards: Agent View (`claude agents`), local only. Anthropic
Console Usage and cost API and Compliance API exist on the platform side.

Docs: https://code.claude.com/docs/en/agent-view ,
https://platform.claude.com/docs/en/manage-claude/usage-cost-api.md

## 4. Remote Control

- Continue a local session from claude.ai/code or the Claude iOS/Android app;
  execution stays local; all plans, Team/Enterprise must enable in admin settings.
- Full local environment available remotely; conversation and subagent progress sync
  across devices; messages from terminal, browser, phone interchangeably.
- Designed for the same person on multiple devices; sharing to another account is not
  supported by Remote Control itself (see correction: the session list at
  claude.ai/code has a visibility toggle).
- Docs: https://code.claude.com/docs/en/remote-control

## 5. Agent-to-agent

Cross-session messaging (v2.1.224+ macOS/Linux, v2.1.234+ Windows): `ListAgents`,
`SendMessage`; same machine over a Unix socket / named pipe; cross-machine through
Anthropic servers via Remote Control; plain text only; ~1M character cap; rate limits;
`crossSessionInbound: accept|hold|refuse`; `dialogExpiry`; enterprise can deny
`SendMessage` and `ListAgents`.

Agent Teams (experimental, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`): lead + teammates,
shared task list, messaging by name; no session resumption with in-process teammates;
lead fixed; no nested teams; one team per session.

Channels (research preview): MCP servers that push events into a session; Telegram,
Discord, iMessage, fakechat; two-way; needs Anthropic auth, Bun; Team/Enterprise must
set `channelsEnabled: true`; not on Bedrock/Vertex/Foundry.

Docs: https://code.claude.com/docs/en/cross-session-messaging ,
https://code.claude.com/docs/en/agent-teams , https://code.claude.com/docs/en/channels ,
https://code.claude.com/docs/en/channels-reference

## 6. Distributing a design system to agents

Skills (`.claude/skills/<name>/SKILL.md`, user or project scope, or in a plugin):
Markdown instructions auto-loaded when relevant or invoked with `/name`.

Plugins (`.claude-plugin/plugin.json` + `skills/`, `agents/`, `hooks/hooks.json`,
`.mcp.json`, `settings.json`): versioned, namespaced `/plugin:skill`; distributed via
official/community marketplaces, a private git marketplace (a repo with
`.claude-plugin/marketplace.json`, self-hosted GitLab works), direct `/plugin install`,
or `claude --plugin-dir ./path` for development. Install:
`/plugin marketplace add <source>` then `/plugin install name@marketplace`.

MCP servers (`.mcp.json` project scope, `~/.claude.json` user scope, or bundled in a
plugin): a design-system server could expose `get_component_spec`,
`validate_component_usage`, `list_components`, `check_color_compliance`. Build with the
MCP SDKs or `/plugin install mcp-server-dev@claude-plugins-official`.

CLAUDE.md: loaded every session, survives compaction; the place for do's and don'ts and
component usage examples.

Recommended tiers: CLAUDE.md bootstrap; plugin with skills (+ optional MCP); MCP server
for live validation.

Docs: https://code.claude.com/docs/en/skills , https://code.claude.com/docs/en/plugins ,
https://code.claude.com/docs/en/plugin-marketplaces , https://code.claude.com/docs/en/mcp

## 7. GitLab

Claude Code for GitLab CI/CD: beta, maintained by GitLab. One `claude:` job
(`node:24-alpine3.21`, install via `curl -fsSL https://claude.ai/install.sh | bash`,
`claude -p "$AI_FLOW_INPUT" --permission-mode acceptEdits --allowedTools "Bash Read
Edit Write mcp__gitlab" --debug`). Triggers: web/manual, `merge_request_event`, or a
webhook listener calling the pipeline trigger API with `AI_FLOW_INPUT`,
`AI_FLOW_CONTEXT`, `AI_FLOW_EVENT` on `@claude` comments. Providers: Claude API,
Bedrock (OIDC), Vertex (WIF). Self-hosted GitLab supported; `CI_JOB_TOKEN` or a
project access token with `api` scope as `GITLAB_ACCESS_TOKEN`. `mcp__gitlab` tools
create/update MRs, comment, read files and logs. Costs: runner minutes + tokens; use
`--max-turns` and job `timeout`.

Docs: https://code.claude.com/docs/en/gitlab-ci-cd

## 8. Multi-session dashboards

Agent View (`claude agents`): Pinned / Ready for review / Needs input / Working /
Completed; Space to peek, Enter to attach, x to stop; local machine only, own sessions
only. `/list-agents` lists reachable sessions (subagents, teammates, local, cloud,
Remote Control). No organisation-level or multi-machine dashboard is built in.

Docs: https://code.claude.com/docs/en/agent-view
