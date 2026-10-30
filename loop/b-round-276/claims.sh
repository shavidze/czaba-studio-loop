#!/usr/bin/env bash
# Run from store/ on the round-277 start tree (a4c0e24 + A's round-276 working tree).
T=app/lib/arrangement/__tests__
echo "[K1]"; grep -n "expect(workspace.split().title).toBe('Split at the insert marker (Ctrl+E)');" $T/navigation-strings-ui.test.tsx
echo "[K2]"; grep -n "expect(button.hasAttribute('disabled')).toBe(disabled);" $T/navigation-strings-ui.test.tsx
echo "[K3]"; grep -n "expect(undo).toHaveProperty('disabled', true);" $T/transport-centre-ui.test.tsx
echo "[K4]"; grep -n "'aria-disabled': 'true', onMouseDown: preventSoftDisabledMouseFocus" app/components/arrangement/ArrangementTransport.tsx
echo "[K5]"; grep -n "studioEditStrings.splitNeedsTargetTitle\|'Split — select a clip or make a time selection first'" app/components/arrangement/ArrangementTransport.tsx app/lib/arrangement/strings.ts
echo "[K6]"; grep -cE "×" /home/runner/czaba-project/tmp/studio-real-loop/gates/round-276/verify.log; grep -E "Test Files|Tests " /home/runner/czaba-project/tmp/studio-real-loop/gates/round-276/verify.log | sed 's/\x1b\[[0-9;]*m//g'
echo "[SW-A]"; grep -rlE "hasAttribute\('disabled'\)|toHaveProperty\('disabled'|toBeDisabled|toBeEnabled|\.disabled\b|getAttribute\('disabled'\)" app perf --include=*.ts --include=*.tsx | grep -E "__tests__|perf/" | xargs grep -lE "/\^?(Undo|Redo|Split|Delete|Loop|Zoom to selection|Zoom back)|\.(undo|redo|split|remove|loop|zoomToSelection|zoomBack)\(\)|name: '(Undo|Redo|Split|Delete|Loop|Zoom to selection|Zoom back)" | sort | wc -l
echo "[SW-B]"; grep -rnE "'Split at the insert marker \(Ctrl\+E\)'|'Undo \(Ctrl\+Z\)'|'Redo \(Ctrl\+Shift\+Z\)'|'Delete clip — leaves a gap \(Delete\)'" app perf --include=*.ts --include=*.tsx | grep -E "__tests__|perf/" | cut -d: -f1,2
