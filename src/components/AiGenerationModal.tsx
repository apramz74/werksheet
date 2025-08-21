import React, { useState } from 'react';
import { MathProblem } from '../types';
import { aiService, GenerationResponse } from '../services/aiService';

interface AiGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemsGenerated: (problems: MathProblem[]) => void;
}

const AiGenerationModal: React.FC<AiGenerationModalProps> = ({
  isOpen,
  onClose,
  onProblemsGenerated,
}) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResponse | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe the problems you want to generate');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);

    try {
      const result = await aiService.generateProblems({ description: description.trim() });
      setGenerationResult(result);
      
      if (result.problems.length === 0) {
        setError('No valid problems were generated. Please try a different description.');
        return;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate problems');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddProblems = () => {
    if (generationResult?.problems) {
      onProblemsGenerated(generationResult.problems);
      handleClose();
    }
  };

  const handleClose = () => {
    setDescription('');
    setError(null);
    setGenerationResult(null);
    setIsGenerating(false);
    onClose();
  };

  const examplePrompts = [
    "20 addition problems where the sum is 15",
    "10 multiple choice questions about multiplication tables 1-5", 
    "15 subtraction problems using numbers 1-20",
    "5 basic division problems and 5 word problems about fractions",
    "10 word problems about money and shopping",
    "8 word problems involving animals and counting",
    "12 fill-in-the-blank problems with addition and subtraction"
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🤖
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700',
              color: '#1f2937',
              margin: 0 
            }}>
              Generate Problems with AI
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {!generationResult ? (
          <>
            {/* Description Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Describe your worksheet
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 20 addition problems where the sum is always 15"
                rows={4}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>

            {/* Example Prompts */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                Try these examples:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setDescription(prompt)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#4b5563',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isGenerating || !description.trim() ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isGenerating || !description.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating && description.trim()) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating && description.trim()) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isGenerating && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {isGenerating ? 'Generating...' : 'Draft worksheet'}
              </button>
            </div>
          </>
        ) : (
          /* Generation Results */
          <div>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#15803d',
                margin: '0 0 8px 0'
              }}>
                ✅ Generated {generationResult.totalGenerated} problems
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#166534',
                lineHeight: '1.5'
              }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  • {generationResult.breakdown.basicEquations} basic equations
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • {generationResult.breakdown.multipleChoice} multiple choice questions
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • {generationResult.breakdown.wordProblems} word problems
                </p>
                <p style={{ margin: '0' }}>
                  • {generationResult.breakdown.fillBlanks} fill-in-the-blank problems
                </p>
              </div>
            </div>

            {/* Preview of first few problems */}
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                Preview (first 3 problems):
              </h4>
              {generationResult.problems.slice(0, 3).map((problem, index) => (
                <div key={problem.id} style={{
                  fontSize: '13px',
                  color: '#4b5563',
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  <strong>{index + 1}.</strong>{' '}
                  {problem.type === 'basic-equation' 
                    ? `${problem.leftOperand} ${problem.operator} ${problem.rightOperand} = ____`
                    : problem.type === 'word-problem'
                      ? `${problem.problemText?.substring(0, 60)}${(problem.problemText?.length || 0) > 60 ? '...' : ''} (Word problem)`
                      : problem.type === 'fill-blanks'
                        ? `____ ${problem.operator} ${problem.rightOperand} = ${problem.result} (Fill-in-the-blank)`
                        : `${problem.question} (Multiple choice)`
                  }
                </div>
              ))}
              {generationResult.problems.length > 3 && (
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  margin: '8px 0 0 0'
                }}>
                  ... and {generationResult.problems.length - 3} more problems
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setGenerationResult(null)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
              >
                Try again
              </button>
              
              <button
                onClick={handleAddProblems}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#047857';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
              >
                Add to worksheet
              </button>
            </div>
          </div>
        )}

        {/* CSS Animation for spinner */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    </div>
  );
};

export default AiGenerationModal;