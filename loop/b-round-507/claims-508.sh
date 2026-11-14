#!/usr/bin/env bash
# B round 507 -> 508 claims. usage: bash claims-508.sh [store-tree]   (default: the store repo)
# K1-K18 are the round-507 claims (b-round-506/claims-507.sh), re-run unchanged; K19-K25 are new.
T=${1:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-507
bash $L/b-round-506/claims-507.sh "$T"
cd "$T" || exit 2
c(){ echo "[$1] $2"; }
F=app/lib/__tests__/store-button-cleanup-n1.test.tsx
c K19 "n1 test: its=$(grep -c "^  it('N1-" $F) clearAllMocks=$(grep -c 'vi.clearAllMocks()' $F) perClickLoop=$(grep -c 'action === step.action ? 1 : 0' $F) togglePlayPauseInList=$(grep -c '      audioMock.togglePlayPause,' $F) N1-6=$(grep -c "it('N1-6" $F) N1-7=$(grep -c "it('N1-7" $F) ghostRef=$(grep -c 'ghostReferenceTokens(control.iconButtonSize)' $F)"
c K20 "gate 507: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-507.json'));print(g['status'],g.get('reason'))")"
c K21 "c-round-507: $(python3 -I -c "import json;c=json.load(open('$L/c-round-507.json'));print(c['taskStatus'],c['browserVerified'],c['realVerified'],[b['id']+'/'+b['severity'] for b in c['bugs']])")"
c K22 "AudioPlayer.tsx sha vs v2 post-sketch pin: $(sha256sum app/components/audio/AudioPlayer.tsx | cut -c1-12) (pin $(grep AudioPlayer $L/b-round-506/r507-post-sketch-sha.txt | cut -c1-12))"
c K23 "doc 328 l.4: $(sed -n 4p docs/implementation/2026/quarter-IV/328-dpg-nonbrand-stage-n1-audio-player.md 2>/dev/null)"
c K24 "mutants-508: $(grep -c ' OK$' $B/mutants-508.txt) OK, $(grep -c MISMATCH $B/mutants-508.txt) MISMATCH, $(tail -1 $B/mutants-508.txt)"
c K25 "A swap proof on v2: $(grep -c 'onClick={skipNext}' $L/a-round-507/mutant-swap.log) swapped lines, $(grep -o 'Tests  [0-9]* passed ([0-9]*)' $L/a-round-507/mutant-swap.log | head -1)"
c K26 "artifacts-508: $(for f in sketch-508-delta.patch.txt sketch-sha.txt r508-pre-sha.txt r508-post-sketch-sha.txt r508-tree-sha256.txt mutants-508.py mutants-508.txt covering-files.txt precheck-tsc.log precheck-lint.log precheck-biome.log precheck-covering.log precheck-full.log precheck-build-sketch.log sketch-review.md sketch-sha-history.txt; do test -s $B/$f && echo -n "ok " || echo -n "MISSING:$f "; done)"
