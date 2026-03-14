// options/options.js - BlurShield options page logic

const CATEGORIES = [
  { id: 'azure', label: 'Azure', desc: 'GUIDs, subscription paths, keys, SAS tokens' },
  { id: 'aws', label: 'AWS', desc: 'ARNs, access keys' },
  { id: 'gcp', label: 'GCP', desc: 'Service account emails' },
  { id: 'openai', label: 'OpenAI', desc: 'API keys, org IDs' },
  { id: 'anthropic', label: 'Anthropic', desc: 'API keys' },
  { id: 'emails', label: 'Emails', desc: 'Email addresses' },
  { id: 'ipaddresses', label: 'IP Addresses', desc: 'IPv4 addresses' },
  { id: 'apikeys', label: 'API Keys', desc: 'API key assignments, tokens, secrets, passwords' },
  { id: 'phones', label: 'Phone Numbers', desc: 'US, AU, international phone and mobile numbers' },
  { id: 'addresses', label: 'Addresses', desc: 'Street addresses, PO boxes' },
  { id: 'creditcards', label: 'Credit Cards', desc: 'Card numbers, masked displays (Visa ••••1234), last 4 digits' },
  { id: 'custom', label: 'Custom', desc: 'Your custom keywords and regex patterns' }
];

const VALID_HOSTNAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
const ALLOWED_STORAGE_KEYS = new Set([
  'enabled', 'enabledCategories', 'siteConfigs', 'bypassSites',
  'personalInfo', 'customPatterns', 'preferences'
]);
const MAX_REGEX_LENGTH = 500;
const MAX_CUSTOM_PATTERNS = 200;
const MAX_PERSONAL_ENTRIES = 100;
const MAX_IMPORT_SIZE = 1024 * 1024; // 1MB
const VALID_CATEGORY_IDS = new Set(CATEGORIES.map(c => c.id));

let statusTimer = null;

function showStatus(msg) {
  const el = document.getElementById('statusMessage');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

async function loadAll() {
  const data = await chrome.storage.local.get(null);
  loadPersonalInfo(data.personalInfo || { emails: [], ips: [] });
  loadCustomPatterns(data.customPatterns || []);
  loadSites(data.siteConfigs || {});
  loadBypassList(data.bypassSites || []);
  loadCategories(data.enabledCategories || {});
  loadPreferences(data.preferences || { blurIntensity: 8, revealOnHover: false });
}

// --- Personal Info ---

function loadPersonalInfo(info) {
  document.getElementById('personalEmails').value = (info.emails || []).join('\n');
  document.getElementById('personalIPs').value = (info.ips || []).join('\n');
}

document.getElementById('savePersonalInfo').addEventListener('click', async () => {
  const emails = document.getElementById('personalEmails').value
    .split('\n').map(s => s.trim()).filter(s => s && s.length < 254).slice(0, MAX_PERSONAL_ENTRIES);
  const ips = document.getElementById('personalIPs').value
    .split('\n').map(s => s.trim()).filter(s => s && s.length < 46).slice(0, MAX_PERSONAL_ENTRIES);
  await chrome.storage.local.set({ personalInfo: { emails, ips } });
  const msg = (emails.length === MAX_PERSONAL_ENTRIES || ips.length === MAX_PERSONAL_ENTRIES)
    ? 'Personal info saved (max ' + MAX_PERSONAL_ENTRIES + ' entries per field)'
    : 'Personal info saved';
  showStatus(msg);
});

// --- Custom Patterns ---

function loadCustomPatterns(patterns) {
  const list = document.getElementById('customPatternsList');
  while (list.firstChild) list.removeChild(list.firstChild);

  for (const p of patterns) {
    const item = document.createElement('div');
    item.className = 'pattern-item';

    const info = document.createElement('div');
    info.className = 'pattern-info';

    const label = document.createElement('span');
    label.textContent = p.label || p.value;

    const type = document.createElement('span');
    type.className = 'pattern-type';
    type.textContent = ' (' + p.type + ')';

    info.appendChild(label);
    info.appendChild(type);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', () => removeCustomPattern(p.id));

    item.appendChild(info);
    item.appendChild(removeBtn);
    list.appendChild(item);
  }
}

document.getElementById('addPattern').addEventListener('click', async () => {
  const type = document.getElementById('newPatternType').value;
  const value = document.getElementById('newPatternValue').value.trim();
  const label = document.getElementById('newPatternLabel').value.trim();

  if (!value) return;

  // Validate regex
  if (type === 'regex') {
    if (value.length > MAX_REGEX_LENGTH) {
      showStatus('Pattern too long (max ' + MAX_REGEX_LENGTH + ' characters)');
      return;
    }
    try {
      new RegExp(value);
    } catch {
      showStatus('Invalid regex pattern');
      return;
    }
    // Reject patterns with nested quantifiers (ReDoS risk)
    if (/[+*}]\s*\)\s*[+*?{]/.test(value)) {
      showStatus('Pattern rejected: nested quantifiers are not allowed (performance risk)');
      return;
    }
  }

  const data = await chrome.storage.local.get('customPatterns');
  const patterns = data.customPatterns || [];
  if (patterns.length >= MAX_CUSTOM_PATTERNS) {
    showStatus('Maximum of ' + MAX_CUSTOM_PATTERNS + ' custom patterns reached');
    return;
  }
  patterns.push({
    id: Date.now().toString(36),
    type,
    value,
    label: label || value,
    flags: 'gi'
  });
  await chrome.storage.local.set({ customPatterns: patterns });

  document.getElementById('newPatternValue').value = '';
  document.getElementById('newPatternLabel').value = '';
  loadCustomPatterns(patterns);
  showStatus('Pattern added');
});

