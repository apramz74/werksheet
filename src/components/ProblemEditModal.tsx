import React, { useState, useRef, useEffect } from 'react';
import { MathProblem } from '../types';
import { MathFormatter } from '../utils/mathFormatter';

interface ProblemEditModalProps {
  problem: MathProblem;
  isOpen: boolean;
  onSave: (problem: MathProblem) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const ProblemEditModal: React.FC<ProblemEditModalProps> = ({
  problem,
  isOpen,
  onSave,
  onCancel,
  onDelete
}) => {
  const [leftOperand, setLeftOperand] = useState(problem.leftOperand || '');
  const [operator, setOperator] = useState(problem.operator || '+');
  const [rightOperand, setRightOperand] = useState(problem.rightOperand || '');
  const [question, setQuestion] = useState(problem.question || '');
  const [options, setOptions] = useState(problem.options || ['', '']);
  const [selectedType, setSelectedType] = useState<string>(problem.type || 'basic-equation');
  const leftInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const problemTypes = [
    {
      id: 'basic-equation',
      title: 'Basic Equation',
      description: 'Simple arithmetic problems',
      example: '5 + 3 = ____',
      available: true
    },
    {
      id: 'word-problem',
      title: 'Word Problem',
      description: 'Math problems with text context',
      example: 'Sarah has 5 apples...',
      available: false
    },
    {
      id: 'multiple-choice',
      title: 'Multiple Choice',
      description: 'Questions with answer options',
      example: 'What is 2 + 2? A) 3 B) 4',
      available: true
    },
    {
      id: 'fill-blanks',
      title: 'Fill in Blanks',
      description: 'Complete the equation',
      example: '__ + 3 = 8',
      available: false
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setLeftOperand(problem.leftOperand || '');
      setOperator(problem.operator || '+');
      setRightOperand(problem.rightOperand || '');
      setQuestion(problem.question || '');
      setOptions(problem.options || ['', '']);
      setSelectedType(problem.type || 'basic-equation');
      setTimeout(() => {
        if (leftInputRef.current && problem.type === 'basic-equation') {
          leftInputRef.current.focus();
          leftInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, problem]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onCancel]);

  const handleSave = () => {
    let updatedProblem: MathProblem;
    
    if (selectedType === 'multiple-choice') {
      updatedProblem = {
        ...problem,
        type: 'multiple-choice',
        question,
        options,
        // Clear basic equation fields when switching to multiple choice
        leftOperand: undefined,
        operator: undefined,
        rightOperand: undefined
      };
    } else {
      updatedProblem = {
        ...problem,
        type: 'basic-equation',
        leftOperand,
        operator: MathFormatter.normalizeOperator(operator),
        rightOperand,
        // Clear multiple choice fields when switching to basic equation
        question: undefined,
        options: undefined
      };
    }
    
    onSave(updatedProblem);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOperatorChange = (newOperator: string) => {
    const normalizedOperator = MathFormatter.normalizeOperator(newOperator);
    if (MathFormatter.validateOperator(normalizedOperator)) {
      setOperator(normalizedOperator);
    }
  };

  const currentProblem: MathProblem = selectedType === 'multiple-choice' ? {
    ...problem,
    type: 'multiple-choice',
    question,
    options
  } : {
    ...problem,
    type: 'basic-equation',
    leftOperand,
    operator,
    rightOperand
  };
  
  const isValid = MathFormatter.validateProblem(currentProblem);

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
      zIndex: 1000
    }}>
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a202c'
          }}>
            Edit Problem
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#a0aec0',
              padding: '0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f7fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Problem Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4a5568',
            marginBottom: '8px'
          }}>
            Problem Type
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {problemTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => type.available && setSelectedType(type.id)}
                style={{
                  border: selectedType === type.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px',
                  cursor: type.available ? 'pointer' : 'not-allowed',
                  backgroundColor: selectedType === type.id ? '#f0f8ff' : 'white',
                  opacity: type.available ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  position: 'relative' as const
                }}
                onMouseEnter={(e) => {
                  if (type.available && selectedType !== type.id) {
                    e.currentTarget.style.borderColor = '#cbd5e0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (type.available && selectedType !== type.id) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                {/* Selection indicator */}
                {selectedType === type.id && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#3182ce',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}

                {/* Coming soon badge */}
                {!type.available && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: '#fed7d7',
                    color: '#c53030',
                    fontSize: '8px',
                    fontWeight: '500',
                    padding: '2px 4px',
                    borderRadius: '3px'
                  }}>
                    Coming Soon
                  </div>
                )}

                <h4 style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>
                  {type.title}
                </h4>
                
                <p style={{
                  margin: '0 0 6px 0',
                  fontSize: '11px',
                  color: '#4a5568',
                  lineHeight: '1.3'
                }}>
                  {type.description}
                </p>
                
                <div style={{
                  fontSize: '9px',
                  color: '#718096',
                  fontFamily: 'monospace',
                  backgroundColor: '#f7fafc',
                  padding: '4px',
                  borderRadius: '3px',
                  fontStyle: 'italic'
                }}>
                  {type.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Math Problem Components - Only show for Basic Equation */}
        {selectedType === 'basic-equation' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              Math Problem
            </label>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            {/* Left Operand */}
            <input
              ref={leftInputRef}
              type="text"
              value={leftOperand}
              onChange={(e) => setLeftOperand(e.target.value)}
              style={{
                width: '80px',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '18px',
                fontFamily: 'monospace',
                textAlign: 'center',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3182ce';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            />

            {/* Operator */}
            <select
              value={operator}
              onChange={(e) => handleOperatorChange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '18px',
                fontFamily: 'monospace',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '60px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3182ce';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            >
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/</option>
            </select>

            {/* Right Operand */}
            <input
              type="text"
              value={rightOperand}
              onChange={(e) => setRightOperand(e.target.value)}
              style={{
                width: '80px',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '18px',
                fontFamily: 'monospace',
                textAlign: 'center',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3182ce';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            />

            {/* Equals and blank */}
            <span style={{ 
              fontSize: '18px', 
              fontFamily: 'monospace',
              color: '#666'
            }}>
              = ____
            </span>
          </div>
          </div>
        )}


        {/* Multiple Choice Components - Only show for Multiple Choice */}
        {selectedType === 'multiple-choice' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              Multiple Choice Question
            </label>
            
            {/* Question Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#4a5568',
                marginBottom: '6px'
              }}>
                Question:
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3182ce';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                }}
              />
            </div>

            {/* Answer Options */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#4a5568',
                marginBottom: '6px'
              }}>
                Answer Options:
              </label>
              {options.map((option, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    minWidth: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#666'
                  }}>
                    {String.fromCharCode(65 + index)})
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3182ce';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ddd';
                    }}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      style={{
                        padding: '2px 4px',
                        fontSize: '10px',
                        border: '1px solid #feb2b2',
                        borderRadius: '3px',
                        backgroundColor: '#fed7d7',
                        cursor: 'pointer',
                        color: '#c53030'
                      }}
                      title="Remove this option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddOption}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  backgroundColor: '#f7fafc',
                  cursor: 'pointer',
                  color: '#4a5568',
                  marginTop: '6px'
                }}
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {/* Coming Soon Message for other unavailable types */}
        {selectedType !== 'basic-equation' && selectedType !== 'multiple-choice' && (
          <div style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#4a5568'
            }}>
              Coming Soon!
            </h3>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#718096'
            }}>
              This problem type is not available yet. Please select "Basic Equation" or "Multiple Choice" to continue.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={onDelete}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fed7d7',
              color: '#c53030',
              border: '1px solid #feb2b2',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#feb2b2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fed7d7';
            }}
          >
            Delete Problem
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f7fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || (selectedType !== 'basic-equation' && selectedType !== 'multiple-choice')}
              style={{
                padding: '8px 16px',
                backgroundColor: (isValid && (selectedType === 'basic-equation' || selectedType === 'multiple-choice')) ? '#3182ce' : '#a0aec0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isValid && (selectedType === 'basic-equation' || selectedType === 'multiple-choice')) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                if (isValid && (selectedType === 'basic-equation' || selectedType === 'multiple-choice')) {
                  e.currentTarget.style.backgroundColor = '#2c5aa0';
                }
              }}
              onMouseLeave={(e) => {
                if (isValid && (selectedType === 'basic-equation' || selectedType === 'multiple-choice')) {
                  e.currentTarget.style.backgroundColor = '#3182ce';
                }
              }}
            >
              Save Problem
            </button>
          </div>
        </div>

        {/* Help text */}
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#718096',
          textAlign: 'center'
        }}>
          Press Escape to cancel
        </div>
      </div>
    </div>
  );
};

export default ProblemEditModal;