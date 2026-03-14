// patterns/openai.js - OpenAI-specific patterns
BlurShield.registerPatterns([
  {
    id: 'openai-api-key',
    category: 'openai',
    label: 'API Key',
    regex: /sk-[A-Za-z0-9_\-]{20,}/g
  },
  {
    id: 'openai-org-id',
    category: 'openai',
    label: 'Organization ID',
    regex: /org-[A-Za-z0-9]{20,}/g
  },
  {
    id: 'openai-webhook-secret',
    category: 'openai',
    label: 'Webhook Signing Secret',
    regex: /whsec_[A-Za-z0-9+\/=_\-]{20,}/g
  }
]);
