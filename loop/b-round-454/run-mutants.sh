#!/usr/bin/env bash
# usage: run-mutants.sh <scratch-root> <out-file>; scratch must hold the sketch applied
set -u
R="$1"; OUT="$(realpath -m "$2")"; : > "$OUT"
F=app/components/audio/AudioPlayer.tsx; C=app/styles/app.css; T=app/lib/__tests__/audio-preview-player.test.tsx
cd "$R"; cp $F /tmp/m455-f.bak; cp $C /tmp/m455-c.bak
run() { local id="$1"; local file="$2"; local py="$3"
  python3 -c "import sys;p='$file';s=open(p).read();o,n=sys.argv[1],sys.argv[2];assert o in s,('MISSING',o);open(p,'w').write(s.replace(o,n,1))" "${@:4}" || { echo "$id APPLY-FAIL" >> "$OUT"; cp /tmp/m455-f.bak $F; cp /tmp/m455-c.bak $C; return; }
  local log; log="$(dirname "$OUT")/mutant-$id.log"; npx vitest run $T > "$log" 2>&1
  local res; res=$(cat "$log" | grep -E "^\s+(×|✗)|FAIL .*>" | sed -E 's/.*> //; s/\x1b\[[0-9;]*m//g' | grep -oE "^(ST[0-9]|draws the played)[^ ]*" | sort -u | tr '\n' ' ')
  [ -z "$res" ] && echo "$id GREEN(survived)" >> "$OUT" || echo "$id RED $res" >> "$OUT"
  cp /tmp/m455-f.bak $F; cp /tmp/m455-c.bak $C; }
run BASE $F x 'const AUDIO_PLAYER_THUMB_PX = 12;' 'const AUDIO_PLAYER_THUMB_PX = 12;'
run M1-no-step-any $F x '                step="any"
' ''
run M2-percent-edge $F x 'const edge = `calc(${AUDIO_PLAYER_THUMB_PX / 2}px + ${safeFraction.toFixed(5)} * (100% - ${AUDIO_PLAYER_THUMB_PX}px))`;' 'const edge = `${safeFraction * 100}%`;'
run M3-no-keydown $F x '                onKeyDown={handleProgressKeyDown}
' ''
run M4-rounded-time $F x 'seek(Math.min(Math.max(currentTime + step, 0), duration));' 'seek(Math.min(Math.max(Math.round(currentTime) + step, 0), duration));'
run M5-no-clamp $F x 'seek(Math.min(Math.max(currentTime + step, 0), duration));' 'seek(currentTime + step);'
run M6-modifiers-native $F x 'if (step === undefined) return;' 'if (step === undefined || event.altKey || event.ctrlKey || event.metaKey) return;'
run M7-no-valuetext $F x '                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
' ''
run M8-volume-old-fill $F x 'style={{ background: audioPlayerRangeFill(volume) }}' 'style={{ background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%, rgba(255, 255, 255, 0.1) 100%)` }}'
run M9-no-nan-guard $F x 'Number.isFinite(fraction) ? Math.min(Math.max(fraction, 0), 1) : 0' 'Math.min(Math.max(fraction, 0), 1)'
run M10-css-thumb-14 $C x '.audio-player-progress::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 12px;' '.audio-player-progress::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;'
run M11-thumb-px-10 $F x 'const AUDIO_PLAYER_THUMB_PX = 12;' 'const AUDIO_PLAYER_THUMB_PX = 10;'
run M12-drag-rounded $F x 'onChange={(e) => seek(Number(e.target.value))}
                onKeyDown' 'onChange={(e) => seek(Math.round(Number(e.target.value)))}
                onKeyDown'
run M13-shift-native $F x 'if (step === undefined) return;' 'if (step === undefined || event.shiftKey) return;'
