#!/usr/bin/env bash
# RETRO 495: a STOP = the first 3 lines of a-round-N.md contain "STOP — needs" or "STOP: needs" (the old stops-count.txt regex missed 457 and 459). Run from the loop root.
for n in $(seq 480 494); do printf '%s %s\n' "$n" "$(head -3 a-round-$n.md | grep -cE 'STOP( —|:) needs')"; done
