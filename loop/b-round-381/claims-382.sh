#!/usr/bin/env bash
# Round 382 claims. Run from the loop root: bash b-round-381/claims-382.sh
L=$(pwd); S=${S:-/home/runner/czaba-project/store}; AC="$S/app/contexts/ArrangementContext.tsx"
echo "K1 gate381: $(python3 -I -c "import json;g=json.load(open('gates/gate-round-381.json'));print(g['status'],g['commit'][:7])") HEAD: $(git -C "$S" rev-parse --short=7 HEAD)"
echo "K2 status lines: $(git -C "$S" status --short --untracked-files=all | wc -l)"
echo "K3 buffersRef decl:"; grep -n "const buffersRef = useRef(new Map<string, AudioBuffer>())" "$AC"
echo "K4 buffersRef set sites: $(grep -c "buffersRef.current.set(" "$AC") delete/clear sites: $(grep -cE "buffersRef.current.(delete|clear)\(" "$AC")"
echo "K5 SWEEP buffersRef consumers (app/** perf/**): $(grep -rn "buffersRef" "$S/app" "$S/perf" | grep -v __tests__ | wc -l)"; grep -n "buffersRef" "$AC"
echo "K6 demo URL sources + loader branch:"; grep -nE "'demo-(middle-east|hero-music)': '|const url = demoUrls\[source.id\];|fetchAndDecodeSource\(url, ctx, signal, publicPreviewSourceFetch\(\)\)" "$S/app/data/studio-lab-demo.ts"; for f in public/middle-east.mp3 public/videos/hero/hero-music.mp3; do echo "  $f $(stat -c %s "$S/$f") bytes"; done
echo "K7 WorkspaceCollection fields:"; grep -n "export interface WorkspaceCollection {" "$S/app/types/arrangement.ts"; echo "  canReloadSource hits in app/**: $(grep -rn "canReloadSource" "$S/app" | wc -l)"
echo "K8 placement/paste/drag gates on status ready:"; grep -nE "state.status !== 'ready'|sourceStates\[sourceId\]\?\.status === 'ready'|sourceStates\[sourceId\]\?\.status !== 'ready'" "$AC"
echo "K9 preview buffer guard + sourceNotLoaded:"; grep -n "const buffer = buffersRef.current.get(sourceId);\|studioLibraryStrings.sourceNotLoaded(source.title)" "$AC"; grep -n "sourceNotLoaded: (title: string)" "$S/app/lib/arrangement/strings.ts"
echo "K10 load path: set after peaks, resync when a clip uses it:"; grep -n "buffersRef.current.set(source.id, buffer);\|if (present.clips.some((clip) => clip.sourceId === source.id)) {" "$AC"
echo "K11 render + schedule consumers:"; grep -n "renderArrangementWav(arrangement, buffersRef.current\|buffers: buffersRef.current,\|^                buffersRef.current,$" "$AC"
echo "K12 test files naming loadSource / sourceNotLoaded / 'has not loaded yet' (app/**): $(grep -rlE "loadSource|has not loaded yet|sourceNotLoaded" "$S/app" --include=*.test.* | wc -l)"
echo "K13 demo-collection / studio-lab route tests (covering set C-DEMO):"; (grep -rlE "studioLabDemoCollection|studio-lab-demo'|routes/studio-lab'" "$S/app" --include=*.test.* | sed "s#$S/##" | sort) | tee /dev/null | sed 's/^/  /'; echo "  count $(grep -rlE "studioLabDemoCollection|studio-lab-demo'|routes/studio-lab'" "$S/app" --include=*.test.* | wc -l)"
echo "K14 protected sha:"; (cd "$S" && sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt"; echo "  rc $?")
echo "K15 frozen sha (r382, $(wc -l < "$L/b-round-381/r382-frozen-sha256.txt") entries):"; (cd "$S" && sha256sum -c --quiet "$L/b-round-381/r382-frozen-sha256.txt"; echo "  rc $?")
echo "K16 docs: 248 $(ls "$S/docs/implementation/2026/quarter-IV/" | grep -c '^248-') present; doc 247 l.4: $(sed -n 4p "$S/docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md")"
echo "K17 'In Progress (stage' hits: $(grep -rln 'In Progress (stage' "$S/docs/implementation" | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K18 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])") lessons lines: $(wc -l < lessons.md)"
echo "K19 artifacts:"; for f in b-round-380/probe/pcm-probe-381.mjs b-round-380/probe/pcm-head-381.json b-round-380/probe/pcm-detail-head-381.json c-round-381/res-rows.txt c-round-381/perf-res.log b-round-381/grants-382.txt b-round-381/r382-frozen-sha256.txt b-round-334/vitest.perf-lib.config.mjs b-round-318/protected-sha256.txt b-round-381/tech-lead-382.md b-round-381/fixture-grants-382.txt b-round-381/fixture-expect-counts-head.txt; do test -f "$f" && echo "  ok $f" || echo "  MISSING $f"; done
echo "K20 studio-lab initial arrangement (tracks only, no clips):"; grep -n "const studioLabInitialArrangement = createArrangement(\[" "$S/app/routes/studio-lab.tsx"; echo "  clip/source refs in that block: $(sed -n '/const studioLabInitialArrangement/,/^\]);/p' "$S/app/routes/studio-lab.tsx" | grep -c 'sourceId')"
echo "K21 harness count guard + problem strings:"; grep -n "return \['pcm registry missing'\]\|pcm registry did not count its probe buffer\|library sources\`" "$S/perf/lib/pcm-live.ts"
echo "K22 default selected source = first collection source; first demo source:"; grep -n "collection.sources\[0\]?.id ??" "$AC"; grep -n "id: 'demo-middle-east'," "$S/app/data/studio-lab-demo.ts"
echo "K23 C round 381 production rows:"; grep -E "^res\.(mem\.pcm-live|export\.[12]\.bytes |export\.[12]\.peak-backing-delta-mib |export\.1\.longtask-max\.6x)" c-round-381/res-rows.txt | awk '{print "  "$1, $2, $4}'
echo "K24 per-buffer seconds at ready (B HEAD probe): $(python3 -I -c "
import json;r=json.load(open('$L/b-round-380/probe/pcm-detail-head-381.json'))
d=r[0]['ready']['detail'];print(sorted((x['sec'],round(x['len']*x['ch']*4/1048576,2)) for x in d))")"
echo "K25 assert rows in budgets: $(grep -c '\"mode\": \"assert\"' "$S/perf/budgets.resources.json")"
echo "K26 stem cache fetch for public previews:"; grep -n "export function publicPreviewSourceFetch" "$S/app/lib/arrangement/stem-cache.client.ts"
echo "K27 perf lib test files: $(ls "$S/perf/lib/" | grep -c '\.test\.ts$')"
echo "K28 collection load effect cleanup aborts only:"; grep -n "  }, \[collection, getDecodeContext, patchSourceState, requestSourcePeaks, syncPlayback, setStatus\]);" "$AC"
echo "K29 startGraph callers:"; grep -n "startGraph(" "$AC" | grep -v "const startGraph"
echo "K30 updateHistory decl:"; grep -n "const updateHistory = useCallback" "$AC"
echo "K31 consumers already take ReadonlyMap:"; grep -n "  buffers: ReadonlyMap<string, TBuffer>;\|  buffers: ReadonlyMap<string, AudioBuffer>," "$S/app/lib/arrangement/graph.client.ts"
echo "K32 other buffer holders release it: peaks active cleared $(grep -c "active = null;" "$S/app/lib/arrangement/peaks.client.ts") sites; preview stopActive/onended clear $(grep -c "active = null;" "$S/app/lib/arrangement/preview.client.ts") sites; AudioBuffer in stem-cache.client.ts: $(grep -c "AudioBuffer" "$S/app/lib/arrangement/stem-cache.client.ts")"
