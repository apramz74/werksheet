import React, { useState, useRef, useEffect } from 'react';
import { MathProblem, formatMathProblem } from '../types';
import { MathFormatter } from '../utils/mathFormatter';
import ProblemEditModal from './ProblemEditModal';

interface ProblemEditorProps {
  problem: MathProblem;
  index: number;
  onUpdate: (problem: MathProblem) => void;
  onDelete: (id: string) => void;
  onAddAfter: (index: number) => void;
}

const ProblemEditor: React.FC<ProblemEditorProps> = ({ 
  problem, 
  index, 
  onUpdate, 
  onDelete,
  onAddAfter 
}) => {
  const [isEditing, setIsEditing] = useState(problem.isEditing || false);
  const [editingField, setEditingField] = useState<'left' | 'operator' | 'right' | 'question' | number | null>(null);
  
  // Basic equation state
  const [leftOperand, setLeftOperand] = useState(problem.leftOperand || '');
  const [operator, setOperator] = useState(problem.operator || '+');
  const [rightOperand, setRightOperand] = useState(problem.rightOperand || '');
  
  // Multiple choice state
  const [question, setQuestion] = useState(problem.question || '');
  const [options, setOptions] = useState(problem.options || ['', '']);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const operatorSelectRef = useRef<HTMLSelectElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editingField === null) {
      // Auto-focus first field when entering editing mode based on problem type
      if (problem.type === 'multiple-choice') {
        setEditingField('question');
      } else {
        setEditingField('left');
      }
    }
  }, [isEditing, editingField, problem.type]);

  useEffect(() => {
    if (isEditing) {
      if (editingField === 'left' && leftInputRef.current) {
        leftInputRef.current.focus();
        leftInputRef.current.select();
      } else if (editingField === 'right' && rightInputRef.current) {
        rightInputRef.current.focus();
        rightInputRef.current.select();
      } else if (editingField === 'question' && questionInputRef.current) {
        questionInputRef.current.focus();
        questionInputRef.current.select();
      } else if (typeof editingField === 'number' && optionInputRefs.current[editingField]) {
        optionInputRefs.current[editingField]?.focus();
        optionInputRefs.current[editingField]?.select();
      }
    }
  }, [isEditing, editingField]);

  const handleStartEdit = () => {
    setIsEditing(true);
    if (problem.type === 'multiple-choice') {
      setEditingField('question');
      setQuestion(problem.question || '');
      setOptions(problem.options || ['', '']);
    } else {
      setEditingField('left');
      setLeftOperand(problem.leftOperand || '');
      setOperator(problem.operator || '+');
      setRightOperand(problem.rightOperand || '');
    }
  };

  const handleFinishEdit = () => {
    let updatedProblem: MathProblem;
    
    if (problem.type === 'multiple-choice') {
      updatedProblem = {
        ...problem,
        question,
        options,
        isEditing: false
      };
    } else {
      updatedProblem = {
        ...problem,
        leftOperand,
        operator: MathFormatter.normalizeOperator(operator),
        rightOperand,
        isEditing: false
      };
    }
    
    onUpdate(updatedProblem);
    setIsEditing(false);
    setEditingField(null);
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent, field: 'left' | 'right') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'left') {
        setEditingField('operator');
        setTimeout(() => operatorSelectRef.current?.focus(), 0);
      } else {
        handleFinishEdit();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (field === 'left') {
        setEditingField('operator');
        setTimeout(() => operatorSelectRef.current?.focus(), 0);
      } else {
        handleFinishEdit();
        onAddAfter(index);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingField(null);
      setLeftOperand(problem.leftOperand || '');
      setOperator(problem.operator || '+');
      setRightOperand(problem.rightOperand || '');
    }
  };

  const handleOperatorChange = (newOperator: string) => {
    const normalizedOperator = MathFormatter.normalizeOperator(newOperator);
    if (MathFormatter.validateOperator(normalizedOperator)) {
      setOperator(normalizedOperator);
    }
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

  const handleOpenEditModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleModalSave = (updatedProblem: MathProblem) => {
    onUpdate(updatedProblem);
    setShowEditModal(false);
  };

  const handleModalCancel = () => {
    setShowEditModal(false);
  };

  const handleModalDelete = () => {
    onDelete(problem.id);
    setShowEditModal(false);
  };

  const validateProblem = (): { isValid: boolean; message?: string } => {
    let currentProblem: MathProblem;
    
    if (problem.type === 'multiple-choice') {
      currentProblem = isEditing ? 
        { ...problem, question, options } : 
        problem;
    } else {
      currentProblem = isEditing ? 
        { ...problem, leftOperand, operator, rightOperand } : 
        problem;
    }
    
    if (!MathFormatter.validateProblem(currentProblem)) {
      if (problem.type === 'multiple-choice') {
        return { isValid: false, message: 'Invalid multiple choice question' };
      } else {
        return { isValid: false, message: 'Invalid math problem' };
      }
    }
    return { isValid: true };
  };

  const validation = validateProblem();
  const displayText = formatMathProblem(problem);

  return (
    <>
      {!isEditing ? (
        // Compact card view
        <div 
          ref={containerRef}
          style={{ 
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onClick={handleStartEdit}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e0';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <span style={{ 
              fontSize: '14px', 
              color: '#718096', 
              fontWeight: '600',
              minWidth: '20px'
            }}>
              {index + 1}.
            </span>
            <span style={{ 
              fontSize: '16px',
              fontFamily: 'monospace',
              color: validation.isValid ? '#2d3748' : '#e53e3e',
              flex: 1
            }}>
              {displayText || 'Click to add problem...'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(e);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: '1px solid #a0aec0',
                borderRadius: '4px',
                backgroundColor: '#f7fafc',
                cursor: 'pointer',
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '500'
              }}
              title="Edit problem settings"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(problem.id);
              }}
              style={{
                padding: '4px 6px',
                fontSize: '12px',
                border: '1px solid #feb2b2',
                borderRadius: '4px',
                backgroundColor: '#fed7d7',
                cursor: 'pointer',
                color: '#c53030',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete this problem"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        // Full editing view with structured inputs
        <div 
          ref={containerRef}
          style={{ 
            position: 'relative',
            backgroundColor: '#ffffff',
            border: '2px solid #3182ce',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxHeight: '500px',
            overflowY: 'auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
          tabIndex={-1}
        >
          {/* Header with problem number */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '14px', 
                color: '#666', 
                fontWeight: 'bold',
                marginRight: '10px'
              }}>
                {index + 1}.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(problem.id);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  backgroundColor: '#fff5f5',
                  cursor: 'pointer',
                  color: '#dc3545'
                }}
                title="Delete this problem"
              >
                ×
              </button>
            </div>
          </div>

          {/* Conditional rendering based on problem type */}
          {problem.type === 'multiple-choice' ? (
            /* Multiple Choice Editing - Compact Layout */
            <div style={{ marginBottom: '12px' }}>
              {/* Question Input - More Compact */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '4px'
                }}>
                  Question:
                </label>
                <input
                  ref={questionInputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onFocus={() => setEditingField('question')}
                  onBlur={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
                      handleFinishEdit();
                    }
                  }}
                  placeholder="Enter your question here..."
                  style={{
                    width: '100%',
                    border: editingField === 'question' ? '2px solid #3182ce' : '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '14px',
                    backgroundColor: editingField === 'question' ? '#f0f8ff' : 'transparent',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Answer Options - More Compact */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '4px'
                }}>
                  Options:
                </label>
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {options.map((option, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      marginBottom: '6px'
                    }}>
                      <span style={{ 
                        minWidth: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#666'
                      }}>
                        {String.fromCharCode(65 + index)})
                      </span>
                      <input
                        ref={(el) => {
                          if (optionInputRefs.current) {
                            optionInputRefs.current[index] = el;
                          }
                        }}
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        onFocus={() => setEditingField(index)}
                        onBlur={(e) => {
                          const relatedTarget = e.relatedTarget as HTMLElement;
                          if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
                            handleFinishEdit();
                          }
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        style={{
                          flex: 1,
                          border: editingField === index ? '2px solid #3182ce' : '1px solid #ddd',
                          borderRadius: '3px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: editingField === index ? '#f0f8ff' : 'white',
                          outline: 'none'
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
                            color: '#c53030',
                            minWidth: '20px'
                          }}
                          title="Remove option"
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
                      borderRadius: '3px',
                      backgroundColor: '#f7fafc',
                      cursor: 'pointer',
                      color: '#4a5568',
                      marginTop: '4px',
                      width: '100%'
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Basic Equation Editing */
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '20px',
              fontFamily: 'monospace',
              marginBottom: '15px'
            }}>
              {/* Left operand */}
              <input
                ref={leftInputRef}
                type="text"
                value={leftOperand}
                onChange={(e) => setLeftOperand(e.target.value)}
                onKeyDown={(e) => handleFieldKeyDown(e, 'left')}
                onFocus={() => setEditingField('left')}
                onBlur={(e) => {
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
                    handleFinishEdit();
                  }
                }}
                style={{
                  border: editingField === 'left' ? '2px solid #3182ce' : '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  width: '60px',
                  textAlign: 'center',
                  backgroundColor: editingField === 'left' ? '#f0f8ff' : 'transparent'
                }}
              />

              {/* Operator */}
              <select
                ref={operatorSelectRef}
                value={operator}
                onChange={(e) => handleOperatorChange(e.target.value)}
                onFocus={() => setEditingField('operator')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    setEditingField('right');
                    if (rightInputRef.current) {
                      rightInputRef.current.focus();
                      rightInputRef.current.select();
                    }
                  }
                }}
                style={{
                  border: editingField === 'operator' ? '2px solid #3182ce' : '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  backgroundColor: editingField === 'operator' ? '#f0f8ff' : '#f8f9fa',
                  cursor: 'pointer',
                  minWidth: '50px',
                  outline: 'none'
                }}
              >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">*</option>
                <option value="/">/</option>
              </select>

              {/* Right operand */}
              <input
                ref={rightInputRef}
                type="text"
                value={rightOperand}
                onChange={(e) => setRightOperand(e.target.value)}
                onKeyDown={(e) => handleFieldKeyDown(e, 'right')}
                onFocus={() => setEditingField('right')}
                onBlur={(e) => {
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
                    handleFinishEdit();
                  }
                }}
                style={{
                  border: editingField === 'right' ? '2px solid #3182ce' : '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  width: '60px',
                  textAlign: 'center',
                  backgroundColor: editingField === 'right' ? '#f0f8ff' : 'transparent'
                }}
              />

              {/* Equals and blank */}
              <span style={{ fontSize: '18px', color: '#666' }}>= ____</span>
            </div>
          )}

          {/* Validation message */}
          {!validation.isValid && (
            <div style={{ 
              marginBottom: '10px', 
              fontSize: '12px', 
              color: '#dc3545' 
            }}>
              {validation.message}
            </div>
          )}

          {/* Help text */}
          <div style={{ 
            fontSize: '12px', 
            color: '#666' 
          }}>
            {problem.type === 'multiple-choice' 
              ? 'Click fields to edit • Esc: Cancel'
              : 'Enter/Tab: Next field • Type +, -, *, / for operators • Esc: Cancel'
            }
          </div>

        </div>
      )}

      {/* Edit Modal - Always rendered regardless of editing state */}
      <ProblemEditModal
        problem={problem}
        isOpen={showEditModal}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        onDelete={handleModalDelete}
      />
    </>
  );
};

export default ProblemEditor;