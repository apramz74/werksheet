import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string = 'worksheet.pdf'): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    // Ultra high resolution settings
    const dpi = 300; // Print-quality DPI
    const pixelsPerInch = dpi;
    const pageWidthInches = 8.5;
    const pageHeightInches = 11;
    const renderWidth = Math.floor(pageWidthInches * pixelsPerInch); // 2550px
    const renderHeight = Math.floor(pageHeightInches * pixelsPerInch); // 3300px

    // Temporarily modify the element for ultra-high-res rendering
    const originalStyle = element.style.cssText;
    const originalPosition = element.style.position;
    const originalLeft = element.style.left;
    const originalTop = element.style.top;
    const originalVisibility = element.style.visibility;

    // Move element off-screen but keep it visible for rendering
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.visibility = 'visible';
    element.style.transform = 'scale(1)';
    element.style.transformOrigin = 'top left';
    element.style.width = `${renderWidth}px`;
    element.style.maxWidth = 'none';
    element.style.fontSize = '48px'; // Much larger font for ultra-sharp rendering
    element.style.lineHeight = '1.4';
    element.style.backgroundColor = 'white';
    element.style.padding = '120px'; // Proportionally larger padding
    element.style.boxSizing = 'border-box';

    // Force layout recalculation
    void element.offsetHeight;

    // Capture at ultra-high resolution
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      width: renderWidth,
      height: Math.max(element.scrollHeight, renderWidth * 1.3), // Ensure enough height
      logging: false
    });

    // Restore original styles immediately
    element.style.cssText = originalStyle;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;
    element.style.visibility = originalVisibility;

    // Convert to maximum quality PNG
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Create PDF at print resolution
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [pageWidthInches, pageHeightInches],
      compress: false // No compression for maximum quality
    });

    // Calculate dimensions for PDF (with margins)
    const marginInches = 0.5;
    const printableWidth = pageWidthInches - (marginInches * 2);
    const printableHeight = pageHeightInches - (marginInches * 2);
    
    const imgAspectRatio = canvas.width / canvas.height;
    let imgWidth = printableWidth;
    let imgHeight = imgWidth / imgAspectRatio;
    
    // If image is too tall, scale to fit height
    if (imgHeight > printableHeight) {
      imgHeight = printableHeight;
      imgWidth = imgHeight * imgAspectRatio;
    }

    // Center the image on the page
    const x = marginInches + (printableWidth - imgWidth) / 2;
    const y = marginInches;

    // Add image at full resolution
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, '', 'NONE');

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};