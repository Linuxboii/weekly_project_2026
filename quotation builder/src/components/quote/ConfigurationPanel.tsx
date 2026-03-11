import type { ServiceItem } from '../../hooks/useQuote';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { MessageSquare, Box, Sparkles, Workflow, Cpu } from 'lucide-react';

interface ConfigurationPanelProps {
    services: ServiceItem[];
    updateService: (id: string, updates: Partial<ServiceItem>) => void;
    toggleService: (id: string) => void;
}

export const ConfigurationPanel = ({ services, updateService, toggleService }: ConfigurationPanelProps) => {
    const getS = (id: string) => services.find(s => s.id === id) || services[0];

    const whatsapp = getS('whatsapp');
    const email = getS('email_inbox');
    const openai = getS('openai_tokens');
    const leadgen = getS('ai_lead_gen');

    // Toggles
    const warmup = getS('warmup');
    const n8n = getS('n8n_hosting');
    const serp = getS('serp_api');
    const blotato = getS('blotato_api');
    const management = getS('management');
    const setup = getS('setup');

    return (
        <Card className="flex flex-col gap-8 h-full overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Tooling & Capacities</h2>
                <p className="text-xs text-text-muted">Configure your AI outreach stack variables.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                {/* Communication Config */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-brand">
                        <MessageSquare size={18} />
                        <h3 className="text-sm font-semibold">Messaging & Email</h3>
                    </div>
                    <Input
                        label="Monthly WhatsApp Volume"
                        type="number"
                        value={whatsapp.quantity}
                        onChange={(e) => updateService('whatsapp', { quantity: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                        label="Email Sending Inboxes"
                        type="number"
                        value={email.quantity}
                        onChange={(e) => updateService('email_inbox', { quantity: parseInt(e.target.value) || 0 })}
                    />
                </div>

                {/* AI & Data Config */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-status-info">
                        <Sparkles size={18} />
                        <h3 className="text-sm font-semibold">AI & Lead Intel</h3>
                    </div>
                    <Input
                        label="AI Tokens (Millions/mo)"
                        type="number"
                        value={openai.quantity}
                        onChange={(e) => updateService('openai_tokens', { quantity: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                        label="Lead Batches (per 1k)"
                        type="number"
                        value={leadgen.quantity}
                        onChange={(e) => updateService('ai_lead_gen', { quantity: parseInt(e.target.value) || 0 })}
                    />
                </div>

                {/* Automation Hardware/API */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-status-success">
                        <Cpu size={18} />
                        <h3 className="text-sm font-semibold">Infrastucture</h3>
                    </div>
                    <div className="space-y-3">
                        <Checkbox
                            label="n8n Managed Instance"
                            checked={n8n.enabled}
                            onChange={() => toggleService('n8n_hosting')}
                        />
                        <Checkbox
                            label="Email Warmup Engine"
                            checked={warmup.enabled}
                            onChange={() => toggleService('warmup')}
                        />
                    </div>
                </div>

                {/* Advanced AI Toggles */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-brand-light">
                        <Workflow size={18} />
                        <h3 className="text-sm font-semibold">AI Platforms</h3>
                    </div>
                    <div className="space-y-3">
                        <Checkbox
                            label="SerpAPI Web Research"
                            checked={serp.enabled}
                            onChange={() => toggleService('serp_api')}
                        />
                        <Checkbox
                            label="Blotato Agent Layer"
                            checked={blotato.enabled}
                            onChange={() => toggleService('blotato_api')}
                        />
                    </div>
                </div>

                {/* Commercials */}
                <div className="md:col-span-2 space-y-4 p-4 rounded-xl border border-white/5 bg-brand-subtle">
                    <div className="flex items-center gap-2 text-brand">
                        <Box size={18} />
                        <h3 className="text-sm font-semibold text-text-primary">Commercial Toggles</h3>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <Checkbox
                            label="Strategic Support Retainer"
                            checked={management.enabled}
                            onChange={() => toggleService('management')}
                        />
                        <Checkbox
                            label="One-Time Architectural Setup"
                            checked={setup.enabled}
                            onChange={() => toggleService('setup')}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};
