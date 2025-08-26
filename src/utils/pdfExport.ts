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
const renderCompactProblemPDF = (pdf: jsPDF, problem: MathProblem, globalIndex: number, x: number, y: number, cellWidth: number, cellHeight: number, fontScale: number = 1.0): void => {
  let currentY = y + 0.1 * fontScale;
  
  // Problem number
  pdf.setFontSize(9 * fontScale);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${globalIndex + 1})`, x + 0.02 * fontScale, currentY);
  currentY += 0.12 * fontScale;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11 * fontScale);
  
  if (problem.type === 'fill-blanks') {
    // Render like traditional worksheet: blank line at top, then operator and operand, then bottom line
    const rightAlignX = x + cellWidth - 0.05 * fontScale;
    const operatorX = x + 0.1 * fontScale; // Slightly inset from left edge
    
    // Top blank line
    pdf.setLineWidth(0.005);
    pdf.line(x + 0.05 * fontScale, currentY + 0.02 * fontScale, x + cellWidth - 0.05 * fontScale, currentY + 0.02 * fontScale);
    currentY += 0.15 * fontScale;
    
    // Operator and operand - operator just slightly from left, number right-aligned
    pdf.text(problem.operator || '', operatorX, currentY);
    pdf.text(problem.rightOperand || '', rightAlignX, currentY, { align: 'right' });
    currentY += 0.15 * fontScale;
    
    // Bottom line
    pdf.line(x + 0.05 * fontScale, currentY, x + cellWidth - 0.05 * fontScale, currentY);
    
  } else if (problem.type === 'basic-equation') {
    // Render like traditional worksheet: number at top, operator and operand below, then line
    const rightAlignX = x + cellWidth - 0.05 * fontScale;
    const operatorX = x + 0.1 * fontScale; // Slightly inset from left edge
    
    // Top operand (right-aligned)
    pdf.text(problem.leftOperand || '', rightAlignX, currentY, { align: 'right' });
    currentY += 0.15 * fontScale;
    
    // Operator and second operand - operator just slightly from left, number right-aligned
    pdf.text(problem.operator || '', operatorX, currentY);
    pdf.text(problem.rightOperand || '', rightAlignX, currentY, { align: 'right' });
    currentY += 0.15 * fontScale;
    
    // Answer line
    pdf.setLineWidth(0.005);
    pdf.line(x + 0.05 * fontScale, currentY, x + cellWidth - 0.05 * fontScale, currentY);
  }
};

// Render problem in two-column format for PDF
const renderTwoColumnProblemPDF = (pdf: jsPDF, problem: MathProblem, globalIndex: number, x: number, y: number, fontScale: number = 1.0): number => {
  pdf.setFontSize(14 * fontScale); // Match single column question number size
  pdf.setFont('helvetica', 'bold');
  const questionNumber = `${globalIndex + 1}.`;
  pdf.text(questionNumber, x, y);
  
  pdf.setFont('helvetica', 'normal');
  // Dynamic spacing based on question number length
  const numberWidth = pdf.getTextWidth(questionNumber);
  const contentX = x + numberWidth + 0.1 * fontScale; // Scale spacing too
  let currentY = y;
  
  if (problem.type === 'multiple-choice') {
    // Question
    pdf.setFontSize(14 * fontScale); // Match single column and option font size
    pdf.text(problem.question || '', contentX, currentY);
    currentY += 0.25 * fontScale; // Scale spacing
    
    // Options (same font size and spacing as single column)
    pdf.setFontSize(14 * fontScale); // Match single column font size
    pdf.setLineWidth(0.005); // Initialize graphics state for proper circle rendering
    problem.options?.forEach((option, optIndex) => {
      const letter = String.fromCharCode(65 + optIndex);
      
      // Circle for multiple choice option - match single column radius and alignment
      pdf.circle(contentX + 0.1 * fontScale, currentY - 0.05 * fontScale, 0.08 * fontScale, 'S');
      pdf.text(`${letter}) ${option}`, contentX + 0.25 * fontScale, currentY);
      currentY += 0.2 * fontScale; // Scale spacing
    });
    
    return currentY - y + 0.1 * fontScale;
    
  } else if (problem.type === 'fill-blanks') {
    // Horizontal layout but more compact
    pdf.setFontSize(12 * fontScale);
    pdf.text('____', contentX, currentY);
    const blankWidth = pdf.getTextWidth('____');
    pdf.text(` ${problem.operator} ${problem.rightOperand} = ${problem.result}`, contentX + blankWidth, currentY);
    return 0.25 * fontScale;
    
  } else {
    // Basic equation - horizontal layout but more compact
    pdf.setFontSize(12 * fontScale);
    const equation = `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = `;
    pdf.text(equation, contentX, currentY);
    
    // Answer line
    const textWidth = pdf.getTextWidth(equation);
    const lineStartX = contentX + textWidth;
    const lineEndX = lineStartX + 0.7 * fontScale; // Scale line length
    pdf.setLineWidth(0.005);
    pdf.line(lineStartX, currentY + 0.02 * fontScale, lineEndX, currentY + 0.02 * fontScale);
    
    return 0.25 * fontScale;
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

// Calculate dynamic font scale for pages with few problems
const calculateFontScale = (problemCount: number, layout: string): number => {
  // Only apply scaling for single pages with few problems
  if (problemCount > 15) return 1.0; // No scaling for many problems
  
  if (layout === 'two-column') {
    // Two-column can fit more problems, so scale differently
    if (problemCount <= 2) return 1.8;
    if (problemCount <= 4) return 1.5;
    if (problemCount <= 6) return 1.3;
    if (problemCount <= 8) return 1.2;
    return 1.1;
  } else {
    // Single column and compact grid
    if (problemCount <= 1) return 2.2;
    if (problemCount <= 2) return 1.8;
    if (problemCount <= 3) return 1.6;
    if (problemCount <= 4) return 1.4;
    if (problemCount <= 6) return 1.3;
    return 1.2;
  }
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
  const pages = paginateProblems(validProblems, hasFootnote, settings.layout);
  
  // Calculate font scale for first page if it's the only page with few problems
  const fontScale = pages.length === 1 ? calculateFontScale(validProblems.length, settings.layout) : 1.0;
  
  pages.forEach((pageProblems, pageIndex) => {
    if (pageIndex > 0) {
      pdf.addPage();
    }
    
    let currentY: number = margin;

    // Header (only on first page)
    if (pageIndex === 0) {
      pdf.setFontSize(20 * fontScale);
      pdf.setFont('helvetica', 'bold');
      pdf.text(settings.title, pageWidth / 2, currentY + 0.5, { align: 'center' });
      currentY += 0.5 + SPACING.headerSpacing + 0.4; // Extra space after title
    }

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
          renderCompactProblemPDF(pdf, problem, globalIndex, x, y, cellWidth, cellHeight, fontScale);
        } else {
          // Fall back to single column for complex problems
          // Calculate position for single column (full width)
          const singleColumnY = currentY + gridRows * cellHeight + 0.2;
          currentY = singleColumnY;
          
          pdf.setFontSize(14 * fontScale);
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
          
          const problemHeight = renderTwoColumnProblemPDF(pdf, problem, globalIndex, x, y, fontScale);
          
          if (isLeftColumn) {
            leftColumnY += problemHeight + 0.15 * fontScale;
          } else {
            rightColumnY += problemHeight + 0.15 * fontScale;
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

        pdf.setFontSize(14 * fontScale);
        pdf.setFont('helvetica', 'bold');
        const questionNumber = `${globalIndex + 1}.`;
        pdf.text(questionNumber, margin, currentY);

        if (problem.type === 'multiple-choice') {
          pdf.setFont('helvetica', 'normal');
          pdf.text(problem.question || '', margin + 0.3 * fontScale, currentY);
          currentY += SPACING.multipleChoiceQuestionHeight * fontScale;

          pdf.setLineWidth(0.005); // Initialize graphics state for proper circle rendering
          problem.options?.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const circleX = margin + 0.4 * fontScale;
            const circleY = currentY - 0.05 * fontScale;
            pdf.circle(circleX, circleY, 0.08 * fontScale, 'S');
            pdf.text(`${letter})`, margin + 0.6 * fontScale, currentY);
            pdf.text(option, margin + 0.9 * fontScale, currentY);
            currentY += SPACING.multipleChoiceOptionHeight * fontScale;
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