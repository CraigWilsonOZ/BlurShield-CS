// patterns/aws.js - AWS-specific patterns
BlurShield.registerPatterns([
  {
    id: 'aws-arn',
    category: 'aws',
    label: 'ARN',
    regex: /arn:aws[a-z-]*:[a-z0-9-]+:[a-z0-9-]*:\d{12}:[^\s"',]+/gi
  },
  {
    id: 'aws-access-key',
    category: 'aws',
    label: 'Access Key',
    regex: /(?:AKIA|ASIA)[A-Z0-9]{16}/g
  },
  {
    id: 'aws-account-id',
    category: 'aws',
    label: 'Account ID',
    regex: /\b\d{4}-\d{4}-\d{4}\b/g
  }
]);
