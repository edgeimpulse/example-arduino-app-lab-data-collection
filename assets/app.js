// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

const STORAGE_KEY = 'edge-impulse-data-collection';

const statusEl = document.querySelector('#connection-status');
const formEl = document.querySelector('#upload-form');
const apiKeyEl = document.querySelector('#api-key');
const categoryEl = document.querySelector('#category');
const labelEl = document.querySelector('#label');
const uploadBtn = document.querySelector('#upload-btn');
const resultEl = document.querySelector('#result-message');
const countEl = document.querySelector('#count');

let uploadCount = 0;

// Initialize UI
const ui = new WebUI();
ui.on_connect(onUIConnected);
ui.on_disconnect(onUIDisconnected);

restoreSettings();
formEl.addEventListener('submit', onSubmit);

// Called when the websocket connection is established.
function onUIConnected() {
  statusEl.textContent = 'Connected to the board';
  statusEl.className = 'status connected';
}

function onUIDisconnected() {
  statusEl.textContent = 'Disconnected from the board';
  statusEl.className = 'status disconnected';
}

function restoreSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.apiKey) apiKeyEl.value = saved.apiKey;
    if (saved.category) categoryEl.value = saved.category;
    if (saved.label) labelEl.value = saved.label;
  } catch (err) {
    console.warn('Could not restore saved settings', err);
  }
}

function saveSettings() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiKey: apiKeyEl.value.trim(),
      category: categoryEl.value,
      label: labelEl.value.trim(),
    })
  );
}

async function onSubmit(event) {
  event.preventDefault();
  saveSettings();

  uploadBtn.disabled = true;
  showResult('Uploading…', null);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKeyEl.value.trim(),
        category: categoryEl.value,
        label: labelEl.value.trim(),
      }),
    });
    const data = await response.json();

    if (response.ok && data.status === 'success') {
      uploadCount += 1;
      countEl.textContent = uploadCount;
      showResult(`Uploaded ${data.filename}`, true);
    } else {
      showResult(data.message || `Upload failed (HTTP ${response.status})`, false);
    }
  } catch (err) {
    showResult(`Upload failed: ${err.message}`, false);
  } finally {
    uploadBtn.disabled = false;
  }
}

function showResult(message, success) {
  resultEl.textContent = message;
  resultEl.className = 'result' + (success === true ? ' success' : success === false ? ' error' : '');
}

