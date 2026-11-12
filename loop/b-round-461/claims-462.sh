#!/usr/bin/env bash
# Claims for round 462 (STORE-2b-3d-1: delete 6 dead Store modules; ArtistBioSection and TestimonialsSection kept). One line per claim. S defaults to the store tree.
S=${S:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-461
DEL="app/components/home/VideoShowcase.tsx app/components/loading/PianoLoadingAnimation.tsx app/components/loading/PianoCurtainLoader.tsx app/components/loading/CinemaCurtainLoader.tsx app/components/audio/Timeline.tsx app/lib/email.server.ts"
NAMES='VideoShowcase|PianoLoadingAnimation|PianoCurtainLoader|CinemaCurtainLoader|sendOrderEmail'
BARRELS="app/components/home/index.ts app/components/loading/index.ts app/components/common/index.ts app/components/audio/index.ts"; BARRELS_ABS="$S/app/components/home/index.ts $S/app/components/loading/index.ts $S/app/components/common/index.ts $S/app/components/audio/index.ts"
TESTS="app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-live-teal.test.ts"
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-461.json'));print(g['status'],g['commit'][:7])")"
echo "K2 present=$(for f in $DEL; do test -f $S/$f && printf 1 || printf 0; done) lines=$(for f in $DEL; do test -f $S/$f && printf "$(wc -l < $S/$f) " || printf -- '- '; done)"
echo "K3 specifierImporters=$(grep -rnE "from ['\"][^'\"]*/(VideoShowcase|PianoLoadingAnimation|PianoCurtainLoader|CinemaCurtainLoader|Timeline|email\.server)['\"]|import\(['\"][^'\"]*/(Timeline|email\.server|CinemaCurtainLoader|PianoCurtainLoader)['\"]" $S/app $S/perf $S/e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -v '/__tests__/' | sed "s#$S/##" | cut -d: -f1 | sort | tr '\n' ' ')"
echo "K4 nameUsersOutsideOwnBarrelsTests=$(grep -rlwE "$NAMES" $S/app $S/perf $S/e2e --include=*.ts --include=*.tsx 2>/dev/null | sed "s#$S/##" | grep -v '/__tests__/' | grep -vxF -f <(printf '%s\n' $DEL $BARRELS) | wc -l) timelineNamedImports=$(grep -rnzoP "import\s*\{[^}]*\bTimeline\b[^}]*\}\s*from\s*['\"][^'\"]+['\"]" $S/app $S/perf $S/e2e --include=*.ts --include=*.tsx 2>/dev/null | tr '\0' '\n' | grep -c 'from')"
echo "K5 barrelLines=$(grep -cwE "$NAMES|Timeline" $BARRELS_ABS | sed "s#$S/##" | tr '\n' ' ')"
echo "K6 testimonials=$(test -f $S/app/components/home/TestimonialsSection.tsx && echo kept) barrel=$(grep -c TestimonialsSection $S/app/components/home/index.ts) artistBio=$(test -f $S/app/components/home/ArtistBioSection.tsx && echo kept) barrel=$(grep -c ArtistBioSection $S/app/components/home/index.ts) onlyStatsRenderer=$(grep -rl "NEWSLETTER_STATS.happyProducers" $S/app --include=*.tsx | sed "s#$S/##" | tr "\n" " ")"
echo "K7 nonAppRefs=$(grep -rlE "ArtistBioSection|VideoShowcase|PianoLoadingAnimation|PianoCurtainLoader|CinemaCurtainLoader|audio/Timeline|lib/email\.server" $S/.claude $S/scripts $S/e2e $S/perf $S/package.json $S/biome.json $S/vite.config.ts $S/vitest.config.ts $S/tsconfig.json $S/remix.config.js $S/AGENTS.md $S/CLAUDE.md 2>/dev/null | wc -l)"
echo "K8 testHits=$(grep -cE "$NAMES|components/audio/Timeline|lib/email\.server|'loading-brand'" $(printf "$S/%s " $TESTS) | sed "s#$S/##g" | tr '\n' ' ')"
echo "K9 loadingBrandCss=$(grep -c '\.loading-brand' $S/app/styles/app.css)"
echo "K10 $(cd $B && sha256sum -c sketch-462.sha256 2>&1 | grep -c ': OK') review=$(grep -c "$(cut -c1-64 $B/sketch-462.sha256 | head -1)" $B/sketch-review.md 2>/dev/null)"
echo "K11 $(grep -c GREEN $B/mutants/mutants.txt) green / $(grep -c ' RED ' $B/mutants/mutants.txt) red: $(grep ' RED ' $B/mutants/mutants.txt | cut -d' ' -f1,3- | tr '\n' ';')"
echo "K12 $(cat $B/precheck-summary.txt | tr '\n' '|')"
echo "K13 $(cat $B/precheck-lint.txt)"
echo "K14 $(cat $B/head-build-fingerprints.txt | tail -n +2 | tr '\n' ' ')"
echo "K15 doc301free=$(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^301-') last=$(ls $S/docs/implementation/2026/quarter-IV/ | tail -1)"
echo "K16 $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K17 $(for f in sketch-462.patch.txt sketch-462.sha256 sketch-review.md apply-check.txt mutants/mutants.sh mutants/mutants.txt precheck-full.log precheck-summary.txt precheck-lint.txt head-build-fingerprints.txt claims-462.sh claims-462-planning-output.txt claims-462-expected-after-A.txt covering-462.txt grants-462.txt sketch-462-files-sha256.txt precheck-covering.log build-compare.txt build-compare.py css-live-grep.py css-live-grep-head.txt css-removed-live-grep.txt head-build-fingerprints.txt l29-planning.txt sketch-462-delta-v1-v2.diff.txt precheck-agents.log probe/store-pages.cjs probe/run1/store-pages.json v1-superseded/sketch-review.md; do test -f $B/$f && printf 'ok ' || printf "MISSING:$f "; done)"
echo "K18 $(cut -c1-40 $B/apply-check.txt)"
echo "K19 $(grep -E '^(server-normalized|client-js|css-bytes|tree-fingerprint)' $B/build-compare.txt | tr '\n' '|')"
echo "K20 sketch: $(tail -n +2 $B/css-removed-live-grep.txt | tr '\n' '|') head: $(tail -n +2 $B/css-live-grep-head.txt | cut -d' ' -f1-2 | tr '\n' '|') removedSelectors=$(grep -c '^REMOVED' $B/build-compare.txt) added=$(grep -c '^ADDED' $B/build-compare.txt)"
echo "K21 staleDocs=$(grep -nE 'email\.server|VideoShowcase' $S/docs/technical/future/stripe-migration-guide.md $S/docs/technical/video-sync.md | sed "s#$S/##" | cut -d: -f1,2 | tr '\n' ' ')"
echo "K22 $(python3 -I -c "
import json;r=json.load(open('$B/probe/run1/store-pages.json'))
ok=lambda x:x['headTreeEqual'] and x['controlHeadHeadEqual'] and x['status'][0]==x['status'][1]==200 and x['h1'][0]==x['h1'][1] and x['freeSamples'][0]==x['freeSamples'][1] and x['tokenElsHead']==x['tokenElsTree']==0 and not x['chunk404']
print('rows',len(r),'allOk',sum(map(ok,r)),'pages',' '.join(sorted({x['path'] for x in r})))")"
echo "K23 storeDocForms=$(grep -lE 'In Progress \(stage 2b-[0-9a-z-]+ of STORE-2b; C round [0-9]+ PASS\)' $S/docs/implementation/2026/quarter-IV/*.md | sed 's#.*/##' | cut -c1-3 | tr '\n' ' ') agentsRc=$(tail -1 $B/precheck-agents.log)"
