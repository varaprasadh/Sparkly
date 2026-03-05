/// <reference types="chrome"/>

// ── Open links in new tab feature ────────────────────────────────────────────

const SETTINGS_KEY = 'settings:general';

function handleLinkClick(e: MouseEvent): void {
  const anchor = (e.target as Element).closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('javascript:') || href.startsWith('#') || href === '') return;
  if (anchor.target === '_blank' || anchor.target === '_self') return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  e.stopPropagation();
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
}

function applyLinkSetting(enabled: boolean): void {
  if (enabled) {
    document.addEventListener('click', handleLinkClick, true);
  } else {
    document.removeEventListener('click', handleLinkClick, true);
  }
}

chrome.storage.local.get(SETTINGS_KEY, (result) => {
  const general = result[SETTINGS_KEY] as { openLinksInNewTab?: boolean } | undefined;
  applyLinkSetting(!!general?.openLinksInNewTab);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[SETTINGS_KEY]) return;
  const newValue = changes[SETTINGS_KEY].newValue as { openLinksInNewTab?: boolean } | undefined;
  applyLinkSetting(!!newValue?.openLinksInNewTab);
});

// ── Page AI Chat ──────────────────────────────────────────────────────────────

function getPageText(): string {
  const article = document.querySelector('article') || document.querySelector('main') || document.body;
  const clone = article.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script,style,nav,header,footer,aside,[role="navigation"]').forEach((el) => el.remove());
  return clone.innerText.replace(/\s+/g, ' ').trim().slice(0, 6000);
}

