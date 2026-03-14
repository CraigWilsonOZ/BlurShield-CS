// patterns/azure.js - Azure-specific patterns
BlurShield.registerPatterns([
  {
    id: 'azure-guid',
    category: 'azure',
    label: 'GUID',
    regex: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  },
  {
    id: 'azure-subscription-path',
    category: 'azure',
    label: 'Subscription Path',
    regex: /\/subscriptions\/[0-9a-f-]{36}/gi
  },
  {
    id: 'azure-connection-key',
    category: 'azure',
    label: 'Connection String Key',
    regex: /(?:AccountKey|SharedAccessKey|sig)=[A-Za-z0-9+\/=]{20,}/gi
  },
  {
    id: 'azure-storage-key',
    category: 'azure',
    label: 'Storage Account Key',
    regex: /[A-Za-z0-9+\/]{86}==/g
  },
  {
    id: 'azure-sas-token',
    category: 'azure',
    label: 'SAS Token',
    regex: /[?&]sig=[A-Za-z0-9%+\/=]{20,}/gi
  },
  {
    id: 'azure-managed-identity',
    category: 'azure',
    label: 'Managed Identity / Resource Path',
    regex: /\/providers\/Microsoft\.\w+\/[^\s"',]+/gi
  }
]);
