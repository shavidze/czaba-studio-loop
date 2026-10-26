#!/usr/bin/env bash
set -u
STORE=/home/runner/czaba-project/store
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-188
START=/home/runner/czaba-project/tmp/studio-real-loop/b-round-187/r188-granted-start
FILES=(app/components/layout/Header.tsx app/components/layout/Footer.tsx)
cd "$STORE" || exit 2
mkdir -p "$L/end-copies/app/components/layout"
for f in "${FILES[@]}"; do cp "$f" "$L/end-copies/$f"; done
(cd "$L/end-copies" && sha256sum "${FILES[@]}") > "$L/end-copies.sha256"
for f in "${FILES[@]}"; do cp "$START/$f" "$f"; done
npx vitest run app/lib/__tests__/store-header-footer.test.tsx 2>&1 | grep -E "✓|×|Test Files|Tests " > "$L/t1-final-red-on-start.txt"
for f in "${FILES[@]}"; do cp "$L/end-copies/$f" "$f"; done
sha256sum -c "$L/end-copies.sha256" --quiet 2>&1 | sed 's#^#restore-check: #' || true
(cd "$STORE" && sha256sum -c <(cd "$L/end-copies" && sha256sum "${FILES[@]}") --quiet) && echo "RESTORED_OK"
cat "$L/t1-final-red-on-start.txt"
