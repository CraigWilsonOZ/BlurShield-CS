// shared/storage.js - BlurShield storage wrapper with defaults

const StorageDefaults = {
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

async function getStorage() {
  const data = await chrome.storage.local.get(null);
  const result = {};
  for (const key of Object.keys(StorageDefaults)) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    } else {
      result[key] = structuredClone(StorageDefaults[key]);
    }
  }
  return result;
}

async function updateStorage(changes) {
  await chrome.storage.local.set(changes);
}

// Make available globally for content scripts (no ES modules)
// Only expose in extension context to avoid page-level pollution
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  globalThis.BlurShieldStorage = { getStorage, updateStorage, StorageDefaults };
}
