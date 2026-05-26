

function App() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-4 print:p-0 print:m-0 print:bg-white">
      {/* Poster Canvas */}
      <div className="w-[100vw] sm:w-[210mm] h-auto sm:h-[297mm] bg-gradient-to-b from-blue-50 to-cyan-100 shadow-2xl font-sans relative mx-auto print:max-w-none print:w-[210mm] print:h-[297mm] print:shadow-none print:bg-none print:from-blue-50 flex flex-col items-center overflow-hidden shrink-0 px-8 py-10">
        
        {/* Logo Section - Top Left */}
        <div className="w-full flex justify-start mb-6">
          <img src="/bbn_logo.png" alt="BBN Logo" className="w-48 sm:w-56 h-auto drop-shadow-md print:drop-shadow-none [clip-path:inset(2px_0_0_0)]" />
        </div>

        {/* Title Box */}
        <div className="w-full border-2 border-slate-700 bg-white/60 py-3 px-4 mb-10 text-center shadow-sm">
          <h2 className="text-[#3b5998] font-black text-2xl sm:text-4xl tracking-wide uppercase" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
            Construction Vertical Meeting
          </h2>
        </div>

        {/* Host Image */}
        <div className="mb-6">
          <div className="w-48 h-48 sm:w-64 sm:h-64 relative rounded-3xl overflow-hidden shadow-lg bg-slate-200">
            <img src="/host.png" alt="Host Ratan K." className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Host Info */}
        <div className="text-center mb-8 w-full">
          <h3 className="text-[#e04a4a] text-2xl sm:text-3xl font-bold mb-1">
            Host: Ratan K.
          </h3>
          <p className="text-[#a06a6a] text-xl sm:text-2xl font-extrabold">
            RK Real Estate Advisers
          </p>
        </div>

        {/* Leadership Section */}
        <div className="w-full grid grid-cols-2 gap-y-6 gap-x-4 mb-10 px-4 text-center">
          <div className="flex flex-col">
            <p className="text-[#3b5998] font-bold text-lg sm:text-xl">President</p>
            <p className="text-[#e04a4a] font-black text-base sm:text-lg">K.V Murali</p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#3b5998] font-bold text-lg sm:text-xl">Vertical Head</p>
            <p className="text-[#e04a4a] font-black text-base sm:text-lg">Prabha Kasturi</p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#3b5998] font-bold text-lg sm:text-xl">Vertical Director</p>
            <p className="text-[#e04a4a] font-black text-base sm:text-lg">VSN Murthy</p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#3b5998] font-bold text-lg sm:text-xl">Vertical Lead</p>
            <p className="text-[#e04a4a] font-black text-base sm:text-lg">G. Sangameshwar Rao</p>
          </div>
        </div>

        {/* Footer (Logistics & Contact) */}
        <div className="w-full mt-auto flex flex-col gap-6">
          
          <div className="w-full flex justify-between px-4 sm:px-8">
            {/* Venue */}
            <div className="flex flex-col text-left">
              <p className="text-black font-extrabold text-lg sm:text-xl">Venue: BBN Meeting Hall,</p>
              <p className="text-black font-extrabold text-lg sm:text-xl">Moosarambagh, Hyd</p>
            </div>

            {/* Date & Time */}
            <div className="flex flex-col text-left">
              <p className="text-black font-extrabold text-lg sm:text-xl">Date: 23rd March, Wed</p>
              <p className="text-black font-extrabold text-lg sm:text-xl">Time: 5:00 PM</p>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="w-full text-center pb-2">
            <p className="text-[#e04a4a] font-black text-xl sm:text-2xl tracking-wider">
              8309259281, 9642624613
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;

