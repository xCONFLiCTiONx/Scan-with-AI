// popup.js

const GEMINI_MODEL_NAME = window.GeminiAnalyzer?.modelName || 'Gemini 3.5 Flash Lite';

function getStoredApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (syncResult) => {
      let key = syncResult?.gemini_api_key || syncResult?.geminiApiKey || syncResult?.apiKey;
      if (key) {
        resolve(key);
        return;
      }

      chrome.storage.local.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (localResult) => {
        key = localResult?.gemini_api_key || localResult?.geminiApiKey || localResult?.apiKey;
        resolve(key || '');
      });
    });
  });
}

let savedApiKey = '';

function setStatusMessage(message, color = '#9aa0a6') {
  statusMsg.textContent = message;
  statusMsg.style.color = color;
}

function setApiKeySaveStatus(isSaved, message) {
  apiKeySaveStatus.textContent = message;
  apiKeySaveStatus.style.color = isSaved ? '#81c995' : '#f28b82';
}

function updateSaveButtonLabel() {
  saveBtn.textContent = savedApiKey ? 'Update API Key' : 'Save API Key';
}

function updateSavedKeyInfo() {
  if (savedApiKey) {
    const masked = '•'.repeat(8);
    savedKeyLabel.textContent = `Saved API key: ${masked}`;
    removeKeyBtn.style.display = 'inline-flex';
  } else {
    savedKeyLabel.textContent = 'No API key saved.';
    removeKeyBtn.style.display = 'none';
  }
  updateSaveButtonLabel();
}

function showStartView() {
  startView.style.display = 'block';
  responseView.style.display = 'none';
}

