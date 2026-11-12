#!/usr/bin/env bash
# Usage: bash build-compare.sh <head-root> <sketch-root>  (each already built with npm run build). Prints per-file sha256 diff of build/ with Vite hashes normalised.
set -u
sums(){ (cd "$1/build" && find . -type f | sort | xargs sha256sum | sed -E 's/-[A-Za-z0-9_-]{8}\././'); }
d=$(diff <(sums "$1") <(sums "$2")); echo "build files $(cd "$1/build" && find . -type f | wc -l) vs $(cd "$2/build" && find . -type f | wc -l)"; echo "differing lines: $(printf '%s' "$d" | grep -c '^[<>]')"; printf '%s\n' "$d" | head -20
