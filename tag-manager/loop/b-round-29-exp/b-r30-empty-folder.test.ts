import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "~/App";
import { MetadataPanel } from "~/components/metadata-editor/MetadataPanel";
import { FolderBrowser } from "~/components/sidebar/FolderBrowser";
import { useFileStore } from "~/stores/file-store";
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

const FOLDER = "/music";
const OTHER_FOLDER = "/other";
const PATH_A = "/music/a.wav";
const PATH_B = "/music/b.wav";
const SAVED_CATEGORY = "R29Cat";
const EXTERNAL_CATEGORY = "ExtCat";
const MODIFIED_AT = "2026-10-27T00:00:00.000Z";

const FILE_A: WavFileEntry = { name: "a.wav", path: PATH_A, size: 100, modifiedAt: MODIFIED_AT };
const FILE_B: WavFileEntry = { name: "b.wav", path: PATH_B, size: 100, modifiedAt: MODIFIED_AT };
const OTHER_FILES: WavFileEntry[] = [
  { name: "c.wav", path: "/other/c.wav", size: 100, modifiedAt: MODIFIED_AT },
  { name: "d.wav", path: "/other/d.wav", size: 100, modifiedAt: MODIFIED_AT },
];
const OLD_A: WavMetadata = { title: "A-title", category: "ACat", comment: "" };
const OLD_B: WavMetadata = { title: "B-title", category: "BCat", comment: "" };
const NEW_A: WavMetadata = { ...OLD_A, category: SAVED_CATEGORY };

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => {};
  let reject: (reason: Error) => void = () => {};
  const promise = new Promise<T>((settleResolve, settleReject) => {
    resolve = settleResolve;
    reject = settleReject;
  });
  return { promise, resolve, reject };
}

function seedTwoFiles(selectedPaths: string[]): void {
  useFileStore.setState({
    folderPath: FOLDER,
    files: [FILE_A, FILE_B],
    metadata: { [PATH_A]: { ...OLD_A }, [PATH_B]: { ...OLD_B } },
    selectedPaths,
  });
  vi.mocked(window.api.scanFolder).mockResolvedValue([FILE_A, FILE_B]);
}

function makeFiles(count: number, firstPath: string, lastPath: string): WavFileEntry[] {
  return Array.from({ length: count }, (_, index) => {
    let path = `/music/f${String(index).padStart(2, "0")}.wav`;
    if (index === 0) path = firstPath;
    if (index === count - 1) path = lastPath;
    return { name: path.slice(FOLDER.length + 1), path, size: 100, modifiedAt: MODIFIED_AT };
  });
}

function oldMetaFor(path: string): WavMetadata {
  return { title: `${path}-title`, category: `${path}-cat`, comment: "" };
}

function seedManyFiles(files: WavFileEntry[], selectedPaths: string[]): void {
  const metadata: Record<string, WavMetadata> = {};
  for (const file of files) metadata[file.path] = oldMetaFor(file.path);
  useFileStore.setState({ folderPath: FOLDER, files, metadata, selectedPaths });
  vi.mocked(window.api.scanFolder).mockResolvedValue(files);
}

function renderBrowserAndPanel(): void {
  render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
}

function getInputByLabel(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText);
  const input = label.parentElement?.querySelector("input");
  if (!input) throw new Error(`${labelText} input not found`);
  return input;
}

async function typeCategoryAndSave(saveButtonName: RegExp): Promise<void> {
  fireEvent.change(getInputByLabel("Category (UCS)"), { target: { value: SAVED_CATEGORY } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: saveButtonName }));
  });
}

async function clickButton(name: RegExp): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

async function settle(action: () => void): Promise<void> {
  await act(async () => {
    action();
  });
}

async function dropFolder(target: Element): Promise<void> {
  await act(async () => {
    fireEvent.drop(target, { dataTransfer: { files: [{ path: FOLDER }] } });
  });
}

function expectSeededEntriesKeptWithToast(): void {
  const state = useFileStore.getState();
  expect(state.metadata).toEqual({ [PATH_A]: OLD_A, [PATH_B]: OLD_B });
  expect(state.files).toHaveLength(2);
  expect(useMetadataStore.getState().toastMessage).toBe("Failed to read 2 files");
  expect(useMetadataStore.getState().toastType).toBe("error");
}

beforeEach(() => {
  resetAllStores();
  resetWindowApiMocks();
  vi.mocked(window.api.openFolderDialog).mockReset().mockResolvedValue(null);
  vi.mocked(window.api.loadSchema).mockReset().mockResolvedValue([]);
  vi.mocked(window.api.resolveDroppedPaths).mockReset().mockResolvedValue({ folders: [], wavFiles: [] });
});

afterEach(() => {
  cleanup();
  resetAllStores();
});

describe("B R30 experiment: empty folder", () => {
  it("(x1) Open Folder of an empty folder clears metadata", async () => {
    seedTwoFiles([]);
    vi.mocked(window.api.openFolderDialog).mockResolvedValue("/empty");
    vi.mocked(window.api.scanFolder).mockResolvedValue([]);
    renderBrowserAndPanel();
    await clickButton(/Open Folder/);
    const state = useFileStore.getState();
    expect(state.files).toEqual([]);
    expect(state.metadata).toEqual({});
  });
  it("(x2) App drop of an empty folder clears metadata", async () => {
    vi.mocked(window.api.loadSchema).mockResolvedValue(STANDARD_FIELDS);
    seedTwoFiles([]);
    vi.mocked(window.api.scanFolder).mockResolvedValue([]);
    vi.mocked(window.api.resolveDroppedPaths).mockResolvedValue({ folders: ["/empty"], wavFiles: [] });
    const { container } = render(createElement(App));
    await act(async () => { await new Promise((r) => setTimeout(r, 100)); });
    await dropFolder(container.firstElementChild as Element);
    expect(useFileStore.getState().files).toEqual([]);
    expect(useFileStore.getState().metadata).toEqual({});
  });
  it("(x3) empty folder then Open Folder /music with rejected read: old entries resurrected?", async () => {
    seedTwoFiles([]);
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/empty").mockResolvedValueOnce(FOLDER);
    vi.mocked(window.api.scanFolder).mockResolvedValueOnce([]).mockResolvedValueOnce([FILE_A, FILE_B]);
    vi.mocked(window.api.readMetadataBatch).mockRejectedValueOnce(new Error("ipc read failed"));
    renderBrowserAndPanel();
    await clickButton(/Open Folder/);
    await clickButton(/Open Folder/);
    expect(useFileStore.getState().metadata).toEqual({});
    expect(useMetadataStore.getState().toastMessage).toBe("Failed to read 2 files");
  });
  it("(x4) Rescan of a now-empty folder clears metadata (pin)", async () => {
    seedTwoFiles([]);
    vi.mocked(window.api.scanFolder).mockResolvedValue([]);
    renderBrowserAndPanel();
    await clickButton(/Rescan/);
    expect(useFileStore.getState().metadata).toEqual({});
  });
});
