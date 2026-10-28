#!/bin/bash
# C round-40 mutant runner: reverts one class edit at a time on /tmp/c40/mut, builds, probes, restores.
M=/tmp/c40/mut; L=/home/runner/czaba-project/tmp/tag-manager-loop/c-round-40; mkdir -p $L/mut
B=src/renderer/src/components/ui/button.tsx; S=src/renderer/src/components/schema/SchemaEditor.tsx
declare -A FILE=( [m1-primary-notaria]=$B [m2-ghost-enabled]=$B [m3-arrow]=$S [m4-x]=$S [m5-trash]=$S [m6-chip]=$S )
declare -A SED=(
 [m1-primary-notaria]='s/enabled:not-aria-disabled:hover:bg-brand-hover/enabled:hover:bg-brand-hover/'
 [m2-ghost-enabled]="s/ghost: 'text-foreground enabled:not-aria-disabled:hover:bg-elevated'/ghost: 'text-foreground not-aria-disabled:hover:bg-elevated'/"
 [m3-arrow]="s/'text-dim enabled:hover:text-foreground p-0.5'/'text-dim hover:text-foreground p-0.5'/"
 [m4-x]='s/text-dim enabled:hover:text-destructive p-0.5/text-dim hover:text-destructive p-0.5/'
 [m5-trash]='s/text-destructive enabled:hover:text-destructive\/80/text-destructive hover:text-destructive\/80/'
 [m6-chip]='s/enabled:hover:text-foreground enabled:hover:border-brand/hover:text-foreground hover:border-brand/'
)
for m in m1-primary-notaria m2-ghost-enabled m3-arrow m4-x m5-trash m6-chip; do
  f=${FILE[$m]}; cp $M/$f /tmp/c40/orig.tsx
  sed -i "${SED[$m]}" $M/$f
  echo "== $m"; diff /tmp/c40/orig.tsx $M/$f | grep '^[<>]' | wc -l
  (cd $M && npx electron-vite build > $L/mut/$m-build.log 2>&1) || echo BUILD-FAIL
  C40_OUT=$L/mut xvfb-run -a node $L/c40-probe.mjs $M $m hover > $L/mut/$m.log 2>&1
  grep -E '^H[0-9]' $L/mut/$m.log | cut -c1-45
  cp /tmp/c40/orig.tsx $M/$f
done
diff -r -q $M/src /home/runner/czaba-project/czaba-tag-manager/src && echo RESTORED-OK
