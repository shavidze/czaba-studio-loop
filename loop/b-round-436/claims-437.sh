#!/usr/bin/env bash
# Round 437 claims (COPY-PD-VIS stage 2: STUDIO-VIS-7, STUDIO-VIS-10, SABA-LANE-RESIZE-HANDLE). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-436
E=app/components/arrangement/ArrangementExportDialog.tsx
W=app/components/arrangement/StudioWorkspace.tsx
N=app/components/arrangement/StudioNarrowScreen.tsx
L=app/components/arrangement/ArrangementLane.tsx
P=app/components/arrangement/ArrangementDetailPanel.tsx
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate436 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-436.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-437.txt" | wc -l)"
sha256sum --quiet -c "$B/r437-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r437-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-437.txt")"
if git apply --check "$B/sketch-437.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) doc284 $(ls $Q/284-* 2>/dev/null | wc -l)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 export old-outline $(grep -c 'border border-brand bg-foreground/5 px-4 py-2 text-sm font-medium text-brand ' $E) old-hover $(grep -c 'text-brand motion-safe.*enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 disabled:cursor-not-allowed disabled:opacity-40' $E) new-fill $(grep -c 'border border-transparent bg-brand px-4 py-2 text-sm font-medium text-brand-foreground' $E) aria-busy $(grep -c 'aria-busy={isRendering}' $E) disabled-expr $(grep -c 'disabled={isEmpty || isRendering || isDecoding}' $E) busy-label $(grep -c 'studioExportStrings.busyButton' $E)"
echo "K9 exit old-header $(grep -c 'inline-flex items-center gap-0.75 rounded-sm px-1 text-sm font-medium text-muted hover:text-foreground' $W) old-narrow $(grep -c 'inline-flex items-center gap-1 self-start rounded-sm px-1 text-sm font-medium text-muted hover:text-foreground' $N) new-header $(grep -c 'group inline-flex items-center gap-0.75 rounded-sm px-1 text-sm font-medium text-foreground' $W) new-narrow $(grep -c 'group inline-flex items-center gap-1 self-start rounded-sm px-1 text-sm font-medium text-foreground' $N) arrows-new $(grep -c 'size-3 shrink-0 text-muted group-hover:text-foreground' $W $N | tr '\n' ' ')link-to-root $(grep -c 'to="/"' $W $N | tr '\n' ' ')"
echo "K10 lane old-hover $(grep -c 'h-1.5 cursor-row-resize touch-none hover:bg-foreground/50' $L) old-drag $(grep -c "isHeightDragging && 'bg-foreground/50'" $L) new-hairline $(grep -c 'after:absolute after:inset-x-0 after:-bottom-px after:h-px' $L) new-swap $(grep -c "isHeightDragging ? 'after:bg-foreground/40' : 'hover:after:bg-foreground/25'" $L) container-border $(grep -c "'relative flex border-b border-outline'," $L) | detail old-hover $(grep -c 'top-0 z-20 h-1.5 cursor-row-resize touch-none hover:bg-foreground/50' $P) new-hairline $(grep -c 'after:absolute after:inset-x-0 after:top-0 after:h-px hover:after:bg-foreground/25' $P) panel-overflow-border $(grep -c "'relative flex shrink-0 flex-col overflow-hidden border-t border-outline bg-surface text-xs'," $P)"
echo "K10b SWEEP-siblings roots app/components/arrangement hover:bg-foreground/50 $(grep -rn 'hover:bg-foreground/50' app/components/arrangement | wc -l) files $(grep -rln 'hover:bg-foreground/50' app/components/arrangement | sort | tr '\n' ' ')"
echo "K11 app.css button-cursor l.482 '$(sed -n 482p app/styles/app.css)' brand-hover-token $(grep -c -- '--color-brand-hover: #d9b87f;' app/styles/app.css)"
echo "K11b SWEEP-tests roots app perf e2e (test files) old-tokens $(grep -rnE "hover:bg-foreground/50|text-muted hover:text-foreground|'enabled:hover:bg-foreground/8'|'text-brand'" app perf e2e 2>/dev/null | grep -E '/__tests__/|^perf/|^e2e/' | wc -l) testid-files $(grep -rlE "arrangement-track-height|arrangement-detail-separator|arrangement-exit|studio-narrow-exit" app perf e2e 2>/dev/null | grep -E '/__tests__/|^perf/|^e2e/' | wc -l) perf-e2e-testid-hits $(grep -rlE "arrangement-track-height|arrangement-detail-separator|arrangement-exit|studio-narrow-exit|aria-busy" perf e2e 2>/dev/null | wc -l)"
for f in sketch-437.patch.txt sketch-437.sha256 sketch-review.md sketch-paths.txt mutants/summary.txt mutants/run.py precheck-covering.log precheck-full.log precheck-full-code-only.log precheck-typecheck.log precheck-lint.log covering-files.txt grants-437.txt r437-frozen-sha256.txt probe/vis-probe.mjs probe/summarize.py probe/rows-decode.mjs probe/summary.txt probe/rows-decoded.txt probe/head/vis-probe.json probe/sketch/vis-probe.json current-task-before-437.md backlog-before-437.json l57-check-c436.txt update-backlog.py update-backlog.done l31-headroom.txt recheck-436.txt probe/press-export-probe.mjs probe/head-press/press-export.json probe/sketch-press/press-export.json probe/narrow-probe.mjs probe/head-narrow/narrow-probe.json probe/sketch-narrow/narrow-probe.json screens/compare.py screens/compare.txt screens/head/screen435.json screens/sketch/screen435.json; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K12 artifacts /'; echo
echo "K13 archive-436 $(cmp -s "$LOOP/tasks/round-436.md" "$B/current-task-before-437.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" STUDIO-VIS-4 STUDIO-VIS-6 STUDIO-VIS-7 STUDIO-VIS-10 SABA-LANE-RESIZE-HANDLE TL-R437-01 TL-R437-02 TL-R437-03 B-R437-BUTTON-CURSOR-UNLAYERED TL-R436-02-INLINE-STATUS TL-R436-03-LABEL-IN-NAME | awk '{$2=""; print}' | sed 's/^/K14 /' | cut -c1-140
echo "K14c open-CHM $(python3 -I -c "
import json
b=json.load(open('$LOOP/backlog.json'))
o=[(f['id'],str(f.get('status',''))[:24]) for f in b['open_findings'] if isinstance(f,dict) and str(f.get('severity','')).lower() in ('critical','high','medium') and not str(f.get('status','')).startswith(('done','closed','resolved','wontfix'))]
print(len(o), sorted(o))")"
echo "K14b screen-candidates $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print([(x['id'],x['status'][:30]) for x in b['screen_review_candidates'] if x.get('id') in ('SR-435-1','SR-435-2')])")"
echo "K15 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K16 probe $(python3 -I - "$B/probe" <<'PY'
import json, sys
o = []
for side in ('head', 'sketch'):
    d = json.load(open(f'{sys.argv[1]}/{side}/vis-probe.json'))
    for k in ('1440x900', '1280x720'):
        r = d[k]
        o.append(f"{side} {k} exit {r['exitRest']['link']['color']}/{r['exitRest']['arrow']['color']}->{r['exitHover']['arrow']['color']} exp rest {r['exportRest']['bg']} hover {r['exportHover']['bg']} pressed {r['exportPressed']['bg']} busy-op {[x['opacity'] for x in r['exportBusySamples'] if x['disabled']][:1]} box {r['exportRest']['box']['w']}x{r['exportRest']['box']['h']} c {r['contrast']['labelOnFill']}/{r['contrast']['ringOnSurface']} lane hover {r['laneHandleHover']['after']['bg'] if r['laneHandleHover']['after']['content'] != 'none' else r['laneHandleHover']['el']['bg']} drag {r['laneHandleDrag']['after']['bg'] if r['laneHandleDrag']['after']['content'] != 'none' else r['laneHandleDrag']['el']['bg']} box {r['laneHandleRest']['el']['box']['h']} det {r['detailSepHover']['after']['bg'] if r['detailSepHover']['after']['content'] != 'none' else r['detailSepHover']['el']['bg']}")
