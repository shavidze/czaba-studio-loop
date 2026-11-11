import { Transform, type TransformCallback } from 'node:stream';

export function stripNulBytes(chunk: Buffer): Buffer {
  const firstNul = chunk.indexOf(0);
  if (firstNul === -1) {
    return chunk;
  }

  let nulCount = 0;
  for (let index = firstNul; index < chunk.length; index++) {
    if (chunk[index] === 0) {
      nulCount++;
    }
  }

  const stripped = Buffer.alloc(chunk.length - nulCount);
  let written = 0;
  let spanStart = 0;
  let nulIndex = firstNul;
  while (nulIndex !== -1) {
    written += chunk.copy(stripped, written, spanStart, nulIndex);
    spanStart = nulIndex + 1;
    nulIndex = chunk.indexOf(0, spanStart);
  }
  chunk.copy(stripped, written, spanStart);
  return stripped;
}

export function createNulByteStripStream(): Transform {
  return new Transform({
    transform(chunk: unknown, _encoding: BufferEncoding, callback: TransformCallback) {
      if (!Buffer.isBuffer(chunk)) {
        callback(new TypeError('createNulByteStripStream expects byte chunks'));
        return;
      }
      const stripped = stripNulBytes(chunk);
      if (stripped.length === 0) {
        callback();
        return;
      }
      callback(null, stripped);
    },
  });
}
