import type { ServiceItem } from '../../hooks/useQuote';
import { Card } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface ServiceSelectorProps {
    services: ServiceItem[];
    customServices: ServiceItem[];
    toggleService: (id: string) => void;
    updateService: (id: string, updates: Partial<ServiceItem>) => void;
    addCustomService: () => void;
    updateCustomService: (id: string, updates: Partial<ServiceItem>) => void;
    toggleCustomService: (id: string) => void;
    removeCustomService: (id: string) => void;
}

export const ServiceSelector = ({
    services,
    customServices,
    toggleService,
    updateService,
    addCustomService,
    updateCustomService,
    toggleCustomService,
    removeCustomService
}: ServiceSelectorProps) => {
    return (
        <Card className="flex flex-col gap-6 h-full overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Services</h2>
                <p className="text-xs text-text-muted">Select the services to include in the quote.</p>
            </div>

            <div className="space-y-4">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <Checkbox
                                label={service.name}
                                description={service.description}
                                checked={service.enabled}
                                onChange={() => toggleService(service.id)}
                            />
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-brand">₹</span>
                                    <Input
                                        type="number"
                                        value={service.unitPrice}
                                        onChange={(e) => updateService(service.id, { unitPrice: parseInt(e.target.value) || 0 })}
                                        className="h-8 w-24 text-right text-xs font-semibold text-brand"
                                    />
                                    <span className="text-xs text-text-muted">{service.type === 'monthly' ? '/mo' : ' once'}</span>
                                </div>
                                {service.id !== 'management' && service.id !== 'setup' && service.id !== 'platform' && service.id !== 'warmup' && service.id !== 'server' && (
                                    <div className="w-20">
                                        <Input
                                            type="number"
                                            value={service.quantity}
                                            onChange={(e) => updateService(service.id, { quantity: parseInt(e.target.value) || 0 })}
                                            className="h-8 text-center"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {customServices.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary">Custom Line Items</h3>
                        {customServices.map((service) => (
                            <div
                                key={service.id}
                                className="p-4 rounded-xl border border-brand/20 bg-brand/5 transition-colors relative group"
                            >
                                <button
                                    onClick={() => removeCustomService(service.id)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-status-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={12} />
                                </button>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            label=""
                                            checked={service.enabled}
                                            onChange={() => toggleCustomService(service.id)}
                                        />
                                        <Input
                                            placeholder="Service Name"
                                            value={service.name}
                                            onChange={(e) => updateCustomService(service.id, { name: e.target.value })}
                                            className="h-8 flex-1"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pl-8">
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                value={service.quantity}
                                                onChange={(e) => updateCustomService(service.id, { quantity: parseInt(e.target.value) || 0 })}
                                                className="h-8 text-center"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-brand">₹</span>
                                            <Input
                                                type="number"
                                                value={service.unitPrice}
                                                onChange={(e) => updateCustomService(service.id, { unitPrice: parseInt(e.target.value) || 0 })}
                                                className="h-8 w-24 text-right text-xs font-semibold text-brand"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    variant="secondary"
                    className="w-full mt-2 border-white/5 border-dashed bg-transparent hover:bg-white/5"
                    onClick={addCustomService}
                >
                    <Plus size={16} className="mr-2" />
                    Add Custom Line Item
                </Button>
            </div>
        </Card>
    );
};
