#!/usr/bin/env bash
# Round 289 claims (L29). Run from store/. Output must equal b-round-288/claims-289-output.txt (K1 may differ only by a root-only commit, INFO-C268-HEAD-DRIFT rule).
export LC_ALL=C.UTF-8
echo "K1 HEAD"; git rev-parse --short=7 HEAD
echo "K2 status (app docs perf e2e)"; git status --porcelain -- app docs perf e2e | wc -l
echo "K3 demo Georgian lines"; grep -nP '[\x{10A0}-\x{10FF}]' app/data/studio-lab-demo.ts
echo "K4 demo labels"; grep -nE "_LABEL = |notice: " app/data/studio-lab-demo.ts
echo "K5 option context line"; grep -nE "source.shortTitle \? \(|arrangement-library-option-context|\{source.collectionLabel\}|title=\{source.title\}" app/components/arrangement/ArrangementLibrary.tsx
echo "K6 listbox + map"; grep -nE 'role="listbox"|space-y-1 overflow-y-auto|results.map\(\(source, index\)|isFocusTarget=\{isSelected \|\| \(visibleSelectedId === null && index === 0\)\}' app/components/arrangement/ArrangementLibrary.tsx
echo "K7 keyboard order source"; grep -nE "const resultIds = |moveLibrarySelection\(resultIds|selectLibraryOption\(resultIds\[0\]" app/components/arrangement/ArrangementLibrary.tsx
echo "K8 search haystack"; grep -nE "^\s+source\.(title|collectionLabel),$" app/lib/arrangement/library.ts
echo "K9 collision pins"; grep -nE "DEMO_REMAINING_GEORGIAN_LINES|Synthetic demo · " app/lib/arrangement/__tests__/strings.test.ts app/data/__tests__/studio-lab-demo.test.ts
echo "K10 SWEEP demo terms (roots app perf e2e)"; grep -rlE 'ღამის|პულსი|ბასი|პადი|მელოდია|საჯარო|მიქსი' app perf e2e | sort; grep -rcE 'ღამის|პულსი|ბასი|პადი|მელოდია|საჯარო|მიქსი' app perf e2e | grep -v ':0$' | sort
echo "K11 SWEEP context testid + option-structure (roots app perf e2e)"; grep -rn "arrangement-library-option-context" app perf e2e | wc -l
echo "K12 biome-ignore precedent"; grep -c "biome-ignore lint/a11y/useSemanticElements" app/components/arrangement/ArrangementLibrary.tsx
echo "K13 purchased shortTitle"; grep -nE "shortTitle: stem.name|collectionLabel: label" app/lib/arrangement/collection.ts
echo "K14 full title consumers"; grep -nE "historyAdd\(source.title\)|source.id === sourceId\)\?\.title" app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementLane.tsx
echo "K15 next doc number"; ls docs/implementation/2026/quarter-IV | sort | tail -1
echo "K16 Fragment/useId not yet imported"; grep -cE "^\s+(Fragment|useId),$" app/components/arrangement/ArrangementLibrary.tsx
echo "K17 demo audio keyed by source id"; grep -nE "const part = demoStemParts\[sourceId\]|sourceId === 'demo-synth-mix'|const url = demoUrls\[source.id\]" app/data/studio-lab-demo.ts
echo "K18 status + undo strings"; grep -nE "historyAdd: |\}\): string => \`“\\$\{title\}” added to the|Tempo \\$\{bpm\} BPM from" app/lib/arrangement/strings.ts
echo "K19 row targets"; grep -rn 'data-testid="arrangement-position"' app/components/arrangement | wc -l; grep -rln "Demo collection — no sign-in required" app --include=*.ts --include=*.tsx | grep -v __tests__; test -f app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx && echo "library-row-strings-ui present"
echo "K19b journey + states locators"; grep -nE 'data-testid="arrangement-(status|selected-clip|library-empty)"' app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementLibrary.tsx; grep -n "data-clip-id={clip.id}" app/components/arrangement/ArrangementClip.tsx; grep -n "searchLabel: 'Search the library'" app/lib/arrangement/strings.ts
echo "K20 browser probes (not re-run by this script): C re-runs, at HEAD on dev :5173 with the standard mock, 'cd ../tmp/studio-real-loop/b-round-288 && node probe/<name>.mjs' for baseline, sketch, sketch-wrap, journey-head, play-head and states-head (each writes JSON to stdout; redirect it to a C-owned file, never over probe/<name>.json). Expected = the stored probe/<name>.json values named in the task (layout +-1 px, texts exact; play-head t1 >= 00:01.000)"