async function removeCustomPattern(id) {
  const data = await chrome.storage.local.get('customPatterns');
  const patterns = (data.customPatterns || []).filter(p => p.id !== id);
  await chrome.storage.local.set({ customPatterns: patterns });
  loadCustomPatterns(patterns);
  showStatus('Pattern removed');
}

// --- Site Management ---

function loadSites(siteConfigs) {
  const list = document.getElementById('siteList');
  while (list.firstChild) list.removeChild(list.firstChild);

  for (const [host, config] of Object.entries(siteConfigs)) {
    const item = document.createElement('div');
    item.className = 'site-item';

    const info = document.createElement('span');
    info.className = 'site-info';
    info.textContent = host + (config.enabled ? '' : ' (disabled)');

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', () => removeSite(host));

    item.appendChild(info);
    item.appendChild(removeBtn);
    list.appendChild(item);
  }
}

document.getElementById('addSite').addEventListener('click', async () => {
  const host = document.getElementById('newSiteHost').value.trim().toLowerCase();
  if (!host) return;
  if (!VALID_HOSTNAME.test(host) || host.length > 253) {
    showStatus('Invalid hostname');
    return;
  }

  const data = await chrome.storage.local.get('siteConfigs');
  const siteConfigs = data.siteConfigs || {};
  siteConfigs[host] = { enabled: true };
  await chrome.storage.local.set({ siteConfigs });

  document.getElementById('newSiteHost').value = '';
  loadSites(siteConfigs);
  showStatus('Site added');
});

async function removeSite(host) {
  const data = await chrome.storage.local.get('siteConfigs');
  const siteConfigs = data.siteConfigs || {};
  delete siteConfigs[host];
  await chrome.storage.local.set({ siteConfigs });
  loadSites(siteConfigs);
  showStatus('Site removed');
}

// --- Bypass List ---

