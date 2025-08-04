import { MathProblem } from '../types';

export class MathFormatter {
  private static readonly OPERATORS = ['+', '-', '*', '/'];
  private static readonly OPERATOR_MAP: { [key: string]: string } = {
    'x': '*',
    'X': '*',
    '×': '*',
    '÷': '/'
  };

  public static normalizeOperator(operator: string): string {
    return this.OPERATOR_MAP[operator] || operator;
  }

  public static validateNumber(value: string): boolean {
    if (!value.trim()) return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }

  public static validateOperator(operator: string): boolean {
    return this.OPERATORS.includes(operator);
  }

  public static validateProblem(problem: MathProblem): boolean {
    if (problem.type === 'multiple-choice') {
      return (
        Boolean(problem.question && problem.question.trim()) &&
        Boolean(problem.options && problem.options.length >= 2) &&
        Boolean(problem.options && problem.options.every(option => Boolean(option && option.trim())))
      );
    } else if (problem.type === 'word-problem') {
      return Boolean(problem.problemText && problem.problemText.trim());
    } else {
      // Basic equation validation
      return (
        Boolean(problem.leftOperand) &&
        this.validateNumber(problem.leftOperand || '') &&
        this.validateOperator(problem.operator || '') &&
        Boolean(problem.rightOperand) &&
        this.validateNumber(problem.rightOperand || '')
      );
    }
  }

  public static createBlankProblem(type: 'basic-equation' | 'multiple-choice' | 'word-problem' = 'basic-equation'): MathProblem {
    if (type === 'multiple-choice') {
      return this.createBlankMultipleChoice();
    } else if (type === 'word-problem') {
      return this.createBlankWordProblem();
    } else {
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'basic-equation',
        leftOperand: '2',
        operator: '+',
        rightOperand: '3',
        isEditing: true
      };
    }
  }

  public static createBlankMultipleChoice(): MathProblem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: 'What is 2 + 2?',
      options: ['3', '4'],
      isEditing: true
    };
  }

  public static createBlankWordProblem(): MathProblem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'word-problem',
      problemText: 'Sarah has 5 apples. She gives 2 apples to her friend. How many apples does Sarah have left?',
      isEditing: true
    };
  }

  public static formatForDisplay(problem: MathProblem): string {
    if (problem.type === 'multiple-choice') {
      const optionsText = problem.options?.map((option, index) => 
        `${String.fromCharCode(65 + index)}) ${option}`
      ).join('\n') || '';
      return `${problem.question || ''}\n${optionsText}`;
    } else if (problem.type === 'word-problem') {
      return `${problem.problemText || ''}\n____________________`;
    } else {
      return `${problem.leftOperand || ''} ${problem.operator || ''} ${problem.rightOperand || ''} = ____`;
    }
  }

  // Legacy support for migrating existing data
  public static parseFromLegacyFormat(questionString: string): MathProblem | null {
    try {
      // Parse something like "5 + 3 = ____" or "5+3=____"
      const cleaned = questionString.replace(/\s+/g, ' ').trim();
      const equalsIndex = cleaned.indexOf('=');
      
      if (equalsIndex === -1) return null;
      
      const leftSide = cleaned.substring(0, equalsIndex).trim();
      
      // Find operator
      let operator = '';
      let operatorIndex = -1;
      
      for (const op of this.OPERATORS) {
        const idx = leftSide.indexOf(op);
        if (idx > 0) { // Operator shouldn't be at the start
          operator = op;
          operatorIndex = idx;
          break;
        }
      }
      
      if (operatorIndex === -1) return null;
      
      const leftOperand = leftSide.substring(0, operatorIndex).trim();
      const rightOperand = leftSide.substring(operatorIndex + 1).trim();
      
      if (!this.validateNumber(leftOperand) || !this.validateNumber(rightOperand)) {
        return null;
      }
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'basic-equation',
        leftOperand,
        operator,
        rightOperand
      };
    } catch (error) {
      return null;
    }
  }

}