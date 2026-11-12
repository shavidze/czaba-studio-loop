#!/usr/bin/env bash
# RETRO 465: a STOP = the first 3 lines of a-round-N.md contain "STOP — needs" or "STOP: needs" (the old stops-count.txt regex missed 457 and 459). Run from the loop root.
for n in $(seq 450 464); do printf '%s %s\n' "$n" "$(head -3 a-round-$n.md | grep -cE 'STOP( —|:) needs')"; done
