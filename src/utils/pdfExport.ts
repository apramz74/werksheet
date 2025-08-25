import jsPDF from 'jspdf';
import { MathProblem, WorksheetSettings } from '../types';
import { MathFormatter } from './mathFormatter';
import { 
  PAGE_DIMENSIONS, 
  SPACING, 
  paginateProblems 
} from './layoutCalculations';

// Helper functions to determine layout suitability (shared with WorksheetPreview)
const isCompactLayoutSuitable = (problem: MathProblem): boolean => {
  return problem.type === 'basic-equation' || problem.type === 'fill-blanks';
};

const isTwoColumnSuitable = (problem: MathProblem): boolean => {
  return problem.type === 'basic-equation' || 
         problem.type === 'fill-blanks' || 
         problem.type === 'multiple-choice';
};

// Render problem in compact format for PDF (like traditional worksheet)
const renderCompactProblemPDF = (pdf: jsPDF, problem: MathProblem, globalIndex: number, x: number, y: number, cellWidth: number, cellHeight: number): void => {
  let currentY = y + 0.1;
  
  // Problem number
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${globalIndex + 1})`, x + 0.02, currentY);
  currentY += 0.12;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  
  if (problem.type === 'fill-blanks') {
    // Render like traditional worksheet: blank line at top, then operator and operand, then bottom line
    const rightAlignX = x + cellWidth - 0.05;
    const operatorX = x + 0.1; // Slightly inset from left edge
    
    // Top blank line
    pdf.setLineWidth(0.005);
    pdf.line(x + 0.05, currentY + 0.02, x + cellWidth - 0.05, currentY + 0.02);
    currentY += 0.15;
    
    // Operator and operand - operator just slightly from left, number right-aligned
    pdf.text(problem.operator || '', operatorX, currentY);
    pdf.text(problem.rightOperand || '', rightAlignX, currentY, { align: 'right' });
    currentY += 0.15;
    
    // Bottom line
    pdf.line(x + 0.05, currentY, x + cellWidth - 0.05, currentY);
    
  } else if (problem.type === 'basic-equation') {
    // Render like traditional worksheet: number at top, operator and operand below, then line
    const rightAlignX = x + cellWidth - 0.05;
    const operatorX = x + 0.1; // Slightly inset from left edge
    
    // Top operand (right-aligned)
    pdf.text(problem.leftOperand || '', rightAlignX, currentY, { align: 'right' });
    currentY += 0.15;
    
    // Operator and second operand - operator just slightly from left, number right-aligned
    pdf.text(problem.operator || '', operatorX, currentY);
    pdf.text(problem.rightOperand || '', rightAlignX, currentY, { align: 'right' });
    currentY += 0.15;
    
    // Answer line
    pdf.setLineWidth(0.005);
    pdf.line(x + 0.05, currentY, x + cellWidth - 0.05, currentY);
  }
};

// Render problem in two-column format for PDF
const renderTwoColumnProblemPDF = (pdf: jsPDF, problem: MathProblem, globalIndex: number, x: number, y: number): number => {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${globalIndex + 1}.`, x, y);
  
  pdf.setFont('helvetica', 'normal');
  const contentX = x + 0.25;
  let currentY = y;
  
  if (problem.type === 'multiple-choice') {
    // Question
    pdf.setFontSize(14); // Match single column and option font size
    pdf.text(problem.question || '', contentX, currentY);
    currentY += 0.25; // Use SPACING.multipleChoiceQuestionHeight for consistency
    
    // Options (same font size and spacing as single column)
    pdf.setFontSize(14); // Match single column font size
    pdf.setLineWidth(0.005); // Initialize graphics state for proper circle rendering
    problem.options?.forEach((option, optIndex) => {
      const letter = String.fromCharCode(65 + optIndex);
      
      // Circle for multiple choice option - larger radius for visibility
      pdf.circle(contentX + 0.1, currentY - 0.03, 0.06, 'S');
      pdf.text(`${letter}) ${option}`, contentX + 0.25, currentY);
      currentY += 0.2; // Use SPACING.multipleChoiceOptionHeight for consistency
    });
    
    return currentY - y + 0.1;
    
  } else if (problem.type === 'fill-blanks') {
    // Horizontal layout but more compact
    pdf.setFontSize(12);
    pdf.text('____', contentX, currentY);
    const blankWidth = pdf.getTextWidth('____');
    pdf.text(` ${problem.operator} ${problem.rightOperand} = ${problem.result}`, contentX + blankWidth, currentY);
    return 0.25;
    
  } else {
    // Basic equation - horizontal layout but more compact
    pdf.setFontSize(12);
    const equation = `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = `;
    pdf.text(equation, contentX, currentY);
    
    // Answer line
    const textWidth = pdf.getTextWidth(equation);
    const lineStartX = contentX + textWidth;
    const lineEndX = lineStartX + 0.7; // Shorter line for two-column
    pdf.setLineWidth(0.005);
    pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
    
    return 0.25;
  }
};

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
    
    let currentY: number = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(settings.title, pageWidth / 2, currentY + 0.5, { align: 'center' });
    currentY += 0.5 + SPACING.headerSpacing + 0.4; // Extra space after title

    // Render problems based on layout
    if (settings.layout === 'compact-grid') {
      // Compact Grid Layout - 10 columns like traditional worksheets with increased spacing
      const gridCols = 10;
      const gridRows = Math.ceil(pageProblems.length / gridCols);
      const spacing = 0.2; // Spacing between cells (doubled for maximum readability)
      const totalSpacing = spacing * (gridCols - 1);
      const cellWidth = (pageWidth - 2 * margin - totalSpacing) / gridCols;
      const cellHeight = 0.7; // Smaller height for compact cells
      
      pageProblems.forEach((problem, pageRelativeIndex) => {
        const globalIndex = pages.slice(0, pageIndex).reduce((sum, page) => sum + page.length, 0) + pageRelativeIndex;
        
        const col = pageRelativeIndex % gridCols;
        const row = Math.floor(pageRelativeIndex / gridCols);
        
        const x = margin + col * (cellWidth + spacing);
        const y = currentY + row * cellHeight;
        
        if (isCompactLayoutSuitable(problem)) {
          renderCompactProblemPDF(pdf, problem, globalIndex, x, y, cellWidth, cellHeight);
        } else {
          // Fall back to single column for complex problems
          // Calculate position for single column (full width)
          const singleColumnY = currentY + gridRows * cellHeight + 0.2;
          currentY = singleColumnY;
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${globalIndex + 1}.`, margin, currentY);
          
          if (problem.type === 'multiple-choice') {
            pdf.setFont('helvetica', 'normal');
            pdf.text(problem.question || '', margin + 0.3, currentY);
            currentY += SPACING.multipleChoiceQuestionHeight;

            pdf.setLineWidth(0.005); // Initialize graphics state for proper circle rendering
            problem.options?.forEach((option, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex);
              const circleX = margin + 0.4;
              const circleY = currentY - 0.05;
              pdf.circle(circleX, circleY, 0.08, 'S');
              pdf.text(`${letter})`, margin + 0.6, currentY);
              pdf.text(option, margin + 0.9, currentY);
              currentY += SPACING.multipleChoiceOptionHeight;
            });
          } else if (problem.type === 'word-problem') {
            pdf.setFont('helvetica', 'normal');
            const problemText = problem.problemText || '';
            const maxWidth = pageWidth - margin * 2 - 0.3;
            const lines = pdf.splitTextToSize(problemText, maxWidth);
            
            lines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, margin + 0.3, currentY + (lineIndex * 0.2));
            });
            
            currentY += lines.length * 0.2 + 0.2;
            const lineStartX = margin + 0.3;
            const lineEndX = lineStartX + 2;
            pdf.setLineWidth(0.005);
            pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
            currentY += SPACING.basicEquationHeight;
          }
          currentY += SPACING.problemSpacing;
        }
      });
      
      // Update currentY to account for the grid
      if (pageProblems.some(p => isCompactLayoutSuitable(p))) {
        currentY += gridRows * cellHeight + 0.3;
      }
      
    } else if (settings.layout === 'two-column') {
      // Two Column Layout
      const columnWidth = (pageWidth - 2 * margin - 0.5) / 2; // 0.5 inch gap between columns
      const leftColumnX = margin;
      const rightColumnX = margin + columnWidth + 0.5;
      
      let leftColumnY = currentY;
      let rightColumnY = currentY;
      
      pageProblems.forEach((problem, pageRelativeIndex) => {
        const globalIndex = pages.slice(0, pageIndex).reduce((sum, page) => sum + page.length, 0) + pageRelativeIndex;
        const isLeftColumn = pageRelativeIndex % 2 === 0;
        
        if (isTwoColumnSuitable(problem)) {
          const x = isLeftColumn ? leftColumnX : rightColumnX;
          const y = isLeftColumn ? leftColumnY : rightColumnY;
          
          const problemHeight = renderTwoColumnProblemPDF(pdf, problem, globalIndex, x, y);
          
          if (isLeftColumn) {
            leftColumnY += problemHeight + 0.15;
          } else {
            rightColumnY += problemHeight + 0.15;
          }
          
        } else {
          // Fall back to single column for complex problems (word problems)
          // Use the higher of the two columns
          const fallbackY = Math.max(leftColumnY, rightColumnY) + 0.2;
          leftColumnY = fallbackY;
          rightColumnY = fallbackY;
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${globalIndex + 1}.`, margin, fallbackY);
          
          if (problem.type === 'word-problem') {
            pdf.setFont('helvetica', 'normal');
            const problemText = problem.problemText || '';
            const maxWidth = pageWidth - margin * 2 - 0.3;
            const lines = pdf.splitTextToSize(problemText, maxWidth);
            
            lines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, margin + 0.3, fallbackY + (lineIndex * 0.2));
            });
            
            const finalY = fallbackY + lines.length * 0.2 + 0.2;
            const lineStartX = margin + 0.3;
            const lineEndX = lineStartX + 2;
            pdf.setLineWidth(0.005);
            pdf.line(lineStartX, finalY + 0.02, lineEndX, finalY + 0.02);
            
            leftColumnY = finalY + SPACING.basicEquationHeight + SPACING.problemSpacing;
            rightColumnY = leftColumnY;
          }
        }
      });
      
      currentY = Math.max(leftColumnY, rightColumnY);
      
    } else {
      // Single Column Layout (default)
      pageProblems.forEach((problem, pageRelativeIndex) => {
        const globalIndex = pages.slice(0, pageIndex).reduce((sum, page) => sum + page.length, 0) + pageRelativeIndex;

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const questionNumber = `${globalIndex + 1}.`;
        pdf.text(questionNumber, margin, currentY);

        if (problem.type === 'multiple-choice') {
          pdf.setFont('helvetica', 'normal');
          pdf.text(problem.question || '', margin + 0.3, currentY);
          currentY += SPACING.multipleChoiceQuestionHeight;

          pdf.setLineWidth(0.005); // Initialize graphics state for proper circle rendering
          problem.options?.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const circleX = margin + 0.4;
            const circleY = currentY - 0.05;
            pdf.circle(circleX, circleY, 0.08, 'S');
            pdf.text(`${letter})`, margin + 0.6, currentY);
            pdf.text(option, margin + 0.9, currentY);
            currentY += SPACING.multipleChoiceOptionHeight;
          });
          
        } else if (problem.type === 'word-problem') {
          pdf.setFont('helvetica', 'normal');
          const problemText = problem.problemText || '';
          const maxWidth = pageWidth - margin * 2 - 0.3;
          const lines = pdf.splitTextToSize(problemText, maxWidth);
          
          lines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, margin + 0.3, currentY + (lineIndex * 0.2));
          });
          
          currentY += lines.length * 0.2 + 0.2;
          const lineStartX = margin + 0.3;
          const lineEndX = lineStartX + 2;
          pdf.setLineWidth(0.005);
          pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
          currentY += SPACING.basicEquationHeight;
          
        } else if (problem.type === 'fill-blanks') {
          pdf.setFont('helvetica', 'normal');
          const lineStartX = margin + 0.3;
          const lineEndX = lineStartX + 1;
          pdf.setLineWidth(0.005);
          pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
          
          const restOfEquation = ` ${problem.operator} ${problem.rightOperand} = ${problem.result}`;
          pdf.text(restOfEquation, lineEndX + 0.1, currentY);
          currentY += SPACING.basicEquationHeight;
          
        } else {
          const equation = `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = `;
          pdf.setFont('helvetica', 'normal');
          pdf.text(equation, margin + 0.3, currentY);
          
          const textWidth = pdf.getTextWidth(equation);
          const lineStartX = margin + 0.3 + textWidth;
          const lineEndX = lineStartX + 1;
          pdf.setLineWidth(0.005);
          pdf.line(lineStartX, currentY + 0.02, lineEndX, currentY + 0.02);
          currentY += SPACING.basicEquationHeight;
        }

        currentY += SPACING.problemSpacing;
      });
    }

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