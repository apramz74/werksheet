import React, { useState, useRef, useEffect } from 'react';
import { MathProblem } from '../types';
import { aiService } from '../services/aiService';

interface CreateProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (problemType: string) => void;
  onAiProblemsGenerated: (problems: MathProblem[]) => void;
  defaultSection?: 'ai' | 'manual';
}

const CreateProblemModal: React.FC<CreateProblemModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onAiProblemsGenerated,
  defaultSection = 'ai'
}) => {
  const [selectedType, setSelectedType] = useState<string>('basic-equation');
  const [activeSection, setActiveSection] = useState<'ai' | 'manual'>(defaultSection);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Set active section when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection(defaultSection);
    }
  }, [isOpen, defaultSection]);

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
      available: true
    },
    {
      id: 'algebra-equation',
      title: 'Algebra Equation',
      description: 'Solve for the variable',
      example: 'x + 5 = 12',
      available: true
    }
  ];

  const handleCreate = () => {
    onCreate(selectedType);
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe the problems you want to generate');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await aiService.generateProblems({ description: description.trim() });
      
      if (result.problems.length === 0) {
        setError('No valid problems were generated. Please try a different description.');
        return;
      }

      // Directly add problems and close modal
      onAiProblemsGenerated(result.problems);
      handleClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate problems');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setError(null);
    setIsGenerating(false);
    setActiveSection(defaultSection);
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
            Add problems
          </h2>
          <button
            onClick={handleClose}
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

        {/* AI Generation Section */}
        <div style={{
          border: activeSection === 'ai' ? '2px solid #3182ce' : '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          {/* AI Section Header */}
          <div
            onClick={() => setActiveSection('ai')}
            style={{
              padding: '16px',
              backgroundColor: activeSection === 'ai' ? '#f0f8ff' : '#f9fafb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: activeSection === 'ai' ? '1px solid #e2e8f0' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                  <path d="M12 7h.01"/>
                  <path d="M12 14h.01"/>
                </svg>
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>
                  Generate with AI
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  Describe what you want in plain English
                </p>
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: activeSection === 'ai' ? '#3182ce' : '#64748b',
              transform: activeSection === 'ai' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </div>
          </div>

          {/* AI Section Content */}
          {activeSection === 'ai' && (
            <div style={{ padding: '20px' }}>
              {/* Description Input */}
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 20 addition problems where the sum is always 15"
                  rows={3}
                  style={{
                    width: '100%',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none'
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
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  Try these examples:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {examplePrompts.slice(0, 3).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setDescription(prompt)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#4b5563',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
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
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '16px',
                  color: '#dc2626',
                  fontSize: '12px'
                }}>
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isGenerating || !description.trim() ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isGenerating || !description.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
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
                {isGenerating ? 'Generating...' : 'Generate problems'}
              </button>
            </div>
          )}
        </div>

        {/* Manual Creation Section */}
        <div style={{
          border: activeSection === 'manual' ? '2px solid #3182ce' : '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          {/* Manual Section Header */}
          <div
            onClick={() => setActiveSection('manual')}
            style={{
              padding: '16px',
              backgroundColor: activeSection === 'manual' ? '#f0f8ff' : '#f9fafb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: activeSection === 'manual' ? '1px solid #e2e8f0' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#6b7280" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a202c'
                }}>
                  Create manually
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  Choose a problem type to create yourself
                </p>
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: activeSection === 'manual' ? '#3182ce' : '#64748b',
              transform: activeSection === 'manual' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </div>
          </div>

          {/* Manual Section Content */}
          {activeSection === 'manual' && (
            <div style={{ padding: '20px' }}>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: '#4a5568'
              }}>
                Choose the type:
              </p>

              {/* Problem Type Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '16px'
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

                    <h4 style={{
                      margin: '0 0 6px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a202c'
                    }}>
                      {type.title}
                    </h4>
                    
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      color: '#4a5568',
                      lineHeight: '1.3'
                    }}>
                      {type.description}
                    </p>
                    
                    <div style={{
                      fontSize: '10px',
                      color: '#718096',
                      fontFamily: 'monospace',
                      backgroundColor: '#f7fafc',
                      padding: '6px',
                      borderRadius: '3px',
                      fontStyle: 'italic'
                    }}>
                      {type.example}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreate}
                disabled={!problemTypes.find(t => t.id === selectedType)?.available}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: problemTypes.find(t => t.id === selectedType)?.available ? '#3182ce' : '#a0aec0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: problemTypes.find(t => t.id === selectedType)?.available ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Create problem
              </button>
            </div>
          )}
        </div>

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

export default CreateProblemModal;