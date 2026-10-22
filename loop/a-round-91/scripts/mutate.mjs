import { readFileSync, writeFileSync } from 'node:fs';
const [, , root, id] = process.argv;
const ctx = `${root}/app/contexts/ArrangementContext.tsx`;
const dialog = `${root}/app/components/arrangement/ArrangementExportDialog.tsx`;
const wav = `${root}/app/lib/arrangement/export-wav.ts`;
const worker = `${root}/app/lib/arrangement/export-wav.worker.ts`;
const swap = (file, from, to) => {
  const text = readFileSync(file, 'utf8');
  if (text.split(from).length !== 2) throw new Error(`pattern not unique for ${id}: ${from}`);
  writeFileSync(file, text.replace(from, to));
};
const inPlaceLoop = '  for (const channel of channels) {\n    for (let i = 0; i < channel.length; i++) {\n      channel[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, channel[i]));\n    }\n  }\n  const bytes = encodeSfxWav({ sampleRate, channels }, onProgress);';
const muts = {
  a: () => swap(wav, inPlaceLoop, '  const copies = channels.map((data) => {\n    const clamped = new Float32Array(data.length);\n    for (let i = 0; i < data.length; i++) {\n      clamped[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, data[i]));\n    }\n    return clamped;\n  });\n  const bytes = encodeSfxWav({ sampleRate, channels: copies }, onProgress);'),
  b: () => {
    swap(wav, '): ArrangementWavEncoding {\n  const report = measureExportOverload(channels);\n  for (const channel', '): ArrangementWavEncoding {\n  for (const channel');
    swap(wav, '  const bytes = encodeSfxWav({ sampleRate, channels }, onProgress);', '  const report = measureExportOverload(channels);\n  const bytes = encodeSfxWav({ sampleRate, channels }, onProgress);');
  },
  c: () => {
    swap(worker, '  encodeArrangementWavInPlace,\n', '  encodeArrangementWav,\n');
    swap(worker, 'const result = encodeArrangementWavInPlace(', 'const result = encodeArrangementWav(');
  },
  d: () => swap(wav, '  const report = measureExportOverload(channels);\n  const clampedChannels = channels.map((data) => {\n    const clamped = new Float32Array(data.length);\n    for (let i = 0; i < data.length; i++) {\n      clamped[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, data[i]));\n    }\n    return clamped;\n  });\n  const bytes = encodeSfxWav({ sampleRate, channels: clampedChannels }, onProgress);\n  return { bytes, ...report };', '  return encodeArrangementWavInPlace([...channels], sampleRate, onProgress);'),
  e: () => swap(dialog, ' ან არცერთი. ბრაუზერმა მეორე ფაილის ჩამოტვირთვაზე შეიძლება ნებართვა მოითხოვოს.', ' ან არცერთი'),
  f: () => swap(ctx, '120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი', '120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. გადატვირთე გვერდი'),
};
if (id !== 'orig') muts[id]();
console.log(`applied ${id}`);
