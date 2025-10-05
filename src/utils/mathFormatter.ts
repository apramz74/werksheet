import { MathProblem } from '../types';

export class MathFormatter {
  private static readonly OPERATORS = ['+', '-', '×', '÷'];
  private static readonly OPERATOR_MAP: { [key: string]: string } = {
    'x': '×',
    'X': '×',
    '*': '×',
    '/': '÷'
  };

  public static normalizeOperator(operator: string): string {
    return this.OPERATOR_MAP[operator] || operator;
  }

  public static validateNumber(value: string): boolean {
    if (!value.trim()) return false;
    const trimmed = value.trim();
    // Allow negative numbers by checking if it matches number pattern
    const numberPattern = /^-?\d*\.?\d+$/;
    if (!numberPattern.test(trimmed)) return false;
    const num = parseFloat(trimmed);
    return !isNaN(num) && isFinite(num);
  }

  public static validateOperator(operator: string): boolean {
    return this.OPERATORS.includes(operator);
  }

  public static validateAlgebraEquation(equation: string): boolean {
    if (!equation || !equation.trim()) return false;
    
    // Basic validation: should contain an equals sign and at least one variable
    const hasEquals = equation.includes('=');
    const hasVariable = /[a-zA-Z]/.test(equation);
    
    return hasEquals && hasVariable;
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
    } else if (problem.type === 'fill-blanks') {
      return (
        this.validateOperator(problem.operator || '') &&
        Boolean(problem.rightOperand) &&
        this.validateNumber(problem.rightOperand || '') &&
        Boolean(problem.result) &&
        this.validateNumber(problem.result || '')
      );
    } else if (problem.type === 'algebra-equation') {
      return this.validateAlgebraEquation(problem.equation || '');
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

  public static createBlankProblem(type: 'basic-equation' | 'multiple-choice' | 'word-problem' | 'fill-blanks' | 'algebra-equation' = 'basic-equation'): MathProblem {
    if (type === 'multiple-choice') {
      return this.createBlankMultipleChoice();
    } else if (type === 'word-problem') {
      return this.createBlankWordProblem();
    } else if (type === 'fill-blanks') {
      return this.createBlankFillBlanks();
    } else if (type === 'algebra-equation') {
      return this.createBlankAlgebraEquation();
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

  public static createBlankFillBlanks(): MathProblem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'fill-blanks',
      operator: '+',
      rightOperand: '3',
      result: '8',
      isEditing: true
    };
  }

  public static createBlankAlgebraEquation(): MathProblem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'algebra-equation',
      equation: 'x + 5 = 12',
      variable: 'x',
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
    } else if (problem.type === 'fill-blanks') {
      return `____ ${problem.operator || ''} ${problem.rightOperand || ''} = ${problem.result || ''}`;
    } else if (problem.type === 'algebra-equation') {
      const variable = problem.variable || 'x';
      return `${problem.equation || ''}\n${variable} = ____`;
    } else {
      return `${problem.leftOperand || ''} ${problem.operator || ''} ${problem.rightOperand || ''} = ____`;
    }
  }

  // Helper function to render variables with proper styling
  public static renderVariableText(text: string, variable: string = 'x'): string {
    // This will be used by components to identify variables for styling
    return text.replace(new RegExp(`\\b${variable}\\b`, 'g'), `<var>${variable}</var>`);
  }

  // Legacy support for migrating existing data
  public static parseFromLegacyFormat(questionString: string): MathProblem | null {
    try {
      // Parse something like "5 + 3 = ____" or "-5+3=____" or "5 + -3 = ____"
      const cleaned = questionString.replace(/\s+/g, ' ').trim();
      const equalsIndex = cleaned.indexOf('=');
      
      if (equalsIndex === -1) return null;
      
      const leftSide = cleaned.substring(0, equalsIndex).trim();
      
      // Find operator - need to handle negative numbers properly
      let operator = '';
      let operatorIndex = -1;
      
      // Check for all possible operators (including legacy ones)
      const allOperators = [...this.OPERATORS, '*', '/'];
      for (const op of allOperators) {
        // Start search from index 1 to allow for negative numbers at the start
        let searchStart = leftSide.startsWith('-') ? 1 : 0;
        const idx = leftSide.indexOf(op, searchStart);
        if (idx > searchStart) { // Operator should be after potential negative sign and at least one digit
          operator = this.normalizeOperator(op);
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