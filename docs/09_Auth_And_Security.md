
# Authentication and Security - CryptoMax

## Overview
This document outlines the comprehensive security architecture for the CryptoMax platform, including authentication mechanisms, authorization policies, data protection, and compliance measures.

## Security Framework

### Security Principles
1. **Zero Trust Architecture**: Never trust, always verify
2. **Defense in Depth**: Multiple layers of security controls
3. **Least Privilege**: Minimum necessary access rights
4. **Data Minimization**: Collect and store only necessary data
5. **Transparency**: Clear security policies and incident reporting

### Compliance Standards
- **SOC 2 Type II**: Service Organization Control 2
- **GDPR**: General Data Protection Regulation compliance
- **CCPA**: California Consumer Privacy Act
- **ISO 27001**: Information Security Management
- **PCI DSS**: Payment Card Industry Data Security Standard

## Authentication System

### Primary Authentication (Supabase Auth)

#### Email/Password Authentication
```typescript
// Registration with validation
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        email_confirmed: false,
        registration_date: new Date().toISOString()
      }
    }
  });
  
  return { data, error };
};

// Login with session management
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (data.user) {
    // Log successful login
    await auditLog('user_login', {
      user_id: data.user.id,
      timestamp: new Date().toISOString(),
      ip_address: getClientIP(),
      user_agent: navigator.userAgent
    });
  }
  
  return { data, error };
};
```

#### Password Policy
```typescript
const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserDataInPassword: true
};

const validatePassword = (password: string, userData?: any): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain special characters');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### Multi-Factor Authentication (MFA)

#### TOTP Implementation
```typescript
import { authenticator } from 'otplib';

// Generate TOTP secret
const generateTOTPSecret = (userEmail: string): string => {
  const secret = authenticator.generateSecret();
  const service = 'CryptoMax';
  return authenticator.keyuri(userEmail, service, secret);
};

// Verify TOTP token
const verifyTOTP = (token: string, secret: string): boolean => {
  return authenticator.verify({ token, secret });
};

// MFA enforcement for sensitive operations
const requireMFA = async (operation: string): Promise<boolean> => {
  const user = await getCurrentUser();
  
  if (!user.mfa_enabled) {
    throw new Error('MFA required for this operation');
  }
  
  const lastMFAVerification = await getLastMFAVerification(user.id);
  const mfaTimeout = 5 * 60 * 1000; // 5 minutes
  
  if (Date.now() - lastMFAVerification > mfaTimeout) {
    throw new Error('Recent MFA verification required');
  }
  
  return true;
};
```

#### SMS Backup Authentication
```typescript
// SMS verification for account recovery
const sendSMSVerification = async (phoneNumber: string): Promise<void> => {
  const code = generateSecureCode(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  await supabase.from('sms_verifications').insert({
    phone_number: phoneNumber,
    code: await hashCode(code),
    expires_at: expiresAt.toISOString(),
    attempts: 0
  });
  
  await sendSMS(phoneNumber, `CryptoMax verification code: ${code}`);
};
```

### Session Management

#### JWT Token Handling
```typescript
interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'bearer';
  user: User;
}

// Session validation middleware
const validateSession = async (token: string): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    // Check if user is still active
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, is_active, last_login')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_active) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

// Automatic token refresh
const refreshToken = async (): Promise<AuthSession | null> => {
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
  
  return data.session;
};
```

#### Session Security
```typescript
// Session configuration
const sessionConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: process.env.DOMAIN || 'localhost'
};

// Concurrent session management
const MAX_CONCURRENT_SESSIONS = 3;

const manageConcurrentSessions = async (userId: string, newSessionId: string) => {
  const activeSessions = await getActiveSessions(userId);
  
  if (activeSessions.length >= MAX_CONCURRENT_SESSIONS) {
    // Invalidate oldest session
    const oldestSession = activeSessions.sort((a, b) => 
      a.created_at.getTime() - b.created_at.getTime()
    )[0];
    
    await invalidateSession(oldestSession.id);
  }
  
  await createSession(userId, newSessionId);
};
```

## Authorization and Access Control

### Role-Based Access Control (RBAC)

#### User Roles
```sql
CREATE TYPE user_role AS ENUM (
  'trader',     -- Basic trading access
  'premium',    -- Advanced features
  'admin',      -- Platform administration
  'moderator',  -- Content moderation
  'auditor'     -- Read-only audit access
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);
```

#### Permission System
```typescript
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

