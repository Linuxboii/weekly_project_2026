import { useRef } from 'react';
import { useQuote } from './hooks/useQuote';
import { generateQuotePDF } from './lib/pdf-generator';
import { QuotationTemplate } from './components/quote/QuotationTemplate';
import { FileText, Save, Download, FileSearch, Hash, Building2, User, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from './lib/utils';

function App() {
  const {
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
    totals
  } = useQuote();

  const pdfRef = useRef<HTMLDivElement>(null);

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 15);
  const validUntil = validUntilDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleGeneratePDF = async () => {
    if (pdfRef.current) {
      await generateQuotePDF(pdfRef.current, clientName, date);
    }
  };

  const activeServices = services.filter((s) => s.enabled);
  const activeCustomServices = customServices.filter((s) => s.enabled);
  const allServices = [...activeServices, ...activeCustomServices];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[60px] md:w-[240px] bg-white border-r border-slate-200 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
            A
          </div>
          <span className="ml-3 font-semibold text-slate-800 hidden md:block">AvlokAI Tools</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1">
          <a href="#" className="flex items-center px-4 md:px-6 py-3 text-indigo-600 bg-indigo-50 border-r-2 border-indigo-600">
            <FileText size={20} className="shrink-0" />
            <span className="ml-3 font-medium text-sm hidden md:block">Quote Builder</span>
          </a>
          <a href="#" className="flex items-center px-4 md:px-6 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50">
            <FileSearch size={20} className="shrink-0" />
            <span className="ml-3 font-medium text-sm hidden md:block">Drafts</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Quotes</span>
            <ChevronRight size={14} />
            <span className="text-slate-900">New Quotation</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={resetQuote}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Reset Draft</span>
            </button>
            <button 
              onClick={handleGeneratePDF}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Generate PDF</span>
            </button>
          </div>
        </header>

        {/* Scrollable Layout */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex min-w-[1200px] h-full p-6 gap-6">
            
            {/* Column 1: Options Panel */}
            <section className="w-[300px] xl:w-1/4 shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 pb-12">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} className="text-indigo-500" />
                  Client Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Company / Person Name</label>
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-500" />
                  Standard Services
                </h3>
                <div className="space-y-2">
                  {services.map(service => (
                    <label 
                      key={service.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${service.enabled ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={service.enabled} 
                        onChange={() => toggleService(service.id)} 
                        className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-slate-800">{service.name}</span>
                        <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{service.description}</span>
                        {service.enabled && (
                           <div className="mt-2 flex gap-2">
                              <input 
                                type="number" 
                                value={service.quantity}
                                onChange={(e) => updateService(service.id, { quantity: Number(e.target.value) })}
                                className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-white" 
                                min="1"
                              />
                           </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Hash size={16} className="text-indigo-500" />
                    Custom Line Items
                  </h3>
                  <button onClick={addCustomService} className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-md transition-colors">
                    <PlusCircle size={16} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {customServices.map(service => (
                    <div key={service.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                      <button 
                        onClick={() => removeCustomService(service.id)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-2 mb-1">
                        <input 
                          type="checkbox" 
                          checked={service.enabled} 
                          onChange={() => toggleCustomService(service.id)} 
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <input 
                           type="text" 
                           value={service.name}
                           onChange={(e) => updateCustomService(service.id, { name: e.target.value })}
                           className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 text-sm font-semibold text-slate-800"
                           placeholder="Item Name" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Qty</label>
                          <input 
                            type="number" 
                            value={service.quantity}
                            onChange={(e) => updateCustomService(service.id, { quantity: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Price</label>
                          <input 
                            type="number" 
                            value={service.unitPrice}
                            onChange={(e) => updateCustomService(service.id, { unitPrice: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {customServices.length === 0 && (
                     <p className="text-xs text-slate-500 text-center py-4 italic">No custom items added.</p>
                  )}
                </div>
              </div>

            </section>

            {/* Column 2: Live Preview */}
            <section className="flex-1 min-w-[500px] xl:min-w-[600px] flex flex-col items-center overflow-y-auto pb-12">
              <div className="w-full max-w-[840px] bg-white rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden flex flex-col preview-canvas">
                
                {/* PDF-like Header */}
                <header className="p-10 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                         <span className="text-white font-bold text-2xl">A</span>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">AvlokAI</h1>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Business Intelligence</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-3xl font-light text-slate-300 uppercase tracking-widest mb-1">Quotation</h2>
                      <p className="text-slate-900 font-bold text-sm tracking-wide">#2026-001</p>
                    </div>
                  </div>
                </header>

                {/* PDF-like Body */}
                <div className="p-10 flex-1 flex flex-col">
                  
                  {/* Addresses */}
                  <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-3">From</h3>
                      <p className="font-bold text-slate-900 text-sm">AvlokAI</p>
                      <p className="text-sm text-indigo-600 font-medium mt-1">avlokaibusiness@gmail.com</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-3">Bill To</h3>
                      <p className="font-bold text-slate-900 text-sm">{clientName || 'Client Name'}</p>
                    </div>
                  </div>

                  {/* Meta Data */}
                  <div className="grid grid-cols-3 gap-0 mb-10 border-y border-slate-100 py-4 bg-slate-50/50 px-4 rounded-lg">
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Quote Date</p>
                      <p className="text-sm font-semibold text-slate-900">{date}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Valid Until</p>
                      <p className="text-sm font-semibold text-slate-900">{validUntil}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Currency</p>
                      <p className="text-sm font-semibold text-slate-900">INR (₹)</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-10 flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-900">
                          <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</th>
                          <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center w-16">Qty</th>
                          <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right w-28">Rate (₹)</th>
                          <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right w-32">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allServices.map(s => {
                          let quantityStr = String(s.quantity);
                          return (
                            <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-2">
                                <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{s.description || 'Custom line item'}</p>
                              </td>
                              <td className="py-4 px-2 text-center text-sm text-slate-600">{quantityStr}</td>
                              <td className="py-4 px-2 text-right text-sm text-slate-600">{formatCurrency(s.unitPrice).replace('₹', '')}</td>
                              <td className="py-4 px-2 text-right text-sm font-semibold text-slate-900">{formatCurrency(s.unitPrice * Math.max(1, s.quantity)).replace('₹', '')}</td>
                            </tr>
                          );
                        })}

                        {totals.managementCost > 0 && (
                          <tr className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-2">
                              <p className="font-semibold text-slate-900 text-sm">Expert Retainer</p>
                              <p className="text-xs text-slate-500 mt-0.5">Monthly maintenance and operations</p>
                            </td>
                            <td className="py-4 px-2 text-center text-sm text-slate-600">1</td>
                            <td className="py-4 px-2 text-right text-sm text-slate-600">{formatCurrency(totals.managementCost).replace('₹', '')}</td>
                            <td className="py-4 px-2 text-right text-sm font-semibold text-slate-900">{formatCurrency(totals.managementCost).replace('₹', '')}</td>
                          </tr>
                        )}
                        
                        {totals.setupFee > 0 && (
                          <tr className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-2">
                              <p className="font-semibold text-slate-900 text-sm">Strategic Setup</p>
                              <p className="text-xs text-slate-500 mt-0.5">Extra configuration and integration fee</p>
                            </td>
                            <td className="py-4 px-2 text-center text-sm text-slate-600">1</td>
                            <td className="py-4 px-2 text-right text-sm text-slate-600">{formatCurrency(totals.setupFee).replace('₹', '')}</td>
                            <td className="py-4 px-2 text-right text-sm font-semibold text-slate-900">{formatCurrency(totals.setupFee).replace('₹', '')}</td>
                          </tr>
                        )}
                        
                        {totals.buildFee > 0 && (
                          <tr className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-2">
                              <p className="font-semibold text-slate-900 text-sm">One-Time Build Fee</p>
                              <p className="text-xs text-slate-500 mt-0.5">Initial system development and provisioning</p>
                            </td>
                            <td className="py-4 px-2 text-center text-sm text-slate-600">1</td>
                            <td className="py-4 px-2 text-right text-sm text-slate-600">{formatCurrency(totals.buildFee).replace('₹', '')}</td>
                            <td className="py-4 px-2 text-right text-sm font-semibold text-slate-900">{formatCurrency(totals.buildFee).replace('₹', '')}</td>
                          </tr>
                        )}

                        {allServices.length === 0 && totals.managementCost === 0 && totals.setupFee === 0 && totals.buildFee === 0 && (
                          <tr>
                             <td colSpan={4} className="py-8 text-center text-slate-400 text-sm italic">
                               No items added to the quotation yet.
                             </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Section */}
                  <div className="flex justify-end pt-6 border-t border-slate-200">
                    <div className="w-[320px] space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Monthly Subtotal</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(totals.monthlyTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">One-Time Fees</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(totals.setupFee + totals.buildFee)}</span>
                      </div>
                      <div className="h-px bg-slate-200 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 uppercase tracking-wide">Total First Month</span>
                        <span className="text-2xl font-black text-indigo-600">{formatCurrency(totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Column 3: Summary Panel */}
            <section className="w-[300px] xl:w-1/4 shrink-0 overflow-y-auto pb-12 pr-2">
              <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl sticky top-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Commercial Summary</h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Monthly Recurring (MRR)</p>
                    <p className="text-3xl font-light text-white tracking-tight">{formatCurrency(totals.monthlyTotal)}</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-400 text-sm mb-1">One-Time Setup Total</p>
                    <p className="text-2xl font-light text-slate-200 tracking-tight">{formatCurrency(totals.setupFee + totals.buildFee)}</p>
                  </div>

                  <div className="h-px bg-slate-800 my-4"></div>

                  <div>
                    <p className="text-indigo-400 text-sm font-semibold mb-1 uppercase tracking-wider">Total Due Today</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(totals.grandTotal)}</p>
                  </div>
                </div>

                <button 
                  onClick={handleGeneratePDF}
                  className="w-full mt-8 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PDF Quote
                </button>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Hidden PDF Template (for html2canvas/jsPDF generation to mirror the web view accurately but on a fixed resolution if needed, though we can reuse the same styles here we keep the original hidden component so generation logic doesn't break) */}
      <QuotationTemplate
        ref={pdfRef}
        clientName={clientName}
        services={services}
        customServices={customServices}
        totals={totals}
        date={date}
        validUntil={validUntil}
      />
    </div>
  );
}

export default App;
