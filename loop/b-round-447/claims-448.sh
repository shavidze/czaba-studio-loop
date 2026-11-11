#!/usr/bin/env bash
# B round 447 -> 448 claims. Run from anywhere. Each line: K#<TAB>value
S=${STORE_ROOT:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-447
cd "$S" || exit 2
R='teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\b|rgba?\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\)|hsla?\( ?17[0-9][ ,][^)]*\)'
echo -e "K1\t$(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-447.json'))['commit'][:7])")"
echo -e "K2\t$(git rev-parse --short=7 HEAD)"
echo -e "K3\tteal-total $(grep -rnoiE "$R" app perf --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
for f in app/routes/hire-us.tsx app/lib/hire-us-inquiry-email.server.ts app/lib/email.server.ts app/components/audio/Timeline.tsx app/components/loading/CinemaCurtainLoader.tsx app/components/studio/StudioTrack.tsx app/components/audio/StemsPlayerModal.tsx app/components/audio/StemControl.tsx; do
  echo -e "K4\t$f $(test -f $f && grep -oiE "$R" $f | wc -l || echo absent)"; done
echo -e "K5\temail.server-importers $(grep -rnE "[/'\"]email\.server['\"]|sendOrderPaidEmail" app perf e2e --include=*.ts --include=*.tsx | grep -v '^app/lib/email.server.ts:' | grep -v __tests__ | wc -l)"
echo -e "K6\tPianoCurtainLoader-users $(grep -rlw PianoCurtainLoader app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'loading/(index|PianoCurtainLoader)\.tsx?$|common/index\.ts$' | wc -l)"
echo -e "K7\thire-us-inline-teal-styles $(grep -c 'style="color: #13D9CC' app/routes/hire-us.tsx)"
echo -e "K8\thire-us-no-key-500 $(grep -c "Server configuration error" app/routes/hire-us.tsx)"
echo -e "K9\ttests-naming-hire-us $(grep -rlE 'hire-us' app/**/__tests__ app/lib/__tests__ perf e2e 2>/dev/null | sort -u | tr '\n' ' ')"
echo -e "K10\thead-email-contrast $(python3 -I -c "
import json;d=json.load(open('$B/probe/contrast-head.json'));print(' '.join(f'{k}:rows={len(v[\"rows\"])},failing={v[\"failing\"]}' for k,v in d['clients'].items()))")"
echo -e "K11\tsketch-email-contrast $(python3 -I -c "
import json;d=json.load(open('$B/probe/contrast-sketch.json'));print(' '.join(f'{k}:failing={v[\"failing\"]},min={min(r[\"ratio\"] for r in v[\"rows\"])}' for k,v in d['clients'].items()))")"
echo -e "K12\tsketch-sha256 $(sha256sum $B/sketch-448.patch.txt | cut -c1-16) review=$(test -f $B/sketch-review.md && grep -c "$(sha256sum $B/sketch-448.patch.txt | cut -d' ' -f1)" $B/sketch-review.md || echo absent)"
for m in M1 M2 M3 M4 M5 M6 M7 M8 M9 M10; do echo -e "K13\t$m $(grep '×' $B/mutant-$m.log 2>/dev/null | grep -oE '(HE|TS)[0-9]+' | sort -u | tr '\n' ' ')"; done
for f in precheck-typecheck.log precheck-build.log precheck-full.log; do echo -e "K14\t$f $(tail -1 $B/$f 2>/dev/null || echo absent)"; done
echo -e "K14b\tprecheck-full-summary $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -aE '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')"
for a in probe/capture-hire-us-email.ts probe/vn.config.mjs probe/email-contrast.cjs probe/hire-us-email-head.html probe/hire-us-email-sketch.html probe/contrast-head.json probe/contrast-sketch.json probe/shot-head-light.png probe/shot-sketch-light.png run-mutants.sh sketch-448.patch.txt grants-448.txt covering-448.txt; do echo -e "K15\t$a $(test -f $B/$a && echo present || echo absent)"; done
echo -e "K16\tdoc293 $(test -f docs/implementation/2026/quarter-IV/293-store-2b-2b-hire-us-email.md && sed -n 4p docs/implementation/2026/quarter-IV/293-store-2b-2b-hire-us-email.md || echo absent) next-free=$(ls docs/implementation/2026/quarter-IV | grep -c '^293-')"
echo -e "K17\tspec-email-guidance $(grep -ciE 'e-?mail' /home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md)"
echo -e "K18\tforbidden-dirty $(git status --porcelain -- app/root.tsx app/components/studio app/styles app/routes/account.downloads.tsx app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/contexts app/lib/email.server.ts | wc -l)"
echo -e "K19\tdirty-outside-grants $(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -vxF -f $B/grants-448.txt | wc -l) dirty-in-grants $(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -cxF -f $B/grants-448.txt)"
echo -e "K20\tl58 $(cd $L && python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo rc=$?)"
echo -e "K21\tsendOrderPaidEmail-commits $(git log --format=%h -S sendOrderPaidEmail -- app | tr '\n' ' ')"
echo -e "K22\ttheme-values $(for t in background surface foreground muted outline brand; do awk '/^@theme \{/{f=1} f&&/^\}/{f=0} f' app/styles/app.css | grep -oiE "^\s*--color-$t:\s*#[0-9a-f]{6}" | head -1 | tr -d ' '; done | tr '\n' ' ')"
echo -e "K23\thire-us-biome-warnings $(npx biome check app/routes/hire-us.tsx 2>&1 | grep -oE 'Found [0-9]+ warning' || echo 'Found 0 warning')"
echo -e "K24\tescapeHtml-sites $(grep -rnE '\bescapeHtml\b' app --include=*.ts --include=*.tsx | grep -v __tests__ | cut -d: -f1 | sort | uniq -c | tr -s ' ' | tr '\n' ';')"
echo -e "K25\tperf-report-ts $(test -f perf/lib/report.ts && echo present || echo absent) teal-allow-list-string-map $(grep -c 'TEAL_ALLOW_LIST: Readonly<Record<string, string>>' app/lib/__tests__/store-teal-sweep.test.ts) new-tests $(ls app/lib/__tests__/hire-us-inquiry-email*.test.ts 2>/dev/null | wc -l)"
echo -e "K26\thire-us-page $(python3 -I -c "
import json;d=json.load(open('$B/probe/hire-us-page-sketch.json'))['viewports']
print(' '.join(f'{w}:hh={v[\"headVsHead\"][\"diffPx\"]},ht={v[\"headVsTree\"][\"diffPx\"]},emptyInvalid={len(v[\"tree\"][\"empty\"][\"invalid\"])},filled={v[\"tree\"][\"filledError\"]!r}/{v[\"head\"][\"filledError\"]!r}' for w,v in d.items()))")"
echo -e "K27\temail-structure-diff-lines $(grep -c '' $B/probe/email-structure-diff-sketch.txt) sha $(sha256sum $B/probe/email-structure-diff-sketch.txt | cut -c1-12)"
for f in precheck-lint.log precheck-check.log; do echo -e "K14\t$f $(tail -1 $B/$f 2>/dev/null || echo absent) $(grep -oE 'Found [0-9]+ warnings' $B/$f | head -1)"; done
