#!/usr/bin/env bash
# Round 276 claims (current-task.md section 9). Run from store/ at HEAD a4c0e24 (or on a checkout of it).
# Each block prints its tag first; compare with the Expected column of section 9.
set -u
T=app/components/arrangement/ArrangementTransport.tsx
W=app/components/arrangement/StudioWorkspace.tsx
echo K1; grep -nE "disabled=\{" $T
echo K2; grep -n "\.disabled" $T
echo K3; grep -n "preventRepeatedEnterKeyDown" $T
echo K4; sed -n 53p $T | grep -oE "enabled:[a-z:/0-9-]+|disabled:[a-z-]+[0-9]*"
echo K5; grep -nE "enabled:hover" $T | cut -d: -f1
echo K6; grep -nE ":not\(:disabled\)" app/styles/app.css app/styles/base/utilities.css
echo K7; grep -nE "splitAtInsertMarkerTitle:|deleteClipTitle:|undoTitle:|redoTitle:" app/lib/arrangement/strings.ts | cut -c1-60; sed -n 619,621p app/lib/arrangement/__tests__/strings.test.ts
echo K8; grep -nE "ZOOM_RANGE_MISSING_MESSAGE|ZOOM_HISTORY_EMPTY_MESSAGE" $W
echo K9; sed -n 461,470p $W; sed -n 55,62p app/components/arrangement/ArrangementExportDialog.tsx; sed -n 12,16p app/components/arrangement/ArrangementShortcutSheet.tsx
echo K11; node -e "console.log(require('./node_modules/tailwindcss/package.json').version)"
echo K12; grep -n 'truncate">Undo' perf/lib/app-labels.ts $T | cut -c1-70
echo K13; sed -n 2272,2290p $W | grep -c preventDefault; sed -n 2573,2577p $W
echo K14; grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' $T
echo SW1; grep -rlE "toBeDisabled|toBeEnabled|\.disabled\b|:disabled|\[disabled\]|disabled=\{|enabled:(hover|active)|disabled:(opacity|cursor)" app perf | grep -E "__tests__|perf/" | wc -l
grep -rlE "toBeDisabled|toBeEnabled|\.disabled\b|:disabled|\[disabled\]|disabled=\{|enabled:(hover|active)|disabled:(opacity|cursor)" app perf | grep -E "__tests__|perf/" | xargs grep -lE "ArrangementTransport|arrangement-transport|TRANSPORT_PATH|mountTransport|transportButton|undoButton|zoomBackButton" | while read f; do echo "$f $(grep -cE "toBeDisabled|toBeEnabled|\.disabled\b|:disabled|\[disabled\]|disabled=\{|enabled:(hover|active)|disabled:(opacity|cursor)" "$f")"; done
echo "K10: browser, run b-round-275/probe/baseline.cjs (copy it first; it writes next to itself)"
