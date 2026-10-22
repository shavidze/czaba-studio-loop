import {
  type ArrangementWavEncodeRequest,
  type ArrangementWavEncodeResponse,
  encodeArrangementWav,
} from './export-wav';

const sendWavEncodeMessage = (
  message: ArrangementWavEncodeResponse,
  transfer: Transferable[] = [],
) => self.postMessage(message, { transfer });

self.onmessage = (event: MessageEvent<ArrangementWavEncodeRequest>) => {
  try {
    let lastPercent = -1;
    const result = encodeArrangementWav(event.data.channels, event.data.sampleRate, (fraction) => {
      const percent = Math.floor(fraction * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        sendWavEncodeMessage({ type: 'progress', fraction });
      }
    });
    sendWavEncodeMessage({ type: 'complete', ...result }, [result.bytes]);
  } catch (reason) {
    sendWavEncodeMessage({
      type: 'error',
      message: reason instanceof Error ? reason.message : 'WAV encoding failed',
    });
  }
};
