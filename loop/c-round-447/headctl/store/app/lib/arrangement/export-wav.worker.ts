import {
  type ArrangementWavStreamRequest,
  type ArrangementWavStreamResponse,
  type ArrangementWavStreamWriter,
  createArrangementWavStreamWriter,
} from './export-wav';

const sendWavStreamMessage = (message: ArrangementWavStreamResponse) => self.postMessage(message);

let writer: ArrangementWavStreamWriter | null = null;

self.onmessage = (event: MessageEvent<ArrangementWavStreamRequest>) => {
  const message = event.data;
  try {
    if (message.type === 'begin') {
      writer = createArrangementWavStreamWriter(
        message.length,
        message.channelCount,
        message.sampleRate,
      );
      return;
    }
    if (!writer) {
      throw new Error('WAV stream: no begin message');
    }
    if (message.type === 'chunk') {
      sendWavStreamMessage({ type: 'ack', written: writer.write(message.channels) });
      return;
    }
    const { bytes, peak, clippedSamples } = writer.finish();
    writer = null;
    sendWavStreamMessage({
      type: 'complete',
      blob: new Blob([bytes], { type: 'audio/wav' }),
      peak,
      clippedSamples,
    });
  } catch (reason) {
    writer = null;
    sendWavStreamMessage({
      type: 'error',
      message: reason instanceof Error ? reason.message : 'WAV encoding failed',
    });
  }
};
