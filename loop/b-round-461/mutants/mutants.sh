#!/usr/bin/env bash
# usage: mutants.sh <scratch-repo-with-sketch-applied-and-committed> <out-dir>
# Each mutant edits the scratch, runs the 4 style files whole, records GREEN/RED + failing rows, then restores with git checkout/clean INSIDE the scratch only.
set -u
S="$1"; OUT="$2"; mkdir -p "$OUT"; cd "$S" || exit 2
FILES="app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-live-teal.test.ts app/lib/__tests__/store-teal-sweep.test.ts"
R="$OUT/mutants.txt"; : > "$R"
run() { id="$1"; npx vitest run $FILES > "$OUT/mutant-$id.log" 2>&1; rc=$?
  rows=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -E '^ FAIL ' | grep -oE '> (GT[0-9a-z]+|GS[0-9]+|LT[0-9]+|TS[0-9]+)' | sed 's/> //' | sort -u | tr '\n' ' ')
  if [ $rc -eq 0 ]; then echo "$id GREEN" >> "$R"; else echo "$id RED $rows" >> "$R"; fi
  git checkout -q -- . && git clean -qfd app perf-empty-b462 >/dev/null 2>&1; true; }
run BASE
# M1 resurrect a deleted dead file (no importer) -> GT6
git show a7fa78e:app/components/home/VideoShowcase.tsx > app/components/home/VideoShowcase.tsx; run M1-RESURRECT-FILE
# M2 a barrel re-exports a deleted name again (file also restored so tsc would pass) -> GT6
git show a7fa78e:app/components/loading/PianoCurtainLoader.tsx > app/components/loading/PianoCurtainLoader.tsx; echo "export { PianoCurtainLoader } from './PianoCurtainLoader';" >> app/components/loading/index.ts; run M2-BARREL-REEXPORT
# M3 the emptied script allow-list: a live file clips text again -> GT1b
sed -i '0,/className="/s//className="bg-clip-text text-transparent /' app/components/loading/SpotlightLoader.tsx; run M3-LIVE-GRADIENT-CLIP
# M4 dead .loading-brand class gets a consumer again -> LT7
sed -i '0,/className="/s//className="loading-brand /' app/components/loading/SpotlightLoader.tsx; run M4-LOADING-BRAND-CONSUMER
# M5 keep-list TestimonialsSection deleted by mistake -> GT6 (+GT3/GT5)
rm app/components/home/TestimonialsSection.tsx; sed -i '/TestimonialsSection/d' app/components/home/index.ts; run M5-TESTIMONIALS-DELETED
# M6 a deleted teal file comes back (Timeline) -> TS2/TS1 + GT6
git show a7fa78e:app/components/audio/Timeline.tsx > app/components/audio/Timeline.tsx; run M6-TIMELINE-BACK
# M7 a deleted barrel is dropped from the check list (components/index.ts removed) -> GT6 count
rm app/components/index.ts; run M7-BARREL-LIST-SHRINKS
# M8 perf root read as an empty folder (prefix kept) -> GT4b new perf/ liveness row
mkdir -p perf-empty-b462 && sed -i "s#export const PERF_ROOT = resolve(APP_ROOT, '../perf');#export const PERF_ROOT = resolve(APP_ROOT, '../perf-empty-b462');#" app/lib/__tests__/helpers/style-scan.ts; run M8-PERF-ROOT-EMPTY; rm -rf perf-empty-b462
# M9 keep-list ArtistBioSection deleted by mistake -> GT5 + GT6 (+GT3)
rm app/components/home/ArtistBioSection.tsx; sed -i '/ArtistBioSection/d' app/components/home/index.ts; run M9-ARTISTBIO-DELETED
echo done >> "$R"
