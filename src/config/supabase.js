import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://mock-scopeshield.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-scopeshield';

export const isSupabaseConfigured = Boolean(
  import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY
);

// Standard Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Initial demo / fallback state simulating a multi-client digital agency environment.
 * Stored in localStorage for instantaneous reactivity and offline resilience.
 */
const DEFAULT_CLIENTS = [
  {
    id: 'client_01',
    name: 'Apex Robotics Inc.',
    portalSlug: 'apex-robotics',
    companyLogo: '🤖',
    industry: 'Autonomous Systems & IoT',
    contactEmail: 'engineering@apexrobotics.io',
    retainer: {
      totalHours: 80,
      usedHours: 67.5,
      hourlyRate: 195,
      renewalDate: '2026-10-15',
      status: 'critical', // < 20% remaining
    },
    project: {
      name: 'Fleet Telemetry Dashboard v2.4',
      status: 'Active Sprint',
      baseContractValue: 74000,
      scopeCreepProtectedValue: 14850,
      scopeBoundary: [
        'Real-time CAN bus telemetry parsing (up to 100 sensors)',
        'React & WebGL visualizer for LIDAR point clouds',
        'Standard OAuth2/OIDC user authentication',
        'Weekly deployment cycle to AWS ECS cluster'
      ],
      explicitExclusions: [
        'Native mobile iOS/Android applications (Separate SOW required)',
        'Hardware firmware modification or embedded C writing',
        'Custom multi-tenant billing gateway integration',
        'Sub-millisecond high-frequency trading protocol interfaces'
      ]
    }
  },
  {
    id: 'client_02',
    name: 'Vanguard Biometrics',
    portalSlug: 'vanguard-bio',
    companyLogo: '🧬',
    industry: 'Healthcare & Security',
    contactEmail: 'cto@vanguardbio.com',
    retainer: {
      totalHours: 120,
      usedHours: 42,
      hourlyRate: 220,
      renewalDate: '2026-11-01',
      status: 'healthy',
    },
    project: {
      name: 'HIPAA Compliant Patient Intake Cloud',
      status: 'Phase 2 Validation',
      baseContractValue: 118000,
      scopeCreepProtectedValue: 8600,
      scopeBoundary: [
        'HL7/FHIR compliant API microservices in Go',
        'Encrypted patient document storage with S3 SSE-KMS',
        'Strict RBAC audit logging with tamper-proof signatures'
      ],
      explicitExclusions: [
        'Custom hardware biometric scanner drivers',
        'Direct EHR vendor integration for legacy on-premise AS400'
      ]
    }
  },
  {
    id: 'client_03',
    name: 'Luminary Fintech',
    portalSlug: 'luminary-fin',
    companyLogo: '💎',
    industry: 'Decentralized Finance',
    contactEmail: 'product@luminaryfin.org',
    retainer: {
      totalHours: 60,
      usedHours: 54,
      hourlyRate: 250,
      renewalDate: '2026-10-05',
      status: 'warning',
    },
    project: {
      name: 'Cross-Border Settlement Portal',
      status: 'Pre-Audit Code Freeze',
      baseContractValue: 92000,
      scopeCreepProtectedValue: 24200,
      scopeBoundary: [
        'Next-generation smart contract audit dashboards',
        'KYC/AML verification integration with Sumsub API',
        'Multi-signature approval modal workflows'
      ],
      explicitExclusions: [
        'Writing core EVM bytecode or formal mathematical verification',
        'Custom liquidity pool market-making bots'
      ]
    }
  }
];

const DEFAULT_CHANGE_ORDERS = [
  {
    id: 'co_001',
    clientId: 'client_01',
    requestTitle: 'Real-time WebSocket Push for Mobile Driver App',
    requestedBy: 'David Vance (Director of Engineering)',
    requestedAt: '2026-09-27T14:32:00Z',
    status: 'pending_client_approval', // pending_client_approval | approved | rejected | in_review
    urgency: 'high',
    estimatedHours: 24,
    amount: 4680,
    scopeClassification: 'out_of_scope',
    scopeAnalysis: 'Request specifies standalone iOS push infrastructure. Original Master Services Agreement specifically lists native mobile support under Section 4.2: Explicit Exclusions.',
    lineItems: [
      { description: 'Apple Push Notification Service (APNs) credential config & background worker', hours: 8, rate: 195 },
      { description: 'WebSocket reconnect state engine & exponential backoff handler', hours: 10, rate: 195 },
      { description: 'Security audit & load test (10k concurrent simulated drivers)', hours: 6, rate: 195 }
    ],
    billingOption: 'stripe_checkout',
    clientSignature: null,
    signedAt: null,
  },
  {
    id: 'co_002',
    clientId: 'client_01',
    requestTitle: 'Export Telemetry Raw Logs to Parquet / Snowflake Pipeline',
    requestedBy: 'Elena Rostova (Data Lead)',
    requestedAt: '2026-09-25T11:10:00Z',
    status: 'approved',
    urgency: 'medium',
    estimatedHours: 16,
    amount: 3120,
    scopeClassification: 'scope_expansion',
    scopeAnalysis: 'Beyond original CSV/JSON export agreement; required custom column mapper and S3 Snowflake staging pipe.',
    lineItems: [
      { description: 'Apache Arrow & Parquet schema encoder pipeline', hours: 10, rate: 195 },
      { description: 'Automated Snowflake Snowpipe integration & credential vault', hours: 6, rate: 195 }
    ],
    billingOption: 'retainer_deduction',
    clientSignature: 'Elena Rostova (Hash #e891c9)',
    signedAt: '2026-09-26T09:14:22Z',
  },
  {
    id: 'co_003',
    clientId: 'client_03',
    requestTitle: 'Custom Algorithmic Automated Rebalancing Bot',
    requestedBy: 'Markus Chen (Chief Investment Officer)',
    requestedAt: '2026-09-28T16:45:00Z',
    status: 'pending_client_approval',
    urgency: 'critical',
    estimatedHours: 48,
    amount: 12000,
    scopeClassification: 'out_of_scope',
    scopeAnalysis: 'Explicitly flagged by ScopeShield AI: Classified as "Market-making / high-frequency bot", strictly barred in Section 8.4 exclusions.',
    lineItems: [
      { description: 'Arbitrage routing mathematical engine', hours: 20, rate: 250 },
      { description: 'Low-latency RPC fallback network nodes', hours: 16, rate: 250 },
      { description: 'Emergency circuit breaker & automated liquidation guardrails', hours: 12, rate: 250 }
    ],
    billingOption: 'stripe_checkout',
    clientSignature: null,
    signedAt: null,
  }
];

