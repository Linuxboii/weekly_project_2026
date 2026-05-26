import { useQuote, type ServiceItem } from '../../hooks/useQuote';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { FileDown, RefreshCw, Save, TrendingUp } from 'lucide-react';

interface QuoteSummaryProps {
    services: ServiceItem[];
    customServices: ServiceItem[];
    totals: ReturnType<typeof useQuote>['totals'];
    resetQuote: () => void;
    onGeneratePDF: () => void;
}

export const QuoteSummary = ({ services, customServices, totals, resetQuote, onGeneratePDF }: QuoteSummaryProps) => {
    const activeServices = services.filter(s => s.enabled);
    const activeCustomServices = customServices?.filter(s => s.enabled) || [];
    const allServices = [...activeServices, ...activeCustomServices];

    return (
        <Card className="flex flex-col gap-6 h-full border-brand/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl -mr-16 -mt-16 rounded-full" />

            <div>
                <h2 className="text-lg font-semibold text-text-primary">Outreach Proposal</h2>
                <p className="text-xs text-text-muted">Dynamic investment overview.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <table className="w-full text-xs text-left">
                    <thead className="text-text-muted border-b border-white/5">
                        <tr>
                            <th className="pb-2 font-medium">Core Asset</th>
                            <th className="pb-2 font-medium text-right">Investment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {allServices.map((service) => (
                            <tr key={service.id} className="group">
                                <td className="py-3 pr-4">
                                    <div className="font-medium text-text-primary">{service.name}</div>
                                    <div className="text-[10px] text-text-muted line-clamp-1">
                                        {service.quantity > 1
                                            ? `${service.quantity} Units × ${formatCurrency(service.unitPrice)}`
                                            : service.description}
                                    </div>
                                </td>
                                <td className="py-3 text-right font-medium text-text-secondary">
                                    {formatCurrency(service.unitPrice * service.quantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {allServices.length === 0 && (
                    <div className="py-8 text-center text-text-muted italic">
                        Select services to visualize investment
                    </div>
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary italic">Monthly Infrastructure</span>
                    <span className="font-medium text-text-primary">{formatCurrency(totals.infrastructureSubtotal)}</span>
                </div>

                {totals.managementCost > 0 && (
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary italic">Expert Retainer</span>
                        <span className="font-medium text-text-primary">{formatCurrency(totals.managementCost)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center p-4 rounded-xl bg-brand/10 border border-brand/20 shadow-glow shadow-brand/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Initial Payable</span>
                        <span className="text-2xl font-bold text-text-primary">{formatCurrency(totals.initialPayable)}</span>
                    </div>
                    <TrendingUp className="text-brand opacity-60" size={28} />
                </div>

                <div className="flex justify-between items-center p-2 px-3 rounded-lg border border-status-info/20 text-xs text-status-info bg-status-info/5">
                    <span>Monthly Recurring Total</span>
                    <span className="font-bold">{formatCurrency(totals.monthlyTotal)}</span>
                </div>

                <div className="text-[10px] text-text-muted italic px-1 text-center">
                    * One-time implementation fees are due upfront. Recurring services bill monthly thereafter.
                </div>

                <div className="flex gap-2 pt-2">
                    <Button variant="secondary" className="flex-1 border-white/5" onClick={() => { localStorage.setItem('automation_quote_saved', JSON.stringify({ services, totals })); alert('Quote saved to local bank'); }}>
                        <Save size={16} className="mr-2" />
                        Snap Quote
                    </Button>
                    <Button variant="ghost" size="sm" onClick={resetQuote} className="hover:text-status-error">
                        <RefreshCw size={14} />
                    </Button>
                </div>

                <Button className="w-full py-5 text-base font-bold tracking-tight rounded-xl group relative overflow-hidden" onClick={onGeneratePDF}>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-light opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center">
                        <FileDown size={20} className="mr-2" />
                        Generate Professional Proposal
                    </span>
                </Button>
            </div>
        </Card>
    );
};
