export interface MathProblem {
  id: string;
  type: 'basic-equation' | 'multiple-choice' | 'word-problem';
  
  // Basic equation fields
  leftOperand?: string;
  operator?: string;
  rightOperand?: string;
  
  // Multiple choice fields
  question?: string;
  options?: string[];
  
  // Word problem fields
  problemText?: string;
  
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
  } else {
    // Basic equation
    if (!problem.leftOperand || !problem.operator || !problem.rightOperand) {
      return 'Math equation...';
    }
    return `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = ____`;
  }
};

export interface WorksheetSettings {
  title: string;
  numberOfProblems: number;
  showAnswers: boolean;
  footnote: string;
}

export interface MathExpression {
  original: string;
  formatted: string;
  isValid: boolean;
}