import { useState, useEffect, useMemo } from 'react';

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    quantity: number;
    enabled: boolean;
    type: 'monthly' | 'one-time';
}

export const INITIAL_SERVICES: ServiceItem[] = [
    {
        id: 'whatsapp',
        name: 'WhatsApp Business API',
        description: 'Advanced WhatsApp Cloud API messaging',
        unitPrice: 0.80,
        quantity: 2000,
        enabled: true,
        type: 'monthly',
    },
    {
        id: 'email_inbox',
        name: 'Email Infrastructure',
        description: 'Premium dedicated sending inboxes',
        unitPrice: 850,
        quantity: 3,
        enabled: true,
        type: 'monthly',
    },
    {
        id: 'n8n_hosting',
        name: 'n8n Managed Instance',
        description: 'Enterprise-grade n8n workflow hosting',
        unitPrice: 3500,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'openai_tokens',
        name: 'AI Token Hub (OpenAI)',
        description: 'Managed credits for LLM operations (per 1M tokens)',
        unitPrice: 2000,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'serp_api',
        name: 'Web Intelligence (SerpAPI)',
        description: 'Real-time web search for AI agents',
        unitPrice: 5500,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'blotato_api',
        name: 'AI Agent Platform (Blotato)',
        description: 'Blotato API orchestration layer',
        unitPrice: 4200,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'warmup',
        name: 'Email Warmup Tools',
        description: 'Automated IP/Domain warmup service',
        unitPrice: 2500,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'ai_lead_gen',
        name: 'AI Lead Generation',
        description: 'Targeted lead discovery & enrichment (per 1k)',
        unitPrice: 4000,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'platform',
        name: 'Automation Platform',
        description: 'Platform / API access fee',
        unitPrice: 1200,
        quantity: 1,
        enabled: true,
        type: 'monthly',
    },
    {
        id: 'management',
        name: 'Agency Support Retainer',
        description: 'Monthly management and workflow optimization',
        unitPrice: 18000,
        quantity: 1,
        enabled: false,
        type: 'monthly',
    },
    {
        id: 'setup',
        name: 'Strategic System Setup',
        description: 'Initial architectural configuration & design',
        unitPrice: 22000,
        quantity: 1,
        enabled: false,
        type: 'one-time',
    },
];

export const useQuote = () => {
    const [services, setServices] = useState<ServiceItem[]>(() => {
        try {
            const saved = localStorage.getItem('automation_quote_v2');
            if (!saved) return INITIAL_SERVICES;

            const parsed: ServiceItem[] = JSON.parse(saved);

            // Merge INITIAL_SERVICES with parsed data to ensure new services are present
            return INITIAL_SERVICES.map(initial => {
                const existing = parsed.find(p => p.id === initial.id);
                if (existing) {
                    // Keep user-configured quantity, enabled state, and custom price
                    return {
                        ...initial,
                        quantity: existing.quantity,
                        enabled: existing.enabled,
                        unitPrice: existing.unitPrice !== undefined ? existing.unitPrice : initial.unitPrice
                    };
                }
                return initial;
            });
        } catch (e) {
            console.error('Failed to parse quote from localStorage', e);
            return INITIAL_SERVICES;
        }
    });

    const [clientName, setClientName] = useState('New Client');

    useEffect(() => {
        localStorage.setItem('automation_quote_v2', JSON.stringify(services));
    }, [services]);

    const updateService = (id: string, updates: Partial<ServiceItem>) => {
        setServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
    };

    const toggleService = (id: string) => {
        setServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        );
    };

    const [customServices, setCustomServices] = useState<ServiceItem[]>(() => {
        try {
            const saved = localStorage.getItem('automation_custom_services_v1');
            if (saved) return JSON.parse(saved);
            return [];
        } catch (e) {
            console.error('Failed to parse custom quote services from localStorage', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('automation_custom_services_v1', JSON.stringify(customServices));
    }, [customServices]);

    const addCustomService = () => {
        const newService: ServiceItem = {
            id: `custom_${Date.now()}`,
            name: 'Custom Item',
            description: '',
            unitPrice: 0,
            quantity: 1,
            enabled: true,
            type: 'monthly',
        };
        setCustomServices((prev) => [...prev, newService]);
    };

    const updateCustomService = (id: string, updates: Partial<ServiceItem>) => {
        setCustomServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
    };

    const removeCustomService = (id: string) => {
        setCustomServices((prev) => prev.filter((s) => s.id !== id));
    };

    const toggleCustomService = (id: string) => {
        setCustomServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        );
    };

    const resetQuote = () => {
        setServices(INITIAL_SERVICES.map(s => ({ ...s, enabled: false })));
        setCustomServices([]);
        setClientName('New Client');
    };

    const totals = useMemo(() => {
        const infrastructureItems = services.filter(s => s.type === 'monthly' && s.id !== 'management');
        const managementItem = services.find(s => s.id === 'management');
        const setupItem = services.find(s => s.id === 'setup');
        const activeCustomServices = customServices.filter(s => s.enabled);

        const infrastructureSubtotal = infrastructureItems.reduce(
            (sum, s) => sum + (s.enabled ? s.unitPrice * s.quantity : 0),
            0
        );

        const customMonthlyTotal = activeCustomServices.filter(s => s.type === 'monthly').reduce(
            (sum, s) => sum + (s.unitPrice * s.quantity),
            0
        );

        const customOneTimeTotal = activeCustomServices.filter(s => s.type === 'one-time').reduce(
            (sum, s) => sum + (s.unitPrice * s.quantity),
            0
        );

        const managementCost = managementItem?.enabled ? managementItem.unitPrice * managementItem.quantity : 0;
        const monthlyTotal = infrastructureSubtotal + managementCost + customMonthlyTotal;
        const setupFee = (setupItem?.enabled ? setupItem.unitPrice * setupItem.quantity : 0) + customOneTimeTotal;
        const buildFee = 15000;

        return {
            infrastructureSubtotal: infrastructureSubtotal + customMonthlyTotal, // Combined standard + custom infrastructure
            managementCost,
            monthlyTotal,
            setupFee,
            buildFee,
            grandTotal: monthlyTotal + setupFee + buildFee,
        };
    }, [services, customServices]);

    return {
        services,
        customServices,
        clientName,
        setClientName,
        updateService,
        toggleService,
        addCustomService,
        updateCustomService,
        removeCustomService,
        toggleCustomService,
        resetQuote,
        totals,
    };
};