print(' | '.join(o))
PY
)"
echo "K16b rows $(grep -c 'rows' "$B/probe/rows-decoded.txt") sketch-lane-hover-1440 '$(grep -A99 '^## sketch' "$B/probe/rows-decoded.txt" | grep '^lane-rows-hover-1440' | cut -d' ' -f2-)'"
echo "K16c press-export $(python3 -I - "$B/probe" <<'PY'
import json, sys
o = []
for side in ('head-press', 'sketch-press'):
    d = json.load(open(f'{sys.argv[1]}/{side}/press-export.json'))
    for k in ('1440x900', '1280x720'):
        r = d[k]; e = r['export']
        o.append(side + ' ' + k + ' ' + ' '.join(f"{w}:{v['hit']}/{v['moved']}" for w, v in r['press'].items()) + f" wav {e['suggested']} {e['bytes']} {e['riff']}{e['wave']} after {e['after']['text']}/{e['after']['opacity']}/{e['after']['busy']} esc {e['dialogClosedByEsc']}")
print(' | '.join(o))
PY
)"
echo "K17 mutants red $(grep -cE '^M[0-9]+-[a-z0-9-]+ rc 1 red: [^n]' "$B/mutants/summary.txt") of $(grep -c '^M[0-9]' "$B/mutants/summary.txt") sketch $(grep '^sketch-green' "$B/mutants/summary.txt")"
echo "K18 covering $(wc -l < "$B/covering-files.txt") run $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-covering.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')$(tail -1 "$B/precheck-full.log")"
echo "K20 lint-typecheck tc $(tail -1 "$B/precheck-typecheck.log") lint $(grep -oE 'Found [0-9]+ warnings' "$B/precheck-lint.log") $(tail -1 "$B/precheck-lint.log")"
echo "K21 review sha-named $(grep -c "$(cut -d' ' -f1 "$B/sketch-437.sha256")" "$B/sketch-review.md") verdict $(grep -ciE '^\- \*\*Verdict: approve-with-lows' "$B/sketch-review.md") l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K22 c436 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-436.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])") l57 $(tail -1 "$B/l57-check-c436.txt")"
echo "K23 saba stem-lanes-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null) q-retro-435-answers $(ls "$LOOP/user-review/" | grep -ciE 'retro-435.*(answer|decision)')"
echo "K24 lessons lines $(wc -l < "$LOOP/lessons.md") l61-clause $(grep -c 'Hover and drag paint on a hit area (D-29z1551)' "$LOOP/lessons.md")"
echo "K26 l31 $(grep -oE 'share [0-9]+%' "$B/l31-headroom.txt" | sort -t' ' -k2 -n | tail -1) files $(grep -c ' slowest ' "$B/l31-headroom.txt")"
echo "K27 band-origin $(git log -S'cursor-row-resize touch-none hover:bg' --format='%h %ad' --date=short -- app/components/arrangement/ArrangementLane.tsx | tail -1)"
echo "K28 l28-in-progress $(grep -rln 'In Progress (stage' docs/implementation | wc -l) copy-pd-vis-docs $(grep -rl 'In Progress (stage' docs/implementation | grep -cE '/28[34]-') recheck-436 $(grep -c 'True' "$B/recheck-436.txt")"
echo "K25 live-manual-6.9 'adjust its height by dragging the split line below the Unfold Track button' (WebFetch https://www.ableton.com/en/live-manual/12/arrangement-view/ 2026-11-10; quoted in current-task.md)"
