import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetadataPanel } from "~/components/metadata-editor/MetadataPanel";
import { FolderBrowser } from "~/components/sidebar/FolderBrowser";
import { useFileStore } from "~/stores/file-store";
import type { BatchWriteResult, WavFileEntry, WavMetadata } from "~/types";
import { resetAllStores } from "../helpers/reset-stores";
import { resetWindowApiMocks } from "../helpers/window-api-mocks";

vi.hoisted(() => {
  const g = globalThis as unknown as { window: { api: unknown }; api: unknown };
  const mockApi = g.window.api;
  g.window = globalThis as unknown as { api: unknown };
  g.api = mockApi;
});

const PATH_A = "/music/a.wav";
const PATH_B = "/music/b.wav";
const FILE_A: WavFileEntry = { name: "a.wav", path: PATH_A, size: 100, modifiedAt: "2026-10-27T00:00:00.000Z" };
const FILE_B: WavFileEntry = { name: "b.wav", path: PATH_B, size: 100, modifiedAt: "2026-10-27T00:00:00.000Z" };
const OLD_A: WavMetadata = { title: "A-title", category: "ACat", comment: "" };
const OLD_B: WavMetadata = { title: "B-title", category: "BCat", comment: "" };
const NEW_A: WavMetadata = { ...OLD_A, category: "R28Cat" };
const NEW_B: WavMetadata = { ...OLD_B, category: "R28Cat" };

function seed(selected: string[]): void {
  useFileStore.setState({ folderPath: "/music", files: [FILE_A, FILE_B], metadata: { [PATH_A]: { ...OLD_A }, [PATH_B]: { ...OLD_B } }, selectedPaths: selected });
  vi.mocked(window.api.scanFolder).mockResolvedValue([FILE_A, FILE_B]);
}
function input(label: string): HTMLInputElement {
  const el = screen.getByText(label).parentElement?.querySelector("input");
  if (!el) throw new Error(label);
  return el;
}
function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void } {
  let resolve: (v: T) => void = () => {};
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

beforeEach(() => { resetAllStores(); resetWindowApiMocks(); });
afterEach(() => { cleanup(); resetAllStores(); });

describe("B-R25-01 experiment", () => {
  it("(x1) single save pending + Rescan whose read was issued before the write resolved: store keeps the save", async () => {
    seed([PATH_A]);
    const write = deferred<void>();
    vi.mocked(window.api.writeMetadata).mockReturnValueOnce(write.promise);
    vi.mocked(window.api.readMetadata).mockResolvedValue({ ...NEW_A });
    const rescanRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(rescanRead.promise);
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));

    fireEvent.change(input("Category (UCS)"), { target: { value: "R28Cat" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Save Tags/ })); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Rescan/ })); });
    await act(async () => { write.resolve(); });
    expect(useFileStore.getState().metadata[PATH_A]).toEqual(NEW_A);
    await act(async () => { rescanRead.resolve({ [PATH_A]: { ...OLD_A }, [PATH_B]: { ...OLD_B } }); });

    expect(useFileStore.getState().metadata[PATH_A]?.category).toBe("R28Cat");
    await act(async () => { fireEvent.click(screen.getByText("a.wav")); });
  });

  it("(x2) batch save pending + Rescan: store keeps both saved entries", async () => {
    seed([PATH_A, PATH_B]);
    const write = deferred<BatchWriteResult>();
    vi.mocked(window.api.writeMetadataBatch).mockReturnValueOnce(write.promise);
    const rescanRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch)
      .mockReturnValueOnce(rescanRead.promise)
      .mockResolvedValueOnce({ [PATH_A]: { ...NEW_A }, [PATH_B]: { ...NEW_B } });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));

    fireEvent.change(input("Category (UCS)"), { target: { value: "R28Cat" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Save to 2 files/ })); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Rescan/ })); });
    await act(async () => { write.resolve({ succeeded: 2, failed: [] }); });
    expect(useFileStore.getState().metadata[PATH_A]).toEqual(NEW_A);
    await act(async () => { rescanRead.resolve({ [PATH_A]: { ...OLD_A }, [PATH_B]: { ...OLD_B } }); });

    expect(useFileStore.getState().metadata[PATH_A]?.category).toBe("R28Cat");
    expect(useFileStore.getState().metadata[PATH_B]?.category).toBe("R28Cat");
  });

  it("(x3) pin: Rescan with no pending save applies the read", async () => {
    seed([PATH_A]);
    vi.mocked(window.api.readMetadataBatch).mockResolvedValueOnce({ [PATH_A]: { ...NEW_A }, [PATH_B]: { ...OLD_B } });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Rescan/ })); });
    expect(useFileStore.getState().metadata[PATH_A]).toEqual(NEW_A);
    expect(useFileStore.getState().selectedPaths).toEqual([]);
  });
});
