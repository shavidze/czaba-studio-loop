#!/usr/bin/env bash
# RETRO 465 / D-29z1636: consumers of the 11 kept keyframes. Run from the store root: bash ../tmp/studio-real-loop/b-round-464/l4-check.sh > <out>
echo "# L4 check (B round 464->465): consumers of the 11 kept keyframes outside the named-utility branch"
for k in insert-marker-blink fade-in slide-up pulse navLoadingProgress audioPlayingPulse slideUpPlayer waveform-pulse shimmer light-flicker-on pulse404; do
  n=$(grep -rnE "(animation(-name)?|--animate-[a-z0-9-]+)\s*:[^;]*\b$k\b" app --include=*.css --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)
  u=$(grep -rnoE "\banimate-$k\b" app --include=*.tsx --include=*.ts | grep -v __tests__ | wc -l)
  echo "$k declaration_uses=$n named_utility_uses=$u"
done
echo "# note: pulse declaration_uses=1 is the \\b word-boundary hit on 'waveform-pulse' (next line); with a hyphen-aware boundary pulse has 0 declaration uses, so it is kept only through the named-utility branch (Tailwind default --animate-pulse)"
grep -rnE "(animation(-name)?|--animate-[a-z0-9-]+)\s*:[^;]*\bpulse\b" app --include=*.css --include=*.ts --include=*.tsx | grep -v __tests__
echo "hyphen-aware pulse declaration uses: $(grep -rnE "(animation(-name)?|--animate-[a-z0-9-]+)\s*:[^;]*(^|[^a-z0-9-])pulse([^a-z0-9-]|$)" app --include=*.css --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
