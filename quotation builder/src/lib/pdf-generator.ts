import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateQuotePDF = async (element: HTMLElement, clientName: string, date: string) => {
    try {
        // Temporarily make it visible for html2canvas
        const originalParent = element.parentElement;
        const clone = element.cloneNode(true) as HTMLElement;

        // We append it to body, make it visible but outside the scroll view to avoid flashing
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.zIndex = '-9999';
        clone.style.opacity = '1';
        clone.style.display = 'block';
        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
            scale: 2, // Higher scale for better resolution
            useCORS: true, // Allow loading external images
            logging: false,
            windowWidth: 800,
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/png');

        // A4 physical dimensions in mm: 210 x 297
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Quotation_${clientName.replace(/\s+/g, '_') || 'Client'}_${date}.pdf`);
    } catch (error) {
        console.error('Failed to generate PDF', error);
    }
};
