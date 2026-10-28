| file | before r1/r2 ms | after r1/r2 ms | speedup (mean) | slowest test after r1/r2 ms |
|---|---|---|---|---|
| components/file-list.test.ts | 886 / 807 | 496 / 528 | 1.7x | 71 / 85 |
| components/folder-read-during-save.test.ts | 2330 / 2170 | 656 / 585 | 3.6x | 187 / 152 |
| components/folder-read-overlap.test.ts | 3076 / 3361 | 1424 / 1310 | 2.4x | 274 / 300 |
| components/folder-read-rejected-chunk.test.ts | 1474 / 1480 | 379 / 329 | 4.2x | 73 / 66 |
| components/metadata-panel-batch-save.test.ts | 6337 / 5954 | 1348 / 1285 | 4.7x | 108 / 105 |
| components/metadata-panel-schema-change.test.ts | 18385 / 18647 | 1307 / 1297 | 14.2x | 193 / 220 |
| components/reread-after-folder-switch.test.ts | 7374 / 7148 | 958 / 974 | 7.5x | 223 / 210 |
| components/schema-change-during-folder-load.test.ts | 15526 / 15743 | 1564 / 1381 | 10.6x | 382 / 315 |
| components/schema-editor-done-busy.test.ts | 1044 / 1104 | 1441 / 1391 | 0.8x | 339 / 297 |
| components/schema-editor-stale-close.test.ts | 9122 / 8859 | 988 / 942 | 9.3x | 402 / 360 |
| components/schema-editor.test.ts | 2880 / 2887 | 330 / 338 | 8.6x | 100 / 131 |
after-run1 max overall (402.177189, 'components/schema-editor-stale-close.test.ts', '(e1) C-R33-02: Done during a pending Open Folder, Back, reop')
after-run1 tests>=1500ms []
after-run1 files 18 passed 289 failed 0
after-run1 done-busy [('(b1)', 305, 'passed'), ('(b2)', 175, 'passed'), ('(b3)', 186, 'passed'), ('(b4)', 48, 'passed'), ('(b5)', 149, 'passed'), ('(b6)', 171, 'passed'), ('(b7)', 339, 'passed'), ('(b8)', 66, 'passed')]
after-run2 max overall (360.07013300000017, 'components/schema-editor-stale-close.test.ts', '(e1) C-R33-02: Done during a pending Open Folder, Back, reop')
after-run2 tests>=1500ms []
after-run2 files 18 passed 289 failed 0
after-run2 done-busy [('(b1)', 297, 'passed'), ('(b2)', 186, 'passed'), ('(b3)', 154, 'passed'), ('(b4)', 53, 'passed'), ('(b5)', 163, 'passed'), ('(b6)', 165, 'passed'), ('(b7)', 293, 'passed'), ('(b8)', 79, 'passed')]
