// content/content.js - BlurShield content script entry point

(() => {
  const MASK_CLASS = 'blurshield-hidden';
  const HOVER_CLASS = 'blurshield-hover-reveal';
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'IFRAME', 'CANVAS', 'SVG']);
  // Tags where we blur the element itself (via class) instead of wrapping text
  const FORM_TAGS = new Set(['INPUT', 'TEXTAREA']);

  let isActive = false;
  let observer = null;
  let currentPatterns = [];
  let personalPatterns = [];

  // Check if this hostname or any ancestor frame's hostname is bypassed
  function isBypassed(bypassSites) {
    const hostname = location.hostname;
    if (bypassSites.some(site => hostname === site || hostname.endsWith('.' + site))) {
      return true;
    }
    if (location.ancestorOrigins) {
      for (let i = 0; i < location.ancestorOrigins.length; i++) {
        try {
          const ancestorHost = new URL(location.ancestorOrigins[i]).hostname;
          if (bypassSites.some(site => ancestorHost === site || ancestorHost.endsWith('.' + site))) {
            return true;
          }
        } catch {
          // skip
        }
      }
    }
    return false;
  }

  async function init() {
    const data = await chrome.storage.local.get(null);

    // Check bypass list first
    const bypassSites = data.bypassSites || [];
    if (isBypassed(bypassSites)) {
      return;
    }

    const enabled = data.enabled !== undefined ? data.enabled : true;
    if (!enabled) {
      return;
    }

    // Build personal info patterns
    personalPatterns = buildPersonalPatterns(data.personalInfo || { emails: [], ips: [] });

    // Get enabled category patterns - merge with defaults so new categories are on by default
    const defaultCategories = {
      azure: true, aws: true, gcp: true, openai: true, anthropic: true,
      emails: true, ipaddresses: true, apikeys: true, phones: true,
      addresses: true, creditcards: true, custom: true
    };
    const enabledCategories = Object.assign({}, defaultCategories, data.enabledCategories || {});
    currentPatterns = BlurShield.getEnabledPatterns(enabledCategories);

    // Apply preferences
    applyPreferences(data.preferences || { blurIntensity: 8, revealOnHover: false });

    activate();
  }

  function buildPersonalPatterns(personalInfo) {
    const patterns = [];
    if (personalInfo.emails) {
      for (const email of personalInfo.emails) {
        if (email.trim()) {
          patterns.push({
            id: 'personal-email-' + email,
            category: 'personal',
            label: 'Personal Email',
            regex: new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          });
        }
      }
    }
    if (personalInfo.ips) {
      for (const ip of personalInfo.ips) {
        if (ip.trim()) {
          patterns.push({
            id: 'personal-ip-' + ip,
            category: 'personal',
            label: 'Personal IP',
            regex: new RegExp(ip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          });
        }
      }
    }
    return patterns;
  }

  function applyPreferences(prefs) {
    const intensity = Math.max(2, Math.min(20, parseInt(prefs.blurIntensity, 10) || 8));

    let style = document.getElementById('blurshield-dynamic-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'blurshield-dynamic-style';
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = `.${MASK_CLASS} { filter: blur(${intensity}px) !important; }`;

    if (prefs.revealOnHover) {
      document.documentElement.classList.add(HOVER_CLASS);
    } else {
      document.documentElement.classList.remove(HOVER_CLASS);
    }
  }

  function fullScan() {
    if (!isActive || !document.body) return;
    scanNode(document.body);
    scanInputs(document.body);
  }

  function activate() {
    isActive = true;

    // Start observing immediately - catches DOM nodes as they're added
    startObserver();

    if (document.body) {
      fullScan();
    } else {
      // At document_start, body doesn't exist yet - watch for it
      const earlyObserver = new MutationObserver(() => {
        if (document.body) {
          earlyObserver.disconnect();
          fullScan();
        }
      });
      earlyObserver.observe(document.documentElement, { childList: true });
    }

    // Aggressive early rescans to catch content as it renders
    setTimeout(fullScan, 50);
    setTimeout(fullScan, 150);
    setTimeout(fullScan, 300);
    setTimeout(fullScan, 600);
    setTimeout(fullScan, 1500);
  }

  function deactivate() {
    isActive = false;
    stopObserver();
    unmaskAll();
  }

  function getAllPatterns() {
    return [...currentPatterns, ...personalPatterns];
  }

  function scanNode(root) {
    if (!root || !isActive) return;

    const patterns = getAllPatterns();
    if (patterns.length === 0) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.' + MASK_CLASS)) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (FORM_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (const textNode of textNodes) {
      maskTextNode(textNode, patterns);
    }
  }

  // Non-destructive masking: blur the closest inline parent element
  // instead of splitText + span wrapping. Doesn't break React/frameworks.
  function maskTextNode(textNode, patterns) {
    if (!textNode.isConnected) return;
    const text = textNode.textContent;
    if (!text || text.trim().length === 0) return;

    // Check the text node itself
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      if (regex.test(text)) {
        const target = findMaskTarget(textNode);
        if (target && !target.classList.contains(MASK_CLASS)) {
          target.classList.add(MASK_CLASS);
          target.dataset.blurshieldCategory = pattern.category;
        }
        return;
      }
    }

    // Also check parent element's full textContent (catches split text nodes / newlines)
    const parent = textNode.parentElement;
    if (parent && !parent.classList.contains(MASK_CLASS)) {
      const parentText = parent.textContent;
      if (parentText && parentText.length < 300) {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
          if (regex.test(parentText)) {
            const target = findMaskTarget(textNode);
            if (target && !target.classList.contains(MASK_CLASS)) {
              target.classList.add(MASK_CLASS);
              target.dataset.blurshieldCategory = pattern.category;
            }
            return;
          }
        }
      }
    }
  }

  // Walk up to find the best element to blur:
  // - Prefer the immediate parent if it's an inline/leaf element
  // - Stop at block-level containers to avoid blurring entire sections
  function findMaskTarget(textNode) {
    let el = textNode.parentElement;
    if (!el) return null;

    const blockTags = new Set([
      'DIV', 'P', 'SECTION', 'ARTICLE', 'MAIN', 'HEADER', 'FOOTER',
      'NAV', 'ASIDE', 'TABLE', 'TBODY', 'THEAD', 'TR', 'UL', 'OL',
      'LI', 'FORM', 'FIELDSET', 'DETAILS', 'SUMMARY', 'BODY', 'HTML'
    ]);

    // If parent is a block element, we need to be more careful.
    // Only blur it if its text content is short (likely a value cell, not a whole section)
    if (blockTags.has(el.tagName)) {
      const textLen = el.textContent.trim().length;
      if (textLen > 200) {
        // Too large - don't blur the whole block
        return null;
      }
      return el;
    }

    // Inline element (span, a, td, code, etc.) - blur it
    return el;
  }

  function scanInputs(root) {
    if (!root || !isActive) return;

    const patterns = getAllPatterns();
    if (patterns.length === 0) return;

    const inputs = root.querySelectorAll('input, textarea');
    for (const input of inputs) {
      if (input.classList.contains(MASK_CLASS)) continue;
      const val = input.value || '';
      if (!val.trim()) continue;

      for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        if (regex.test(val)) {
          input.classList.add(MASK_CLASS);
          break;
        }
      }
    }
  }

  function unmaskAll() {
    const masked = document.querySelectorAll('.' + MASK_CLASS);
    for (const el of masked) {
      el.classList.remove(MASK_CLASS);
      delete el.dataset.blurshieldCategory;
    }
  }

  function startObserver() {
    if (observer) return;

    let rafPending = false;
    let pendingNodes = [];

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              pendingNodes.push(node);
            }
          }
        } else if (mutation.type === 'characterData') {
          if (mutation.target.parentElement) {
            pendingNodes.push(mutation.target.parentElement);
          }
        }
      }
      if (pendingNodes.length > 0 && !rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          const nodes = pendingNodes;
          pendingNodes = [];
          // If too many mutations, just do a full scan
          if (nodes.length > 50) {
            fullScan();
          } else {
            const patterns = getAllPatterns();
            if (patterns.length === 0) return;
            for (const node of nodes) {
              if (node.nodeType === Node.TEXT_NODE) {
                maskTextNode(node, patterns);
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                scanNode(node);
                scanInputs(node);
              }
            }
          }
        });
      }
    });

    const target = document.body || document.documentElement;
    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function getMaskedCount() {
    return document.querySelectorAll('.' + MASK_CLASS).length;
  }

  // Debounced reinit to avoid rapid teardown/rebuild cycles
  let reinitTimer = null;
  function debouncedReinit() {
    if (reinitTimer) clearTimeout(reinitTimer);
    reinitTimer = setTimeout(() => {
      reinitTimer = null;
      deactivate();
      init();
    }, 100);
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    const needsReinit = changes.enabled || changes.siteConfigs || changes.bypassSites ||
                        changes.enabledCategories || changes.personalInfo || changes.customPatterns ||
                        changes.preferences;

    if (needsReinit) {
      debouncedReinit();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'getMaskedCount') {
      sendResponse({ count: getMaskedCount() });
    } else if (msg.type === 'reinit') {
      debouncedReinit();
      sendResponse({ ok: true });
    }
  });

  // Start
  init();
})();
