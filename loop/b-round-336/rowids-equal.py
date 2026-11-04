# Usage: python3 -I rowids-equal.py <a latest-interactions.json> <b latest-interactions.json>  -> ids-equal N | ids-differ +x -y
import json, sys
a = {r['id'] for r in json.load(open(sys.argv[1]))['rows']}
b = {r['id'] for r in json.load(open(sys.argv[2]))['rows']}
print(f'ids-equal {len(a)}' if a == b else f'ids-differ +{sorted(b - a)} -{sorted(a - b)}')
