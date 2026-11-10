export interface FakeRenderedBuffer {
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  getChannelData(index: number): Float32Array;
  copyFromChannel(destination: Float32Array, channelNumber: number, bufferOffset: number): void;
}

export function fakeRenderedBuffer(
  channels: Float32Array[],
  sampleRate = 48000,
): FakeRenderedBuffer {
  return {
    sampleRate,
    length: channels[0]?.length ?? 0,
    numberOfChannels: channels.length,
    getChannelData: (index) => channels[index],
    copyFromChannel: (destination, channelNumber, bufferOffset) => {
      destination.set(
        channels[channelNumber].subarray(bufferOffset, bufferOffset + destination.length),
      );
    },
  };
}
