# Raw notes: multiplayer agent products, self-hosted environments, managed settings

Direct searches and doc fetches, 2026-09-02. Kept close to the source wording.

## Amp
- Visibility levels: Public, Unlisted (link + workspace), Workspace-shared, Group-shared (Enterprise), Private (you + workspace admins).
- "If you're in a workspace, your threads are shared by default with your workspace."
- CLI: `/` palette → "thread: set visibility". Web: sharing menu.
- Thread Map visualises agent activity across threads.

## Devin
- 2026 release notes: "Session Subscribers" to follow others' sessions; sessions sidebar filtering by subscriber; Devin Local "Share Conversation" uploads a sanitised transcript (system prompts/tool defs removed, secrets redacted, paths normalised) and copies a team-visible link; Slack threads route replies back to the session.

## Cursor
- Cloud Agents dashboard shows environment/build per agent. Viewing other users' cloud agents is read-only; a team admin can enable "team follow-ups" so members can message agents created by others.
- Team analytics: admins see all users; members see themselves and sometimes select others.
- GitLab: self-hosted needs Teams/Enterprise plan and a Cursor admin; GitLab Premium/Ultimate for project access tokens; private connectivity for Enterprise. Forum bug reports: cloud agents on self-hosted GitLab terminate quickly, group projects fail.

## Codex
- GitLab connection across ChatGPT plans, admin-enabled; Self-Managed/Dedicated needs GitLab 19.0+. Tasks from issues/MRs with @codex; MR reviews.
- Cloud tasks see only the repo; no local files, no private network.
- Workspace admins get environment controls, monitoring and analytics.

## Warp / Oz
- Centralised view of agent activity across account and team (Warp app or oz.warp.dev). Personal tab = own conversations; All tab adds cloud agent sessions shared by teammates.
- Shared session opens the run transcript: prompt, plan, commands, logs, files changed, outputs, follow-ups. Authorized teammates can attach to a running task and, where supported, steer it.
- Local agent session sharing also documented (docs.warp.dev blocked from here).
- Oz name kept until 2026-09-15.

## Factory
- Analytics across org (active users, sessions, messages, files/lines, commits, PRs, tool invocations). Not session viewing.
- Self-managed GitHub Enterprise Server or GitLab via an OAuth app you register; Enterprise plan; a `factory-droid` service user with one org-level authorisation.

## Coder Tasks
- "Tasks will be removed from new Coder releases beginning with v2.37 (September 1, 2026) and will only be available via the ESR during the support period."

## Entire
- github.com/entireio/cli, MIT, 5k+ stars, 406 forks, 8,230 commits, 85 open issues.
- Agents: Claude Code, Codex, Copilot CLI, Cursor, Factory Droid, Gemini CLI, OpenCode, Pi, external agents on $PATH.
- Install: `brew tap entireio/tap && brew install --cask entire`; `scoop install entire/entire`; `entire enable` per repo.
- Storage: `refs/entire/checkpoints/<shard>/<id>`; `Entire-Checkpoint` trailer on commits; shadow branches `entire/<hash7>-<worktree6>` during sessions; a hidden `entire/checkpoints/v1` branch mentioned in third-party writeups.
- Any git host. Teammate commands: `entire checkpoint list`, `entire checkpoint explain <id>`, `entire search`. No account needed. No web viewer in README.
- Company: $60M seed, Thomas Dohmke.

## Omnara / Happy
- Omnara: open-source "command center"; run agents on your laptop, VM or sandboxes (Blaxel, Daytona, Unikraft); unified dashboard with diffs, logs, approvals; iOS app.
- Happy: open source, no telemetry, self-host with one Docker Compose (Postgres + Redis + server) behind the firewall; mobile app for your own Claude Code sessions.
- A dev.to post describes a self-hosted dashboard for Claude Code across 8 machines (domain blocked; project name not captured).

