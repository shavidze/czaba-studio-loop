#!/usr/bin/env bash
# One job of the CZABA Tag Manager cloud loop: restore state, run one agent-loop-kit round, save state.
# Same design as cloud/run.sh (the Studio loop), with its own repository, loop folder, patch and switch:
#   $CZ/czaba-tag-manager          -> the Tag Manager repository (cloned by the workflow)
#   $CZ/tmp/tag-manager-loop       -> symlink to <this repo>/tag-manager/loop (loop memory)
set -euo pipefail

STATE_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATE="$STATE_ROOT/tag-manager"
CZ="${CZ_ROOT:-$HOME/czaba-project}"
REPO="$CZ/czaba-tag-manager"
KIT="${KIT_DIR:-$HOME/agent-loop-kit}"
LOOP="$CZ/tmp/tag-manager-loop"
CFG="$CZ/tm-kit.config.json"
TIMEOUT_MIN="${LOOP_TIMEOUT_MIN:-320}"
LABEL="tm-loop-attention"

log() { echo "[tm-loop $(date -u +%H:%M:%S)] $*"; }

notify() {
  local title="$1" body="$2"
  log "NOTIFY: $title"
  if [ -n "${GH_TOKEN:-}" ] && [ -z "${DRY_RUN:-}" ] && command -v gh >/dev/null; then
    if [ -z "$(gh issue list --state open --label "$LABEL" --json number --jq '.[0].number' 2>/dev/null)" ]; then
      gh label create "$LABEL" --color D93F0B --description "The Tag Manager loop needs Saba" >/dev/null 2>&1 || true
      gh issue create --title "$title" --label "$LABEL" --body "$(printf '%b' "$body")" >/dev/null || log "could not open issue"
    fi
  fi
}

save_state() {
  local rc=$?
  set +e
  [ -n "${WATCH_PID:-}" ] && kill "$WATCH_PID" 2>/dev/null
  log "saving state (loop exit $rc)"
  mkdir -p "$STATE/worktree"
  local plain="${RUNNER_TEMP:-/tmp}/tm-worktree.patch"
  git -C "$REPO" add -A
  git -C "$REPO" diff --cached --binary HEAD > "$plain"
  git -C "$REPO" reset -q
  git -C "$REPO" rev-parse HEAD > "$STATE/worktree/base"
  # The state repository is public: the Tag Manager's unpublished code is kept only encrypted (secret LOOP_PATCH_KEY).
  if [ -n "${LOOP_PATCH_KEY:-}" ]; then
    openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:LOOP_PATCH_KEY -in "$plain" -out "$STATE/worktree/patch.enc" && rm -f "$STATE/worktree/patch"
  else
    log "WARNING: LOOP_PATCH_KEY is not set; saved work stays unencrypted"; cp "$plain" "$STATE/worktree/patch"
  fi
  log "uncommitted Tag Manager work saved: $(wc -c < "$plain") bytes on $(cut -c1-8 "$STATE/worktree/base")"
  rm -f "$plain"
  cd "$STATE_ROOT"
  case "$(jq -r '.phase // ""' "$LOOP/status.json" 2>/dev/null)" in
    ROUND_LIMIT_REACHED|A_IMPLEMENTING|C_VERIFYING|G_ROOT_GATE|B_PLANNING_NEXT|B_BOOTSTRAP)
      [ "$rc" -eq 0 ] && date -u +%FT%TZ > "$STATE/cloud/KICK" ;;
  esac
  git add -A tag-manager/loop tag-manager/worktree tag-manager/cloud/KICK tag-manager/cloud/RELEASE-DONE 2>/dev/null || git add -A tag-manager/loop tag-manager/worktree tag-manager/cloud/KICK
  if ! git diff --cached --quiet; then
    local ph rd
    ph="$(jq -r '.phase // "?"' "$LOOP/status.json" 2>/dev/null)"; rd="$(jq -r '.round // "?"' "$LOOP/status.json" 2>/dev/null)"
    git commit -q -m "tm-loop: round $rd $ph"
    if [ -z "${DRY_RUN:-}" ]; then
      for i in 1 2 3; do git push -q origin HEAD && break; git pull -q --rebase origin "$(git rev-parse --abbrev-ref HEAD)"; done
    fi
  fi
  exit "$rc"
}

# ---------- layout ----------
mkdir -p "$CZ/tmp"
ln -sfn "$STATE/loop" "$LOOP"
[ -d "$REPO/.git" ] || { log "Tag Manager repository missing at $REPO"; exit 2; }

