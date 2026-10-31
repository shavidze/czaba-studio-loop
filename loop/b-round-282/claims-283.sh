#!/usr/bin/env bash
# Round 283 claims block (L29). Run from store/ on the round-282 working tree (HEAD 000da42 + A's round-282 files), BEFORE A edits.
# Expected output: b-round-282/claims-283-output.txt
L=/home/runner/czaba-project/tmp/studio-real-loop
D=docs/implementation/2026/quarter-IV
T=app/lib/arrangement/__tests__/demo-synth-worker.test.ts
echo "== K1 HEAD"; git rev-parse --short HEAD 2>/dev/null || echo "(archive)"
echo "== K2 the six code files equal the round-282 sketch bytes"; sha256sum -c $L/b-round-282/code-six-sha256.txt
echo "== K3 the test file is A's round-282 version"; sha256sum -c $L/b-round-282/test-at-a282-sha256.txt
echo "== K4 readDemoComposition builds a new wrapper (client l.35)"; grep -n "return { mix, stems: { pulse, bass, pad, lead } };" app/lib/arrangement/demo-synth.client.ts
echo "== K5 a postMessage throw falls back (client l.72-76)"; sed -n '72,76p' app/lib/arrangement/demo-synth.client.ts
echo "== K6 the worker builds the composition and posts it with a transfer list"; grep -n "getDemoStemComposition()\|postMessage(message, { transfer" app/lib/arrangement/demo-synth.worker.ts
echo "== K7 test rows at round 282 (DW ids)"; grep -oE "it(\.each\(\[)?.*'DW[0-9]+" $T | grep -oE "DW[0-9]+" ; grep -c "DW11" $T
echo "== K8 DW3/DW9 use toBe on the wrapper"; grep -n "expect(result).toBe(composition);\|resolves.toBe(composition);" $T
echo "== K9 DW10 imports the synth in the same module graph as the worker"; grep -n "vi.resetModules()\|const { client, synth } = await loadClient();\|await import('../demo-synth.worker');" $T
echo "== K10 implementation docs after 209"; ls $D | sort | tail -2
echo "== K11 doc 163 granted headings and TODO"; grep -n '^### Pass-ის თანმიმდევრობა (ინტერპრეტაცია)$\|^## მეტრიკების განმარტება და ზღვრები$\|^## TODO / შემდეგი ნაბიჯები$' $D/163-studio-perf-harness.md
echo "== K12 doc 169 l.37 duration-only sentence; B-R281 TODO bullet"; grep -n 'მხოლოდ `duration`-ს ინახავს' $D/169-perf-resources-baseline.md | cut -c1-40; grep -n 'B-R281-RESOURCES-READY-FAILED' $D/169-perf-resources-baseline.md | cut -c1-40
echo "== K13 In Progress (stage lines"; grep -rn 'In Progress (stage' docs/implementation | wc -l
echo "== K14 vitest has no testTimeout override (default 5000 ms)"; grep -c "testTimeout" vitest.config.ts
echo "== K15 git status"; git status --short 2>/dev/null || echo "(archive)"
