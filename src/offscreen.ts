/**
 * Offscreen Document — AI Model Runner
 */

import { pipeline, TextGenerationPipeline, env } from '@huggingface/transformers';

env.allowRemoteModels = true;
env.allowLocalModels = false;

// Point ONNX runtime to locally bundled WASM files (avoids CSP CDN blocks)
const extBase = chrome.runtime.getURL('');
(env.backends as any).onnx.wasm.wasmPaths = extBase;

const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct';

type BackendType = 'webgpu' | 'wasm';

interface CompatibilityResult {
  supported: boolean;
  backend: BackendType;
  reason?: string;
}

let pipe: TextGenerationPipeline | null = null;
let currentBackend: BackendType | null = null;
let isLoading = false;

// ── Safe message sender — never throws ───────────────────────────────────────

function send(type: string, payload: Record<string, unknown> = {}): void {
  try {
    chrome.runtime.sendMessage({ type, ...payload }, () => {
      void chrome.runtime.lastError; // suppress "no receiver" errors
    });
  } catch (_) {
    // background may be sleeping; ignore
  }
}

// ── Compatibility check ───────────────────────────────────────────────────────

async function checkCompatibility(): Promise<CompatibilityResult> {
  if (!(navigator as any).gpu) {
    return { supported: true, backend: 'wasm', reason: 'WebGPU not available — using CPU (WASM) fallback' };
  }
  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return { supported: true, backend: 'wasm', reason: 'No GPU adapter found — using CPU fallback' };
    }
    return { supported: true, backend: 'webgpu' };
  } catch {
    return { supported: true, backend: 'wasm', reason: 'WebGPU unavailable — using CPU fallback' };
  }
}

// ── Load model ────────────────────────────────────────────────────────────────

let lastProgressPct = -1;

async function loadModel(backend: BackendType): Promise<void> {
  if (isLoading) return;
  if (pipe && currentBackend === backend) {
    send('AI_STATUS', { status: 'ready', message: 'Model already loaded', backend });
    return;
  }

  isLoading = true;
  lastProgressPct = -1;
  send('AI_STATUS', { status: 'downloading', message: 'Starting download (~360 MB, cached after first run)…', progress: 0 });

  try {
    pipe = (await (pipeline as any)('text-generation', MODEL_ID, {
      device: backend,
      dtype: 'q4', // q4 works for both webgpu and wasm
      progress_callback: (progress: { status: string; progress?: number; file?: string }) => {
        if (progress.status === 'progress' && progress.progress !== undefined) {
          const pct = Math.round(progress.progress);
          if (pct !== lastProgressPct) { // debounce identical values
            lastProgressPct = pct;
            send('AI_STATUS', {
              status: 'downloading',
              message: `Downloading… ${pct}%`,
              progress: pct,
            });
          }
        } else if (progress.status === 'initiate') {
          send('AI_STATUS', { status: 'downloading', message: `Fetching ${progress.file ?? 'model files'}…`, progress: 0 });
        }
      },
    })) as TextGenerationPipeline;

    currentBackend = backend;
    send('AI_STATUS', { status: 'ready', message: `Model ready (${backend.toUpperCase()})`, backend });
  } catch (err) {
    pipe = null;
    currentBackend = null;
    const msg = err instanceof Error ? err.message : String(err);
    send('AI_STATUS', { status: 'error', message: `Failed to load model: ${msg}` });
  } finally {
    isLoading = false;
  }
}

// ── Run inference ─────────────────────────────────────────────────────────────

async function runInference(requestId: string, messages: { role: string; content: string }[]): Promise<void> {
  if (!pipe) {
    send('AI_RESULT', { requestId, error: 'Model not loaded — please download it in Settings → Sparkly AI' });
    return;
  }

  try {
    const result = await (pipe as any)(messages, {
      max_new_tokens: 512,
      temperature: 0.3,
      do_sample: true,
      return_full_text: false,
    });

    const output = (result as Array<{ generated_text: unknown }>)[0]?.generated_text;
    const text = Array.isArray(output)
      ? (output[output.length - 1] as { content: string })?.content?.trim() ?? ''
      : String(output ?? '').trim();

    send('AI_RESULT', { requestId, text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    send('AI_RESULT', { requestId, error: `Inference failed: ${msg}` });
  }
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function isModelCached(): Promise<boolean> {
  try {
    const keys = await caches.keys();
    return keys.length > 0;
  } catch {
    return false;
  }
}

async function deleteModelCache(): Promise<void> {
  pipe = null;
  currentBackend = null;
  isLoading = false;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch (_) {}
  send('AI_DELETE_RESULT', { ok: true });
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'AI_GET_STATUS':
      Promise.all([checkCompatibility(), isModelCached()]).then(([compat, modelCached]) => {
        send('AI_STATUS_RESULT', { compat, modelCached } as unknown as Record<string, unknown>);
      }).catch(() => {});
      break;

    case 'AI_LOAD_MODEL':
      if (!isLoading) {
        checkCompatibility().then((c) => loadModel(c.backend)).catch((err) => {
          send('AI_STATUS', { status: 'error', message: String(err) });
        });
      }
      break;

    case 'AI_INFER':
      runInference(message.requestId, message.messages);
      break;

    case 'AI_DELETE_MODEL':
      deleteModelCache().catch(() => send('AI_DELETE_RESULT', { ok: false }));
      break;
  }
});
