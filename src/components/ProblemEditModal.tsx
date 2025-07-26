import React, { useState, useRef, useEffect } from 'react';
import { MathProblem, formatMathProblem } from '../types';
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
  const [leftOperand, setLeftOperand] = useState(problem.leftOperand);
  const [operator, setOperator] = useState(problem.operator);
  const [rightOperand, setRightOperand] = useState(problem.rightOperand);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLeftOperand(problem.leftOperand);
      setOperator(problem.operator);
      setRightOperand(problem.rightOperand);
      setTimeout(() => {
        if (leftInputRef.current) {
          leftInputRef.current.focus();
          leftInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, problem.leftOperand, problem.operator, problem.rightOperand]);

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
    const updatedProblem: MathProblem = {
      ...problem,
      leftOperand,
      operator: MathFormatter.normalizeOperator(operator),
      rightOperand
    };
    
    onSave(updatedProblem);
  };

  const handleOperatorChange = (newOperator: string) => {
    const normalizedOperator = MathFormatter.normalizeOperator(newOperator);
    if (MathFormatter.validateOperator(normalizedOperator)) {
      setOperator(normalizedOperator);
    }
  };

  const currentProblem: MathProblem = {
    ...problem,
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
            padding: '8px 12px',
            backgroundColor: '#edf2f7',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#4a5568'
          }}>
            Basic Equation
          </div>
        </div>

        {/* Math Problem Components */}
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

        {/* Preview */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4a5568',
            marginBottom: '8px'
          }}>
            Preview
          </label>
          <div style={{
            padding: '12px',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '16px',
            fontFamily: 'monospace',
            color: isValid ? '#2d3748' : '#e53e3e'
          }}>
            {formatMathProblem(currentProblem)}
          </div>
          {!isValid && (
            <div style={{
              fontSize: '12px',
              color: '#e53e3e',
              marginTop: '4px'
            }}>
              Please enter valid numbers and operator
            </div>
          )}
        </div>

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
              disabled={!isValid}
              style={{
                padding: '8px 16px',
                backgroundColor: isValid ? '#3182ce' : '#a0aec0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                if (isValid) {
                  e.currentTarget.style.backgroundColor = '#2c5aa0';
                }
              }}
              onMouseLeave={(e) => {
                if (isValid) {
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