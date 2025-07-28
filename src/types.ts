export interface MathProblem {
  id: string;
  type: 'basic-equation' | 'multiple-choice';
  
  // Basic equation fields
  leftOperand?: string;
  operator?: string;
  rightOperand?: string;
  
  // Multiple choice fields
  question?: string;
  options?: string[];
  
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
}

export interface MathExpression {
  original: string;
  formatted: string;
  isValid: boolean;
}