# ---------- root release request (Saba): bump the version on master before the round ----------
# tag-manager/cloud/RELEASE holds a version (e.g. 1.4.0). The Tag Manager's release.yml builds installers on a
# master push with a new package.json version. Done once; tag-manager/cloud/RELEASE-DONE records it.
if [ -s "$STATE/cloud/RELEASE" ]; then
  WANT="$(head -1 "$STATE/cloud/RELEASE" | tr -d '[:space:]')"
  if [ -n "$WANT" ] && ! grep -qx "$WANT" "$STATE/cloud/RELEASE-DONE" 2>/dev/null; then
    CUR="$(cd "$REPO" && node -p "require('./package.json').version")"
    if [ "$CUR" = "$WANT" ] || git -C "$REPO" rev-parse -q --verify "refs/tags/v$WANT" >/dev/null; then
      log "release $WANT: already at that version or tagged; nothing to do"
    else
      ( cd "$REPO" && npm version "$WANT" --no-git-tag-version --allow-same-version >/dev/null \
        && git add package.json package-lock.json && git commit -qm "chore(release): v$WANT" \
        && git push -q origin HEAD:master ) && log "release $WANT: pushed $(git -C "$REPO" log -1 --format='%h %s')" \
        || { notify "Tag Manager loop: release v$WANT bump failed" "Root's version bump to $WANT could not be committed or pushed. The round continues without it."; git -C "$REPO" reset -q --hard origin/master; }
    fi
    echo "$WANT" >> "$STATE/cloud/RELEASE-DONE"
  fi
fi

# ---------- should this job run? ----------
PHASE="$(jq -r '.phase // ""' "$LOOP/status.json")"
ROUND="$(jq -r '.round // 0' "$LOOP/status.json")"
DETAIL="$(jq -r '.detail // ""' "$LOOP/status.json")"
case "$PHASE" in
  NEEDS_ATTENTION|AWAITING_ROOT_VERIFICATION|PAUSED)
    notify "Tag Manager loop: $PHASE (round $ROUND)" "The Tag Manager cloud loop stopped and waits for you.\n\nStatus: $PHASE, round $ROUND\nDetail: $DETAIL\n\nRead tag-manager/loop/b-round-$ROUND.md and tag-manager/loop/status.json. To resume, answer in tag-manager/loop/policy.local.md or requirements.md, then set tag-manager/loop/status.json phase to RESUME (keep the round)."
    log "not running: $PHASE"; exit 0 ;;
esac
[ -f "$LOOP/requirements.md" ] || { log "not running: tag-manager/loop/requirements.md is missing"; exit 0; }
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
PATCH="$STATE/worktree/patch"
if [ -f "$STATE/worktree/patch.enc" ]; then
  [ -n "${LOOP_PATCH_KEY:-}" ] || { notify "Tag Manager loop: LOOP_PATCH_KEY missing" "tag-manager/worktree/patch.enc exists but the LOOP_PATCH_KEY secret is not set."; exit 3; }
  PATCH="${RUNNER_TEMP:-/tmp}/tm-restore.patch"
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:LOOP_PATCH_KEY -in "$STATE/worktree/patch.enc" -out "$PATCH" || { notify "Tag Manager loop: saved work cannot be decrypted" "tag-manager/worktree/patch.enc does not decrypt with the current LOOP_PATCH_KEY."; exit 3; }
fi
if [ -s "$PATCH" ]; then
  BASE="$(cat "$STATE/worktree/base" 2>/dev/null || true)"
  HEAD_NOW="$(git -C "$REPO" rev-parse HEAD)"
  [ "$BASE" = "$HEAD_NOW" ] || log "repository moved from ${BASE:0:8} to ${HEAD_NOW:0:8}; applying saved work with 3-way merge"
  if ! git -C "$REPO" apply --3way --whitespace=nowarn "$PATCH"; then
    notify "Tag Manager loop: saved work does not apply" "The uncommitted work saved by the previous job (base ${BASE:0:8}) does not apply to master ${HEAD_NOW:0:8}. The loop is paused until this is resolved."
    exit 3
  fi
  git -C "$REPO" reset -q
  log "restored $(git -C "$REPO" status --porcelain | wc -l) changed paths"
fi

# ---------- kit config for this runner ----------
sed "s#__CZ__#$CZ#g" "$STATE/cloud/config.template.json" > "$CFG"

trap save_state EXIT
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
    notify "Tag Manager loop: $NEWPHASE (round $(jq -r .round "$LOOP/status.json"))" "$(jq -r .detail "$LOOP/status.json")" ;;
esac
if [ "$RC" -ne 0 ]; then
  notify "Tag Manager loop: runner failed (exit $RC)" "See the Actions log and tag-manager/loop/loop.log. The next scheduled job retries the same phase."
fi
exit "$RC"
