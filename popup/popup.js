// popup/popup.js - BlurShield popup logic

const CATEGORIES = [
  'azure', 'aws', 'gcp', 'openai', 'anthropic',
  'emails', 'ipaddresses', 'apikeys', 'phones', 'addresses', 'creditcards',
  'custom'
];

const CATEGORY_LABELS = {
  azure: 'Azure', aws: 'AWS', gcp: 'GCP', openai: 'OpenAI', anthropic: 'Anthropic',
  emails: 'Emails', ipaddresses: 'IP Addresses', apikeys: 'API Keys',
  phones: 'Phone Numbers', addresses: 'Addresses', creditcards: 'Credit Cards', custom: 'Custom'
};

const masterToggle = document.getElementById('masterToggle');
const siteToggle = document.getElementById('siteToggle');
const currentSiteEl = document.getElementById('currentSite');
const categoryListEl = document.getElementById('categoryList');
const maskedCountEl = document.getElementById('maskedCount');
const contentEl = document.getElementById('content');
const openOptionsEl = document.getElementById('openOptions');

let currentHostname = '';

async function init() {
  // Get current tab hostname
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      currentHostname = new URL(tab.url).hostname;
    } catch {
      currentHostname = '';
    }
  }
  currentSiteEl.textContent = currentHostname || 'N/A';

  const data = await chrome.storage.local.get(null);
  const enabled = data.enabled !== undefined ? data.enabled : true;
  const bypassSites = data.bypassSites || [];
  const enabledCategories = data.enabledCategories || {};

  // Master toggle
  masterToggle.checked = enabled;
  contentEl.classList.toggle('disabled', !enabled);

  // Site toggle - on means masking active (not bypassed), off means bypassed
  const isBypassed = bypassSites.some(site => currentHostname === site || currentHostname.endsWith('.' + site));
  siteToggle.checked = !isBypassed;

  // Category checkboxes
  buildCategoryList(enabledCategories);

  // Masked count
  updateMaskedCount(tab);

  // Event listeners
  masterToggle.addEventListener('change', onMasterToggle);
  siteToggle.addEventListener('change', onSiteToggle);
  openOptionsEl.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

function buildCategoryList(enabledCategories) {
  while (categoryListEl.firstChild) {
    categoryListEl.removeChild(categoryListEl.firstChild);
  }
  for (const cat of CATEGORIES) {
    const item = document.createElement('div');
    item.className = 'category-item';

    const label = document.createElement('label');
    label.textContent = CATEGORY_LABELS[cat] || cat;
    label.setAttribute('for', 'cat-' + cat);

    const toggle = document.createElement('label');
    toggle.className = 'toggle';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'cat-' + cat;
    input.checked = enabledCategories[cat] !== false;
    input.addEventListener('change', () => onCategoryToggle(cat, input.checked));

    const slider = document.createElement('span');
    slider.className = 'slider';

    toggle.appendChild(input);
    toggle.appendChild(slider);

    item.appendChild(label);
    item.appendChild(toggle);
    categoryListEl.appendChild(item);
  }
}

async function notifyContentScript() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    // Send to all frames in the tab (top frame + iframes)
    const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id }).catch(() => null);
    if (frames) {
      for (const frame of frames) {
        chrome.tabs.sendMessage(tab.id, { type: 'reinit' }, { frameId: frame.frameId }).catch(() => {});
      }
    } else {
      chrome.tabs.sendMessage(tab.id, { type: 'reinit' }).catch(() => {});
    }
  }
}

async function onMasterToggle() {
  const enabled = masterToggle.checked;
  await chrome.storage.local.set({ enabled });
  contentEl.classList.toggle('disabled', !enabled);
  await notifyContentScript();
}

async function onSiteToggle() {
  if (!currentHostname) return;
  const active = siteToggle.checked;
  const data = await chrome.storage.local.get('bypassSites');
  let bypassSites = data.bypassSites || [];
  if (active) {
    // Remove from bypass
    bypassSites = bypassSites.filter(site => site !== currentHostname);
  } else {
    // Add to bypass
    if (!bypassSites.includes(currentHostname)) {
      bypassSites.push(currentHostname);
    }
  }
  await chrome.storage.local.set({ bypassSites });
  await notifyContentScript();
}

async function onCategoryToggle(category, enabled) {
  const data = await chrome.storage.local.get('enabledCategories');
  const enabledCategories = data.enabledCategories || {};
  enabledCategories[category] = enabled;
  await chrome.storage.local.set({ enabledCategories });
  await notifyContentScript();
}

async function updateMaskedCount(tab) {
  if (!tab || !tab.id) return;
  try {
    chrome.tabs.sendMessage(tab.id, { type: 'getMaskedCount' }, (response) => {
      if (chrome.runtime.lastError) {
        maskedCountEl.textContent = '0 items masked';
        return;
      }
      const count = response ? response.count : 0;
      maskedCountEl.textContent = count + ' item' + (count !== 1 ? 's' : '') + ' masked';
    });
  } catch {
    maskedCountEl.textContent = '0 items masked';
  }
}

init();
