import { getDemoStemComposition } from './demo-synth';
import { type DemoSynthWorkerResponse, demoCompositionTransfer } from './demo-synth.client';

self.onmessage = () => {
  const composition = getDemoStemComposition();
  const message: DemoSynthWorkerResponse = { type: 'complete', composition };
  self.postMessage(message, { transfer: demoCompositionTransfer(composition) });
};
