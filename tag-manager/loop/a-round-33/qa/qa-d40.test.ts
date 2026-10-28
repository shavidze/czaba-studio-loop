import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetadataPanel } from "~/components/metadata-editor/MetadataPanel";
import { FolderBrowser } from "~/components/sidebar/FolderBrowser";
import { useFileStore } from "~/stores/file-store";
import { useMetadataStore } from "~/stores/metadata-store";
import type { FieldDefinition, WavFileEntry, WavMetadata } from "~/types";
import { resetAllStores } from "/home/runner/czaba-project/czaba-tag-manager/tests/renderer/helpers/reset-stores";
import { resetWindowApiMocks } from "/home/runner/czaba-project/czaba-tag-manager/tests/renderer/helpers/window-api-mocks";

vi.hoisted(() => {
  const globalScope = globalThis as unknown as { window: { api: unknown }; api: unknown };
  const mockApi = globalScope.window.api;
  globalScope.window = globalThis as unknown as { api: unknown };
  globalScope.api = mockApi;
});

type MetadataByPath = Record<string, WavMetadata>;

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

const MODIFIED_AT = "2026-10-27T00:00:00.000Z";
const SAVED_CATEGORY = "R33Cat";
const NOTE_KEY = "r33note";
const PATH_A = "/fa/a.wav";
const PATH_A2 = "/fa/a2.wav";
const PATH_B = "/fb/b.wav";
const PATH_C = "/fc/c.wav";
const FILE_A: WavFileEntry = { name: "a.wav", path: PATH_A, size: 1, modifiedAt: MODIFIED_AT };
const FILE_A2: WavFileEntry = { name: "a2.wav", path: PATH_A2, size: 1, modifiedAt: MODIFIED_AT };
const FILE_B: WavFileEntry = { name: "b.wav", path: PATH_B, size: 1, modifiedAt: MODIFIED_AT };
const FILE_C: WavFileEntry = { name: "c.wav", path: PATH_C, size: 1, modifiedAt: MODIFIED_AT };
const A_META: WavMetadata = { title: "A", category: "ACat", comment: "" };
const A2_META: WavMetadata = { title: "A2", category: "A2Cat", comment: "" };
const B_META: WavMetadata = { title: "B", category: "BCat", comment: "" };
const C_META: WavMetadata = { title: "C", category: "CCat", comment: "" };
const NEW_A: WavMetadata = { ...A_META, category: SAVED_CATEGORY };
const NOTE_BY_PATH: Record<string, string> = { [PATH_A]: "AN", [PATH_A2]: "A2N", [PATH_B]: "BN", [PATH_C]: "CN" };
const BASE_BY_PATH: MetadataByPath = { [PATH_A]: A_META, [PATH_A2]: A2_META, [PATH_B]: B_META, [PATH_C]: C_META };

function createDeferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

async function clickButton(name: RegExp): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

async function clickCloseFolder(): Promise<void> {
  const closeButton = document.querySelector('button[type="button"] svg.lucide-x')?.closest("button");
  if (!closeButton) throw new Error("close button not found");
  await act(async () => {
    fireEvent.click(closeButton);
  });
}

async function settle(action: () => void): Promise<void> {
  await act(async () => {
    action();
  });
}

async function waitMs(ms: number): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function getInputByLabel(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText);
  const input = label.parentElement?.querySelector("input");
  if (!input) throw new Error(`${labelText} input not found`);
  return input;
}

async function typeCategoryAndSave(saveButtonName: RegExp): Promise<void> {
  fireEvent.change(getInputByLabel("Category (UCS)"), { target: { value: SAVED_CATEGORY } });
  await clickButton(saveButtonName);
}

function renderBrowserAndPanel(): void {
  render(createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)));
}

function seedFolderA(selectedPaths: string[]): void {
  useFileStore.setState({
    folderPath: "/fa",
    files: [FILE_A, FILE_A2],
    metadata: { [PATH_A]: { ...A_META }, [PATH_A2]: { ...A2_META } },
    selectedPaths,
  });
}

function hasNoteField(schema: FieldDefinition[]): boolean {
  return schema.some((field) => field.key === NOTE_KEY);
}

function readFor(paths: string[], schema: FieldDefinition[]): MetadataByPath {
  const out: MetadataByPath = {};
  for (const path of paths) {
    out[path] = hasNoteField(schema) ? { ...BASE_BY_PATH[path], [NOTE_KEY]: NOTE_BY_PATH[path] } : { ...BASE_BY_PATH[path] };
  }
  return out;
}

function withNote(path: string): WavMetadata {
  return { ...BASE_BY_PATH[path], [NOTE_KEY]: NOTE_BY_PATH[path] };
}

function batchReadPaths(): string[][] {
  return vi.mocked(window.api.readMetadataBatch).mock.calls.map((call) => call[0]);
}

async function openCustomize(): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByTitle("Customize Fields"));
  });
}

