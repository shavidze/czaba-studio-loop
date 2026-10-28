import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetadataPanel } from "~/components/metadata-editor/MetadataPanel";
import { FolderBrowser } from "~/components/sidebar/FolderBrowser";
import { useFileStore } from "~/stores/file-store";
import { useSchemaStore } from "~/stores/schema-store";
import type { FieldDefinition, WavFileEntry, WavMetadata } from "~/types";
import { resetAllStores } from "~/../../../tests/renderer/helpers/reset-stores";
import { resetWindowApiMocks } from "~/../../../tests/renderer/helpers/window-api-mocks";

vi.hoisted(() => {
  const g = globalThis as unknown as { window: { api: unknown }; api: unknown };
  const mockApi = g.window.api;
  g.window = globalThis as unknown as { api: unknown };
  g.api = mockApi;
});

const M = "2026-10-28T00:00:00.000Z";
const PA = "/fa/a.wav";
const PB = "/fb/b.wav";
const FA: WavFileEntry = { name: "a.wav", path: PA, size: 1, modifiedAt: M };
const FB: WavFileEntry = { name: "b.wav", path: PB, size: 1, modifiedAt: M };
const PH = "Field name (e.g. Client)";

function deferred<T>() { let resolve: (v: T) => void = () => {}; const promise = new Promise<T>((r) => { resolve = r; }); return { promise, resolve }; }
function readFor(paths: string[], schema: FieldDefinition[]): Record<string, WavMetadata> {
  const out: Record<string, WavMetadata> = {};
  for (const p of paths) {
    const m: WavMetadata = { title: p, category: "C", comment: "" };
    for (const f of schema) if (!f.standard) m[f.key] = `${f.key}@${p}`;
    out[p] = m;
  }
  return out;
}
const input = () => screen.queryByPlaceholderText(PH) as HTMLInputElement | null;
async function click(el: Element) { await act(async () => { fireEvent.click(el); }); }
async function openCustomize() { await click(screen.getByTitle("Customize Fields")); }
async function back() { const b = document.querySelector("svg.lucide-arrow-left")?.closest("button"); if (!b) throw new Error("no back"); await click(b); }
async function addField(name: string) { fireEvent.change(screen.getByPlaceholderText(PH), { target: { value: name } }); await click(screen.getByRole("button", { name: /Add Field/ })); }
async function done() { await click(screen.getByRole("button", { name: /Done/ })); }
async function wait(ms: number) { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); }
function seedA() { useFileStore.setState({ folderPath: "/fa", files: [FA], metadata: { [PA]: { title: PA, category: "C", comment: "" } }, selectedPaths: [PA] }); }
function renderAll(strict: boolean) { const t = createElement(Fragment, null, createElement(FolderBrowser), createElement(MetadataPanel)); render(strict ? createElement(StrictMode, null, t) : t); }

beforeEach(() => {
  resetAllStores();
  resetWindowApiMocks();
  vi.mocked(window.api.openFolderDialog).mockReset().mockResolvedValue(null);
  vi.mocked(window.api.loadSchema).mockReset().mockResolvedValue([]);
});
afterEach(() => cleanup());

