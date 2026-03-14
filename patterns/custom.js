// patterns/custom.js - Load user-defined custom patterns from storage
(async () => {
  try {
    const data = await chrome.storage.local.get('customPatterns');
    const customPatterns = data.customPatterns || [];
    const patterns = [];

    for (const cp of customPatterns) {
      if (cp.type === 'keyword' && cp.value) {
        patterns.push({
          id: 'custom-' + cp.id,
          category: 'custom',
          label: cp.label || cp.value,
          regex: new RegExp(cp.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        });
      } else if (cp.type === 'regex' && cp.value) {
        // Skip patterns that are too long or have nested quantifiers (ReDoS risk)
        if (cp.value.length > 500) continue;
        if (/[+*}]\s*\)\s*[+*?{]/.test(cp.value)) continue;
        try {
          patterns.push({
            id: 'custom-' + cp.id,
            category: 'custom',
            label: cp.label || cp.value,
            regex: new RegExp(cp.value, cp.flags || 'gi')
          });
        } catch {
          // Skip invalid regex
        }
      }
    }

    if (patterns.length > 0) {
      BlurShield.registerPatterns(patterns);
    }
  } catch {
    // Storage not available yet
  }
})();
