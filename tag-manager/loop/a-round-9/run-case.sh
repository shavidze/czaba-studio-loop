#!/usr/bin/env bash
script="$1"; shift
export A_SHIM_LOG="$(mktemp)"
export PATH="/home/runner/czaba-project/tmp/tag-manager-loop/a-round-9/shims:$PATH"
start=$(date +%s.%N)
timeout 120 bash "$script" "$@"; rc=$?
end=$(date +%s.%N)
echo "rc=$rc wall=$(echo "$end - $start" | bc)s"
echo "--- shim log"; cat "$A_SHIM_LOG"
echo "--- leftover sleeps: $(pgrep -f '^sleep 99[79]$' | wc -l)"
