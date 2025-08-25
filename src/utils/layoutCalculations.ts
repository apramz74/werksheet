import { MathProblem } from '../types';

// Page dimensions in inches (matching PDF generation)
export const PAGE_DIMENSIONS = {
  width: 8.5,
  height: 11,
  margin: 0.75,
} as const;

// Convert inches to pixels for preview (assuming 96 DPI for web display)
const DPI = 96;
export const PAGE_DIMENSIONS_PX = {
  width: PAGE_DIMENSIONS.width * DPI,
  height: PAGE_DIMENSIONS.height * DPI,
  margin: PAGE_DIMENSIONS.margin * DPI,
} as const;

// Spacing constants in inches (matching PDF generation)
export const SPACING = {
  headerSpacing: 0.3,
  nameLineSpacing: 0.2,
  nameLineHeight: 0.5,
  horizontalLineSpacing: 0.4,
  problemSpacing: 0.2,
  basicEquationHeight: 0.3,
  multipleChoiceQuestionHeight: 0.25,
  multipleChoiceOptionHeight: 0.2,
  wordProblemBaseHeight: 0.4, // Base height for word problem text
  wordProblemLineHeight: 0.2, // Height per line of text
  wordProblemAnswerLineHeight: 0.3, // Height for answer line section
  footerHeight: 0.3,
  footnoteHeight: 0.4, // Space reserved for footnote (font height + margin)
  pageBreakThreshold: 1.5, // When to start new page (distance from bottom)
} as const;

// Convert spacing to pixels
export const SPACING_PX = Object.fromEntries(
  Object.entries(SPACING).map(([key, value]) => [key, value * DPI])
) as Record<keyof typeof SPACING, number>;

// Font sizes in pixels (converted from PDF generation)
export const FONT_SIZES = {
  title: 20 * (DPI / 72), // Convert from PDF points to pixels
  nameDate: 12 * (DPI / 72),
  problemNumber: 14 * (DPI / 72),
  problemText: 14 * (DPI / 72),
  footer: 10 * (DPI / 72),
} as const;

/**
 * Calculate the height a basic equation problem will take
 */
export function calculateBasicEquationHeight(): number {
  return SPACING.basicEquationHeight + SPACING.problemSpacing;
}

/**
 * Calculate the height a multiple choice problem will take
 */
export function calculateMultipleChoiceHeight(optionCount: number): number {
  return (
    SPACING.multipleChoiceQuestionHeight +
    optionCount * SPACING.multipleChoiceOptionHeight +
    SPACING.problemSpacing
  );
}

/**
 * Calculate the height a word problem will take
 */
export function calculateWordProblemHeight(problemText: string): number {
  // Estimate number of lines based on text length
  // Rough estimate: ~80 characters per line for typical worksheet width
  const estimatedLines = Math.max(1, Math.ceil((problemText || '').length / 80));
  
  return (
    SPACING.wordProblemBaseHeight +
    (estimatedLines - 1) * SPACING.wordProblemLineHeight + // Additional lines
    SPACING.wordProblemAnswerLineHeight +
    SPACING.problemSpacing
  );
}

/**
 * Calculate the height a problem will take based on its type
 */
export function calculateProblemHeight(problem: MathProblem, layout: string = 'single-column'): number {
  if (layout === 'two-column') {
    return calculateTwoColumnProblemHeight(problem);
  }
  
  if (problem.type === 'multiple-choice') {
    return calculateMultipleChoiceHeight(problem.options?.length || 0);
  } else if (problem.type === 'word-problem') {
    return calculateWordProblemHeight(problem.problemText || '');
  } else {
    return calculateBasicEquationHeight();
  }
}

/**
 * Calculate the height a problem will take in two-column layout
 */
function calculateTwoColumnProblemHeight(problem: MathProblem): number {
  if (problem.type === 'multiple-choice') {
    // Question height + options height + extra spacing
    return 0.25 + (problem.options?.length || 0) * 0.2 + 0.1;
  } else if (problem.type === 'fill-blanks' || problem.type === 'basic-equation') {
    // Much more compact in two-column
    return 0.25;
  } else {
    // Word problems fall back to single column in two-column layout
    return calculateWordProblemHeight(problem.problemText || '');
  }
}

