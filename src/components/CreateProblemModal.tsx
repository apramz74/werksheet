import React, { useState, useRef, useEffect } from 'react';

interface CreateProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (problemType: string) => void;
}

const CreateProblemModal: React.FC<CreateProblemModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [selectedType, setSelectedType] = useState<string>('basic-equation');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
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
  }, [isOpen, onClose]);

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
      available: true
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

  const handleCreate = () => {
    onCreate(selectedType);
  };

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
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a202c'
          }}>
            Create problem
          </h2>
          <button
            onClick={onClose}
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

        {/* Subtitle */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#4a5568'
        }}>
          Choose the type:
        </p>

        {/* Problem Type Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {problemTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => type.available && setSelectedType(type.id)}
              style={{
                border: selectedType === type.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
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
                  top: '8px',
                  right: '8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#3182ce',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}

              {/* Coming soon badge */}
              {!type.available && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#fed7d7',
                  color: '#c53030',
                  fontSize: '10px',
                  fontWeight: '500',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  Coming Soon
                </div>
              )}

              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c'
              }}>
                {type.title}
              </h3>
              
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#4a5568',
                lineHeight: '1.4'
              }}>
                {type.description}
              </p>
              
              <div style={{
                fontSize: '12px',
                color: '#718096',
                fontFamily: 'monospace',
                backgroundColor: '#f7fafc',
                padding: '8px',
                borderRadius: '4px',
                fontStyle: 'italic'
              }}>
                {type.example}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={onClose}
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
            onClick={handleCreate}
            disabled={!problemTypes.find(t => t.id === selectedType)?.available}
            style={{
              padding: '8px 16px',
              backgroundColor: problemTypes.find(t => t.id === selectedType)?.available ? '#3182ce' : '#a0aec0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: problemTypes.find(t => t.id === selectedType)?.available ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (problemTypes.find(t => t.id === selectedType)?.available) {
                e.currentTarget.style.backgroundColor = '#2c5aa0';
              }
            }}
            onMouseLeave={(e) => {
              if (problemTypes.find(t => t.id === selectedType)?.available) {
                e.currentTarget.style.backgroundColor = '#3182ce';
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProblemModal;