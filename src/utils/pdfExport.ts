import jsPDF from 'jspdf';
import { MathProblem, WorksheetSettings } from '../types';
import { MathFormatter } from './mathFormatter';

interface GeneratePDFProps {
  problems: MathProblem[];
  settings: WorksheetSettings;
  filename?: string;
}

export const exportToPDF = async (elementId: string, filename: string = 'worksheet.pdf'): Promise<void> => {
  // Get problems and settings from the DOM or state
  // For now, we'll need to pass this data differently
  throw new Error('Use generateProgrammaticPDF instead');
};

export const generateProgrammaticPDF = ({ problems, settings, filename = 'worksheet.pdf' }: GeneratePDFProps): void => {
  // Filter valid problems
  const validProblems = problems.filter(problem => MathFormatter.validateProblem(problem));
  
  if (validProblems.length === 0) {
    throw new Error('No valid problems to export');
  }

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
    compress: true
  });

  // Page dimensions
  const pageWidth = 8.5;
  const pageHeight = 11;
  const margin = 0.75;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;

  // Helper function to add text with wrapping
  const addText = (text: string, x: number, y: number, fontSize: number, options: { bold?: boolean, align?: 'left' | 'center' } = {}) => {
    pdf.setFontSize(fontSize);
    if (options.bold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    
    if (options.align === 'center') {
      pdf.text(text, pageWidth / 2, y, { align: 'center' });
    } else {
      pdf.text(text, x, y);
    }
    
    return y + (fontSize * 0.02); // Convert font size to approximate line height in inches
  };

  // Header
  currentY = addText(settings.title, margin, currentY + 0.5, 20, { bold: true, align: 'center' });
  currentY += 0.3;

  // Name and Date lines
  const lineLength = 2.5;
  const nameX = margin;
  const dateX = pageWidth - margin - lineLength;
  
  currentY += 0.2;
  pdf.setFontSize(12);
  pdf.text('Name:', nameX, currentY);
  
  // Draw thin line for name (slightly below text)
  pdf.setLineWidth(0.005);
  pdf.line(nameX + 0.6, currentY + 0.02, nameX + 0.6 + lineLength, currentY + 0.02);
  
  pdf.text('Date:', dateX - 0.5, currentY);
  
  // Draw thin line for date (slightly below text)
  pdf.line(dateX, currentY + 0.02, dateX + lineLength, currentY + 0.02);
  
  currentY += 0.5;

  // Horizontal line
  pdf.setLineWidth(0.01);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 0.4;

  // Problems
  validProblems.forEach((problem, index) => {
    // Check if we need a new page
    if (currentY > pageHeight - 1.5) {
      pdf.addPage();
      currentY = margin;
    }

    // Problem number
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const questionNumber = `${index + 1}.`;
    pdf.text(questionNumber, margin, currentY);

    if (problem.type === 'multiple-choice') {
      // Multiple choice question
      pdf.setFont('helvetica', 'normal');
      pdf.text(problem.question || '', margin + 0.3, currentY);
      currentY += 0.25;

      // Options
      problem.options?.forEach((option, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex);
        
        // Circle for answer
        const circleX = margin + 0.4;
        const circleY = currentY - 0.05;
        pdf.circle(circleX, circleY, 0.08, 'S');
        
        // Option text
        pdf.text(`${letter})`, margin + 0.6, currentY);
        pdf.text(option, margin + 0.9, currentY);
        currentY += 0.2;
      });
      
    } else {
      // Basic equation
      const equation = `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = `;
      pdf.setFont('helvetica', 'normal');
      pdf.text(equation, margin + 0.3, currentY);
      
      // Answer line
      const textWidth = pdf.getTextWidth(equation);
      const lineStartX = margin + 0.3 + textWidth;
      const lineEndX = lineStartX + 1;
      pdf.line(lineStartX, currentY, lineEndX, currentY);
      currentY += 0.3;
    }

    currentY += 0.2; // Space between problems
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Created with Math Worksheet Generator', pageWidth / 2, pageHeight - 0.3, { align: 'center' });

  // Save
  pdf.save(filename);
};