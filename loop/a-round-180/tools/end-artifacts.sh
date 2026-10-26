#!/usr/bin/env bash
# cwd = store. Writes end-sha256.txt (8 paths) and diff-vs-start.patch.
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop
OUT=$L/a-round-180
START=$L/b-round-179/r180-granted-start
cat $L/b-round-179-r180-grants.txt $L/b-round-179-r180-new-files.txt | xargs sha256sum > $OUT/end-sha256.txt
: > $OUT/diff-vs-start.patch
while read -r f; do
  [ -z "$f" ] && continue
  diff -u --label "a/$f" --label "b/$f" "$START/$f" "$f" >> $OUT/diff-vs-start.patch
done < $L/b-round-179-r180-grants.txt
while read -r f; do
  [ -z "$f" ] && continue
  diff -u --label /dev/null --label "b/$f" /dev/null "$f" >> $OUT/diff-vs-start.patch
done < $L/b-round-179-r180-new-files.txt
wc -l $OUT/end-sha256.txt $OUT/diff-vs-start.patch
