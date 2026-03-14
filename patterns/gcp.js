// patterns/gcp.js - GCP-specific patterns
BlurShield.registerPatterns([
  {
    id: 'gcp-service-account',
    category: 'gcp',
    label: 'Service Account Email',
    regex: /[a-z][a-z0-9-]*@[a-z][a-z0-9-]*\.iam\.gserviceaccount\.com/gi
  },
  {
    id: 'gcp-billing-account',
    category: 'gcp',
    label: 'Billing Account ID',
    regex: /\b[0-9A-F]{6}-[0-9A-F]{6}-[0-9A-F]{6}\b/g
  }
]);
