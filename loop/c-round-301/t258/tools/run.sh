#!/bin/bash
# usage: run.sh script ROW vp...
cd "$(dirname "$0")"; s=$1; row=$2; shift 2
for v in "$@"; do
  if [ "$s" = rg01.cjs ] || [ "$s" = rg03.cjs ]; then timeout 600 node $s $v > ../logs/$row-$v.log 2>&1; else timeout 600 node $s $row $v > ../logs/$row-$v.log 2>&1; fi
  node rec199.cjs $row-$v
done
