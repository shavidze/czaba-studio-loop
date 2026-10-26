#!/usr/bin/env bash
# usage: run-case.sh NAME SCRIPT OUTER_TIMEOUT [env...] -- [args...]
D=/home/runner/czaba-project/tmp/tag-manager-loop/c-round-9
name=$1; script=$2; outer=$3; shift 3
envs=(); while [ "$1" != "--" ]; do envs+=("$1"); shift; done; shift
out=$D/cases/$name; mkdir -p $out; rm -f $out/*
export C_SHIM_LOG=$out/shim.log C_SHIM_STATE=$out/state
touch $C_SHIM_LOG
start=$(date +%s.%N)
env PATH=$D/shims:$PATH "${envs[@]}" timeout -k 2 $outer bash "$script" "$@" >$out/stdout 2>$out/stderr
rc=$?
end=$(date +%s.%N)
wall=$(echo "$end - $start" | bc)
sleep 0.5
orph=$(pgrep -f 'sleep 99[3-9]' | wc -l)
pkill -9 -f 'sleep 99[3-9]' 2>/dev/null
{ echo "== case $name rc=$rc wall=${wall}s orphans=$orph env=[${envs[*]}] args=[$*]"; echo "-- stdout"; cat $out/stdout; echo "-- stderr"; cat $out/stderr; echo "-- shim log"; cat $C_SHIM_LOG; } | tee $out/summary.txt
