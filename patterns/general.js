// patterns/general.js - General sensitive data patterns (split into individual categories)
BlurShield.registerPatterns([
  {
    id: 'email-address',
    category: 'emails',
    label: 'Email Address',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  },
  {
    id: 'ipv4-address',
    category: 'ipaddresses',
    label: 'IPv4 Address',
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
  },
  {
    id: 'api-key-assignment',
    category: 'apikeys',
    label: 'API Key Assignment',
    regex: /(?:api[_-]?key|apikey|token|secret|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-.]{16,}['"]?/gi
  },
  {
    id: 'phone-us',
    category: 'phones',
    label: 'Phone Number (US)',
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  },
  {
    id: 'phone-au',
    category: 'phones',
    label: 'Phone Number (AU)',
    regex: /(?:\+?61[-.\s]?)?0?4\d{2}[-.\s]?\d{3}[-.\s]?\d{3}\b/g
  },
  {
    id: 'phone-au-landline',
    category: 'phones',
    label: 'Phone Number (AU Landline)',
    regex: /(?:\+?61[-.\s]?)?0?[2-9][-.\s]?\d{4}[-.\s]?\d{4}\b/g
  },
  {
    id: 'phone-intl',
    category: 'phones',
    label: 'Phone Number (International)',
    regex: /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/g
  },
  {
    id: 'street-address',
    category: 'addresses',
    label: 'Street Address',
    regex: /\b\d{1,6}[-\/]?\d{0,4}\s+[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)?\s+(?:St(?:reet)?|Ave(?:nue)?|Rd|Road|Dr(?:ive)?|Blvd|Boulevard|Ln|Lane|Way|Ct|Court|Pl(?:ace)?|Cres(?:cent)?|Tce|Terrace|Pde|Parade|Cct|Circuit|Cl|Close|Hwy|Highway)\b/g
  },
  {
    id: 'pobox',
    category: 'addresses',
    label: 'PO Box',
    regex: /\bP\.?O\.?\s*Box\s+\d+\b/gi
  },
  {
    id: 'credit-card-masked',
    category: 'creditcards',
    label: 'Credit Card (masked display)',
    regex: /(?:Mastercard|Visa|Amex|American Express|Discover|Diners|JCB|UnionPay|Maestro)[\s\S]{0,40}\d{4}\b/gi
  },
  {
    id: 'credit-card-bullets',
    category: 'creditcards',
    label: 'Credit Card (bullet mask)',
    regex: /(?:[\u2022\u2023\u2024\u2025\u2027\u00B7\u2219•·*×✱][\s\-]*){3,}\d{2,4}/g
  },
  {
    id: 'credit-card-full',
    category: 'creditcards',
    label: 'Credit Card Number',
    regex: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2})|35\d{3})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b/g
  },
  {
    id: 'credit-card-last4',
    category: 'creditcards',
    label: 'Credit Card (ending in)',
    regex: /(?:ending|last\s*4|card)\s*(?:in|digits?)?\s*[:.]?\s*\d{4}\b/gi
  }
]);
