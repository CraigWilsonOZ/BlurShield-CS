// patterns/anthropic.js - Anthropic/Claude-specific patterns
BlurShield.registerPatterns([
  {
    id: 'anthropic-api-key',
    category: 'anthropic',
    label: 'API Key',
    regex: /sk-ant-[A-Za-z0-9\-]{20,}/g
  }
]);