const permissions: Record<string, Permission[]> = {
  trader: [
    { resource: 'portfolio', action: 'read' },
    { resource: 'portfolio', action: 'write', conditions: { owner: true } },
    { resource: 'orders', action: 'create', conditions: { mode: 'paper' } },
    { resource: 'bots', action: 'create', conditions: { limit: 3 } }
  ],
  premium: [
    { resource: 'portfolio', action: 'read' },
    { resource: 'portfolio', action: 'write', conditions: { owner: true } },
    { resource: 'orders', action: 'create' },
    { resource: 'bots', action: 'create' },
    { resource: 'analytics', action: 'read' },
    { resource: 'api', action: 'access' }
  ],
  admin: [
    { resource: '*', action: '*' }
  ]
};

// Permission checking function
const hasPermission = async (
  userId: string, 
  resource: string, 
  action: string,
  context?: Record<string, any>
): Promise<boolean> => {
  const userRoles = await getUserRoles(userId);
  
  for (const role of userRoles) {
    const rolePermissions = permissions[role] || [];
    
    for (const permission of rolePermissions) {
      if (matchesPermission(permission, resource, action, context)) {
        return true;
      }
    }
  }
  
  return false;
};
```

### Row Level Security (RLS)

#### Portfolio Access Control
```sql
-- Users can only access their own portfolios
CREATE POLICY "portfolio_access" ON portfolios
  FOR ALL
  USING (auth.uid() = user_id);

-- Admins can access all portfolios
CREATE POLICY "admin_portfolio_access" ON portfolios
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.is_active = true
    )
  );
```

#### Trading Data Security
```sql
-- Secure trading orders
CREATE POLICY "order_access" ON orders
  FOR ALL
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'auditor')
      AND ur.is_active = true
    )
  );

-- Bot access restrictions
CREATE POLICY "bot_access" ON trading_bots
  FOR ALL
  USING (auth.uid() = user_id);

-- Premium features restriction
CREATE POLICY "premium_analytics" ON analytics_data
  FOR SELECT
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('premium', 'admin')
      AND ur.is_active = true
    )
  );
```

## Data Protection

### Encryption

#### At-Rest Encryption
```typescript
// Sensitive data encryption
import { encrypt, decrypt } from './crypto-utils';

const encryptSensitiveData = async (data: string): Promise<string> => {
  const key = await getEncryptionKey();
  return encrypt(data, key);
};

const decryptSensitiveData = async (encryptedData: string): Promise<string> => {
  const key = await getEncryptionKey();
  return decrypt(encryptedData, key);
};

// API key encryption for exchange connections
const storeAPIKey = async (userId: string, exchange: string, apiKey: string) => {
  const encryptedKey = await encryptSensitiveData(apiKey);
  
  await supabase.from('exchange_connections').insert({
    user_id: userId,
    exchange_name: exchange,
    api_key_encrypted: encryptedKey,
    created_at: new Date().toISOString()
  });
};
```

#### In-Transit Encryption
```typescript
// TLS configuration
const tlsConfig = {
  minVersion: 'TLSv1.3',
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256'
  ],
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_3_method'
};

// API request encryption
const secureApiRequest = async (url: string, data: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0',
    'X-Request-ID': generateRequestId(),
    'Authorization': `Bearer ${await getValidToken()}`
  };
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
};
```

### Personal Data Protection

#### Data Minimization
```typescript
// User data collection policy
interface UserDataCollection {
  necessary: string[];      // Required for service
  functional: string[];     // Enhances user experience
  analytical: string[];     // For analytics (opt-in)
  marketing: string[];      // For marketing (opt-in)
}

const dataCollection: UserDataCollection = {
  necessary: ['email', 'password_hash', 'user_id', 'registration_date'],
  functional: ['display_name', 'timezone', 'currency_preference'],
  analytical: ['login_patterns', 'feature_usage', 'performance_metrics'],
  marketing: ['marketing_consent', 'communication_preferences']
};

