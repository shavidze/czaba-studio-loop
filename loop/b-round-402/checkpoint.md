# B round 402 -> 403 planning checkpoint
1. Archived tasks/round-402.md (= current-task.md, cmp equal); before-copies in b-round-402/.
2. Premise probe HEAD 7d7d7b2 prod build: b-round-402/probe/head-minzoom-{1,6}x-{1440x900,1280x720}.json (1x all <=24 ms; 6x default 64, near-min 88/80; near-min 159 cols/clip, 16-24 mounted alternating).
3. Sketch /tmp/b403-sketch: peaks.client.ts (rethrowLater, fallback-loop catch, dispose reset), peaks-worker.test.ts (PW14b, PW24-PW28, L4 afterEach, PW18 view afterEach), scale spec step i + 8 record rows.
4. Mutants b-round-402/mutants/summary.txt: 6 RED, MU-403-REPLIED-ON-GARBAGE equivalent (ruled).
5. Running: scale spec on sketch -> perf-sketch-scale.json. NEXT: full vitest on sketch, biome, tech-lead review of frozen patch, consults on 14c-ii design, docs (257 + 228 l.108), claims, task, backlog.
6. Final sketch sha 5cc6d634 (v1 ad417ff7 reviewed, 3 Medium fixed); tech-lead delta "no new Medium+"; 8/8 mutants red; full vitest 261/3870; tsc/lint/biome rc 0; scale v2 rc 0; fallback probes HEAD + sketch OK.
7. Claims: claims-403-planning-output.txt (HEAD), claims-403-sketch-output.txt (sketch). NEXT: current-task.md, backlog update script, feature-status, b-round-402.md, b-next.json.
8. DONE: current-task.md (round 403), backlog v371, feature-status, b-round-402.md, b-next.json CONTINUE; claims stable; store status 0.
9. Advisor hand-off fixes applied (doc228 fenced suffix + K25, doc257 stage note, row 4 scope, K26 L31). Claims re-run: 26, stderr empty.