/**
 * Calculate the height of the worksheet header
 */
export function calculateHeaderHeight(): number {
  // Title + spacing (simplified header - no name/date lines or horizontal divider)
  const titleHeight = (FONT_SIZES.title / DPI) + SPACING.headerSpacing + 0.4; // Extra space after title
  
  return titleHeight;
}

/**
 * Calculate the available content height per page
 */
export function calculateContentHeight(hasFootnote: boolean = false): number {
  const footnoteSpace = hasFootnote ? SPACING.footnoteHeight : 0;
  return (
    PAGE_DIMENSIONS.height -
    PAGE_DIMENSIONS.margin * 2 -
    calculateHeaderHeight() -
    footnoteSpace
  );
}

/**
 * Split problems into pages based on height calculations
 */
export function paginateProblems(problems: MathProblem[], hasFootnote: boolean = false, layout: string = 'single-column'): MathProblem[][] {
  const pages: MathProblem[][] = [];
  let currentPage: MathProblem[] = [];
  let currentPageHeight = 0;
  const maxContentHeight = calculateContentHeight(hasFootnote);

  if (layout === 'two-column') {
    // For two-column layout, problems are arranged in pairs
    // Each pair takes roughly the height of the taller problem plus spacing
    let leftColumnY = 0;
    let rightColumnY = 0;
    
    problems.forEach((problem) => {
      const problemHeight = calculateProblemHeight(problem, layout);
      const isLeftColumn = currentPage.length % 2 === 0;
      
      if (isLeftColumn) {
        // Check if we can fit this problem in left column
        if (leftColumnY + problemHeight > maxContentHeight && currentPage.length > 0) {
          // Start new page
          pages.push(currentPage);
          currentPage = [problem];
          leftColumnY = problemHeight + 0.15; // Add spacing
          rightColumnY = 0;
        } else {
          currentPage.push(problem);
          leftColumnY += problemHeight + 0.15;
        }
      } else {
        // Right column - check if we can fit
        if (rightColumnY + problemHeight > maxContentHeight && currentPage.length > 0) {
          // Start new page, put this problem in left column of new page
          pages.push(currentPage);
          currentPage = [problem];
          leftColumnY = problemHeight + 0.15;
          rightColumnY = 0;
        } else {
          currentPage.push(problem);
          rightColumnY += problemHeight + 0.15;
        }
      }
    });
  } else {
    // Original single-column logic
    problems.forEach((problem) => {
      const problemHeight = calculateProblemHeight(problem, layout);
      
      // Check if adding this problem would exceed page height
      if (currentPageHeight + problemHeight > maxContentHeight && currentPage.length > 0) {
        // Start a new page
        pages.push(currentPage);
        currentPage = [problem];
        currentPageHeight = problemHeight;
      } else {
        // Add to current page
        currentPage.push(problem);
        currentPageHeight += problemHeight;
      }
    });
  }

  // Add the last page if it has content
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // Return at least one empty page if no problems
  return pages.length > 0 ? pages : [[]];
}

/**
 * Calculate remaining space on a page
 */
export function calculateRemainingSpace(problems: MathProblem[], hasFootnote: boolean = false, layout: string = 'single-column'): number {
  const totalHeight = problems.reduce((sum, problem) => sum + calculateProblemHeight(problem, layout), 0);
  return Math.max(0, calculateContentHeight(hasFootnote) - totalHeight);
}

/**
 * Calculate how many more problems of each type could fit on current page
 */
export function calculateRemainingCapacity(currentProblems: MathProblem[], hasFootnote: boolean = false, layout: string = 'single-column'): {
  basicEquations: number;
  multipleChoice: number;
} {
  const remainingSpace = calculateRemainingSpace(currentProblems, hasFootnote, layout);
  const basicEquationHeight = calculateBasicEquationHeight();
  const multipleChoiceHeight = calculateMultipleChoiceHeight(4); // Assume average of 4 options

  return {
    basicEquations: Math.floor(remainingSpace / basicEquationHeight),
    multipleChoice: Math.floor(remainingSpace / multipleChoiceHeight),
  };
}