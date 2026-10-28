import "@testing-library/jest-dom/vitest";

const mockApi: Window["api"] = {
  openFolderDialog: vi.fn().mockResolvedValue(null),
  scanFolder: vi.fn().mockResolvedValue([]),
  loadSchema: vi.fn().mockResolvedValue([]),
  saveSchema: vi.fn().mockResolvedValue(undefined),
  readMetadata: vi.fn().mockResolvedValue({}),
  readMetadataBatch: vi.fn().mockResolvedValue({}),
  writeMetadata: vi.fn().mockResolvedValue(undefined),
  writeMetadataBatch: vi.fn().mockResolvedValue({ succeeded: 0, failed: [] }),
  loadTemplates: vi.fn().mockResolvedValue([]),
  saveTemplate: vi.fn().mockResolvedValue(undefined),
  deleteTemplate: vi.fn().mockResolvedValue(undefined),
  getAudioBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  resolveDroppedPaths: vi.fn().mockResolvedValue({ folders: [], wavFiles: [] }),
  windowMinimize: vi.fn(),
  windowMaximize: vi.fn(),
  windowClose: vi.fn(),
};

Object.defineProperty(globalThis, "window", {
  value: { ...globalThis.window, api: mockApi },
  writable: true,
});

if (!globalThis.window) {
  (globalThis as Record<string, unknown>).window = { api: mockApi };
} else {
  (globalThis.window as unknown as Record<string, unknown>).api = mockApi;
}
