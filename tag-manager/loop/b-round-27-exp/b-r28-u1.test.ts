import { expect, it, vi } from "vitest";
import { readMetadataChunked } from "~/lib/utils";
import { useFileStore } from "~/stores/file-store";
it("u1 probe", async () => {
  const paths = Array.from({ length: 101 }, (_, i) => `/m/${i}.wav`);
  let call = 0;
  vi.mocked(window.api.readMetadataBatch).mockImplementation(async (chunk) => {
    call++;
    if (call === 1) useFileStore.getState().markPathsWritten(["/x"]);
    if (call === 2) throw new Error("down");
    return Object.fromEntries(chunk.map((p) => [p, {}]));
  });
  const r = await readMetadataChunked(paths, []);
  expect(r.failures).toBe(50);
  expect(r.readGenerations["/m/0.wav"]).toBe(0);
  expect(r.readGenerations["/m/100.wav"]).toBe(1);
  expect(r.readGenerations["/m/60.wav"]).toBeUndefined();
});
