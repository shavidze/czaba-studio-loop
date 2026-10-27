import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "~/App";
import { useFileStore } from "~/stores/file-store";
import { STANDARD_FIELDS } from "~/types";
import type { WavFileEntry, WavMetadata } from "~/types";
import { resetAllStores } from "../helpers/reset-stores";
import { resetWindowApiMocks } from "../helpers/window-api-mocks";

vi.hoisted(() => {
  const g = globalThis as unknown as { window: { api: unknown }; api: unknown };
  const mockApi = g.window.api;
  g.window = globalThis as unknown as { api: unknown };
  g.api = mockApi;
});
const PATH_A = "/music/a.wav";
const FILE_A: WavFileEntry = { name: "a.wav", path: PATH_A, size: 100, modifiedAt: "2026-10-27T00:00:00.000Z" };
const OLD_A: WavMetadata = { title: "A-title", category: "ACat", comment: "" };
const NEW_A: WavMetadata = { ...OLD_A, category: "R28Cat" };
beforeEach(() => { resetAllStores(); resetWindowApiMocks(); });
afterEach(() => { cleanup(); resetAllStores(); });
describe("app", () => {
  it("(x4) drop during pending save", async () => {
    vi.mocked(window.api.loadSchema).mockResolvedValue(STANDARD_FIELDS);
    vi.mocked(window.api.scanFolder).mockResolvedValue([FILE_A]);
    vi.mocked(window.api.resolveDroppedPaths).mockResolvedValue({ folders: ["/music"], wavFiles: [] });
    let releaseWrite: () => void = () => {};
    vi.mocked(window.api.writeMetadata).mockReturnValueOnce(new Promise<void>((r) => { releaseWrite = () => r(); }));
    vi.mocked(window.api.readMetadata).mockResolvedValue({ ...NEW_A });
    let releaseRead: (v: Record<string, WavMetadata>) => void = () => {};
    vi.mocked(window.api.readMetadataBatch).mockResolvedValueOnce({ [PATH_A]: { ...OLD_A } }).mockReturnValueOnce(new Promise((r) => { releaseRead = r; }));
    const { container } = render(createElement(App));
    await act(async () => { fireEvent.drop(container.firstChild as Element, { dataTransfer: { files: [{ path: "/music" }] } }); });
    await act(async () => { fireEvent.click(screen.getByText("a.wav")); });
    const cat = screen.getByText("Category (UCS)").parentElement?.querySelector("input") as HTMLInputElement;
    fireEvent.change(cat, { target: { value: "R28Cat" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Save Tags/ })); });
    await act(async () => { fireEvent.drop(container.firstChild as Element, { dataTransfer: { files: [{ path: "/music" }] } }); });
    await act(async () => { releaseWrite(); });
    await act(async () => { releaseRead({ [PATH_A]: { ...OLD_A } }); });
    expect(useFileStore.getState().metadata[PATH_A]?.category).toBe("R28Cat");
  });
});