function loadBypassList(bypassSites) {
  const list = document.getElementById('bypassList');
  while (list.firstChild) list.removeChild(list.firstChild);

  for (const site of bypassSites) {
    const item = document.createElement('div');
    item.className = 'site-item';

    const info = document.createElement('span');
    info.className = 'site-info';
    info.textContent = site;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', () => removeBypass(site));

    item.appendChild(info);
    item.appendChild(removeBtn);
    list.appendChild(item);
  }
}

document.getElementById('addBypass').addEventListener('click', async () => {
  const site = document.getElementById('newBypassSite').value.trim().toLowerCase();
  if (!site) return;
  if (!VALID_HOSTNAME.test(site) || site.length > 253) {
    showStatus('Invalid hostname');
    return;
  }

  const data = await chrome.storage.local.get('bypassSites');
  const bypassSites = data.bypassSites || [];
  if (!bypassSites.includes(site)) {
    bypassSites.push(site);
  }
  await chrome.storage.local.set({ bypassSites });

  document.getElementById('newBypassSite').value = '';
  loadBypassList(bypassSites);
  showStatus('Bypass site added');
});

async function removeBypass(site) {
  const data = await chrome.storage.local.get('bypassSites');
  const bypassSites = (data.bypassSites || []).filter(s => s !== site);
  await chrome.storage.local.set({ bypassSites });
  loadBypassList(bypassSites);
  showStatus('Bypass site removed');
}

// --- Categories ---

function loadCategories(enabledCategories) {
  const container = document.getElementById('categoryDetails');
  while (container.firstChild) container.removeChild(container.firstChild);

  for (const cat of CATEGORIES) {
    const item = document.createElement('div');
    item.className = 'category-detail-item';

    const left = document.createElement('div');
    const catLabel = document.createElement('span');
    catLabel.className = 'cat-label';
    catLabel.textContent = cat.label;
    const catDesc = document.createElement('div');
    catDesc.className = 'description';
    catDesc.textContent = cat.desc;
    catDesc.style.marginBottom = '0';
    left.appendChild(catLabel);
    left.appendChild(catDesc);

    const toggle = document.createElement('label');
    toggle.className = 'toggle-small';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = enabledCategories[cat.id] !== false;
    input.addEventListener('change', async () => {
      const data = await chrome.storage.local.get('enabledCategories');
      const cats = data.enabledCategories || {};
      cats[cat.id] = input.checked;
      await chrome.storage.local.set({ enabledCategories: cats });
    });
    const slider = document.createElement('span');
    slider.className = 'slider';
    toggle.appendChild(input);
    toggle.appendChild(slider);

    item.appendChild(left);
    item.appendChild(toggle);
    container.appendChild(item);
  }
}

// --- Preferences ---

function loadPreferences(prefs) {
  const blur = document.getElementById('blurIntensity');
  const blurVal = document.getElementById('blurValue');
  blur.value = prefs.blurIntensity || 8;
  blurVal.textContent = blur.value;
  blur.addEventListener('input', () => {
    blurVal.textContent = blur.value;
  });
  document.getElementById('revealOnHover').checked = prefs.revealOnHover || false;
}

document.getElementById('savePreferences').addEventListener('click', async () => {
  const prefs = {
    blurIntensity: parseInt(document.getElementById('blurIntensity').value, 10),
    revealOnHover: document.getElementById('revealOnHover').checked
  };
  await chrome.storage.local.set({ preferences: prefs });
  showStatus('Preferences saved');
});

// --- Import / Export ---

document.getElementById('exportSettings').addEventListener('click', async () => {
  const data = await chrome.storage.local.get([...ALLOWED_STORAGE_KEYS]);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'blurshield-settings.json';
  a.click();
  URL.revokeObjectURL(url);
  showStatus('Settings exported');
});

