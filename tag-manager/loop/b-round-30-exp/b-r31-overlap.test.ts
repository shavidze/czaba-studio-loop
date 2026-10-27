import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "~/App";
import { MetadataPanel } from "~/components/metadata-editor/MetadataPanel";
import { FolderBrowser } from "~/components/sidebar/FolderBrowser";
import { isFolderLoadCurrent, useFileStore } from "~/stores/file-store";
import { useMetadataStore } from "~/stores/metadata-store";
import type { WavFileEntry, WavMetadata } from "~/types";
import { STANDARD_FIELDS } from "~/types";
import { resetAllStores } from "../helpers/reset-stores";
import { resetWindowApiMocks } from "../helpers/window-api-mocks";

vi.hoisted(() => {
  const globalScope = globalThis as unknown as { window: { api: unknown }; api: unknown };
  const mockApi = globalScope.window.api;
  globalScope.window = globalThis as unknown as { api: unknown };
  globalScope.api = mockApi;
});

const M = "2026-10-27T00:00:00.000Z";
const A_FILES: WavFileEntry[] = [{ name: "a.wav", path: "/fa/a.wav", size: 1, modifiedAt: M }];
const B_FILES: WavFileEntry[] = [{ name: "b.wav", path: "/fb/b.wav", size: 1, modifiedAt: M }];
const A_META: WavMetadata = { title: "A", category: "ACat", comment: "" };
const B_META: WavMetadata = { title: "B", category: "BCat", comment: "" };

function deferred<T>() {
  let resolve: (v: T) => void = () => {};
  let reject: (e: Error) => void = () => {};
  const promise = new Promise<T>((r, j) => {
    resolve = r;
    reject = j;
  });
  return { promise, resolve, reject };
}

async function click(name: RegExp) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}
async function settle(fn: () => void) {
  await act(async () => {
    fn();
  });
}

beforeEach(() => {
  resetAllStores();
  resetWindowApiMocks();
  vi.mocked(window.api.openFolderDialog).mockReset();
  vi.mocked(window.api.loadSchema).mockReset().mockResolvedValue([]);
  vi.mocked(window.api.resolveDroppedPaths).mockReset().mockResolvedValue({ folders: [], wavFiles: [] });
});
afterEach(() => {
  cleanup();
  resetAllStores();
});

