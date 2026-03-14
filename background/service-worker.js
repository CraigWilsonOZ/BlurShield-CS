// background/service-worker.js - BlurShield MV3 service worker

const DEFAULTS = {
  enabled: true,
  enabledCategories: {
    azure: true,
    aws: true,
    gcp: true,
    openai: true,
    anthropic: true,
    emails: true,
    ipaddresses: true,
    apikeys: true,
    phones: true,
    addresses: true,
    creditcards: true,
    custom: true
  },
  siteConfigs: {
    'portal.azure.com': { enabled: true },
    'console.aws.amazon.com': { enabled: true },
    'console.cloud.google.com': { enabled: true }
  },
  bypassSites: [],
  personalInfo: {
    emails: [],
    ips: []
  },
  customPatterns: [],
  preferences: {
    blurIntensity: 8,
    revealOnHover: false
  }
};

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const existing = await chrome.storage.local.get(null);
    const toSet = {};
    for (const [key, value] of Object.entries(DEFAULTS)) {
      if (existing[key] === undefined) {
        toSet[key] = value;
      }
    }
    if (Object.keys(toSet).length > 0) {
      await chrome.storage.local.set(toSet);
    }
  }
  updateBadge();
});

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.enabled || changes.siteConfigs)) {
    updateBadge();
  }
});

async function updateBadge() {
  const data = await chrome.storage.local.get(['enabled']);
  const enabled = data.enabled !== undefined ? data.enabled : true;

  if (enabled) {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'BlurShield - Active' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#888' });
    chrome.action.setTitle({ title: 'BlurShield - Disabled' });
  }
}

// Initial badge state
updateBadge();
