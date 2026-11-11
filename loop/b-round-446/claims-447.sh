#!/usr/bin/env bash
# B round 446 -> 447 claims. Run from anywhere. Each line: K#<TAB>value
S=/home/runner/czaba-project/store; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-446
cd "$S" || exit 2
R='teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\b|rgba?\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\)|hsla?\( ?17[0-9][ ,][^)]*\)'
echo -e "K1\t$(python3 -c "import json;print(json.load(open('$L/gates/gate-round-446.json'))['commit'][:7])")"
echo -e "K2\t$(git rev-parse --short=7 HEAD)"
echo -e "K3\tteal-total $(grep -rnoiE "$R" app perf --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
for f in $(head -7 $B/grants-447.txt) app/components/audio/StemsPlayerModal.tsx app/components/audio/StemControl.tsx app/components/studio/StudioTrack.tsx app/lib/email.server.ts app/routes/hire-us.tsx app/components/audio/Timeline.tsx app/components/loading/CinemaCurtainLoader.tsx; do
  echo -e "K4\t$f $(grep -oiE "$R" $f | wc -l)"; done
echo -e "K5\tTimeline-importers $(grep -rlE "from ['\"][^'\"]*audio/Timeline['\"]|\\bTimeline\\b[^;]*from ['\"]~/components/audio['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -v 'components/audio/index.ts' | wc -l)"
echo -e "K6\tCinemaCurtainLoader-users $(grep -rlw CinemaCurtainLoader app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'loading/(index|CinemaCurtainLoader)\.tsx?$|common/index\.ts$' | wc -l)"
echo -e "K7\tPianoLoadingAnimation-users $(grep -rlw PianoLoadingAnimation app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'loading/(index|PianoLoadingAnimation)\.tsx?$|common/index\.ts$' | wc -l)"
echo -e "K8\tStemsPlayerModal-in-root $(grep -c '<StemsPlayerModal' app/root.tsx)"
echo -e "K9\tProductCard-hover-reveal-wrappers $(grep -c 'opacity-0 group-hover:opacity-100' app/components/product/ProductCard.tsx)"
echo -e "K10\tloader-gradient-text $(grep -c 'WebkitBackgroundClip' app/components/loading/SpotlightLoader.tsx)"
echo -e "K11\tloader-font-bold $(grep -c 'font-bold' app/components/loading/SpotlightLoader.tsx)"
echo -e "K12\tstudio-solo-on $(grep -c 'border-foreground bg-foreground text-background' app/components/arrangement/ArrangementLane.tsx)"
echo -e "K13\tdoc292 $(test -f docs/implementation/2026/quarter-IV/292-store-2b-2a-teal-sweep.md && sed -n 4p docs/implementation/2026/quarter-IV/292-store-2b-2a-teal-sweep.md || echo absent)"
echo -e "K14\tteal-test $(test -f app/lib/__tests__/store-teal-sweep.test.ts && echo present || echo absent)"
for a in teal-head-1440.json teal-scan.cjs; do echo -e "K15\t$a $(test -f $B/probe/$a && echo present || echo absent)"; done
echo -e "K16\thead-home-scan $(python3 -c "
import json,collections;d=json.load(open('$B/probe/teal-head-1440.json'))
print(' '.join(f'{k}={v.get(\"count\")}' for k,v in d.items()))")"
echo -e "K17\tStemControl-aria-pressed $(grep -c 'aria-pressed' app/components/audio/StemControl.tsx)"
echo -e "K18\tforbidden-dirty $(git status --porcelain -- app/root.tsx app/components/studio app/styles app/routes/account.downloads.tsx app/routes/studio.\$productId.tsx app/contexts | wc -l)"
echo -e "K19\thead-states $(test -f $B/probe/head-states.json && python3 -c "
import json;d=json.load(open('$B/probe/head-states.json'))
print(' '.join(f'{k}:loaderTeal={d[k]['loader'].get('tealEls')},showcase={d[k]['showcase']},giftTeal={sum(d[k]['giftSelected'])},ripple={len(d[k]['checkout']['rippleShadow'])}' for k in ['1440','1280','375']),'stems='+str(sum(d['stems'].values())))" || echo absent)"