describe("B R31 overlapping folder reads", () => {
  it("(x1) Open A (read pending), Open B (done), A's read lands last -> metadata must be B's", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa").mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch)
      .mockReturnValueOnce(aRead.promise)
      .mockResolvedValueOnce({ "/fb/b.wav": B_META });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Open Folder/);
    await click(/Open Folder/);
    expect(useFileStore.getState().metadata).toEqual({ "/fb/b.wav": B_META });
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    const s = useFileStore.getState();
    expect(s.folderPath).toBe("/fb");
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x2) Open A (scan pending), Open B (done), A's scan lands last -> files must be B's", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa").mockResolvedValueOnce("/fb");
    const aScan = deferred<WavFileEntry[]>();
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(aScan.promise).mockResolvedValueOnce(B_FILES);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (paths: string[]) =>
      Object.fromEntries(paths.map((p) => [p, p.startsWith("/fa") ? A_META : B_META])),
    );
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Open Folder/);
    await click(/Open Folder/);
    await settle(() => aScan.resolve(A_FILES));
    const s = useFileStore.getState();
    expect(s.folderPath).toBe("/fb");
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x3) Open A (read pending), Open B (read pending), A finishes first -> isScanning stays true until B finishes", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa").mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    const bRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(aRead.promise).mockReturnValueOnce(bRead.promise);
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Open Folder/);
    await click(/Open Folder/);
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    expect(useFileStore.getState().isScanning).toBe(true);
    expect(useFileStore.getState().metadata).toEqual({});
    await settle(() => bRead.resolve({ "/fb/b.wav": B_META }));
    expect(useFileStore.getState().isScanning).toBe(false);
    expect(useFileStore.getState().metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x4) Open A (read pending), Open B (done), A's read rejects last -> no stale toast", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa").mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch)
      .mockReturnValueOnce(aRead.promise)
      .mockResolvedValueOnce({ "/fb/b.wav": B_META });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Open Folder/);
    await click(/Open Folder/);
    await settle(() => aRead.reject(new Error("late")));
    expect(useMetadataStore.getState().toastMessage).toBeNull();
    expect(useFileStore.getState().metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x5) Open A (read pending), Close Folder, A's read lands -> store stays closed", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(aRead.promise);
    const { container } = render(
      createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)),
    );
    await click(/Open Folder/);
    const closeButton = container.querySelector('button[type="button"] svg.lucide-x')?.closest("button");
    if (!closeButton) throw new Error("close button not found");
    await settle(() => fireEvent.click(closeButton));
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    const s = useFileStore.getState();
    expect(s.folderPath).toBeNull();
    expect(s.files).toEqual([]);
    expect(s.metadata).toEqual({});
    expect(s.isScanning).toBe(false);
  });

  it("(x6) App: Open Folder A (read pending), drop B (done), A's read lands last -> B's metadata", async () => {
    vi.mocked(window.api.loadSchema).mockResolvedValue(STANDARD_FIELDS);
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa");
    vi.mocked(window.api.resolveDroppedPaths).mockResolvedValue({ folders: ["/fb"], wavFiles: [] });
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch)
      .mockReturnValueOnce(aRead.promise)
      .mockResolvedValueOnce({ "/fb/b.wav": B_META });
    const { container } = render(createElement(App));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    await click(/Open Folder/);
    const root = container.firstChild;
    if (!(root instanceof Element)) throw new Error("no root");
    await act(async () => {
      fireEvent.drop(root, { dataTransfer: { files: [{ path: "/fb" }] } });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(useFileStore.getState().metadata).toEqual({ "/fb/b.wav": B_META });
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    const s = useFileStore.getState();
    expect(s.folderPath).toBe("/fb");
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });
  it("(x7) Rescan of A (read pending), Open Folder B (done), Rescan's read lands -> B", async () => {
    useFileStore.setState({ folderPath: "/fa", files: A_FILES, metadata: { "/fa/a.wav": A_META } });
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch)
      .mockReturnValueOnce(aRead.promise)
      .mockResolvedValueOnce({ "/fb/b.wav": B_META });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Rescan/);
    await click(/Open Folder/);
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    const s = useFileStore.getState();
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x8) pin: Open A (read pending), second Open Folder dialog cancelled, A's read lands -> A applied", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa").mockResolvedValueOnce(null);
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(aRead.promise);
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Open Folder/);
    await click(/Open Folder/);
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    const s = useFileStore.getState();
    expect(s.folderPath).toBe("/fa");
    expect(s.files).toEqual(A_FILES);
    expect(s.metadata).toEqual({ "/fa/a.wav": A_META });
    expect(s.isScanning).toBe(false);
  });

  it("(x9) Open A (scan pending), Open B (done), A's scan rejects -> B kept, no toast", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fa").mockResolvedValueOnce("/fb");
    const aScan = deferred<WavFileEntry[]>();
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(aScan.promise).mockResolvedValueOnce(B_FILES);
    vi.mocked(window.api.readMetadataBatch).mockResolvedValueOnce({ "/fb/b.wav": B_META });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Open Folder/);
    await click(/Open Folder/);
    await settle(() => aScan.reject(new Error("EACCES late")));
    const s = useFileStore.getState();
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
    expect(useMetadataStore.getState().toastMessage).toBeNull();
  });
  async function renderAppReady() {
    vi.mocked(window.api.loadSchema).mockResolvedValue(STANDARD_FIELDS);
    const r = render(createElement(App));
    await act(async () => {
      await new Promise((res) => setTimeout(res, 100));
    });
    const root = r.container.firstChild;
    if (!(root instanceof Element)) throw new Error("no root");
    return root;
  }
  async function dropOn(root: Element, path: string) {
    vi.mocked(window.api.resolveDroppedPaths).mockResolvedValueOnce({ folders: [path], wavFiles: [] });
    await act(async () => {
      fireEvent.drop(root, { dataTransfer: { files: [{ path }] } });
    });
    await act(async () => {
      await new Promise((res) => setTimeout(res, 20));
    });
  }

  it("(x10) App: drop A (read pending), Open Folder B (read pending), A lands first -> scanning stays, then B", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    const bRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(aRead.promise).mockReturnValueOnce(bRead.promise);
    const root = await renderAppReady();
    await dropOn(root, "/fa");
    await click(/Open Folder/);
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    expect(useFileStore.getState().isScanning).toBe(true);
    expect(useFileStore.getState().metadata).toEqual({});
    await settle(() => bRead.resolve({ "/fb/b.wav": B_META }));
    const s = useFileStore.getState();
    expect(s.isScanning).toBe(false);
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x11) App: drop A (scan pending), Open Folder B (done), A's scan lands last -> B", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    const aScan = deferred<WavFileEntry[]>();
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(aScan.promise).mockResolvedValueOnce(B_FILES);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (paths: string[]) =>
      Object.fromEntries(paths.map((p) => [p, p.startsWith("/fa") ? A_META : B_META])),
    );
    const root = await renderAppReady();
    await dropOn(root, "/fa");
    await click(/Open Folder/);
    await settle(() => aScan.resolve(A_FILES));
    const s = useFileStore.getState();
    expect(s.folderPath).toBe("/fb");
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x12) App: drop A (scan pending), Open Folder B (done), A's scan rejects last -> B kept, no toast", async () => {
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    const aScan = deferred<WavFileEntry[]>();
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(aScan.promise).mockResolvedValueOnce(B_FILES);
    vi.mocked(window.api.readMetadataBatch).mockResolvedValueOnce({ "/fb/b.wav": B_META });
    const root = await renderAppReady();
    await dropOn(root, "/fa");
    await click(/Open Folder/);
    await settle(() => aScan.reject(new Error("EACCES late")));
    const s = useFileStore.getState();
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
    expect(useMetadataStore.getState().toastMessage).toBeNull();
  });

  it("(x13) Rescan of A (scan pending), Open Folder B (done), Rescan's scan lands last -> B", async () => {
    useFileStore.setState({ folderPath: "/fa", files: A_FILES, metadata: { "/fa/a.wav": A_META } });
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    const aScan = deferred<WavFileEntry[]>();
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(aScan.promise).mockResolvedValueOnce(B_FILES);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (paths: string[]) =>
      Object.fromEntries(paths.map((p) => [p, p.startsWith("/fa") ? A_META : B_META])),
    );
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Rescan/);
    await click(/Open Folder/);
    await settle(() => aScan.resolve(A_FILES));
    const s = useFileStore.getState();
    expect(s.files).toEqual(B_FILES);
    expect(s.metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x14) Rescan of A (scan pending), Open Folder B (done), Rescan's scan rejects last -> no Rescan toast", async () => {
    useFileStore.setState({ folderPath: "/fa", files: A_FILES, metadata: { "/fa/a.wav": A_META } });
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    const aScan = deferred<WavFileEntry[]>();
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(aScan.promise).mockResolvedValueOnce(B_FILES);
    vi.mocked(window.api.readMetadataBatch).mockResolvedValueOnce({ "/fb/b.wav": B_META });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Rescan/);
    await click(/Open Folder/);
    await settle(() => aScan.reject(new Error("Rescan late")));
    expect(useMetadataStore.getState().toastMessage).toBeNull();
    expect(useFileStore.getState().metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x15) Rescan of A (read pending), Open Folder B (read pending), Rescan lands first -> scanning stays true", async () => {
    useFileStore.setState({ folderPath: "/fa", files: A_FILES, metadata: { "/fa/a.wav": A_META } });
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES).mockResolvedValueOnce(B_FILES);
    const aRead = deferred<Record<string, WavMetadata>>();
    const bRead = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(aRead.promise).mockReturnValueOnce(bRead.promise);
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    await click(/Rescan/);
    await click(/Open Folder/);
    await settle(() => aRead.resolve({ "/fa/a.wav": A_META }));
    expect(useFileStore.getState().isScanning).toBe(true);
    await settle(() => bRead.resolve({ "/fb/b.wav": B_META }));
    expect(useFileStore.getState().isScanning).toBe(false);
    expect(useFileStore.getState().metadata).toEqual({ "/fb/b.wav": B_META });
  });

  it("(x16) Rescan takes a new folder load id, so an earlier id is no longer current", async () => {
    useFileStore.setState({ folderPath: "/fa", files: A_FILES, metadata: { "/fa/a.wav": A_META } });
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce(A_FILES);
    vi.mocked(window.api.readMetadataBatch).mockResolvedValueOnce({ "/fa/a.wav": A_META });
    render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
    const before = useFileStore.getState().folderLoadId;
    await click(/Rescan/);
    expect(isFolderLoadCurrent(before)).toBe(false);
    expect(useFileStore.getState().folderLoadId).toBe(before + 1);
  });
});