document.getElementById('importSettingsBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > MAX_IMPORT_SIZE) {
    showStatus('Import file too large (max 1MB)');
    e.target.value = '';
    return;
  }

  const text = await file.text();
  try {
    const raw = JSON.parse(text);
    const data = validateImport(raw);
    if (!data) {
      showStatus('Import rejected: invalid settings format');
    } else {
      await chrome.storage.local.set(data);
      showStatus('Settings imported');
      loadAll();
    }
  } catch {
    showStatus('Invalid JSON file');
  }
  e.target.value = '';
});

function validateImport(raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;

  const clean = {};

  // Only allow known keys
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_STORAGE_KEYS.has(key)) continue;
    clean[key] = raw[key];
  }

  // Validate enabled
  if ('enabled' in clean && typeof clean.enabled !== 'boolean') return null;

  // Validate enabledCategories
  if ('enabledCategories' in clean) {
    if (typeof clean.enabledCategories !== 'object' || clean.enabledCategories === null) return null;
    const safeCats = {};
    for (const [k, v] of Object.entries(clean.enabledCategories)) {
      if (typeof v !== 'boolean') return null;
      if (VALID_CATEGORY_IDS.has(k)) {
        safeCats[k] = v;
      }
    }
    clean.enabledCategories = safeCats;
  }

  // Validate bypassSites
  if ('bypassSites' in clean) {
    if (!Array.isArray(clean.bypassSites)) return null;
    clean.bypassSites = clean.bypassSites.filter(
      s => typeof s === 'string' && VALID_HOSTNAME.test(s) && s.length <= 253
    );
  }

  // Validate siteConfigs
  if ('siteConfigs' in clean) {
    if (typeof clean.siteConfigs !== 'object' || clean.siteConfigs === null) return null;
    const safeSites = Object.create(null);
    for (const [host, config] of Object.entries(clean.siteConfigs)) {
      if (VALID_HOSTNAME.test(host) && host.length <= 253 && typeof config === 'object' && config !== null) {
        safeSites[host] = { enabled: Boolean(config.enabled) };
      }
    }
    clean.siteConfigs = safeSites;
  }

  // Validate personalInfo
  if ('personalInfo' in clean) {
    if (typeof clean.personalInfo !== 'object' || clean.personalInfo === null) return null;
    clean.personalInfo = {
      emails: Array.isArray(clean.personalInfo.emails)
        ? clean.personalInfo.emails.filter(e => typeof e === 'string' && e.length < 254).slice(0, MAX_PERSONAL_ENTRIES)
        : [],
      ips: Array.isArray(clean.personalInfo.ips)
        ? clean.personalInfo.ips.filter(ip => typeof ip === 'string' && ip.length < 46).slice(0, MAX_PERSONAL_ENTRIES)
        : []
    };
  }

  // Validate customPatterns
  if ('customPatterns' in clean) {
    if (!Array.isArray(clean.customPatterns)) return null;
    clean.customPatterns = clean.customPatterns.filter(p => {
      if (typeof p !== 'object' || p === null) return false;
      if (typeof p.value !== 'string' || !p.value) return false;
      if (p.type !== 'keyword' && p.type !== 'regex') return false;
      if (p.flags !== undefined && (typeof p.flags !== 'string' || !/^[gimsuy]*$/.test(p.flags))) return false;
      if (p.type === 'regex') {
        if (p.value.length > MAX_REGEX_LENGTH) return false;
        try { new RegExp(p.value); } catch { return false; }
        // Reject nested quantifiers (ReDoS risk)
        if (/[+*}]\s*\)\s*[+*?{]/.test(p.value)) return false;
      }
      return true;
    }).slice(0, MAX_CUSTOM_PATTERNS);
  }

  // Validate preferences
  if ('preferences' in clean) {
    if (typeof clean.preferences !== 'object' || clean.preferences === null) return null;
    clean.preferences = {
      blurIntensity: Math.max(2, Math.min(20, parseInt(clean.preferences.blurIntensity, 10) || 8)),
      revealOnHover: Boolean(clean.preferences.revealOnHover)
    };
  }

  return clean;
}

// Init
loadAll();
