import sys, json
# usage: lineedit.py file spec.json ; spec = [[line, old_substring, new_substring, formula], ...]
path, spec = sys.argv[1], json.load(open(sys.argv[2]))
lines = open(path).read().split('\n')
log = open('/home/runner/czaba-project/tmp/studio-real-loop/a-round-116/granted-edits.log', 'a')
for ln, old, new, why in spec:
    cur = lines[ln - 1]
    if cur.count(old) != 1:
        sys.exit(f'{path}:{ln} expected exactly one "{old}" in: {cur!r}')
    lines[ln - 1] = cur.replace(old, new)
    log.write(f'{path.split("/")[-1]}:{ln} | {old.strip()} → {new.strip()} | {why}\n')
open(path, 'w').write('\n'.join(lines))
print('ok', len(spec))
