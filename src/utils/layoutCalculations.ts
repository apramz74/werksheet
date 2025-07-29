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
  footerHeight: 0.3,
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
  footer: 8 * (DPI / 72),
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
 * Calculate the height a problem will take based on its type
 */
export function calculateProblemHeight(problem: MathProblem): number {
  if (problem.type === 'multiple-choice') {
    return calculateMultipleChoiceHeight(problem.options?.length || 0);
  } else {
    return calculateBasicEquationHeight();
  }
}

/**
 * Calculate the height of the worksheet header
 */
export function calculateHeaderHeight(): number {
  // Title + spacing + name/date line + spacing + horizontal line + spacing
  const titleHeight = (FONT_SIZES.title / DPI) + SPACING.headerSpacing;
  const nameLineHeight = SPACING.nameLineSpacing + SPACING.nameLineHeight;
  const horizontalLineHeight = SPACING.horizontalLineSpacing;
  
  return titleHeight + nameLineHeight + horizontalLineHeight;
}

/**
 * Calculate the available content height per page
 */
export function calculateContentHeight(): number {
  return (
    PAGE_DIMENSIONS.height -
    PAGE_DIMENSIONS.margin * 2 -
    calculateHeaderHeight() -
    SPACING.footerHeight
  );
}

/**
 * Split problems into pages based on height calculations
 */
export function paginateProblems(problems: MathProblem[]): MathProblem[][] {
  const pages: MathProblem[][] = [];
  let currentPage: MathProblem[] = [];
  let currentPageHeight = 0;
  const maxContentHeight = calculateContentHeight();

  problems.forEach((problem) => {
    const problemHeight = calculateProblemHeight(problem);
    
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
export function calculateRemainingSpace(problems: MathProblem[]): number {
  const totalHeight = problems.reduce((sum, problem) => sum + calculateProblemHeight(problem), 0);
  return Math.max(0, calculateContentHeight() - totalHeight);
}

/**
 * Calculate how many more problems of each type could fit on current page
 */
export function calculateRemainingCapacity(currentProblems: MathProblem[]): {
  basicEquations: number;
  multipleChoice: number;
} {
  const remainingSpace = calculateRemainingSpace(currentProblems);
  const basicEquationHeight = calculateBasicEquationHeight();
  const multipleChoiceHeight = calculateMultipleChoiceHeight(4); // Assume average of 4 options

  return {
    basicEquations: Math.floor(remainingSpace / basicEquationHeight),
    multipleChoice: Math.floor(remainingSpace / multipleChoiceHeight),
  };
}