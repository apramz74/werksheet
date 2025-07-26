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
  const [editingField, setEditingField] = useState<'left' | 'operator' | 'right' | null>(null);
  const [leftOperand, setLeftOperand] = useState(problem.leftOperand);
  const [operator, setOperator] = useState(problem.operator);
  const [rightOperand, setRightOperand] = useState(problem.rightOperand);
  const [showEditModal, setShowEditModal] = useState(false);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const operatorSelectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editingField === 'left' && leftInputRef.current) {
      leftInputRef.current.focus();
      leftInputRef.current.select();
    } else if (isEditing && editingField === 'right' && rightInputRef.current) {
      rightInputRef.current.focus();
      rightInputRef.current.select();
    }
  }, [isEditing, editingField]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditingField('left');
    setLeftOperand(problem.leftOperand);
    setOperator(problem.operator);
    setRightOperand(problem.rightOperand);
  };

  const handleFinishEdit = () => {
    const updatedProblem: MathProblem = {
      ...problem,
      leftOperand,
      operator: MathFormatter.normalizeOperator(operator),
      rightOperand,
      isEditing: false
    };
    
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
      setLeftOperand(problem.leftOperand);
      setOperator(problem.operator);
      setRightOperand(problem.rightOperand);
    }
  };

  const handleOperatorChange = (newOperator: string) => {
    const normalizedOperator = MathFormatter.normalizeOperator(newOperator);
    if (MathFormatter.validateOperator(normalizedOperator)) {
      setOperator(normalizedOperator);
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
    const currentProblem = isEditing ? { ...problem, leftOperand, operator, rightOperand } : problem;
    
    if (!MathFormatter.validateProblem(currentProblem)) {
      return { isValid: false, message: 'Invalid math problem' };
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
                border: '1px solid #d69e2e',
                borderRadius: '4px',
                backgroundColor: '#fef5e7',
                cursor: 'pointer',
                color: '#d69e2e',
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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

          {/* Structured math inputs */}
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
            Enter/Tab: Next field • Type +, -, *, / for operators • Esc: Cancel
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