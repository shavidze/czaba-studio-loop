# czaba-studio-loop

The CZABA Studio agent loop, running in GitHub Actions so it does not depend on a local computer.

- **Runner:** [agent-loop-kit](https://github.com/shavidze/agent-loop-kit), one round per job (`.github/workflows/studio-loop.yml`, every 30 minutes, one job at a time).
- **Loop memory:** `loop/` (backlog, tasks, reports, gates, metrics) and `docs/` (plan, workflow, phase specs). Each job commits them back.
- **Unpublished work:** `worktree/patch` holds the store's uncommitted changes between jobs. It is applied at the start of every job and saved again at the end. The root gate commits and pushes only verified work to `TCzaba/czaba-store` and `shavidze/czaba-store`.
- **On/off:** the loop runs only while `cloud/ENABLED` exists. Delete that file to pause it.
- **Needs you:** when the loop stops for a question or a final check, it opens an issue with the `loop-attention` label. To resume, answer it (in `loop/policy.local.md` or the requirements), then set `loop/status.json` phase to `RESUME`.
- **Secrets:** `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) and `STORE_PUSH_TOKEN` (a classic PAT with `repo` and `workflow`).

## Tag Manager loop (second, independent loop)

- **What:** the same agent-loop-kit round, for [TCzaba/czaba-tag-manager](https://github.com/TCzaba/czaba-tag-manager) (Electron), in `.github/workflows/tag-manager-loop.yml`, at :15 and :45 so it does not start together with the Studio loop.
- **Memory:** `tag-manager/loop/` (requirements, backlog, tasks, reports, gates); rules for this environment in `tag-manager/loop/policy.local.md`. Unpublished work: `tag-manager/worktree/` (encrypted with the same `LOOP_PATCH_KEY`).
- **On/off:** runs only while `tag-manager/cloud/ENABLED` and `tag-manager/loop/requirements.md` exist. Issues it opens carry the `tm-loop-attention` label.
- **Shared limits:** both loops use the same `CLAUDE_CODE_OAUTH_TOKEN`, so they share one usage limit. When the limit is reached, each loop waits and resumes by itself.