function parseMarkdown(text) {
  const escaped = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  const withCodeBlocks = escaped.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (_, code) => {
    const safeCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    codeBlocks.push(`<pre style="background: #181818; color: #d4d4d4; padding: 12px 14px; border-radius: 10px; overflow-x: auto; font-size: 12.5px; line-height: 1.5; margin: 12px 0;"><code>${safeCode}</code></pre>`);
    return `@@CODE_BLOCK_${codeBlocks.length - 1}@@`;
  });

  let html = withCodeBlocks
    .replace(/^#### (.*)$/gim, '<h4 style="color: #8ab4f8; margin-top: 14px; margin-bottom: 6px; font-size: 15px; font-weight: 600;">$1</h4>')
    .replace(/^### (.*)$/gim, '<h3 style="color: #8ab4f8; margin-top: 16px; margin-bottom: 8px; font-size: 16px;">$1</h3>')
    .replace(/^## (.*)$/gim, '<h2 style="color: #8ab4f8; margin-top: 20px; margin-bottom: 10px; font-size: 17px;">$1</h2>')
    .replace(/^# (.*)$/gim, '<h1 style="color: #ffffff; margin-top: 22px; margin-bottom: 12px; font-size: 18px;">$1</h1>')
    .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid #333333; margin: 16px 0;">')
    .replace(/\*\*([^\*]+)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
    .replace(/__([^_]+)__/g, '<strong style="color: #ffffff;">$1</strong>')
    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: #2d2d2d; padding: 2px 5px; border-radius: 4px; font-family: monospace; color: #f28b82;">$1</code>')
    .replace(/^\s*[-\*]\s+(.*)$/gm, '<li style="margin-bottom: 6px; margin-left: 18px;">$1</li>');

  html = html.replace(/(<li style="margin-bottom: 6px; margin-left: 18px;">[\s\S]*?<\/li>)(\s*<li style="margin-bottom: 6px; margin-left: 18px;">[\s\S]*?<\/li>)+/g, (list) => {
    const items = list.replace(/<li style="margin-bottom: 6px; margin-left: 18px;">/g, '<li>').replace(/<\/li>/g, '</li>');
    return `<ul style="padding-left: 20px; margin: 10px 0; color: #e0e0e0;">${items}</ul>`;
  });

  html = html.split(/\n\s*\n/).map((chunk) => {
    if (/^<h[1-4]|^<hr|^<ul|^@\@CODE_BLOCK_\d+@@/.test(chunk.trim())) {
      return chunk;
    }
    return `<p style="margin: 10px 0; line-height: 1.7;">${chunk.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  codeBlocks.forEach((block, index) => {
    html = html.replace(`@@CODE_BLOCK_${index}@@`, block);
  });

  return html;
}

function showResponseView(responseText) {
  responseContent.innerHTML = parseMarkdown(responseText);
  startView.style.display = 'none';
  responseView.style.display = 'block';
}

function sanitizeText(text) {
  return String(text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getTextFromPage() {
  const depth = scanDepthSelect.value;
  const cap = parseInt(charCapInput.value, 10) || 20000;
  const isDeep = deepScanToggle.checked;

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        resolve('');
        return;
      }

      const unsupported = tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'));
      if (unsupported) {
        resolve(null);
        return;
      }

      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async (depth, cap, isDeep) => {
            function pruneHtml(doc) {
              const tagsToRemove = ['script', 'style', 'noscript', 'iframe', 'svg', 'path', 'canvas', 'footer', 'header', 'nav'];
              tagsToRemove.forEach(tag => {
                const elements = doc.querySelectorAll(tag);
                elements.forEach(el => el.remove());
              });
              return doc.documentElement.outerHTML;
            }

            async function captureDeep() {
              const scrollable = document.querySelector('div[role="main"]') || document.body;
              let fullText = "";
              let lastHeight = 0;
              let attempts = 0;
              const maxAttempts = 15;

              while (attempts < maxAttempts) {
                const currentText = scrollable.innerText;
                if (!fullText.includes(currentText.substring(0, 100))) {
                   fullText = currentText + "\n\n" + fullText;
                }

                scrollable.scrollTop = 0; // Scroll to top to trigger loading older messages
                window.scrollBy(0, -1000);

                await new Promise(r => setTimeout(r, 1200));

                const newHeight = scrollable.scrollHeight;
                if (newHeight === lastHeight) {
                  attempts++;
                } else {
                  attempts = 0;
                  lastHeight = newHeight;
                }
              }
              return fullText;
            }

            let text = "";
            if (isDeep) {
              text = await captureDeep();
            } else if (depth === 'backend') {
              const docClone = document.cloneNode(true);
              text = pruneHtml(docClone);
            } else {
              const mainRoot = document.querySelector('div[role="main"]') || document.body;
              text = mainRoot ? mainRoot.innerText.trim() : document.body.innerText.trim();
            }

            if (!isDeep && text.length > cap) {
              return text.substring(0, cap) + "\n\n[CONTENT TRUNCATED DUE TO CHARACTER CAP]";
            }
            return text;
          },
          args: [depth, cap, isDeep]
        });
        resolve(result?.result || '');
      } catch (error) {
        resolve('');
      }
    });
  });
}

async function updateUiState() {
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(['gemini_api_key', 'geminiApiKey', 'apiKey', 'scanDepth', 'charCap', 'customPrompt', 'smartDistill', 'deepScan'], (res) => {
      resolve(res);
    });
  });

  const apiKey = settings?.gemini_api_key || settings?.geminiApiKey || settings?.apiKey || '';
  savedApiKey = apiKey;
  apiKeyInput.value = '';

  // Update settings fields if they exist in storage
  if (settings.scanDepth) scanDepthSelect.value = settings.scanDepth;
  if (settings.charCap) charCapInput.value = settings.charCap;
  if (settings.customPrompt) customPromptInput.value = settings.customPrompt;
  if (settings.smartDistill !== undefined) smartDistillToggle.checked = settings.smartDistill;
  if (settings.deepScan !== undefined) deepScanToggle.checked = settings.deepScan;

  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0] || {};
  const unsupported = tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'));

  updateSavedKeyInfo();
  const inputValue = apiKeyInput.value.trim();
  const isSaved = Boolean(savedApiKey && (!inputValue || inputValue === savedApiKey));
  setApiKeySaveStatus(isSaved, isSaved ? 'API key saved.' : 'API key has not been saved.');

  apiVersion.textContent = apiKey ? `Using Gemini model: ${GEMINI_MODEL_NAME}` : '';
  apiVersion.style.display = apiKey ? 'block' : 'none';
  scanBtn.disabled = !apiKey || unsupported;
  saveBtn.disabled = true;

  if (unsupported) {
    setStatusMessage('This page is not supported.', '#f28b82');
  } else if (!apiKey) {
    setStatusMessage('Enter your Gemini API key to enable scanning.', '#9aa0a6');
  } else {
    setStatusMessage('');
  }
}


async function validateApiKey(key) {
  if (!key) {
    throw new Error('No API key provided.');
  }

  const payload = {
    contents: [{ parts: [{ text: 'Validate this Gemini API key and reply with OK.' }] }]
  };

  const response = await fetch(`${GeminiAnalyzer.endpoint}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('Gemini validation response was invalid.');
  }
}

async function saveApiKey() {
  const keyVal = apiKeyInput.value.trim();
  if (!keyVal) {
    setStatusMessage('Please enter a valid API key.', '#f28b82');
    return;
  }

  setStatusMessage('Validating Gemini API key…', '#9aa0a6');
  try {
    await validateApiKey(keyVal);
  } catch (error) {
    setStatusMessage(error.message || 'Gemini API key validation failed.', '#f28b82');
    return;
  }

  chrome.storage.sync.set({ gemini_api_key: keyVal, geminiApiKey: keyVal }, () => {
    chrome.storage.local.set({ gemini_api_key: keyVal, geminiApiKey: keyVal }, async () => {
      apiKeyInput.value = '';
      setStatusMessage('API key saved and verified!', '#81c995');
      await updateUiState();
      setTimeout(() => {
        if (startView.style.display !== 'none') {
          setStatusMessage('');
        }
      }, 2500);
    });
  });
}

async function scanPage() {
  setStatusMessage('Gathering page content…', '#9aa0a6');

  const pageText = await getTextFromPage();
  if (pageText === null) {
    setStatusMessage('This page is not supported.', '#f28b82');
    return;
  }

  if (!pageText) {
    setStatusMessage('Unable to read page content. Please try again on a regular webpage.', '#f28b82');
    return;
  }

  setStatusMessage('Analyzing page with Gemini…', '#9aa0a6');

  const customPrompt = customPromptInput.value.trim();
  const smartDistill = smartDistillToggle.checked;

  try {
    const analysisResult = await GeminiAnalyzer.analyze({
      rawEmail: pageText,
      fullPageText: pageText,
      customPrompt: customPrompt,
      smartDistill: smartDistill,
      onProgress: (msg) => setStatusMessage(msg, '#8ab4f8')
    });
    showResponseView(analysisResult);
    setStatusMessage('');
  } catch (error) {
    setStatusMessage(error.message || 'Gemini analysis failed.', '#f28b82');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  window.startView = document.getElementById('start-view');
  window.responseView = document.getElementById('response-view');
  window.apiKeyInput = document.getElementById('api-key-input');
  window.saveBtn = document.getElementById('save-btn');
  window.scanBtn = document.getElementById('scan-btn');
  window.apiKeySaveStatus = document.getElementById('api-key-save-status');
  window.savedKeyLabel = document.getElementById('saved-key-label');
  window.removeKeyBtn = document.getElementById('remove-key-btn');
  window.statusMsg = document.getElementById('status-msg');
  window.apiVersion = document.getElementById('api-version');
  window.responseContent = document.getElementById('response-content');
  window.backBtn = document.getElementById('back-btn');

  window.scanDepthSelect = document.getElementById('scan-depth');
  window.charCapInput = document.getElementById('char-cap');
  window.customPromptInput = document.getElementById('custom-prompt');
  window.smartDistillToggle = document.getElementById('smart-distill');
  window.deepScanToggle = document.getElementById('deep-scan');

  saveBtn.addEventListener('click', saveApiKey);
  scanBtn.addEventListener('click', scanPage);

  const saveSettings = () => {
    chrome.storage.sync.set({
      scanDepth: scanDepthSelect.value,
      charCap: charCapInput.value,
      customPrompt: customPromptInput.value,
      smartDistill: smartDistillToggle.checked,
      deepScan: deepScanToggle.checked
    });
  };

  scanDepthSelect.addEventListener('change', saveSettings);
  charCapInput.addEventListener('input', saveSettings);
  customPromptInput.addEventListener('input', saveSettings);
  smartDistillToggle.addEventListener('change', saveSettings);
  deepScanToggle.addEventListener('change', saveSettings);

  apiKeyInput.addEventListener('input', () => {
    const currentValue = apiKeyInput.value.trim();
    const isSaved = Boolean(savedApiKey && (!currentValue || currentValue === savedApiKey));
    setApiKeySaveStatus(isSaved, isSaved ? 'API key saved.' : 'API key has not been saved.');
    saveBtn.disabled = !currentValue;
    updateSaveButtonLabel();
  });
  removeKeyBtn.addEventListener('click', async () => {
    chrome.storage.sync.remove(['gemini_api_key', 'geminiApiKey', 'apiKey'], () => {
      chrome.storage.local.remove(['gemini_api_key', 'geminiApiKey', 'apiKey'], async () => {
        savedApiKey = '';
        apiKeyInput.value = '';
        updateSavedKeyInfo();
        await updateUiState();
        setStatusMessage('Saved API key removed.', '#81c995');
      });
    });
  });
  backBtn.addEventListener('click', () => {
    showStartView();
    updateUiState();
  });

  await updateUiState();
});