import { prepareSfxExport, type SfxExportRequest, type SfxExportResponse } from './sfx-export';

const send = (message: SfxExportResponse) => self.postMessage(message);
self.onmessage = (event: MessageEvent<SfxExportRequest>) => {
  try {
    let last = -1;
    const result = prepareSfxExport(event.data, (progress) => {
      const percent = Math.floor(progress.fraction * 100);
      if (percent !== last) {
        last = percent;
        send({ type: 'progress', progress });
      }
    });
    send({ type: 'complete', ...result });
  } catch (reason) {
    send({
      type: 'error',
      message:
        reason instanceof Error
          ? reason.message
          : 'Export failed. Your scene is preserved. Please retry.',
    });
  }
};
