import { Printer, Download } from 'lucide-react';

async function downloadPdf() {
  const el = document.getElementById('resume-sheet');
  if (!el) return;
  const html2pdf = (await import('html2pdf.js')).default;
  el.classList.add('pdf-export');
  await html2pdf()
    .from(el)
    .set({
      margin: [10, 10, 10, 10],
      filename: 'Sushanth-Kasturi-Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    })
    .save();
  el.classList.remove('pdf-export');
}

export default function FloatingActions() {
  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex gap-2">
      <button
        onClick={() => window.print()}
        aria-label="Print resume"
        title="Print resume"
        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-canvas text-ink shadow-sm transition hover:border-ink"
      >
        <Printer size={15} />
      </button>
      <button
        onClick={downloadPdf}
        aria-label="Download PDF"
        title="Download PDF"
        className="grid h-9 w-9 place-items-center rounded-full bg-ink text-canvas shadow-sm transition hover:bg-accent"
      >
        <Download size={15} />
      </button>
    </div>
  );
}