async function addNoteField(): Promise<void> {
  fireEvent.change(screen.getByPlaceholderText("Field name (e.g. Client)"), { target: { value: "R33note" } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Add Field/ }));
  });
}

beforeEach(() => {
  resetAllStores();
  resetWindowApiMocks();
  vi.mocked(window.api.openFolderDialog).mockReset().mockResolvedValue(null);
  vi.mocked(window.api.loadSchema).mockReset().mockResolvedValue([]);
});
afterEach(() => cleanup());

async function clickBack(): Promise<void> {
  const back = document.querySelector("svg.lucide-arrow-left")?.closest("button");
  if (!back) throw new Error("back not found");
  await act(async () => { fireEvent.click(back); });
}

describe("QA D-40", () => {
  it("Q1: Done during pending scan, Back, reopen Customize, scan resolves: reopened editor must stay open", async () => {
    seedFolderA([PATH_A]);
    const scanB = createDeferred<WavFileEntry[]>();
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(scanB.promise);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (p, s) => readFor(p, s));
    renderBrowserAndPanel();
    await openCustomize();
    await clickButton(/Open Folder/);
    await addNoteField();
    await clickButton(/Done/);
    expect(screen.queryByText("Customize Fields")).not.toBeNull();
    await clickBack();
    await settle(() => useFileStore.getState().setSelectedPaths([PATH_A]));
    await openCustomize();
    expect(screen.queryByText("Customize Fields")).not.toBeNull();
    await settle(() => scanB.resolve([FILE_B]));
    await waitMs(20);
    expect(screen.queryByText("Customize Fields")).not.toBeNull();
  });

  it("Q2: Done clicked twice during a pending scan: the folder is re-read once", async () => {
    seedFolderA([PATH_A]);
    const scanB = createDeferred<WavFileEntry[]>();
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(scanB.promise);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (p, s) => readFor(p, s));
    renderBrowserAndPanel();
    await openCustomize();
    await clickButton(/Open Folder/);
    await addNoteField();
    await clickButton(/Done/);
    await clickButton(/Done/);
    await settle(() => scanB.resolve([FILE_B]));
    await waitMs(20);
    expect(batchReadPaths()).toEqual([[PATH_B], [PATH_B]]); // pin: 1 load read + 1 schema read expected; see output
  });

  it("Q3 (pin): scan never resolves: Done never closes the editor and the button stays enabled", async () => {
    seedFolderA([PATH_A]);
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(new Promise(() => {}));
    renderBrowserAndPanel();
    await openCustomize();
    await clickButton(/Open Folder/);
    await addNoteField();
    await clickButton(/Done/);
    await waitMs(200);
    expect(screen.queryByText("Customize Fields")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Done/ })).not.toBeDisabled();
    expect(useFileStore.getState().isScanning).toBe(true);
  });

  it("Q4: Rescan begins during the schema re-read (after the wait): final metadata has the new field, no toast", async () => {
    seedFolderA([PATH_A]);
    const schemaRead = createDeferred<MetadataByPath>();
    let first = true;
    vi.mocked(window.api.scanFolder).mockResolvedValue([FILE_A, FILE_A2]);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (p, s) => {
      if (first) { first = false; return schemaRead.promise.then(() => readFor(p, s)); }
      return readFor(p, s);
    });
    renderBrowserAndPanel();
    await openCustomize();
    await addNoteField();
    await clickButton(/Done/);
    await clickButton(/Rescan/);
    await waitMs(20);
    await settle(() => schemaRead.resolve({}));
    await waitMs(20);
    expect(useFileStore.getState().metadata).toEqual({ [PATH_A]: withNote(PATH_A), [PATH_A2]: withNote(PATH_A2) });
    expect(useMetadataStore.getState().toastMessage).toBeNull();
    expect(screen.queryByText("Customize Fields")).toBeNull();
  });

  it("Q5: unmount MetadataPanel during the wait, then scan resolves: no throw, subscription released", async () => {
    seedFolderA([PATH_A]);
    const scanB = createDeferred<WavFileEntry[]>();
    vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
    vi.mocked(window.api.scanFolder).mockReturnValueOnce(scanB.promise);
    vi.mocked(window.api.readMetadataBatch).mockImplementation(async (p, s) => readFor(p, s));
    const errSpy = vi.spyOn(console, "error");
    renderBrowserAndPanel();
    await openCustomize();
    await clickButton(/Open Folder/);
    await addNoteField();
    await clickButton(/Done/);
    cleanup();
    useFileStore.setState({ isScanning: false, files: [FILE_B], folderLoadId: useFileStore.getState().folderLoadId });
    await waitMs(20);
    // schema re-read still runs after unmount (store-level), writes B with note
    expect(batchReadPaths()).toEqual([[PATH_B]]);
    expect(useFileStore.getState().metadata).toEqual({ [PATH_B]: withNote(PATH_B) });
    expect(errSpy).not.toHaveBeenCalled();
  });
});
