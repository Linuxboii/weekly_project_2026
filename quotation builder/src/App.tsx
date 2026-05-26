import { useRef } from 'react';
import { useQuote } from './hooks/useQuote';
import { generateQuotePDF } from './lib/pdf-generator';
import { QuotationTemplate } from './components/quote/QuotationTemplate';
import { ConfigurationPanel } from './components/quote/ConfigurationPanel';
import { ServiceSelector } from './components/quote/ServiceSelector';
import { QuoteSummary } from './components/quote/QuoteSummary';
import { Layout, Mail, User, Building2 } from 'lucide-react';

function App() {
  const {
    services,
    customServices,
    clientName,
    setClientName,
    companyName,
    agencyEmail,
    setAgencyEmail,
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

  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 15);
  const validUntil = validUntilDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleGeneratePDF = async () => {
    if (pdfRef.current) {
      await generateQuotePDF(pdfRef.current, clientName, date);
    }
  };

  return (
    <div className="flex h-screen bg-background-dark text-text-primary overflow-hidden">
      
      {/* Mini Sidebar */}
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-8 bg-neutral-bg1">
        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-glow shadow-brand/20">
          <Layout size={20} className="text-white" />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="p-2 rounded-lg bg-white/5 text-brand cursor-pointer">
            <User size={20} />
          </div>
          <div className="p-2 rounded-lg text-text-muted hover:text-text-secondary cursor-pointer transition-colors">
            <Building2 size={20} />
          </div>
          <div className="p-2 rounded-lg text-text-muted hover:text-text-secondary cursor-pointer transition-colors">
            <Mail size={20} />
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Workspace Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-neutral-bg1/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Quotation Engine</h1>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-brand uppercase">Client:</span>
                <input 
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 w-32"
                  placeholder="Client Name"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-brand uppercase">Agency:</span>
                <input 
                  type="text"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 w-48 text-text-secondary"
                  placeholder="Agency Email"
                />
              </div>
            </div>
          </div>
          
          <div className="text-[10px] font-mono text-text-muted bg-white/5 px-3 py-1 rounded-full border border-white/5">
            STABLE_BUILD_2026.03
          </div>
        </header>

        {/* Multi-Column Workspace */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full min-w-[1400px] p-6 gap-6">
            
            {/* Column 1: Configuration */}
            <div className="w-[400px] shrink-0">
              <ConfigurationPanel 
                services={services}
                updateService={updateService}
                toggleService={toggleService}
              />
            </div>

            {/* Column 2: Selection */}
            <div className="w-[450px] shrink-0">
              <ServiceSelector 
                services={services}
                customServices={customServices}
                toggleService={toggleService}
                updateService={updateService}
                addCustomService={addCustomService}
                updateCustomService={updateCustomService}
                toggleCustomService={toggleCustomService}
                removeCustomService={removeCustomService}
              />
            </div>

            {/* Column 3: Summary & Export */}
            <div className="w-[450px] shrink-0">
              <QuoteSummary 
                services={services}
                customServices={customServices}
                totals={totals}
                resetQuote={resetQuote}
                onGeneratePDF={handleGeneratePDF}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Hidden PDF Engine */}
      <QuotationTemplate
        ref={pdfRef}
        clientName={clientName}
        companyName={companyName}
        services={services}
        customServices={customServices}
        totals={totals}
        date={date}
        validUntil={validUntil}
        agencyEmail={agencyEmail}
      />
    </div>
  );
}

export default App;