// Consent management
const updateConsent = async (userId: string, consentType: string, granted: boolean) => {
  await supabase.from('user_consents').upsert({
    user_id: userId,
    consent_type: consentType,
    granted,
    updated_at: new Date().toISOString()
  });
  
  if (!granted) {
    // Delete data that requires this consent
    await deleteDataByConsentType(userId, consentType);
  }
};
```

#### Right to Erasure (GDPR Article 17)
```typescript
const deleteUserData = async (userId: string, dataTypes?: string[]) => {
  const tables = [
    'profiles', 'user_settings', 'portfolios', 'orders',
    'trading_bots', 'alerts', 'notifications', 'user_analytics'
  ];
  
  // Create audit trail before deletion
  await auditLog('data_deletion_request', {
    user_id: userId,
    requested_data_types: dataTypes || 'all',
    timestamp: new Date().toISOString()
  });
  
  // Delete from all tables
  for (const table of tables) {
    await supabase.from(table).delete().eq('user_id', userId);
  }
  
  // Delete from auth system (irreversible)
  await supabase.auth.admin.deleteUser(userId);
  
  // Confirm deletion
  await auditLog('data_deletion_completed', {
    user_id: userId,
    timestamp: new Date().toISOString()
  });
};
```

## API Security

### Rate Limiting
```typescript
interface RateLimit {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const rateLimits: Record<string, RateLimit> = {
  anonymous: { windowMs: 60000, maxRequests: 10 },
  authenticated: { windowMs: 60000, maxRequests: 100 },
  premium: { windowMs: 60000, maxRequests: 1000 },
  trading: { windowMs: 60000, maxRequests: 50 },
  admin: { windowMs: 60000, maxRequests: 10000 }
};

// Rate limiting implementation
const checkRateLimit = async (
  userId: string | null, 
  endpoint: string
): Promise<boolean> => {
  const userType = await getUserType(userId);
  const limit = rateLimits[userType] || rateLimits.anonymous;
  
  const key = `rate_limit:${userType}:${userId || 'anonymous'}:${endpoint}`;
  const current = await redis.get(key);
  
  if (current && parseInt(current) >= limit.maxRequests) {
    return false;
  }
  
  await redis.incr(key);
  await redis.expire(key, Math.ceil(limit.windowMs / 1000));
  
  return true;
};
```

### Input Validation and Sanitization
```typescript
import { z } from 'zod';

// Trading order validation
const orderSchema = z.object({
  symbol: z.string()
    .min(3)
    .max(10)
    .regex(/^[A-Z]{3,4}-[A-Z]{3}$/, 'Invalid symbol format'),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  quantity: z.number()
    .positive()
    .max(1000000, 'Quantity too large'),
  price: z.number()
    .positive()
    .optional(),
  stop_price: z.number()
    .positive()
    .optional()
});

// Sanitization functions
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length
};

