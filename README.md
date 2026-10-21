# czaba-studio-loop

The CZABA Studio agent loop, running in GitHub Actions so it does not depend on a local computer.

- **Runner:** [agent-loop-kit](https://github.com/shavidze/agent-loop-kit), one round per job (`.github/workflows/studio-loop.yml`, every 30 minutes, one job at a time).
- **Loop memory:** `loop/` (backlog, tasks, reports, gates, metrics) and `docs/` (plan, workflow, phase specs). Each job commits them back.
- **Unpublished work:** `worktree/patch` holds the store's uncommitted changes between jobs. It is applied at the start of every job and saved again at the end. The root gate commits and pushes only verified work to `TCzaba/czaba-store` and `shavidze/czaba-store`.
- **On/off:** the loop runs only while `cloud/ENABLED` exists. Delete that file to pause it.
- **Needs you:** when the loop stops for a question or a final check, it opens an issue with the `loop-attention` label. To resume, answer it (in `loop/policy.local.md` or the requirements), then set `loop/status.json` phase to `RESUME`.
- **Secrets:** `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) and `STORE_PUSH_TOKEN` (a classic PAT with `repo` and `workflow`).
