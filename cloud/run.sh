#!/usr/bin/env bash
# One job of the CZABA Studio cloud loop: restore state, run one agent-loop-kit round, save state.
# Layout on the runner mirrors the old Windows layout so the loop's paths keep working:
#   $CZ/store                     -> the store repository (cloned by the workflow)
#   $CZ/tmp/studio-real-loop      -> symlink to <this repo>/loop   (loop memory)
#   $CZ/docs                      -> symlink to <this repo>/docs   (plan, workflow, phase specs)
set -euo pipefail

STATE="$(cd "$(dirname "$0")/.." && pwd)"
CZ="${CZ_ROOT:-$HOME/czaba-project}"
STORE="$CZ/store"
KIT="${KIT_DIR:-$HOME/agent-loop-kit}"
LOOP="$CZ/tmp/studio-real-loop"
CFG="$CZ/kit.config.json"
TIMEOUT_MIN="${LOOP_TIMEOUT_MIN:-320}"

log() { echo "[cloud-loop $(date -u +%H:%M:%S)] $*"; }

notify() {
  local title="$1" body="$2"
  log "NOTIFY: $title"
  if [ -n "${GH_TOKEN:-}" ] && [ -z "${DRY_RUN:-}" ] && command -v gh >/dev/null; then
    if [ -z "$(gh issue list --state open --label loop-attention --json number --jq '.[0].number' 2>/dev/null)" ]; then
      gh label create loop-attention --color D93F0B --description "The Studio loop needs Saba" >/dev/null 2>&1 || true
      gh issue create --title "$title" --label loop-attention --body "$(printf '%b' "$body")" >/dev/null || log "could not open issue"
    fi
  fi
}

