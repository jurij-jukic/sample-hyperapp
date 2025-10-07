import { create } from 'zustand';
import {
  CounterSnapshot,
  get_counters as getCounters,
  ping_http as pingHttp,
  send_message as sendMessageApi,
} from '../types/api';
import { getNodeId } from '../types/global';
import { getErrorMessage } from '../utils/api';

type SendMode = 'local' | 'remote' | 'remote-mismatch';

interface SampleState {
  nodeId: string | null;
  isConnected: boolean;
  counters: CounterSnapshot | null;
  httpMessage: string;
  processMessage: string;
  sendMode: SendMode;
  remoteNode: string;
  mismatchNode: string;
  mismatchMessage: string;
  isSubmitting: boolean;
  isHttpMismatchSubmitting: boolean;
  isMismatchSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  setHttpMessage: (value: string) => void;
  setProcessMessage: (value: string) => void;
  setSendMode: (mode: SendMode) => void;
  setRemoteNode: (value: string) => void;
  setMismatchNode: (value: string) => void;
  setMismatchMessage: (value: string) => void;
  sendHttpPing: () => Promise<void>;
  triggerHttpMismatch: () => Promise<void>;
  sendProcessMessage: () => Promise<void>;
  triggerMismatch: () => Promise<void>;
  clearError: () => void;
}

const EMPTY_PAYLOAD = JSON.stringify('');

export const useSampleStore = create<SampleState>((set, get) => ({
  nodeId: getNodeId(),
  isConnected: Boolean(getNodeId()),
  counters: null,
  httpMessage: '',
  processMessage: '',
  sendMode: 'local',
  remoteNode: '',
  mismatchNode: '',
  mismatchMessage: '',
  isSubmitting: false,
  isHttpMismatchSubmitting: false,
  isMismatchSubmitting: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const nodeId = getNodeId();
    set({ nodeId, isConnected: Boolean(nodeId) });
    if (!nodeId) {
      set({ error: 'Not connected to a Hyperware node.' });
      return;
    }
    await get().refresh();
  },

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await getCounters(EMPTY_PAYLOAD);
      set({ counters: snapshot, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  setHttpMessage: (value) => set({ httpMessage: value }),
  setProcessMessage: (value) => set({ processMessage: value }),
  setSendMode: (mode) => set({ sendMode: mode }),
  setRemoteNode: (value) => set({ remoteNode: value }),
  setMismatchNode: (value) => set({ mismatchNode: value }),
  setMismatchMessage: (value) => set({ mismatchMessage: value }),

  sendHttpPing: async () => {
    const state = get();
    const message = state.httpMessage.trim();
    if (!message) {
      set({ error: 'Enter a message before sending a ping.' });
      return;
    }

    set({ isSubmitting: true, error: null });
    try {
      const snapshot = await pingHttp(JSON.stringify({ message }));
      set({ counters: snapshot, httpMessage: '', isSubmitting: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isSubmitting: false });
    }
  },

  triggerHttpMismatch: async () => {
    const state = get();
    const message = state.httpMessage.trim() || 'mismatch-trigger';

    set({ isHttpMismatchSubmitting: true, error: null });
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ PingLocal: message }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      set({ isHttpMismatchSubmitting: false });
      await get().refresh();
    } catch (error) {
      set({ error: getErrorMessage(error), isHttpMismatchSubmitting: false });
    }
  },

  sendProcessMessage: async () => {
    const state = get();
    const message = state.processMessage.trim();
    if (!message) {
      set({ error: 'Enter a message before sending.' });
      return;
    }

    const payload: Record<string, unknown> = {
      mode: state.sendMode,
      message,
    };

    if (state.sendMode === 'remote') {
      const target = state.remoteNode.trim();
      if (target.length === 0) {
        set({ error: 'Specify a remote node before sending.' });
        return;
      }
      payload.target_node = target;
    }

    set({ isSubmitting: true, error: null });
    try {
      await sendMessageApi(JSON.stringify(payload));
      set({ processMessage: '', isSubmitting: false });
      await get().refresh();
    } catch (error) {
      set({ error: getErrorMessage(error), isSubmitting: false });
    }
  },

  triggerMismatch: async () => {
    const state = get();
    const target = state.mismatchNode.trim();
    const message = state.mismatchMessage.trim();

    if (!target) {
      set({ error: 'Enter the remote node to target.' });
      return;
    }

    if (!message) {
      set({ error: 'Enter a message before triggering the mismatch.' });
      return;
    }

    set({ isMismatchSubmitting: true, error: null });
    try {
      await sendMessageApi(
        JSON.stringify({
          mode: 'remote-mismatch',
          message,
          target_node: target,
        }),
      );
      set({ mismatchMessage: '', isMismatchSubmitting: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isMismatchSubmitting: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export const useSampleSelectors = {
  nodeId: () => useSampleStore((state) => state.nodeId),
  isConnected: () => useSampleStore((state) => state.isConnected),
  counters: () => useSampleStore((state) => state.counters),
  httpMessage: () => useSampleStore((state) => state.httpMessage),
  processMessage: () => useSampleStore((state) => state.processMessage),
  sendMode: () => useSampleStore((state) => state.sendMode),
  remoteNode: () => useSampleStore((state) => state.remoteNode),
  mismatchNode: () => useSampleStore((state) => state.mismatchNode),
  mismatchMessage: () => useSampleStore((state) => state.mismatchMessage),
  isSubmitting: () => useSampleStore((state) => state.isSubmitting),
  isHttpMismatchSubmitting: () => useSampleStore((state) => state.isHttpMismatchSubmitting),
  isMismatchSubmitting: () => useSampleStore((state) => state.isMismatchSubmitting),
  isLoading: () => useSampleStore((state) => state.isLoading),
  error: () => useSampleStore((state) => state.error),
  initialize: () => useSampleStore((state) => state.initialize),
  refresh: () => useSampleStore((state) => state.refresh),
  setHttpMessage: () => useSampleStore((state) => state.setHttpMessage),
  setProcessMessage: () => useSampleStore((state) => state.setProcessMessage),
  setSendMode: () => useSampleStore((state) => state.setSendMode),
  setRemoteNode: () => useSampleStore((state) => state.setRemoteNode),
  setMismatchNode: () => useSampleStore((state) => state.setMismatchNode),
  setMismatchMessage: () => useSampleStore((state) => state.setMismatchMessage),
  sendHttpPing: () => useSampleStore((state) => state.sendHttpPing),
  triggerHttpMismatch: () => useSampleStore((state) => state.triggerHttpMismatch),
  sendProcessMessage: () => useSampleStore((state) => state.sendProcessMessage),
  triggerMismatch: () => useSampleStore((state) => state.triggerMismatch),
  clearError: () => useSampleStore((state) => state.clearError),
};