describe("QA probes r34", () => {
  for (const strict of [false, true]) {
    it(`P1 strict=${strict}: Done A pending folder load, Back, reopen B, add field, Done B: B closes after load, metadata has both fields`, async () => {
      seedA();
      const scan = deferred<WavFileEntry[]>();
      vi.mocked(window.api.openFolderDialog).mockResolvedValueOnce("/fb");
      vi.mocked(window.api.scanFolder).mockReturnValueOnce(scan.promise);
      vi.mocked(window.api.readMetadataBatch).mockImplementation(async (p, s) => readFor(p, s));
      renderAll(strict);
      await openCustomize();
      await click(screen.getByRole("button", { name: /Open Folder/ }));
      await addField("Qone");
      await done();
      await back();
      await act(async () => useFileStore.getState().setSelectedPaths([PA]));
      await openCustomize();
      await addField("Qtwo");
      await done();
      expect(input()).not.toBeNull();
      await act(async () => scan.resolve([FB]));
      await wait(30);
      expect(input()).toBeNull();
      expect(useFileStore.getState().metadata[PB]).toMatchObject({ qone: `qone@${PB}`, qtwo: `qtwo@${PB}` });
    });
  }

  it("P2: Done A (slow re-read), Back, reopen B, add field, Done B; B's read lands first, A's stale-schema read lands last", async () => {
    seedA();
    const reads: Array<{ schema: FieldDefinition[]; d: ReturnType<typeof deferred<Record<string, WavMetadata>>>; paths: string[] }> = [];
    vi.mocked(window.api.readMetadataBatch).mockImplementation((paths, schema) => { const d = deferred<Record<string, WavMetadata>>(); reads.push({ schema, d, paths }); return d.promise; });
    renderAll(false);
    await openCustomize();
    await addField("Qone");
    await done();
    expect(reads.length).toBe(1);
    expect(input()).not.toBeNull();
    await back();
    await openCustomize();
    await addField("Qtwo");
    await done();
    expect(reads.length).toBe(2);
    await act(async () => reads[1].d.resolve(readFor(reads[1].paths, reads[1].schema)));
    await wait(20);
    expect(input()).toBeNull();
    await act(async () => reads[0].d.resolve(readFor(reads[0].paths, reads[0].schema)));
    await wait(20);
    expect(input()).toBeNull();
    expect(useSchemaStore.getState().fields.some((f) => f.key === "qtwo")).toBe(true);
    expect(useFileStore.getState().metadata[PA]).toMatchObject({ qtwo: `qtwo@${PA}` });
  });

  it("P3: Done A (slow re-read), Back, reopen B, type; A's read lands: B stays open with typed text", async () => {
    seedA();
    const d = deferred<Record<string, WavMetadata>>();
    vi.mocked(window.api.readMetadataBatch).mockReturnValueOnce(d.promise);
    renderAll(true);
    await openCustomize();
    await addField("Qone");
    await done();
    await back();
    await openCustomize();
    fireEvent.change(screen.getByPlaceholderText(PH), { target: { value: "typed" } });
    await act(async () => d.resolve(readFor([PA], useSchemaStore.getState().fields)));
    await wait(20);
    expect(input()?.value).toBe("typed");
  });

  it("P4: two Done clicks on the same editor with slow re-read: editor closes once both land, no throw", async () => {
    seedA();
    const ds: Array<ReturnType<typeof deferred<Record<string, WavMetadata>>>> = [];
    vi.mocked(window.api.readMetadataBatch).mockImplementation(() => { const d = deferred<Record<string, WavMetadata>>(); ds.push(d); return d.promise; });
    renderAll(false);
    await openCustomize();
    await addField("Qone");
    await done();
    await done();
    await act(async () => ds[0].resolve(readFor([PA], useSchemaStore.getState().fields)));
    await wait(10);
    expect(input()).toBeNull();
    await act(async () => ds[1]?.resolve(readFor([PA], useSchemaStore.getState().fields)));
    await wait(10);
    expect(input()).toBeNull();
  });
});

describe("QA probes r34 no folder", () => {
  for (const strict of [false, true]) {
    it(`P5 strict=${strict}: no folder open, MetadataPanel with one selected entry, Done closes`, async () => {
      useFileStore.setState({ folderPath: null, files: [], metadata: {}, selectedPaths: [] });
      const { SchemaEditor } = await import("~/components/schema/SchemaEditor");
      let closed = 0;
      let saved = 0;
      const el = createElement(SchemaEditor, { onClose: () => { closed++; }, onSave: async () => { saved++; } });
      render(strict ? createElement(StrictMode, null, el) : el);
      await addField("Qone");
      await done();
      await wait(10);
      expect(saved).toBe(1);
      expect(closed).toBe(1);
    });
    it(`P6 strict=${strict}: SchemaEditor without onSave, Done closes`, async () => {
      const { SchemaEditor } = await import("~/components/schema/SchemaEditor");
      let closed = 0;
      const el = createElement(SchemaEditor, { onClose: () => { closed++; } });
      render(strict ? createElement(StrictMode, null, el) : el);
      await addField("Qone");
      await done();
      expect(closed).toBe(1);
    });
  }
  it("P7: MetadataPanel with no files: Done closes via real handleSchemaChanged early return", async () => {
    useFileStore.setState({ folderPath: null, files: [FA], metadata: {}, selectedPaths: [PA] });
    renderAll(true);
    await openCustomize();
    await act(async () => useFileStore.setState({ files: [] }));
    await addField("Qone");
    await done();
    await wait(10);
    expect(input()).toBeNull();
  });
});