## Claude Code on the web, self-hosted environments, Claude in Slack
- Self-hosted environments: public beta on Team and Enterprise, off by default; Owner enables on the Cloud environments admin page. Runners poll api.anthropic.com; no inbound connections. Inference cannot go through Bedrock/Vertex/Foundry/gateway.
- "Repositories: sessions check out repositories from GitHub." GitLab and others can be sent as a local bundle but the session cannot push back.
- Claude Tag (Slack) sessions can run in self-hosted environments; Slack sessions are shared with Team visibility automatically.
- Session sharing: Team/Enterprise Private|Team; Pro/Max Private|Public; recipients see latest state on open, not live.
- Remote Control: connected devices get the diff pane (v2.1.247+ for interactive sessions), model/effort control, permission prompts; "Use the same account and organization you use for Claude Code in the terminal."

## Managed settings
- Precedence: above user, project, local, `--settings`; a few security-sensitive keys take the stricter lower value.
- Sources in order: server-managed (claude.ai console or Claude apps gateway; only when authenticating to Anthropic's API directly), MDM/OS policy, `managed-settings.d/*.json` + `managed-settings.json`. `managedSourcesBehavior: "merge"` (v2.1.242+) combines them.
- Paths: macOS `/Library/Application Support/ClaudeCode/managed-settings.json`; Linux and WSL `/etc/claude-code/managed-settings.json`; Windows `C:\Program Files\ClaudeCode\managed-settings.json` (legacy `C:\ProgramData\...` no longer read). Drop-ins merged alphabetically, e.g. `10-telemetry.json`, `20-security.json`. Also `managed-mcp.json`.
- Server-managed: fetched at startup, polled hourly. A change to a hook or an `env` variable "waits for the developer to accept the dialog in an interactive session". Other changes apply on next poll. Console cannot target a group yet; a gateway can deliver per IdP group.
- Cloud sessions in Anthropic-hosted environments read only server-managed settings; self-hosted runners also read the file in the runner image.
- Merge rules: lists (`permissions.allow`, `hooks`, `sandbox.network.allowedDomains`, `deniedMcpServers`) combine; locks (`allowManagedHooksOnly`, `permissions.disableBypassPermissionsMode`, `crossSessionInbound`) take the strictest; restriction allowlists (`availableModels`, `allowedMcpServers`, `strictKnownMarketplaces`, `allowedChannelPlugins`, `fallbackModel` chain) come whole from the highest source. `extraKnownMarketplaces`: later same-name entry replaces earlier. `env` merged per variable (v2.1.223+).
- Managed-only keys include `allowedChannelPlugins`, `allowManagedHooksOnly`, `blockedMarketplaces`, `disableCommandPluginSources`, `disableSideloadFlags`, `forceRemoteSettingsRefresh`, `pluginSuggestionMarketplaces`, `pluginTrustMessage`, `strictKnownMarketplaces`.
- Invalid entries are repaired or dropped per key; a file that is not valid JSON contributes nothing.

## Hooks scope
- `.claude/settings.json` hooks: scope single project, shareable, committed to the repo; run after workspace trust; run in `claude -p` without the trust dialog (unless `--bare`).
- Plugin hooks in `hooks/hooks.json` merge with user and project hooks when the plugin is enabled.
- Skill/subagent front-matter hooks follow the same trust rule; subagent ones need explicit trust acceptance.

## Agent Skills standard
- SKILL.md format published at agentskills.io Dec 2025; OpenAI and Microsoft integrated within 48 hours; 40+ tools by mid-2026. Claude Code reads `.claude/skills/`; Codex and others `.agents/skills/`; symlink pattern common.
- Before: Claude Code CLAUDE.md, Codex AGENTS.md, Cursor rules.

## Headless / SDK
- `claude -p --output-format stream-json --verbose --include-partial-messages` streams NDJSON events; last line is `result`. `--forward-subagent-text` includes subagent text. `system/init` carries model, tools, MCP servers, plugins, `capabilities`. `--bare` skips hooks/skills/plugins/CLAUDE.md and needs `ANTHROPIC_API_KEY`. `-p` sessions bind an inbox socket so they can receive cross-session messages; `--bare` does not.
