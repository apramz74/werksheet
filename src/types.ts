export interface MathProblem {
  id: string;
  leftOperand: string;
  operator: string;
  rightOperand: string;
  isEditing?: boolean;
}

// Helper function to format display
export const formatMathProblem = (problem: MathProblem): string => {
  return `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = ____`;
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