save_state() {
  local rc=$?
  set +e
  [ -n "${WATCH_PID:-}" ] && kill "$WATCH_PID" 2>/dev/null
  [ -n "${MOCK_PID:-}" ] && kill "$MOCK_PID" 2>/dev/null
  log "saving state (loop exit $rc)"
  mkdir -p "$STATE/worktree"
  local plain="${RUNNER_TEMP:-/tmp}/loop-worktree.patch"
  git -C "$STORE" add -A
  git -C "$STORE" diff --cached --binary HEAD > "$plain"
  git -C "$STORE" reset -q
  git -C "$STORE" rev-parse HEAD > "$STATE/worktree/base"
  # The state repository is public: the store's unpublished code is kept only encrypted (secret LOOP_PATCH_KEY).
  if [ -n "${LOOP_PATCH_KEY:-}" ]; then
    openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:LOOP_PATCH_KEY -in "$plain" -out "$STATE/worktree/patch.enc" && rm -f "$STATE/worktree/patch"
  else
    log "WARNING: LOOP_PATCH_KEY is not set; saved work stays unencrypted"; cp "$plain" "$STATE/worktree/patch"
  fi
  log "uncommitted store work saved: $(wc -c < "$plain") bytes on $(cut -c1-8 "$STATE/worktree/base")"
  rm -f "$plain"
  cd "$STATE"
  # A finished round (or a job stopped by its time limit) starts the next job at once; the push is made with the PAT,
  # so it triggers the workflow. Paused or failed states do not, so the loop stops there.
  case "$(jq -r '.phase // ""' "$LOOP/status.json" 2>/dev/null)" in
    ROUND_LIMIT_REACHED|A_IMPLEMENTING|C_VERIFYING|G_ROOT_GATE|B_PLANNING_NEXT)
      [ "$rc" -eq 0 ] && date -u +%FT%TZ > "$STATE/cloud/KICK" ;;
  esac
  # Reports the loop wrote for Saba (loop/user-review/*.md) open one issue each, without stopping the loop.
  for f in "$LOOP"/user-review/*.md; do
    [ -f "$f" ] || continue
    case "$f" in *-decisions.md) continue ;; esac
    [ -f "$f.notified" ] && continue
    if [ -n "${GH_TOKEN:-}" ] && [ -z "${DRY_RUN:-}" ]; then
      gh label create loop-review --color 0E8A16 --description "A report from the Studio loop for Saba" >/dev/null 2>&1 || true
      gh issue create --label loop-review --title "Studio loop: $(basename "$f" .md) ready for you" --body "The loop wrote loop/user-review/$(basename "$f"): $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/blob/main/loop/user-review/$(basename "$f"). The loop keeps running. Your answers go to loop/user-review/$(basename "$f" .md | sed 's/-review$//')-decisions.md." >/dev/null && date -u +%FT%TZ > "$f.notified"
    fi
  done
  git add -A loop docs worktree cloud/KICK
  if ! git diff --cached --quiet; then
    local ph rd
    ph="$(jq -r '.phase // "?"' "$LOOP/status.json" 2>/dev/null)"; rd="$(jq -r '.round // "?"' "$LOOP/status.json" 2>/dev/null)"
    git commit -q -m "loop: round $rd $ph"
    if [ -z "${DRY_RUN:-}" ]; then
      for i in 1 2 3; do git push -q origin HEAD && break; git pull -q --rebase origin "$(git rev-parse --abbrev-ref HEAD)"; done
    fi
  fi
  exit "$rc"
}

# ---------- layout ----------
mkdir -p "$CZ/tmp"
ln -sfn "$STATE/loop" "$LOOP"
ln -sfn "$STATE/docs" "$CZ/docs"
[ -d "$STORE/.git" ] || { log "store repository missing at $STORE"; exit 2; }

# ---------- should this job run? ----------
PHASE="$(jq -r '.phase // ""' "$LOOP/status.json")"
ROUND="$(jq -r '.round // 0' "$LOOP/status.json")"
DETAIL="$(jq -r '.detail // ""' "$LOOP/status.json")"
case "$PHASE" in
  NEEDS_ATTENTION|AWAITING_ROOT_VERIFICATION|PAUSED)
    notify "Studio loop: $PHASE (round $ROUND)" "The cloud loop stopped and waits for you.\n\nStatus: $PHASE, round $ROUND\nDetail: $DETAIL\n\nRead loop/b-round-$ROUND.md and loop/status.json. To resume, answer in loop/policy.local.md or the requirements, then set loop/status.json phase to RESUME (keep the round)."
    log "not running: $PHASE"; exit 0 ;;
esac
case "$PHASE" in
  ROUND_LIMIT_REACHED) START_ROUND=$((ROUND + 1)); START_PHASE=A ;;
  C_VERIFYING) START_ROUND=$ROUND; START_PHASE=C ;;
  G_ROOT_GATE) START_ROUND=$ROUND; START_PHASE=G ;;
  B_PLANNING_NEXT) START_ROUND=$ROUND; START_PHASE=B ;;
  *) START_ROUND=$ROUND; START_PHASE=A ;;
esac
[ "$START_ROUND" -ge 1 ] || START_ROUND=1
log "status $PHASE round $ROUND -> start round $START_ROUND phase $START_PHASE"

# ---------- root dependency step (Saba-approved OSS plan, docs/technical/performance/oss-adoption.md) ----------
# A must not change package.json. B asks root for a pre-approved package by writing loop/root-deps-request.json
# ({"add": ["zustand"], "remove": ["@ffmpeg/ffmpeg"]}). Only names in cloud/deps-allowlist.json are acted on, at the
# exact version listed there. Root commits "chore(deps): ..." on master, pushes both store remotes, and records it in
# loop/root-deps-done.json. Runs before the round, so it never lands mid-round.
REQ="$LOOP/root-deps-request.json"; ALLOW="$STATE/cloud/deps-allowlist.json"; DONE="$LOOP/root-deps-done.json"
if [ -s "$REQ" ] && [ -s "$ALLOW" ]; then
  [ -s "$DONE" ] || echo '{"done": []}' > "$DONE"
  ADDS=(); RMS=()
  for n in $(jq -r '.add[]? // empty' "$REQ"); do
    v="$(jq -r --arg n "$n" '.add[$n] // empty' "$ALLOW")"
    if [ -z "$v" ]; then log "root-deps: $n is not on the allowlist, skipped"; continue; fi
    jq -e --arg n "$n" '(.dependencies // {}) | has($n)' "$STORE/package.json" >/dev/null && { log "root-deps: $n already present"; continue; }
    ADDS+=("$n@$v")
  done
  for n in $(jq -r '.remove[]? // empty' "$REQ"); do
    jq -e --arg n "$n" '.remove | index($n)' "$ALLOW" >/dev/null || { log "root-deps: removing $n is not allowed, skipped"; continue; }
    jq -e --arg n "$n" '(.dependencies // {}) | has($n)' "$STORE/package.json" >/dev/null || continue
    RMS+=("$n")
  done
  if [ ${#ADDS[@]} -gt 0 ] || [ ${#RMS[@]} -gt 0 ]; then
    MSG="chore(deps):"; [ ${#ADDS[@]} -gt 0 ] && MSG="$MSG add ${ADDS[*]}"; [ ${#RMS[@]} -gt 0 ] && MSG="$MSG remove ${RMS[*]}"
    if ( cd "$STORE" \
         && { [ ${#ADDS[@]} -eq 0 ] || npm install --save-exact --no-audit --no-fund "${ADDS[@]}" >/dev/null; } \
         && { [ ${#RMS[@]} -eq 0 ] || npm uninstall --no-audit --no-fund "${RMS[@]}" >/dev/null; } \
         && git add package.json package-lock.json && HUSKY=0 git commit -qm "$MSG (root, OSS plan approved by Saba)" ); then
      ok=1
      for r in $(jq -r '.pushRemotes[]' "$STATE/cloud/config.template.json"); do git -C "$STORE" push -q "$r" HEAD:master || ok=0; done
      if [ "$ok" = 1 ]; then
        log "root-deps: $MSG pushed as $(git -C "$STORE" rev-parse --short HEAD)"
        jq --arg m "$MSG" --arg c "$(git -C "$STORE" rev-parse HEAD)" --arg t "$(date -u +%FT%TZ)" '.done += [{msg: $m, commit: $c, utc: $t}]' "$DONE" > "$DONE.tmp" && mv "$DONE.tmp" "$DONE"
        rm -f "$REQ"
      else
        notify "Studio loop: dependency push failed" "Root's dependency commit ($MSG) could not be pushed to every store remote. The round continues on the pushed state."
        git -C "$STORE" reset -q --hard "origin/master"
      fi
    else
      notify "Studio loop: dependency install failed" "Root could not apply: $MSG. See the Actions log."
      git -C "$STORE" checkout -q -- package.json package-lock.json 2>/dev/null; git -C "$STORE" reset -q --hard origin/master
    fi
  else
    rm -f "$REQ"
  fi
fi

# ---------- restore uncommitted work from the previous job ----------
PATCH="$STATE/worktree/patch"
if [ -f "$STATE/worktree/patch.enc" ]; then
  [ -n "${LOOP_PATCH_KEY:-}" ] || { notify "Studio loop: LOOP_PATCH_KEY missing" "worktree/patch.enc exists but the LOOP_PATCH_KEY secret is not set, so the saved unpublished work cannot be restored. Add the same secret again."; exit 3; }
  PATCH="${RUNNER_TEMP:-/tmp}/loop-restore.patch"
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:LOOP_PATCH_KEY -in "$STATE/worktree/patch.enc" -out "$PATCH" || { notify "Studio loop: saved work cannot be decrypted" "worktree/patch.enc does not decrypt with the current LOOP_PATCH_KEY. Was the secret changed?"; exit 3; }
fi
if [ -s "$PATCH" ]; then
  BASE="$(cat "$STATE/worktree/base" 2>/dev/null || true)"
  HEAD_NOW="$(git -C "$STORE" rev-parse HEAD)"
  [ "$BASE" = "$HEAD_NOW" ] || log "store moved from ${BASE:0:8} to ${HEAD_NOW:0:8}; applying saved work with 3-way merge"
  if ! git -C "$STORE" apply --3way --whitespace=nowarn "$PATCH"; then
    notify "Studio loop: saved work does not apply" "The uncommitted work saved by the previous job (worktree, base ${BASE:0:8}) does not apply to store master ${HEAD_NOW:0:8}. Someone probably pushed conflicting changes. The loop is paused until this is resolved."
    exit 3
  fi
  git -C "$STORE" reset -q
  log "restored $(git -C "$STORE" status --porcelain | wc -l) changed paths"
fi

# ---------- kit config for this runner ----------
sed "s#__CZ__#$CZ#g" "$STATE/cloud/config.template.json" > "$CFG"

trap save_state EXIT
# Store verification: the loop's own mock backend (STORE-0) stands in for the .NET API on :5199 when it exists.
if [ -f "$LOOP/mock-api/server.mjs" ]; then
  node "$LOOP/mock-api/server.mjs" > "$LOOP/mock-api/server.log" 2>&1 &
  MOCK_PID=$!
  log "mock API started (pid $MOCK_PID)"
fi
# Context watchdog: when an agent's context nears contextRestartTokens or gets compacted, it stops only that agent and
# the runner continues the same phase in a fresh session (checkpoint in loop/context-restart-*.md).
python3 "$KIT/tools/watch-context.py" "$CFG" > "$LOOP/watch.out.log" 2> "$LOOP/watch.err.log" &
WATCH_PID=$!
log "context watchdog started (pid $WATCH_PID)"
log "running agent-loop-kit (timeout ${TIMEOUT_MIN} min)"
set +e
timeout --signal=TERM "${TIMEOUT_MIN}m" pwsh -NoLogo -NoProfile -File "$KIT/run-loop.ps1" -Config "$CFG" -StartRound "$START_ROUND" -StartPhase "$START_PHASE" -RoundLimit 1
RC=$?
set -e
NEWPHASE="$(jq -r '.phase // ""' "$LOOP/status.json")"
log "kit exit $RC, status now $NEWPHASE"
if [ "$RC" -eq 124 ]; then log "job time limit reached; the next job resumes this phase"; RC=0; fi
case "$NEWPHASE" in
  NEEDS_ATTENTION|AWAITING_ROOT_VERIFICATION|NEEDS_LOGIN)
    notify "Studio loop: $NEWPHASE (round $(jq -r .round "$LOOP/status.json"))" "$(jq -r .detail "$LOOP/status.json")" ;;
esac
if [ "$RC" -ne 0 ]; then
  notify "Studio loop: runner failed (exit $RC)" "See the Actions log and loop/loop.log. The next scheduled job retries the same phase."
fi
exit "$RC"
