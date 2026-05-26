import React from 'react';
import type { ServiceItem, QuoteTotals } from '../../hooks/useQuote';
import { formatCurrency } from '../../lib/utils';

interface QuotationTemplateProps {
    clientName: string;
    companyName?: string;
    services: ServiceItem[];
    customServices?: ServiceItem[];
    totals: QuoteTotals;
    date: string;
    validUntil: string;
    agencyEmail?: string;
}

export const QuotationTemplate = React.forwardRef<HTMLDivElement, QuotationTemplateProps>(
    ({ clientName, companyName = '', services, customServices = [], totals, date, validUntil, agencyEmail = 'avlokaibusiness@gmail.com' }, ref) => {
        const activeServices = services.filter((s) => s.enabled);
        const activeCustomServices = customServices.filter((s) => s.enabled);
        const allServices = [...activeServices, ...activeCustomServices];

        return (
            <div
                ref={ref}
                style={{
                    width: '800px',
                    minHeight: '1100px',
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    backgroundColor: 'white',
                }}
                className="font-display text-slate-900 bg-white"
            >
                <div className="max-w-[800px] w-full bg-white border border-slate-300 shadow-xl overflow-hidden min-h-[1100px] flex flex-col">
                    <header className="p-12 border-b-2 border-slate-100">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                {/* Custom Logo Image */}
                                <div className="flex items-center justify-center">
                                    <img src="/avlokai_logo.png" alt="Logo" className="w-[80px] h-[80px] object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                                        AvlokAI
                                    </h1>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                                        Business Intelligence Solutions
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-1">
                                    Quotation
                                </h2>
                                <p className="text-slate-900 font-bold text-sm">#2026-001</p>
                            </div>
                        </div>
                    </header>

                    <div className="p-12 flex-grow">
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-2">
                                    From
                                </h3>
                                <div>
                                    <p className="font-bold text-slate-900">AvlokAI</p>
                                    <p className="text-sm text-primary font-medium mt-1">{agencyEmail}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-2">
                                    Bill To
                                </h3>
                                <div className="flex items-start gap-4">
                                    <div>
                                        <p className="font-bold text-slate-900">{clientName || 'Client Name'}</p>
                                        {companyName && <p className="text-sm text-slate-600 mt-1">{companyName}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-0 mb-12 border-y border-slate-100 py-6">
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Quote Date
                                </p>
                                <p className="text-sm font-semibold text-slate-900">{date}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Valid Until
                                </p>
                                <p className="text-sm font-semibold text-slate-900">{validUntil}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Currency
                                </p>
                                <p className="text-sm font-semibold text-slate-900">INR (₹)</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto mb-12">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-900">
                                        <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Description
                                        </th>
                                        <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-400 text-center">
                                            Qty
                                        </th>
                                        <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">
                                            Rate (₹)
                                        </th>
                                        <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">
                                            Amount (₹)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allServices.filter(s => !['management', 'setup', 'build_fee'].includes(s.id)).map((s) => {
                                        let quantityStr = '1';
                                        if (s.id === 'whatsapp' || s.id === 'email_inbox' || s.id === 'openai_tokens' || s.id === 'ai_lead_gen') {
                                            quantityStr = String(s.quantity);
                                        } else if (s.quantity > 1) {
                                            quantityStr = String(s.quantity);
                                        }
                                        return (
                                            <tr key={s.id}>
                                                <td className="py-6 px-2">
                                                    <p className="font-semibold text-slate-900">{s.name}</p>
                                                </td>
                                                <td className="py-6 px-2 text-center text-sm">{quantityStr}</td>
                                                <td className="py-6 px-2 text-right text-sm">
                                                    {formatCurrency(s.unitPrice).replace('₹', '')}
                                                </td>
                                                <td className="py-6 px-2 text-right text-sm font-semibold">
                                                    {formatCurrency(s.unitPrice * s.quantity).replace('₹', '')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {totals.managementCost > 0 && (
                                        <tr>
                                            <td className="py-6 px-2">
                                                <p className="font-semibold text-slate-900">Expert Retainer</p>
                                            </td>
                                            <td className="py-6 px-2 text-center text-sm">{services.find(s => s.id === 'management')?.quantity || 1}</td>
                                            <td className="py-6 px-2 text-right text-sm">
                                                {formatCurrency(services.find(s => s.id === 'management')?.unitPrice || 0).replace('₹', '')}
                                            </td>
                                            <td className="py-6 px-2 text-right text-sm font-semibold">
                                                {formatCurrency(totals.managementCost).replace('₹', '')}
                                            </td>
                                        </tr>
                                    )}
                                    {totals.setupFee > 0 && (
                                        <tr>
                                            <td className="py-6 px-2">
                                                <p className="font-semibold text-slate-900">Additional Implementation</p>
                                            </td>
                                            <td className="py-6 px-2 text-center text-sm">{services.find(s => s.id === 'setup')?.quantity || 1}</td>
                                            <td className="py-6 px-2 text-right text-sm">
                                                {formatCurrency(services.find(s => s.id === 'setup')?.unitPrice || 0).replace('₹', '')}
                                            </td>
                                            <td className="py-6 px-2 text-right text-sm font-semibold">
                                                {formatCurrency(totals.setupFee).replace('₹', '')}
                                            </td>
                                        </tr>
                                    )}
                                    {totals.buildFee > 0 && (
                                        <tr>
                                            <td className="py-6 px-2">
                                                <p className="font-semibold text-slate-900">One-Time Build Fee</p>
                                            </td>
                                            <td className="py-6 px-2 text-center text-sm">{services.find(s => s.id === 'build_fee')?.quantity || 1}</td>
                                            <td className="py-6 px-2 text-right text-sm">
                                                {formatCurrency(services.find(s => s.id === 'build_fee')?.unitPrice || 0).replace('₹', '')}
                                            </td>
                                            <td className="py-6 px-2 text-right text-sm font-semibold">
                                                {formatCurrency(totals.buildFee).replace('₹', '')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-12">
                            <div className="md:max-w-xs">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    Terms &amp; Conditions
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    1. 50% advance payment required to commence. <br />
                                    2. Project completion subject to timely access to data APIs.
                                </p>
                            </div>
                            <div className="w-full md:w-80 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Monthly Services (Recurring)</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(totals.monthlyTotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">One-Time Implementation</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(totals.initialPayable)}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-200 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                                        Initial Payable
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(totals.initialPayable)}
                                    </span>
                                </div>
                                <div className="text-[10px] text-right text-slate-400 italic">
                                    * Monthly recurring services to commence post-implementation.
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="p-12 text-center">
                        <div className="border-t border-slate-100 pt-8">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] mb-4">
                                Certified Partner • Quality Assured • Enterprise Ready
                            </p>
                            <p className="text-xs text-slate-500">
                                Thank you for choosing AvlokAI. We look forward to scaling your business together.
                            </p>
                            <p className="text-[10px] text-slate-300 mt-8 italic">
                                This is a computer generated document and does not require a physical signature.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
);
QuotationTemplate.displayName = 'QuotationTemplate';
