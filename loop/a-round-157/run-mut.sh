#!/usr/bin/env bash
# usage: run-mut.sh <id> <file> <test files...>
cd /home/runner/czaba-project/store
D=../tmp/studio-real-loop/a-round-157
id=$1; f=$2; shift 2
npx vitest run "$@" --reporter=json --outputFile=$D/mutations/$id-vitest.json > $D/mutations/$id.log 2>&1
python3 - "$D/mutations/$id-vitest.json" "$id" "$f" "$(sha256sum $f | cut -d' ' -f1)" > $D/mutations/$id.json <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
failed=[t['fullName'] for r in d['testResults'] for t in r['assertionResults'] if t['status']=='failed']
print(json.dumps({"id":sys.argv[2],"file":sys.argv[3],"mutatedSha256":sys.argv[4],"total":d['numTotalTests'],"failed":d['numFailedTests'],"failedTests":failed},indent=1,ensure_ascii=False))
PY
cat $D/mutations/$id.json
