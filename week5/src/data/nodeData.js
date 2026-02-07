import {
    Webhook,
    Shuffle,
    ShieldAlert,
    Brain,
    Route,
    AlertTriangle,
    UserCheck,
    FileText,
    RefreshCw,
    Target,
    UserPlus,
    CreditCard,
    Ticket,
    Database,
    Megaphone,
    BarChart3,
    Building2,
    MessageCircle,
    Headphones
} from 'lucide-react';

// Node Categories
export const NODE_CATEGORIES = {
    CORE: {
        id: 'core',
        label: 'Core Infrastructure',
        color: 'emerald',
        bgColor: 'bg-emerald-500',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400'
    },
    MODULE: {
        id: 'module',
        label: 'Business Modules',
        color: 'violet',
        bgColor: 'bg-violet-500',
        borderColor: 'border-violet-500/30',
        textColor: 'text-violet-400'
    },
    CLIENT: {
        id: 'client',
        label: 'Client Projects',
        color: 'amber',
        bgColor: 'bg-amber-500',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400'
    }
};

// Node Statuses
export const NODE_STATUS = {
    DRAFT: { id: 'draft', label: 'Draft', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    ACTIVE: { id: 'active', label: 'Active', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    DEPRECATED: { id: 'deprecated', label: 'Deprecated', color: 'text-red-400', bgColor: 'bg-red-500/20' }
};

// Edge Types
export const EDGE_TYPES = {
    DATA: { id: 'data', label: 'Data Flow', color: '#3b82f6', strokeWidth: 2, animated: true },
    CONTROL: { id: 'control', label: 'Control Flow', color: '#f59e0b', strokeWidth: 2, dashArray: '5,5' },
    DEPENDENCY: { id: 'dependency', label: 'Dependency', color: '#6b7280', strokeWidth: 1, dashArray: '2,2' }
};

// ============ CORE INFRASTRUCTURE NODES ============
export const CORE_NODES = [
    {
        type: 'core',
        templateId: 'webhook-ingestor',
        label: 'Universal Webhook Ingestor',
        description: 'Receives webhooks from any platform and normalizes the payload for downstream processing.',
        icon: Webhook,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v2.1',
        reusability: 'global',
        inputs: [{ id: 'trigger', label: 'HTTP Request', type: 'webhook' }],
        outputs: [{ id: 'payload', label: 'Normalized Payload', type: 'object' }],
        config: {
            validateSignature: true,
            timeout: 30000,
            retryOnFailure: true
        }
    },
    {
        type: 'core',
        templateId: 'channel-normalizer',
        label: 'Channel Normalizer',
        description: 'Unifies messages from WhatsApp, SMS, Email, and Web into a single format.',
        icon: Shuffle,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.4',
        reusability: 'global',
        inputs: [{ id: 'raw', label: 'Raw Message', type: 'any' }],
        outputs: [{ id: 'normalized', label: 'Unified Message', type: 'message' }],
        config: {
            channels: ['whatsapp', 'sms', 'email', 'web'],
            preserveOriginal: true
        }
    },
    {
        type: 'core',
        templateId: 'rate-limiter',
        label: 'Rate Limit & Abuse Guard',
        description: 'Protects downstream systems from abuse with configurable rate limiting.',
        icon: ShieldAlert,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.2',
        reusability: 'global',
        inputs: [{ id: 'request', label: 'Incoming Request', type: 'any' }],
        outputs: [
            { id: 'allowed', label: 'Allowed', type: 'any' },
            { id: 'blocked', label: 'Blocked', type: 'error' }
        ],
        config: {
            maxRequestsPerMinute: 60,
            blockDuration: 300
        }
    },
    {
        type: 'core',
        templateId: 'conversation-memory',
        label: 'Conversation Memory',
        description: 'Maintains conversation context across sessions using vector embeddings.',
        icon: Brain,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v3.0',
        reusability: 'global',
        inputs: [{ id: 'message', label: 'Message', type: 'message' }],
        outputs: [{ id: 'context', label: 'Context + History', type: 'context' }],
        config: {
            maxHistory: 50,
            embeddingModel: 'text-embedding-3-small'
        }
    },
    {
        type: 'core',
        templateId: 'intent-router',
        label: 'AI Intent Router',
        description: 'Classifies user intent and routes to appropriate handler using LLM.',
        icon: Route,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v2.3',
        reusability: 'global',
        inputs: [{ id: 'context', label: 'Context', type: 'context' }],
        outputs: [
            { id: 'sales', label: 'Sales Intent', type: 'intent' },
            { id: 'support', label: 'Support Intent', type: 'intent' },
            { id: 'info', label: 'Info Intent', type: 'intent' }
        ],
        config: {
            model: 'gpt-4o-mini',
            confidenceThreshold: 0.7
        }
    },
    {
        type: 'core',
        templateId: 'confidence-fallback',
        label: 'Confidence & Fallback System',
        description: 'Handles low-confidence responses with graceful fallback strategies.',
        icon: AlertTriangle,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.1',
        reusability: 'global',
        inputs: [{ id: 'response', label: 'AI Response', type: 'response' }],
        outputs: [
            { id: 'confident', label: 'High Confidence', type: 'response' },
            { id: 'fallback', label: 'Fallback', type: 'escalation' }
        ],
        config: {
            minConfidence: 0.75,
            fallbackMessage: 'Let me connect you with a human agent.'
        }
    },
    {
        type: 'core',
        templateId: 'human-handoff',
        label: 'Human Handoff / Escalation',
        description: 'Seamlessly transfers conversation to human agents with full context.',
        icon: UserCheck,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.5',
        reusability: 'global',
        inputs: [{ id: 'escalation', label: 'Escalation Request', type: 'escalation' }],
        outputs: [{ id: 'handoff', label: 'Agent Assignment', type: 'handoff' }],
        config: {
            platform: 'freshdesk',
            preserveContext: true
        }
    },
    {
        type: 'core',
        templateId: 'prompt-versioning',
        label: 'Prompt Versioning Engine',
        description: 'Manages prompt templates with version control and A/B testing.',
        icon: FileText,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.0',
        reusability: 'global',
        inputs: [{ id: 'promptId', label: 'Prompt ID', type: 'string' }],
        outputs: [{ id: 'prompt', label: 'Versioned Prompt', type: 'prompt' }],
        config: {
            enableABTesting: true,
            defaultVersion: 'latest'
        }
    },
    {
        type: 'core',
        templateId: 'retry-recovery',
        label: 'Retry & Failure Recovery',
        description: 'Handles transient failures with exponential backoff and dead letter queue.',
        icon: RefreshCw,
        category: NODE_CATEGORIES.CORE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.3',
        reusability: 'global',
        inputs: [{ id: 'operation', label: 'Operation', type: 'any' }],
        outputs: [
            { id: 'success', label: 'Success', type: 'any' },
            { id: 'failed', label: 'Dead Letter', type: 'error' }
        ],
        config: {
            maxRetries: 3,
            backoffMultiplier: 2
        }
    }
];

// ============ MODULE BUSINESS LOGIC NODES ============
export const MODULE_NODES = [
    {
        type: 'module',
        templateId: 'lead-scoring',
        label: 'Lead Scoring Engine',
        description: 'Scores leads based on engagement, demographics, and behavior patterns.',
        icon: Target,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v2.0',
        reusability: 'global',
        inputs: [{ id: 'lead', label: 'Lead Data', type: 'lead' }],
        outputs: [{ id: 'scoredLead', label: 'Scored Lead', type: 'scored-lead' }],
        config: {
            scoringModel: 'predictive',
            minScore: 0,
            maxScore: 100
        }
    },
    {
        type: 'module',
        templateId: 'sales-qualification',
        label: 'Sales Qualification Bot',
        description: 'Automates BANT qualification through conversational AI.',
        icon: UserPlus,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.8',
        reusability: 'global',
        inputs: [{ id: 'conversation', label: 'Conversation', type: 'context' }],
        outputs: [
            { id: 'qualified', label: 'Qualified Lead', type: 'lead' },
            { id: 'unqualified', label: 'Nurture', type: 'lead' }
        ],
        config: {
            qualificationCriteria: ['budget', 'authority', 'need', 'timeline']
        }
    },
    {
        type: 'module',
        templateId: 'payment-handler',
        label: 'Payment / Subscription Handler',
        description: 'Manages Stripe/Razorpay payments and subscription lifecycle.',
        icon: CreditCard,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v2.2',
        reusability: 'global',
        inputs: [{ id: 'paymentIntent', label: 'Payment Intent', type: 'payment' }],
        outputs: [
            { id: 'success', label: 'Payment Success', type: 'receipt' },
            { id: 'failed', label: 'Payment Failed', type: 'error' }
        ],
        config: {
            provider: 'stripe',
            currency: 'USD'
        }
    },
    {
        type: 'module',
        templateId: 'ticket-classifier',
        label: 'Support Ticket Classifier',
        description: 'Auto-categorizes and prioritizes support tickets using NLP.',
        icon: Ticket,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.4',
        reusability: 'global',
        inputs: [{ id: 'ticket', label: 'Support Ticket', type: 'ticket' }],
        outputs: [{ id: 'classified', label: 'Classified Ticket', type: 'classified-ticket' }],
        config: {
            categories: ['billing', 'technical', 'general', 'urgent'],
            autoAssign: true
        }
    },
    {
        type: 'module',
        templateId: 'crm-sync',
        label: 'CRM Sync Module',
        description: 'Bi-directional sync with Salesforce, HubSpot, or custom CRMs.',
        icon: Database,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.6',
        reusability: 'global',
        inputs: [{ id: 'data', label: 'Contact Data', type: 'contact' }],
        outputs: [{ id: 'synced', label: 'Synced Record', type: 'crm-record' }],
        config: {
            crm: 'hubspot',
            syncInterval: 300
        }
    },
    {
        type: 'module',
        templateId: 'marketing-automation',
        label: 'Marketing Automation Module',
        description: 'Triggers email sequences, SMS campaigns based on user actions.',
        icon: Megaphone,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.2',
        reusability: 'global',
        inputs: [{ id: 'trigger', label: 'Event Trigger', type: 'event' }],
        outputs: [{ id: 'campaign', label: 'Campaign Sent', type: 'campaign' }],
        config: {
            provider: 'sendgrid',
            templates: []
        }
    },
    {
        type: 'module',
        templateId: 'analytics-logging',
        label: 'Analytics / Logging Module',
        description: 'Centralized logging and analytics for all automation events.',
        icon: BarChart3,
        category: NODE_CATEGORIES.MODULE,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.0',
        reusability: 'global',
        inputs: [{ id: 'event', label: 'Event', type: 'any' }],
        outputs: [{ id: 'logged', label: 'Logged', type: 'log' }],
        config: {
            destination: 'bigquery',
            retentionDays: 90
        }
    }
];

// ============ CLIENT ASSEMBLY NODES ============
export const CLIENT_NODES = [
    {
        type: 'client',
        templateId: 'magazine-subscription',
        label: 'Magazine Subscription Automation',
        description: 'End-to-end subscription management for digital magazines.',
        icon: Building2,
        category: NODE_CATEGORIES.CLIENT,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.0',
        reusability: 'client-specific',
        clientName: 'MediaCorp',
        containedNodes: ['webhook-ingestor', 'channel-normalizer', 'payment-handler', 'crm-sync'],
        inputs: [{ id: 'subscription', label: 'Subscription Request', type: 'request' }],
        outputs: [{ id: 'confirmation', label: 'Confirmation', type: 'response' }]
    },
    {
        type: 'client',
        templateId: 'whatsapp-sales-agent',
        label: 'WhatsApp Sales Agent',
        description: 'AI-powered sales agent for WhatsApp with full qualification flow.',
        icon: MessageCircle,
        category: NODE_CATEGORIES.CLIENT,
        status: NODE_STATUS.ACTIVE,
        version: 'v2.1',
        reusability: 'client-specific',
        clientName: 'TechStartup Inc',
        containedNodes: ['webhook-ingestor', 'channel-normalizer', 'conversation-memory', 'intent-router', 'sales-qualification', 'lead-scoring'],
        inputs: [{ id: 'message', label: 'WhatsApp Message', type: 'message' }],
        outputs: [{ id: 'response', label: 'Bot Response', type: 'message' }]
    },
    {
        type: 'client',
        templateId: 'support-desk',
        label: 'Support Desk Automation',
        description: 'Multi-channel support with AI triage and human escalation.',
        icon: Headphones,
        category: NODE_CATEGORIES.CLIENT,
        status: NODE_STATUS.ACTIVE,
        version: 'v1.5',
        reusability: 'client-specific',
        clientName: 'Enterprise Co',
        containedNodes: ['webhook-ingestor', 'channel-normalizer', 'ticket-classifier', 'confidence-fallback', 'human-handoff'],
        inputs: [{ id: 'request', label: 'Support Request', type: 'request' }],
        outputs: [{ id: 'resolution', label: 'Resolution', type: 'response' }]
    }
];

// All nodes combined
export const ALL_NODE_TEMPLATES = [...CORE_NODES, ...MODULE_NODES, ...CLIENT_NODES];

// Get node template by ID
export const getNodeTemplate = (templateId) => {
    return ALL_NODE_TEMPLATES.find(n => n.templateId === templateId);
};

// Get nodes by category
export const getNodesByCategory = (categoryId) => {
    return ALL_NODE_TEMPLATES.filter(n => n.category.id === categoryId);
};

// Sidebar categories for Node Library
export const SIDEBAR_CATEGORIES = [
    { id: 'core', label: 'Core Infrastructure', nodes: CORE_NODES },
    { id: 'module', label: 'Business Modules', nodes: MODULE_NODES },
    { id: 'client', label: 'Client Projects', nodes: CLIENT_NODES }
];