const validateAndSanitize = (data: any, schema: z.ZodSchema) => {
  // Sanitize string fields
  const sanitized = Object.entries(data).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = sanitizeInput(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
  
  // Validate with schema
  return schema.parse(sanitized);
};
```

### CORS and CSRF Protection
```typescript
// CORS configuration
const corsConfig = {
  origin: [
    'https://cryptomax.com.au',
    'https://app.cryptomax.com.au',
    'https://staging.cryptomax.com.au'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// CSRF token generation and validation
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  const expectedToken = generateTokenFromSession(sessionToken);
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(expectedToken, 'hex')
  );
};
```

## Security Monitoring

### Intrusion Detection
```typescript
// Suspicious activity detection
const detectSuspiciousActivity = async (userId: string, activity: any) => {
  const indicators = [
    checkMultipleFailedLogins(userId),
    checkUnusualTradingPatterns(userId, activity),
    checkGeographicAnomalies(userId, activity.ip_address),
    checkDeviceFingerprinting(userId, activity.user_agent)
  ];
  
  const suspiciousScore = await Promise.all(indicators);
  const totalScore = suspiciousScore.reduce((sum, score) => sum + score, 0);
  
  if (totalScore > SUSPICIOUS_THRESHOLD) {
    await handleSuspiciousActivity(userId, totalScore, activity);
  }
};

// Failed login monitoring
const monitorFailedLogins = async (email: string, ip: string) => {
  const key = `failed_logins:${email}:${ip}`;
  const failures = await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour window
  
  if (failures >= 5) {
    await lockAccount(email, '1 hour');
    await alertSecurityTeam('Account locked due to failed logins', {
      email,
      ip,
      failures
    });
  }
};
```

### Audit Logging
```typescript
interface AuditEvent {
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

const auditLog = async (action: string, details: Record<string, any>) => {
  const event: AuditEvent = {
    user_id: getCurrentUserId(),
    action,
    details: {
      ...details,
      request_id: getCurrentRequestId()
    },
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
    timestamp: new Date().toISOString()
  };
  
  await supabase.from('audit_logs').insert(event);
  
  // Also log to external security system
  await externalSecurityLog(event);
};

// High-value transaction monitoring
const monitorHighValueTransaction = async (order: any) => {
  const valueThreshold = 10000; // AUD
  const orderValue = order.quantity * order.price;
  
  if (orderValue > valueThreshold) {
    await auditLog('high_value_transaction', {
      order_id: order.id,
      value: orderValue,
      symbol: order.symbol,
      requires_verification: true
    });
    
    // Require additional verification
    await requireAdditionalVerification(order.user_id, 'high_value_trade');
  }
};
```

## Incident Response

### Security Incident Classification
```typescript
enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface SecurityIncident {
  id: string;
  severity: IncidentSeverity;
  type: string;
  description: string;
  affected_users?: string[];
  detected_at: Date;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

const handleSecurityIncident = async (incident: SecurityIncident) => {
  // Log the incident
  await auditLog('security_incident', {
    incident_id: incident.id,
    severity: incident.severity,
    type: incident.type
  });
  
  // Alert security team
  await alertSecurityTeam(incident);
  
  // Take immediate action based on severity
  switch (incident.severity) {
    case IncidentSeverity.CRITICAL:
      await initiateEmergencyProtocol(incident);
      break;
    case IncidentSeverity.HIGH:
      await lockAffectedAccounts(incident.affected_users);
      break;
    case IncidentSeverity.MEDIUM:
      await increaseMonitoring(incident.type);
      break;
  }
};
```

### Automated Response
```typescript
const automatedSecurityResponse = {
  // Account compromise detection
  onCompromisedAccount: async (userId: string) => {
    await lockAccount(userId, 'security review');
    await invalidateAllSessions(userId);
    await notifyUser(userId, 'account_locked_security');
    await alertSecurityTeam('Account compromise detected', { userId });
  },
  
  // API abuse detection
  onAPIAbuse: async (apiKey: string, userId: string) => {
    await suspendAPIKey(apiKey);
    await auditLog('api_abuse_detected', { api_key: apiKey, user_id: userId });
    await rateLimitUser(userId, 24 * 60 * 60 * 1000); // 24 hours
  },
  
  // Data breach detection
  onDataBreach: async (affectedData: string[]) => {
    await initiateBreachProtocol();
    await notifyRegulatoryBodies();
    await notifyAffectedUsers(affectedData);
    await enableEnhancedMonitoring();
  }
};
```

## Compliance and Reporting

### GDPR Compliance
```typescript
// Data processing record
const dataProcessingRecord = {
  purpose: 'Cryptocurrency trading platform operation',
  legalBasis: 'Contract performance',
  dataCategories: [
    'Identity data',
    'Contact data', 
    'Financial data',
    'Trading data',
    'Technical data',
    'Usage data'
  ],
  recipients: [
    'Internal teams',
    'Cloud service providers',
    'Payment processors',
    'Regulatory authorities'
  ],
  retentionPeriod: '7 years after account closure',
  securityMeasures: [
    'Encryption at rest and in transit',
    'Access controls',
    'Regular security assessments',
    'Staff training'
  ]
};

// Privacy impact assessment
const conductPIA = async (newFeature: string) => {
  const assessment = {
    feature: newFeature,
    dataTypes: await identifyDataTypes(newFeature),
    risks: await assessPrivacyRisks(newFeature),
    mitigations: await planMitigations(newFeature),
    date: new Date().toISOString()
  };
  
  await savePrivacyAssessment(assessment);
  return assessment;
};
```

### Security Reporting
```typescript
// Regular security reports
const generateSecurityReport = async (period: 'weekly' | 'monthly' | 'quarterly') => {
  const report = {
    period,
    generated_at: new Date().toISOString(),
    metrics: {
      total_users: await getUserCount(),
      login_attempts: await getLoginAttempts(period),
      failed_logins: await getFailedLogins(period),
      security_incidents: await getSecurityIncidents(period),
      data_breaches: await getDataBreaches(period),
      compliance_violations: await getComplianceViolations(period)
    },
    trends: await analyzeSecurityTrends(period),
    recommendations: await generateSecurityRecommendations()
  };
  
  await saveSecurityReport(report);
  await distributeToStakeholders(report);
  
  return report;
};
```

---

*This security documentation provides comprehensive guidelines for maintaining the security posture of the CryptoMax platform. Regular reviews and updates are essential as the threat landscape evolves.*
