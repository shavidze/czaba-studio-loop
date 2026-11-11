#!/usr/bin/env bash
# Evidence for A-R449-REVIEW-GT1-TSX and questions-retro-450.md Q6. Run from the loop root: bash b-round-449/dead-importers.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 2
echo "## GT1-TSX: gradient-text clip patterns in app TS/TSX (non-test)"
grep -rnE "bg-clip-text|text-transparent|background-?[cC]lip|WebkitBackgroundClip|WebkitTextFillColor" app --include=*.tsx --include=*.ts | grep -v __tests__ | cut -c1-160
echo "## importers (word match, non-test, excluding the file itself)"
for n in ArtistBioSection VideoShowcase PianoLoadingAnimation PianoCurtainLoader CinemaCurtainLoader TestimonialsSection Timeline; do
  echo "$n: $(grep -rlw "$n" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -v "/$n.tsx" | sort | tr '\n' ' ')"
done
echo "## Timeline: JSX use or import (comments/aria text excluded)"
grep -rnE "<Timeline\b|import[^;]*\bTimeline\b" app --include=*.tsx --include=*.ts | grep -v __tests__ | cut -c1-160
echo "## root barrel importers (~/components)"
grep -rnE "from ['\"]~/components['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l
echo "## email.server importers"
grep -rnE "from ['\"][^'\"]*/email\.server['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l
