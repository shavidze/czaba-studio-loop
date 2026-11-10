import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const signalr = vi.hoisted(() => {
  const invoke = vi.fn(async () => undefined);
  const start = vi.fn(async () => undefined);
  const state = { loads: 0, failLoad: false, connectionState: 'Connected' };
  return { invoke, start, state };
});

function signalrModule() {
  signalr.state.loads += 1;
  if (signalr.state.failLoad) {
    throw new Error('chunk load failed');
  }
  class FakeConnection {
    get state() {
      return signalr.state.connectionState;
    }
    on() {}
    onclose() {}
    start = signalr.start;
    stop = vi.fn(async () => undefined);
    invoke = signalr.invoke;
  }
  class HubConnectionBuilder {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    configureLogging() {
      return this;
    }
    build() {
      return new FakeConnection();
    }
  }
  return {
    HubConnectionBuilder,
    HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
    LogLevel: { Warning: 3 },
  };
}

vi.mock('~/hooks', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock('~/services/api/client', () => ({
  apiClient: {
    createChatSession: vi.fn(async () => ({
      id: 7,
      status: 'active',
      createdAt: '2026-11-06T00:00:00Z',
      displayName: 'Guest',
      displayEmail: '',
      unreadCount: 0,
      messages: [],
    })),
    getSignalRHubUrl: () => 'http://127.0.0.1:5199/hubs/chat',
    getAccessToken: () => undefined,
  },
}));

async function renderChat() {
  const { ChatProvider } = await import('../ChatContext');
  const { useChat } = await import('~/hooks/useChat');
  function wrapper({ children }: { children: ReactNode }) {
    return <ChatProvider>{children}</ChatProvider>;
  }
  return renderHook(() => useChat(), { wrapper });
}

beforeEach(() => {
  vi.resetModules();
  vi.doMock('@microsoft/signalr', signalrModule);
  signalr.invoke.mockClear();
  signalr.start.mockClear();
  signalr.state.loads = 0;
  signalr.state.failLoad = false;
  signalr.state.connectionState = 'Connected';
});

describe('ChatContext lazy signalr (PERF-11a)', () => {
  it('CL1: the source has no value import of @microsoft/signalr', () => {
    const source = readFileSync(resolve(__dirname, '../ChatContext.tsx'), 'utf8');
    const staticImports = source.match(/^import\s[^;]*from\s+'@microsoft\/signalr';/gm) ?? [];
    expect(staticImports.every((line) => /^import\s+type\s/.test(line))).toBe(true);
    expect(source).toMatch(/await import\('@microsoft\/signalr'\)/);
  });

  it('CL2: mounting the provider does not load signalr; startSession loads it once and joins', async () => {
    const { result } = await renderChat();
    expect(signalr.state.loads).toBe(0);
    await act(async () => {
      await result.current.startSession({ name: 'A', email: 'a@example.com' });
    });
    expect(signalr.state.loads).toBe(1);
    expect(result.current.connectionStatus).toBe('connected');
    expect(signalr.invoke).toHaveBeenCalledWith('JoinSession', 7);
  });

  it('CL3: no invoke while the hub is not connected', async () => {
    signalr.state.connectionState = 'Disconnected';
    const { result } = await renderChat();
    await act(async () => {
      await result.current.startSession({ name: 'A', email: 'a@example.com' });
    });
    expect(signalr.state.loads).toBe(1);
    expect(signalr.invoke).not.toHaveBeenCalled();
  });

  it('CL4: a failed signalr chunk load leaves the chat disconnected with an error', async () => {
    signalr.state.failLoad = true;
    const { result } = await renderChat();
    await act(async () => {
      await result.current.startSession({ name: 'A', email: 'a@example.com' });
    });
    expect(signalr.state.loads).toBe(1);
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.error).toBe('Failed to connect to chat. Please try again.');
    expect(signalr.invoke).not.toHaveBeenCalled();
  });
});
