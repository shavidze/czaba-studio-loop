import {
  handlePeaksWorkerRequest,
  type PeaksWorkerRequest,
  type PeaksWorkerState,
} from './peaks.worker-protocol';

const state: PeaksWorkerState = { job: null };

self.onmessage = (event: MessageEvent<PeaksWorkerRequest>) => {
  handlePeaksWorkerRequest(state, event.data, (response, transfer) => {
    self.postMessage(response, { transfer });
  });
};
