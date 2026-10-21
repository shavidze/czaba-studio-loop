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
  log "saving state (loop exit $rc)"
  mkdir -p "$STATE/worktree"
  git -C "$STORE" add -A
  git -C "$STORE" diff --cached --binary HEAD > "$STATE/worktree/patch"
  git -C "$STORE" reset -q
  git -C "$STORE" rev-parse HEAD > "$STATE/worktree/base"
  log "uncommitted store work saved: $(wc -c < "$STATE/worktree/patch") bytes on $(cat "$STATE/worktree/base" | cut -c1-8)"
  cd "$STATE"
  # A finished round (or a job stopped by its time limit) starts the next job at once; the push is made with the PAT,
  # so it triggers the workflow. Paused or failed states do not, so the loop stops there.
  case "$(jq -r '.phase // ""' "$LOOP/status.json" 2>/dev/null)" in
    ROUND_LIMIT_REACHED|A_IMPLEMENTING|C_VERIFYING|G_ROOT_GATE|B_PLANNING_NEXT)
      [ "$rc" -eq 0 ] && date -u +%FT%TZ > "$STATE/cloud/KICK" ;;
  esac
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

# ---------- restore uncommitted work from the previous job ----------
if [ -s "$STATE/worktree/patch" ]; then
  BASE="$(cat "$STATE/worktree/base" 2>/dev/null || true)"
  HEAD_NOW="$(git -C "$STORE" rev-parse HEAD)"
  [ "$BASE" = "$HEAD_NOW" ] || log "store moved from ${BASE:0:8} to ${HEAD_NOW:0:8}; applying saved work with 3-way merge"
  if ! git -C "$STORE" apply --3way --whitespace=nowarn "$STATE/worktree/patch"; then
    notify "Studio loop: saved work does not apply" "The uncommitted work saved by the previous job (worktree/patch, base ${BASE:0:8}) does not apply to store master ${HEAD_NOW:0:8}. Someone probably pushed conflicting changes. The loop is paused until this is resolved."
    exit 3
  fi
  git -C "$STORE" reset -q
  log "restored $(git -C "$STORE" status --porcelain | wc -l) changed paths"
fi

# ---------- kit config for this runner ----------
sed "s#__CZ__#$CZ#g" "$STATE/cloud/config.template.json" > "$CFG"

trap save_state EXIT
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
