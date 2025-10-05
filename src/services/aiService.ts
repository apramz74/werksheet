import { GoogleGenerativeAI } from '@google/generative-ai';
import { MathProblem } from '../types';

// Initialize Gemini AI
const getGeminiAPI = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('REACT_APP_GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface GenerationRequest {
  description: string;
}

export interface GenerationResponse {
  problems: MathProblem[];
  totalGenerated: number;
  breakdown: {
    basicEquations: number;
    multipleChoice: number;
    wordProblems: number;
    fillBlanks: number;
    algebraEquations: number;
  };
}

const SYSTEM_PROMPT = `You are an AI assistant that generates math problems for educational worksheets. 

Your task is to analyze user requests and generate appropriate math problems in a specific JSON format.

SUPPORTED PROBLEM TYPES:
1. "basic-equation": Simple math equations like "2 + 3 = ____"
   - Fields: leftOperand (string), operator (string), rightOperand (string)
   - Operators: +, -, ×, ÷
   
2. "multiple-choice": Questions with answer options
   - Fields: question (string), options (array of strings)
   - Always provide 4 options (A, B, C, D)

3. "word-problem": Text-based math problems with context
   - Fields: problemText (string)
   - Include a complete word problem with context and question

4. "fill-blanks": Fill in the blank equations like "__ + 3 = 8"
   - Fields: operator (string), rightOperand (string), result (string)
   - The blank is always the first operand (left side)

5. "algebra-equation": Algebra equations with variables like "x + 5 = 12"
   - Fields: equation (string), variable (string, default "x")
   - Include equations with variables that students need to solve
   - Use clear, simple equations appropriate for the grade level
   - Variables typically: x, y, n, a, b, t

ANALYSIS REQUIREMENTS:
1. Extract the number of problems requested
2. Determine the split between basic-equation, multiple-choice, word-problem, fill-blanks, and algebra-equation (default to basic-equation if not specified)
3. For algebra requests, use algebra-equation type instead of fill-blanks
3. Follow any specific rules mentioned (e.g., "sum equals 20", "numbers 1-10", etc.)

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "analysis": {
    "totalProblems": number,
    "basicEquations": number,
    "multipleChoice": number,
    "wordProblems": number,
    "fillBlanks": number,
    "algebraEquations": number,
    "rules": "description of rules followed"
  },
  "problems": [
    {
      "id": "unique-id",
      "type": "basic-equation" | "multiple-choice" | "word-problem" | "fill-blanks" | "algebra-equation",
      "leftOperand": "string", // for basic-equation only
      "operator": "string", // for basic-equation only  
      "rightOperand": "string", // for basic-equation only
      "question": "string", // for multiple-choice only
      "options": ["A option", "B option", "C option", "D option"], // for multiple-choice only
      "problemText": "string", // for word-problem only
      "result": "string", // for fill-blanks only (operator and rightOperand reused from basic-equation)
      "equation": "string", // for algebra-equation only
      "variable": "string" // for algebra-equation only (default "x")
    }
  ]
}

IMPORTANT RULES:
- Generate exactly the number of problems requested
- Ensure math is correct and age-appropriate
- For basic equations, use simple numbers unless specified otherwise (negative numbers are supported)
- For multiple choice, include one correct answer and three plausible distractors
- Each problem must have a unique ID (use format: "ai-generated-{timestamp}-{index}")
- Follow any specific mathematical constraints mentioned in the request
- Support negative numbers in all problem types (e.g., "-5 + 3", "10 - -2", etc.)
- If the request is unclear, make reasonable assumptions and explain in the analysis

Examples:
- "20 addition problems where the sum is 15" → Generate 20 basic-equation problems with various combinations that add to 15
- "10 multiple choice questions about multiplication tables" → Generate 10 multiple-choice problems testing multiplication
- "5 subtraction and 5 addition problems using numbers 1-10" → Generate 10 basic-equation problems split evenly
- "problems with negative numbers" → Generate problems including negative operands like "-5 + 3" or "7 + -2"
- "10 algebra problems solving for x" → Generate 10 algebra-equation problems with variable x
- "one-step equations" → Generate algebra-equation problems like "x + 5 = 12"`;

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = getGeminiAPI();
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateProblems(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const prompt = `${SYSTEM_PROMPT}\n\nUser Request: "${request.description}"\n\nGenerate the problems now:`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsedResponse.problems || !Array.isArray(parsedResponse.problems)) {
        throw new Error('AI response missing problems array');
      }
      
      // Validate and clean up the problems
      const validatedProblems = this.validateAndCleanProblems(parsedResponse.problems);
      
      // Calculate breakdown in single pass
      const breakdown = {
        basicEquations: 0,
        multipleChoice: 0,
        wordProblems: 0,
        fillBlanks: 0,
        algebraEquations: 0,
      };
      
      validatedProblems.forEach(problem => {
        if (problem.type === 'basic-equation') breakdown.basicEquations++;
        else if (problem.type === 'multiple-choice') breakdown.multipleChoice++;
        else if (problem.type === 'word-problem') breakdown.wordProblems++;
        else if (problem.type === 'fill-blanks') breakdown.fillBlanks++;
        else if (problem.type === 'algebra-equation') breakdown.algebraEquations++;
      });
      
      return {
        problems: validatedProblems,
        totalGenerated: validatedProblems.length,
        breakdown
      };
      
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate problems: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndCleanProblems(problems: any[]): MathProblem[] {
    return problems
      .map((problem, index) => {
        try {
          // Ensure required fields
          const cleanProblem: MathProblem = {
            id: problem.id || `ai-generated-${Date.now()}-${index}`,
            type: problem.type === 'multiple-choice' ? 'multiple-choice' : 
                  problem.type === 'word-problem' ? 'word-problem' :
                  problem.type === 'fill-blanks' ? 'fill-blanks' :
                  problem.type === 'algebra-equation' ? 'algebra-equation' : 'basic-equation',
          };

          if (cleanProblem.type === 'basic-equation') {
            if (!problem.leftOperand || !problem.operator || !problem.rightOperand) {
              throw new Error('Missing required fields for basic equation');
            }
            cleanProblem.leftOperand = String(problem.leftOperand);
            cleanProblem.operator = String(problem.operator);
            cleanProblem.rightOperand = String(problem.rightOperand);
          } else if (cleanProblem.type === 'word-problem') {
            if (!problem.problemText) {
              throw new Error('Missing required field for word problem');
            }
            cleanProblem.problemText = String(problem.problemText);
          } else if (cleanProblem.type === 'fill-blanks') {
            if (!problem.operator || !problem.rightOperand || !problem.result) {
              throw new Error('Missing required fields for fill-blanks');
            }
            cleanProblem.operator = String(problem.operator);
            cleanProblem.rightOperand = String(problem.rightOperand);
            cleanProblem.result = String(problem.result);
          } else if (cleanProblem.type === 'algebra-equation') {
            if (!problem.equation) {
              throw new Error('Missing required field for algebra equation');
            }
            cleanProblem.equation = String(problem.equation);
            cleanProblem.variable = String(problem.variable || 'x');
          } else {
            if (!problem.question || !problem.options || !Array.isArray(problem.options)) {
              throw new Error('Missing required fields for multiple choice');
            }
            cleanProblem.question = String(problem.question);
            cleanProblem.options = problem.options.map((opt: any) => String(opt));
          }

          return cleanProblem;
        } catch (error) {
          console.warn(`Skipping invalid problem at index ${index}:`, error);
          return null;
        }
      })
      .filter((problem): problem is MathProblem => problem !== null);
  }
}

// Singleton instance
export const aiService = new AIService();