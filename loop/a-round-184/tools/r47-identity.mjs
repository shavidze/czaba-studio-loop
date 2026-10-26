const { createWorkspaceTestEnvironment } = await import(process.argv[2]);
const a = createWorkspaceTestEnvironment();
const b = createWorkspaceTestEnvironment();
a.fakeClock.base = 123;
const out = {
  keys: Object.keys(a),
  clockDistinct: a.fakeClock !== b.fakeClock,
  bClockUntouched: b.fakeClock.base === 0,
  classesDistinct: ['FakeAudioContext','FakeOfflineAudioContext','FakeAudioBuffer','FakeResizeObserver'].every((k) => a[k] !== b[k]),
  aClockWired: Math.abs(new a.FakeAudioContext().currentTime - (Date.now() / 1000 - 123)) < 1,
  bClockWired: Math.abs(new b.FakeAudioContext().currentTime - Date.now() / 1000) < 1,
};
console.log(JSON.stringify(out));