// Persistent state accessor
const STORAGE_KEYS = {
  CLIENTS: 'scopeshield_clients_v1',
  CHANGE_ORDERS: 'scopeshield_cos_live_v1',
};

export const getStoredClients = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
      return DEFAULT_CLIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_CLIENTS;
  }
};

export const getStoredChangeOrders = (clientId = null) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHANGE_ORDERS);
    const orders = raw ? JSON.parse(raw) : DEFAULT_CHANGE_ORDERS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHANGE_ORDERS, JSON.stringify(DEFAULT_CHANGE_ORDERS));
    }
    if (clientId) {
      return orders.filter(co => co.clientId === clientId);
    }
    return orders;
  } catch (err) {
    return DEFAULT_CHANGE_ORDERS;
  }
};

export const saveChangeOrder = (changeOrder) => {
  const all = getStoredChangeOrders();
  const existingIdx = all.findIndex(item => item.id === changeOrder.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...all];
    updated[existingIdx] = changeOrder;
  } else {
    updated = [changeOrder, ...all];
  }
  localStorage.setItem(STORAGE_KEYS.CHANGE_ORDERS, JSON.stringify(updated));
  return changeOrder;
};

export const approveChangeOrder = (orderId, signature, paymentMethod = 'stripe_checkout') => {
  const all = getStoredChangeOrders();
  const order = all.find(item => item.id === orderId);
  if (!order) return null;

  order.status = 'approved';
  order.clientSignature = signature;
  order.signedAt = new Date().toISOString();
  order.billingOption = paymentMethod;

  // If paid via retainer, deduct hours from client
  if (paymentMethod === 'retainer_deduction') {
    const clients = getStoredClients();
    const client = clients.find(c => c.id === order.clientId);
    if (client) {
      client.retainer.usedHours = Math.min(
        client.retainer.totalHours, 
        client.retainer.usedHours + order.estimatedHours
      );
      if (client.retainer.usedHours >= client.retainer.totalHours * 0.9) {
        client.retainer.status = 'critical';
      }
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }
  }

  saveChangeOrder(order);
  return order;
};

export const rejectChangeOrder = (orderId, reason) => {
  const all = getStoredChangeOrders();
  const order = all.find(item => item.id === orderId);
  if (!order) return null;

  order.status = 'rejected';
  order.rejectionReason = reason;
  order.resolvedAt = new Date().toISOString();
  saveChangeOrder(order);
  return order;
};

/**
 * Intelligent Scope Boundary Classifier
 * Evaluates whether an incoming feature or ticket request falls inside contract scope,
 * requires retainer deduction, or triggers an mandatory out-of-scope Change Order.
 */
export const evaluateScopeBoundary = (title, description, client) => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check exclusions
  for (const exclusion of client.project.explicitExclusions) {
    const keywords = exclusion.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const matches = keywords.filter(word => text.includes(word));
    if (matches.length >= 2) {
      return {
        classification: 'out_of_scope',
        isScopeCreep: true,
        confidence: 0.94,
        matchedExclusion: exclusion,
        explanation: `Violates Master Agreement Exclusion: "${exclusion}". Requires mandatory signed Change Order.`,
        recommendedHours: 18,
        recommendedRate: client.retainer.hourlyRate,
      };
    }
  }

  // Common high-creep tech keywords
  const highRiskTokens = [
    { token: 'native mobile', hours: 32, label: 'Native iOS / Android Mobile development' },
    { token: 'ios', hours: 24, label: 'Apple iOS application integration' },
    { token: 'android', hours: 24, label: 'Android application integration' },
    { token: 'hardware', hours: 40, label: 'Hardware driver / firmware interfacing' },
    { token: 'migration', hours: 20, label: 'Large-scale schema/database migration' },
    { token: 'bot', hours: 36, label: 'Autonomous bot / automated execution' },
    { token: 'blockchain', hours: 30, label: 'Smart contract / Web3 settlement' },
    { token: 'redesign', hours: 28, label: 'Full UI/UX redesign outside wireframes' },
  ];

  for (const risk of highRiskTokens) {
    if (text.includes(risk.token)) {
      return {
        classification: 'out_of_scope',
        isScopeCreep: true,
        confidence: 0.88,
        matchedExclusion: risk.label,
        explanation: `Flagged as Out-of-Scope expansion: Request includes "${risk.label}" which was not included in base contract deliverables.`,
        recommendedHours: risk.hours,
        recommendedRate: client.retainer.hourlyRate,
      };
    }
  }

  // Minor adjustment
  return {
    classification: 'in_scope_retainer',
    isScopeCreep: false,
    confidence: 0.91,
    matchedExclusion: null,
    explanation: 'Within established project architecture. Covered under ongoing monthly development retainer balance.',
    recommendedHours: 4,
    recommendedRate: client.retainer.hourlyRate,
  };
};
