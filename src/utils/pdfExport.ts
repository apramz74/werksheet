import jsPDF from 'jspdf';
import { MathProblem, WorksheetSettings } from '../types';
import { MathFormatter } from './mathFormatter';
import { 
  PAGE_DIMENSIONS, 
  SPACING, 
  paginateProblems 
} from './layoutCalculations';

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

  // Use shared page dimensions
  const pageWidth = PAGE_DIMENSIONS.width;
  const margin = PAGE_DIMENSIONS.margin;
  
  // Use pagination logic to split problems across pages
  const hasFootnote = settings.footnote.trim().length > 0;
  const pages = paginateProblems(validProblems, hasFootnote);
  
  pages.forEach((pageProblems, pageIndex) => {
    if (pageIndex > 0) {
      pdf.addPage();
    }
    
    let currentY = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(settings.title, pageWidth / 2, currentY + 0.5, { align: 'center' });
    currentY += 0.5 + SPACING.headerSpacing + 0.4; // Extra space after title

    // Problems for this page
    pageProblems.forEach((problem, pageRelativeIndex) => {
      const globalIndex = pages.slice(0, pageIndex).reduce((sum, page) => sum + page.length, 0) + pageRelativeIndex;

      // Problem number
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const questionNumber = `${globalIndex + 1}.`;
      pdf.text(questionNumber, margin, currentY);

      if (problem.type === 'multiple-choice') {
        // Multiple choice question
        pdf.setFont('helvetica', 'normal');
        pdf.text(problem.question || '', margin + 0.3, currentY);
        currentY += SPACING.multipleChoiceQuestionHeight;

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
          currentY += SPACING.multipleChoiceOptionHeight;
        });
        
      } else if (problem.type === 'word-problem') {
        // Word problem
        pdf.setFont('helvetica', 'normal');
        const problemText = problem.problemText || '';
        
        // Handle text wrapping if needed (basic implementation)
        const maxWidth = pageWidth - margin * 2 - 0.3; // Account for indentation
        const lines = pdf.splitTextToSize(problemText, maxWidth);
        
        // Render each line
        lines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, margin + 0.3, currentY + (lineIndex * 0.2));
        });
        
        // Move to position for answer line
        currentY += lines.length * 0.2 + 0.2; // Line spacing + extra space
        
        // Answer line (2 inches wide)
        const lineStartX = margin + 0.3;
        const lineEndX = lineStartX + 2;
        pdf.setLineWidth(0.005);
        pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
        currentY += SPACING.basicEquationHeight; // Use same spacing as basic equations
        
      } else {
        // Basic equation
        const equation = `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = `;
        pdf.setFont('helvetica', 'normal');
        pdf.text(equation, margin + 0.3, currentY);
        
        // Answer line
        const textWidth = pdf.getTextWidth(equation);
        const lineStartX = margin + 0.3 + textWidth;
        const lineEndX = lineStartX + 1;
        pdf.setLineWidth(0.005);
        pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
        currentY += SPACING.basicEquationHeight;
      }

      currentY += SPACING.problemSpacing;
    });

    // Add footnote at bottom of page if present
    if (settings.footnote.trim()) {
      const footnoteY = PAGE_DIMENSIONS.height - margin - 0.2; // Position near bottom margin
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(settings.footnote, pageWidth / 2, footnoteY, { align: 'center' });
    }

  });

  // Save
  pdf.save(filename);
};