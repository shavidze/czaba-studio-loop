#!/usr/bin/env bash
# B round 506 -> 507 claims. usage: bash claims-507.sh [store-tree]   (default: the store repo)
T=${1:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-506
cd "$T" || exit 2
c(){ echo "[$1] $2"; }
c K1 "HEAD $(git rev-parse --short HEAD 2>/dev/null || echo n/a)"
c K2 "worktree $(git status --short --untracked-files=all 2>/dev/null | wc -l) changed"
c K3 "AudioPlayer <button=$(grep -c '<button\b' app/components/audio/AudioPlayer.tsx) <IconButton=$(grep -c '<IconButton\b' app/components/audio/AudioPlayer.tsx) bg-white/10=$(grep -c 'bg-white/10' app/components/audio/AudioPlayer.tsx) hover:text-error=$(grep -c 'hover:text-error' app/components/audio/AudioPlayer.tsx)"
c K4 "IconButton ghost/sizes: $(grep -c "'bg-transparent text-muted'" app/components/ui/IconButton.tsx) $(grep -c "sm: { button: 'w-8 h-8', icon: 16 }" app/components/ui/IconButton.tsx) $(grep -c "md: { button: 'w-10 h-10', icon: 20 }" app/components/ui/IconButton.tsx) rounded-lg=$(grep -c "'rounded-lg'," app/components/ui/IconButton.tsx) title=$(grep -c 'title={label}' app/components/ui/IconButton.tsx)"
c K5 "nonbrand scanner: $(python3 -I $B/scan-nonbrand.py . /tmp/k5-nonbrand.json | head -1)"
c K6 "brand scanner: $(python3 -I $L/b-round-497/scan-brand.py . /tmp/k6-brand.json)"
c K7 "ProductSidebar Complimentary Download button line: $(grep -n 'Complimentary Download' -B3 app/components/product/ProductSidebar.tsx | grep -c 'onClick\|href\|to=')(onClick/href/to in 3 lines above) at l.$(grep -n 'Complimentary Download' app/components/product/ProductSidebar.tsx | cut -d: -f1)"
c K8 "tests naming AudioPlayer or components/audio: $(grep -rlE 'AudioPlayer|components/audio' app/lib/__tests__ | sort | tr '\n' ' ')"
c K9 "mock version stems arrays (stems:)=$(grep -c '\bstems:' $L/mock-api/server.mjs) includesStems-true-metadata=$(grep -c 'includesStems: true' $L/mock-api/server.mjs) price0=$(grep -cE 'standardPrice: 0\b|minPrice: 0\b' $L/mock-api/server.mjs)"
c K10 "gate 506: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-506.json'));print(g['status'],g['commit'][:7])")"
c K11 "c-round-506: $(python3 -I -c "import json;c=json.load(open('$L/c-round-506.json'));print(c['taskStatus'],c['browserVerified'],c['realVerified'],len(c['bugs']))")"
c K12 "artifacts: $(for f in sketch-507.patch.txt sketch-sha.txt scan-nonbrand.py scan-nonbrand-head.json scan-nonbrand-sketch.json scan-mutant.txt scan-var-classname.txt consult-product-designer.md mutants-507.py mutants-507.txt covering-files.txt r507-tree-sha256.txt r507-pre-sha.txt r507-post-sketch-sha.txt probe/ap-507.cjs probe/ap-layout-507.cjs probe/head/head.jsonl probe/sketch/sketch.jsonl probe/head/layout.json probe/sketch/layout.json precheck-tsc.log precheck-lint.log precheck-full.log precheck-full-raw.log precheck-full-raw-v2.log precheck-build-sketch.log precheck-covering.log precheck-biome.log sketch-review.md head-AudioPlayer.tsx.txt probe/ap-behaviour-507.cjs probe/head/behaviour.json probe/sketch/behaviour.json probe/close-ring-columns.txt sketch-sha-history.txt sketch-delta-v1-v2.diff.txt sketch-507-v1.patch.txt claims-507-planning-output.txt claims-507-sketch-output.txt; do test -f $B/$f && echo -n "ok " || echo -n "MISSING:$f "; done)"
c K13 "next impl doc number: last=$(ls docs/implementation/2026/quarter-IV | grep -E '^3[0-9]{2}-' | sort | tail -1 | cut -c1-3)"
c K14 "pending grep: $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
c K15 "probe key values sketch: $(python3 -I -c "
import json
r=[json.loads(l) for l in open('$B/probe/sketch/sketch.jsonl')]; r=[x for x in r if 'rest' in x]
print(sorted({(x['nm'],x['rest']['box'][2],x['rest']['radius'],x['rest']['color'],x['hover']['bg'],x['hover']['color'],x['kbd']['offset'],x['restContrastVsPanel']) for x in r}))")"
c K16 "layout head/sketch (root h, playCx): $(python3 -I -c "
import json
for t in ('head','sketch'):
  print(t,[(x['w'],x['root'][3],x['playCx']) for x in json.load(open('$B/probe/'+t+'/layout.json'))],end=' ')")"
c K17 "L50 focus-origin hits in AudioPlayer.tsx: $(grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' app/components/audio/AudioPlayer.tsx)"
c K18 "activeAfterClose head/sketch: $(python3 -I -c "
import json
print([r['activeAfterClose']['tag'] for r in json.load(open('$B/probe/head/behaviour.json'))],[r['activeAfterClose']['tag'] for r in json.load(open('$B/probe/sketch/behaviour.json'))])")"
