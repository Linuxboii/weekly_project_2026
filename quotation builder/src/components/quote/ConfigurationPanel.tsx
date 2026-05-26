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
    const buildFee = getS('build_fee');

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
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                label="WhatsApp Volume"
                                type="number"
                                value={whatsapp.quantity}
                                onChange={(e) => updateService('whatsapp', { quantity: parseInt(e.target.value) || 0 })}
                            />
                            <Input
                                label="Unit Price"
                                type="number"
                                value={whatsapp.unitPrice}
                                onChange={(e) => updateService('whatsapp', { unitPrice: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                label="Email Inboxes"
                                type="number"
                                value={email.quantity}
                                onChange={(e) => updateService('email_inbox', { quantity: parseInt(e.target.value) || 0 })}
                            />
                            <Input
                                label="Unit Price"
                                type="number"
                                value={email.unitPrice}
                                onChange={(e) => updateService('email_inbox', { unitPrice: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>

                {/* AI & Data Config */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-status-info">
                        <Sparkles size={18} />
                        <h3 className="text-sm font-semibold">AI & Lead Intel</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                label="AI Tokens (M/mo)"
                                type="number"
                                value={openai.quantity}
                                onChange={(e) => updateService('openai_tokens', { quantity: parseInt(e.target.value) || 0 })}
                            />
                            <Input
                                label="Unit Price"
                                type="number"
                                value={openai.unitPrice}
                                onChange={(e) => updateService('openai_tokens', { unitPrice: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                label="Lead Batches"
                                type="number"
                                value={leadgen.quantity}
                                onChange={(e) => updateService('ai_lead_gen', { quantity: parseInt(e.target.value) || 0 })}
                            />
                            <Input
                                label="Unit Price"
                                type="number"
                                value={leadgen.unitPrice}
                                onChange={(e) => updateService('ai_lead_gen', { unitPrice: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Automation Hardware/API */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-status-success">
                        <Cpu size={18} />
                        <h3 className="text-sm font-semibold">Infrastructure</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Checkbox
                                label="n8n Managed Instance"
                                checked={n8n.enabled}
                                onChange={() => toggleService('n8n_hosting')}
                            />
                            {n8n.enabled && (
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={n8n.unitPrice}
                                        onChange={(e) => updateService('n8n_hosting', { unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                    <Input
                                        label="Qty"
                                        type="number"
                                        value={n8n.quantity}
                                        onChange={(e) => updateService('n8n_hosting', { quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Checkbox
                                label="Email Warmup Engine"
                                checked={warmup.enabled}
                                onChange={() => toggleService('warmup')}
                            />
                            {warmup.enabled && (
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={warmup.unitPrice}
                                        onChange={(e) => updateService('warmup', { unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                    <Input
                                        label="Qty"
                                        type="number"
                                        value={warmup.quantity}
                                        onChange={(e) => updateService('warmup', { quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Advanced AI Toggles */}
                <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-brand-light">
                        <Workflow size={18} />
                        <h3 className="text-sm font-semibold">AI Platforms</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Checkbox
                                label="SerpAPI Web Research"
                                checked={serp.enabled}
                                onChange={() => toggleService('serp_api')}
                            />
                            {serp.enabled && (
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={serp.unitPrice}
                                        onChange={(e) => updateService('serp_api', { unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                    <Input
                                        label="Qty"
                                        type="number"
                                        value={serp.quantity}
                                        onChange={(e) => updateService('serp_api', { quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Checkbox
                                label="Blotato Agent Layer"
                                checked={blotato.enabled}
                                onChange={() => toggleService('blotato_api')}
                            />
                            {blotato.enabled && (
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={blotato.unitPrice}
                                        onChange={(e) => updateService('blotato_api', { unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                    <Input
                                        label="Qty"
                                        type="number"
                                        value={blotato.quantity}
                                        onChange={(e) => updateService('blotato_api', { quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Commercials */}
                <div className="md:col-span-2 space-y-4 p-4 rounded-xl border border-white/5 bg-brand-subtle">
                    <div className="flex items-center gap-2 text-brand">
                        <Box size={18} />
                        <h3 className="text-sm font-semibold text-text-primary">Commercial Toggles</h3>
                    </div>
                    
                    {/* Strategic Support Retainer Section */}
                    <div className="pt-2 border-t border-white/10">
                        <Checkbox
                            label="Strategic Support Retainer"
                            checked={management.enabled}
                            onChange={() => toggleService('management')}
                        />
                        {management.enabled && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <Input
                                    label="Price"
                                    type="number"
                                    value={management.unitPrice}
                                    onChange={(e) => updateService('management', { unitPrice: parseInt(e.target.value) || 0 })}
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    value={management.quantity}
                                    onChange={(e) => updateService('management', { quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        )}
                    </div>

                    {/* One-Time Architectural Setup Section */}
                    <div className="pt-4 border-t border-white/10">
                        <Checkbox
                            label="One-Time Architectural Setup"
                            checked={setup.enabled}
                            onChange={() => toggleService('setup')}
                        />
                        {setup.enabled && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <Input
                                    label="Price"
                                    type="number"
                                    value={setup.unitPrice}
                                    onChange={(e) => updateService('setup', { unitPrice: parseInt(e.target.value) || 0 })}
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    value={setup.quantity}
                                    onChange={(e) => updateService('setup', { quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* One-Time Build Fee Section */}
                    <div className="pt-4 border-t border-white/10">
                        <Checkbox
                            label="One-Time Build Fee"
                            checked={buildFee.enabled}
                            onChange={() => toggleService('build_fee')}
                        />
                        {buildFee.enabled && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <Input
                                    label="Price"
                                    type="number"
                                    value={buildFee.unitPrice}
                                    onChange={(e) => updateService('build_fee', { unitPrice: parseInt(e.target.value) || 0 })}
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    value={buildFee.quantity}
                                    onChange={(e) => updateService('build_fee', { quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
