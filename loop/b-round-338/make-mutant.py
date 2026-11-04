# B338 perf mutant MU-GROUP-SINGLE: the Ctrl+click that adds the first clip to the selection is skipped,
# so the press on its name bar drags it alone (the Ctrl+D copy stays selected and still). Usage: python3 -I make-mutant.py <tree>
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'perf/studio-lab-interactions.perf.spec.ts'
s = p.read_text()
old = """  await page.keyboard.down('Control');
  try {
    await page.mouse.click(again.x, again.y);
  } finally {
    await page.keyboard.up('Control');
  }
"""
assert s.count(old) == 1
s = s.replace(old, "  void again;\n")
p.write_text(s)
print('MU-GROUP-SINGLE applied')
