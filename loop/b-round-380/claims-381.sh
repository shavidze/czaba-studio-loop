#!/usr/bin/env bash
# Round 381 claims. Run from the loop root: bash b-round-380/claims-381.sh
L=$(pwd); S=${S:-/home/runner/czaba-project/store}
echo "K1 gate380: $(python3 -I -c "import json;g=json.load(open('gates/gate-round-380.json'));print(g['status'],g['commit'][:7])") HEAD: $(git -C "$S" rev-parse --short=7 HEAD)"
echo "K2 status lines: $(git -C "$S" status --short --untracked-files=all | wc -l)"
echo "K3 buffersRef decl:"; grep -n "const buffersRef = useRef(new Map<string, AudioBuffer>())" "$S/app/contexts/ArrangementContext.tsx"
echo "K4 buffersRef set sites: $(grep -c "buffersRef.current.set(" "$S/app/contexts/ArrangementContext.tsx") delete/clear sites: $(grep -cE "buffersRef.current.(delete|clear)\(" "$S/app/contexts/ArrangementContext.tsx")"
echo "K5 demo URL sources:"; grep -nE "'demo-(middle-east|hero-music)': '" "$S/app/data/studio-lab-demo.ts"; for f in public/middle-east.mp3 public/videos/hero/hero-music.mp3; do test -f "$S/$f" && echo "  present $f"; done
echo "K6 demo synth stem seconds:"; grep -n "export const DEMO_STEM_DURATION = " "$S/app/lib/arrangement/demo-synth.ts"
echo "K7 instanceof AudioBuffer in app/** perf/** e2e/**: $(grep -rn "instanceof AudioBuffer" "$S/app" "$S/perf" "$S/e2e" 2>/dev/null | wc -l)"
echo "K8 res.mem rows in budgets: $(grep -c '"id": "res.mem\.' "$S/perf/budgets.resources.json")"; grep -n '"id": "res.mem\.' "$S/perf/budgets.resources.json"
echo "K9 determinism exact units include count:"; grep -n "^  'count',$" "$S/perf/lib/determinism.ts"
echo "K10 resources spec heap read + init scripts:"; grep -n "async function readHeapAfterGc\|result.samples.set('res.mem.backing-ready-mib'\|await context.addInitScript(" "$S/perf/studio-lab-resources.perf.spec.ts"
echo "K11 consumers of the budgets file / spec in app perf e2e: $(grep -rlE 'budgets\.resources|studio-lab-resources' "$S/app" "$S/perf" "$S/e2e" 2>/dev/null | sort | tr '\n' ' ')"
echo "K12 protected sha:"; (cd "$S" && sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt"; echo "  rc $?")
echo "K13 frozen sha (r381, $(wc -l < "$L/b-round-380/r381-frozen-sha256.txt") entries):"; (cd "$S" && sha256sum -c --quiet "$L/b-round-380/r381-frozen-sha256.txt"; echo "  rc $?")
echo "K14 B HEAD probe (dev, both viewports x3):"; python3 -I -c "
import json;r=json.load(open('$L/b-round-380/probe/pcm-head-381.json'))
print('  runs',len(r),'mib',sorted({x['ready']['mib'] for x in r}),'live',sorted({x['ready']['live'] for x in r}),'byOrigin',r[0]['ready']['byOrigin'])"
python3 -I -c "
import json;r=json.load(open('$L/b-round-380/probe/pcm-detail-head-381.json'))
print('  detail seconds',sorted(d['sec'] for d in r[0]['ready']['detail']))"
echo "K15 docs: 247 $(ls "$S/docs/implementation/2026/quarter-IV/" | grep -c '^247-') present; doc 246 l.4: $(sed -n 4p "$S/docs/implementation/2026/quarter-IV/246-perf-export-wav-stream.md")"
echo "K16 'In Progress (stage' hits: $(grep -rln 'In Progress (stage' "$S/docs/implementation" | sed "s#$S/##" | tr '\n' ' ')"
echo "K17 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])") lessons lines: $(wc -l < lessons.md)"
echo "K18 artifacts:"; for f in b-round-380/probe/head-resources-c380.json b-round-380/probe/lib-count-381.mjs b-round-380/probe/lib-count-head-381.json b-round-380/probe/pcm-probe-381.mjs b-round-380/probe/pcm-head-381.json b-round-380/probe/pcm-detail-head-381.json b-round-380/grants-381.txt b-round-380/r381-frozen-sha256.txt b-round-334/vitest.perf-lib.config.mjs b-round-318/protected-sha256.txt; do test -f "$f" && echo "  ok $f" || echo "  MISSING $f"; done
echo "K19 perf lib test files: $(ls "$S/perf/lib/" | grep -c '\.test\.ts$')"
echo "K20 library source locator (B dev probe, both viewports):"; python3 -I -c "
import json;r=json.load(open('$L/b-round-380/probe/lib-count-head-381.json'))
print('  ',[(x['viewport'],x['listboxes']) for x in r])"
echo "K21 tsconfig target/lib (WeakRef needs ES2021+):"; grep -nE '"target"|"lib"' "$S/tsconfig.json"
echo "K22 collection-ready helper + resources ready wait:"; grep -n "export async function waitForCollectionReady" "$S/perf/lib/page.ts"; grep -n "await waitForLibraryReady(page);\|waitForCollectionReady" "$S/perf/studio-lab-resources.perf.spec.ts"
echo "K23 HEAD resources problems arrays (copy of C round 380 latest-resources.json): $(python3 -I -c "
import json,re;s=open('$L/b-round-380/probe/head-resources-c380.json').read();print(sorted(set(re.findall(r'\"problems\": \[[^\]]*\]',s))))")"