// Build shadow DOM panel to avoid CSS conflicts
function createPanel(): { host: HTMLElement; panel: HTMLElement; log: HTMLElement; input: HTMLInputElement; sendBtn: HTMLButtonElement; statusEl: HTMLElement; summarizeBtn: HTMLButtonElement } {
  const host = document.createElement('div');
  host.id = 'sparkly-ai-host';
  Object.assign(host.style, { position: 'fixed', bottom: '80px', right: '20px', zIndex: '2147483647', fontFamily: 'system-ui, sans-serif' });

  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    .panel { width: 360px; height: 480px; background: #1a1a2e; border-radius: 16px; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .header { padding: 14px 16px; background: #16213e; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .title { color: #fff; font-size: 14px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 10px; padding: 2px 7px; border-radius: 10px; background: #3b82f6; color: #fff; font-weight: 500; }
    .close { background: none; border: none; color: rgba(255,255,255,0.5); font-size: 18px; cursor: pointer; padding: 0; line-height: 1; }
    .close:hover { color: #fff; }
    .status { padding: 8px 16px; font-size: 11px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.03); min-height: 30px; display: flex; align-items: center; gap: 6px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: pulse 1.2s infinite; flex-shrink: 0; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .log { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
    .log::-webkit-scrollbar { width: 4px; } .log::-webkit-scrollbar-track { background: transparent; } .log::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
    .msg { max-width: 90%; padding: 10px 13px; border-radius: 12px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
    .msg.user { align-self: flex-end; background: #3b82f6; color: #fff; border-bottom-right-radius: 4px; }
    .msg.ai { align-self: flex-start; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); border-bottom-left-radius: 4px; }
    .msg.system { align-self: center; color: rgba(255,255,255,0.4); font-size: 11px; background: none; padding: 4px; text-align: center; }
    .footer { padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 8px; }
    .input { flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 9px 14px; color: #fff; font-size: 13px; outline: none; }
    .input::placeholder { color: rgba(255,255,255,0.3); }
    .input:focus { border-color: rgba(59,130,246,0.5); }
    .send { background: #3b82f6; border: none; border-radius: 50%; width: 36px; height: 36px; color: #fff; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s; }
    .send:hover { background: #2563eb; }
    .send:disabled { background: rgba(255,255,255,0.1); cursor: not-allowed; }
    .summarize-btn { width: 100%; padding: 9px; background: rgba(59,130,246,0.15); border: 1px dashed rgba(59,130,246,0.4); border-radius: 10px; color: #93c5fd; font-size: 12px; cursor: pointer; margin-bottom: 8px; transition: background 0.2s; }
    .summarize-btn:hover { background: rgba(59,130,246,0.25); }
  `;

  const panel = document.createElement('div');
  panel.className = 'panel';

  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `<span class="title">✦ Sparkly AI <span class="badge">BETA</span></span>`;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.textContent = '×';
  header.appendChild(closeBtn);

  const statusEl = document.createElement('div');
  statusEl.className = 'status';

  const log = document.createElement('div');
  log.className = 'log';

  const summarizeBtn = document.createElement('button');
  summarizeBtn.className = 'summarize-btn';
  summarizeBtn.textContent = '⚡ Summarize this page';

  const footer = document.createElement('div');
  footer.className = 'footer';
  const input = document.createElement('input') as HTMLInputElement;
  input.className = 'input';
  input.placeholder = 'Ask about this page…';
  const sendBtn = document.createElement('button') as HTMLButtonElement;
  sendBtn.className = 'send';
  sendBtn.textContent = '↑';
  footer.append(input, sendBtn);

  panel.append(header, statusEl, log, footer);
  shadow.append(style, panel);

  // Insert summarize button as first log item helper
  log.appendChild(summarizeBtn);

  closeBtn.addEventListener('click', () => { host.remove(); fab.style.display = 'flex'; });

  return { host, panel, log, input, sendBtn, statusEl, summarizeBtn };
}

// Floating action button
const fab = document.createElement('button');
fab.id = 'sparkly-ai-fab';
Object.assign(fab.style, {
  position: 'fixed', bottom: '20px', right: '20px', zIndex: '2147483647',
  width: '48px', height: '48px', borderRadius: '50%',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', color: '#fff', transition: 'transform 0.2s',
});
fab.title = 'Sparkly AI';
fab.textContent = '✦';
fab.addEventListener('mouseenter', () => { fab.style.transform = 'scale(1.1)'; });
fab.addEventListener('mouseleave', () => { fab.style.transform = 'scale(1)'; });

document.addEventListener('DOMContentLoaded', () => document.body.appendChild(fab), { once: true });
if (document.readyState !== 'loading') document.body?.appendChild(fab);

// ── State ─────────────────────────────────────────────────────────────────────

let panelElements: ReturnType<typeof createPanel> | null = null;
let modelReady = false;
let busy = false;
const pageContext = { text: '' };

function setStatus(msg: string, animate = false): void {
  if (!panelElements) return;
  panelElements.statusEl.innerHTML = animate
    ? `<span class="dot"></span>${msg}`
    : `<span style="color:rgba(255,255,255,0.4)">${msg}</span>`;
}

function addMessage(role: 'user' | 'ai' | 'system', text: string): void {
  if (!panelElements) return;
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  panelElements.log.appendChild(el);
  panelElements.log.scrollTop = panelElements.log.scrollHeight;
}

function setSendEnabled(enabled: boolean): void {
  if (!panelElements) return;
  panelElements.sendBtn.disabled = !enabled;
  panelElements.input.disabled = !enabled;
}

// Conversation history
let chatHistory: { role: string; content: string }[] = [];

function buildMessages(userQuery: string): { role: string; content: string }[] {
  const systemPrompt = pageContext.text
    ? `You are a helpful assistant. Answer questions based on the following page content. Be concise.\n\nPAGE CONTENT:\n${pageContext.text}`
    : 'You are a helpful assistant. Be concise.';

  return [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userQuery },
  ];
}

function sendQuery(query: string): void {
  if (busy || !modelReady) return;
  busy = true;
  setSendEnabled(false);
  addMessage('user', query);
  chatHistory.push({ role: 'user', content: query });
  setStatus('Thinking…', true);

  const requestId = `req_${Date.now()}`;
  chrome.runtime.sendMessage({
    type: 'AI_INFER',
    requestId,
    messages: buildMessages(query),
  });
}

// ── Open panel ────────────────────────────────────────────────────────────────

fab.addEventListener('click', () => {
  fab.style.display = 'none';

  if (!panelElements) {
    panelElements = createPanel();
    document.body.appendChild(panelElements.host);

    // Summarize button
    panelElements.summarizeBtn.addEventListener('click', () => {
      if (!modelReady) { setStatus('Model not ready yet', false); return; }
      sendQuery('Please summarize this page in a few bullet points.');
    });

    // Send button / Enter key
    panelElements.sendBtn.addEventListener('click', () => {
      const q = panelElements!.input.value.trim();
      if (!q) return;
      panelElements!.input.value = '';
      sendQuery(q);
    });
    panelElements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const q = panelElements!.input.value.trim();
        if (!q) return;
        panelElements!.input.value = '';
        sendQuery(q);
      }
    });

    // Capture page text once
    pageContext.text = getPageText();

    // Start loading model
    setStatus('Checking compatibility…', true);
    setSendEnabled(false);
    chrome.runtime.sendMessage({ type: 'AI_LOAD_MODEL' });
  } else {
    panelElements.host.style.display = 'block';
  }
});

// ── Incoming messages from background ────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'AI_COMPAT_RESULT': {
      if (!message.supported) {
        setStatus('Not supported on this device', false);
      }
      break;
    }
    case 'AI_STATUS': {
      if (message.status === 'ready') {
        modelReady = true;
        setSendEnabled(true);
        setStatus(`Ready (${message.backend?.toUpperCase() ?? 'loaded'})`, false);
        if (!chatHistory.length) addMessage('system', 'Model loaded. Ask anything about this page.');
      } else if (message.status === 'downloading') {
        setStatus(message.message || 'Loading…', true);
      } else if (message.status === 'thinking') {
        setStatus('Thinking…', true);
      } else if (message.status === 'error') {
        modelReady = false;
        setSendEnabled(false);
        setStatus(message.message || 'Failed to load model', false);
        addMessage('system', `⚠️ ${message.message || 'Model failed to load. Check Settings → Sparkly AI.'}`);
      }
      break;
    }
    case 'AI_RESULT': {
      busy = false;
      setSendEnabled(true);
      if (message.error) {
        addMessage('system', `Error: ${message.error}`);
        setStatus('Error — try again', false);
      } else {
        addMessage('ai', message.text);
        chatHistory.push({ role: 'assistant', content: message.text });
        setStatus('Ready', false);
      }
      break;
    }
  }
});
