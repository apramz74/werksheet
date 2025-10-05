export interface MathProblem {
  id: string;
  type: 'basic-equation' | 'multiple-choice' | 'word-problem' | 'fill-blanks' | 'algebra-equation';
  
  // Basic equation fields
  leftOperand?: string;
  operator?: string;
  rightOperand?: string;
  
  // Multiple choice fields
  question?: string;
  options?: string[];
  
  // Word problem fields
  problemText?: string;
  
  // Fill-blanks fields (__ + rightOperand = result)
  result?: string;
  
  // Algebra equation fields
  equation?: string;
  variable?: string;
  
  isEditing?: boolean;
}

// Helper function to format display
export const formatMathProblem = (problem: MathProblem): string => {
  if (problem.type === 'multiple-choice') {
    if (!problem.question || !problem.options || problem.options.length === 0) {
      return 'Multiple choice question...';
    }
    const optionsText = problem.options
      .map((option, index) => `${String.fromCharCode(65 + index)}) ${option}`)
      .join('\n');
    return `${problem.question}\n${optionsText}`;
  } else if (problem.type === 'word-problem') {
    if (!problem.problemText || problem.problemText.trim() === '') {
      return 'Word problem...';
    }
    return problem.problemText + '\n____________________';
  } else if (problem.type === 'fill-blanks') {
    if (!problem.operator || !problem.rightOperand || !problem.result) {
      return 'Fill in the blank...';
    }
    return `____ ${problem.operator} ${problem.rightOperand} = ${problem.result}`;
  } else if (problem.type === 'algebra-equation') {
    if (!problem.equation || problem.equation.trim() === '') {
      return 'Algebra equation...';
    }
    const variable = problem.variable || 'x';
    return `${problem.equation}\n${variable} = ____`;
  } else {
    // Basic equation
    if (!problem.leftOperand || !problem.operator || !problem.rightOperand) {
      return 'Math equation...';
    }
    return `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = ____`;
  }
};

export type WorksheetLayout = 'single-column' | 'two-column' | 'compact-grid';

export interface WorksheetSettings {
  title: string;
  numberOfProblems: number;
  showAnswers: boolean;
  footnote: string;
  layout: WorksheetLayout;
}

export interface MathExpression {
  original: string;
  formatted: string;
  isValid: boolean;
}