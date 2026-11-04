# Usage: python3 -I make-mutant.py <scratch-root-with-the-round-337-tree> <P|M>
# P = probe control: inject a throw inside the lane gesture (after the cross ghost read) and record, in the
#     pass catch path, whether an in-page pointerup follows the last pointerdown. Finally kept.
# M = MU-NO-RELEASE: the same probe and throw, and pressedGesture's catch no longer releases the button
#     (up only on success).
# D = MU-DENOM: no throw, no probe; measureDrag divides its per-move sum by moves.length - 1 (a value change
#     the EQUAL compare must catch; compare with rowcmp-1x.py).
# All cut the run to 1 pass at 1x. Never run against the real store.
import sys, pathlib
root = pathlib.Path(sys.argv[1]).resolve()
mode = sys.argv[2]
if str(root) == '/home/runner/czaba-project/store' or mode not in ('P', 'M', 'D'):
    sys.exit('refused')
spec = root / 'perf/studio-lab-interactions.perf.spec.ts'
s = spec.read_text()
def rep(old, new):
    global s
    if s.count(old) != 1:
        sys.exit(f'anchor count {s.count(old)}: {old[:70]!r}')
    s = s.replace(old, new)
rep("const passesPerRate = 3;", "const passesPerRate = 1;")
rep("const cpuRates = [1, 6];", "const cpuRates = [1];")
if mode == 'D':
    rep("const perMove = componentsPerMove(inWindow, moves.length);", "const perMove = componentsPerMove(inWindow, moves.length - 1);")
    spec.write_text(s)
    print('mutant D applied')
    sys.exit(0)
rep("    const cross = await readLaneGhosts(page, target.trackId);\n",
    "    const cross = await readLaneGhosts(page, target.trackId);\n    if (cross.document >= 0) throw new Error('MU-INJECT-THROW');\n")
rep("""    result.abortedAt = step;
""", """    result.abortedAt = step;
    const probe = await snapshot(page, 0, await nowIn(page));
    const lastDown = probe.downs.at(-1) ?? -1;
    result.problems.push(`MU-PROBE up-after-last-down ${probe.ups.some((t) => t > lastDown)}`);
""")
if mode == 'M':
    rep("""    await page.mouse.up().catch(() => undefined);
    throw error;""", """    throw error;""")
spec.write_text(s)
print('mutant', mode, 'applied')
