import React, { useState } from 'react';
import { MathProblem } from '../types';
import { aiService } from '../services/aiService';

interface AiGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemsGenerated: (problems: MathProblem[]) => void;
}

interface TopicCategory {
  name: string;
  subcategories: {
    name: string;
    description: string;
    examples: string[];
  }[];
}

const topics: TopicCategory[] = [
  {
    name: 'Addition',
    subcategories: [
      {
        name: 'Single-digit numbers',
        description: 'Addition with single-digit numbers',
        examples: ['3 + 2 = ___', '7 + 4 = ___', '5 + 6 = ___', '8 + 9 = ___']
      },
      {
        name: 'Two-digit numbers',
        description: 'Addition with two-digit numbers',
        examples: ['27 + 48 = ___', '59 + 36 = ___', '23 + 45 = ___', '68 + 25 = ___']
      },
      {
        name: 'Three-digit numbers',
        description: 'Addition with three-digit numbers',
        examples: ['123 + 456 = ___', '287 + 394 = ___', '502 + 139 = ___', '745 + 298 = ___']
      },
      {
        name: 'Multi-digit numbers',
        description: 'Addition with larger numbers',
        examples: ['1,234 + 5,678 = ___', '12,456 + 3,789 = ___', '45,673 + 12,849 = ___', '123,456 + 789,012 = ___']
      }
    ]
  },
  {
    name: 'Subtraction',
    subcategories: [
      {
        name: 'Single-digit numbers',
        description: 'Subtraction with single-digit numbers',
        examples: ['9 - 3 = ___', '8 - 5 = ___', '7 - 2 = ___', '6 - 4 = ___']
      },
      {
        name: 'Two-digit numbers',
        description: 'Subtraction with two-digit numbers',
        examples: ['52 - 28 = ___', '81 - 37 = ___', '64 - 49 = ___', '73 - 25 = ___']
      },
      {
        name: 'Three-digit numbers',
        description: 'Subtraction with three-digit numbers',
        examples: ['456 - 123 = ___', '803 - 267 = ___', '625 - 378 = ___', '904 - 589 = ___']
      },
      {
        name: 'Multi-digit numbers',
        description: 'Subtraction with larger numbers',
        examples: ['5,678 - 1,234 = ___', '12,456 - 3,789 = ___', '45,673 - 12,849 = ___', '123,456 - 89,012 = ___']
      }
    ]
  },
  {
    name: 'Multiplication',
    subcategories: [
      {
        name: 'Single-digit × single-digit',
        description: 'Basic multiplication facts',
        examples: ['4 × 6 = ___', '7 × 8 = ___', '9 × 3 = ___', '5 × 7 = ___']
      },
      {
        name: 'Single-digit × two-digit',
        description: 'Single-digit times two-digit multiplication',
        examples: ['7 × 23 = ___', '4 × 56 = ___', '9 × 34 = ___', '6 × 47 = ___']
      },
      {
        name: 'Two-digit × two-digit',
        description: 'Two-digit by two-digit multiplication',
        examples: ['23 × 45 = ___', '67 × 29 = ___', '34 × 56 = ___', '48 × 37 = ___']
      },
      {
        name: 'Multi-digit numbers',
        description: 'Multiplication with larger numbers',
        examples: ['123 × 456 = ___', '234 × 67 = ___', '1,234 × 56 = ___', '567 × 123 = ___']
      }
    ]
  },
  {
    name: 'Division',
    subcategories: [
      {
        name: 'Basic division facts',
        description: 'Simple division problems',
        examples: ['24 ÷ 6 = ___', '35 ÷ 7 = ___', '42 ÷ 6 = ___', '56 ÷ 8 = ___']
      },
      {
        name: 'Division with remainders',
        description: 'Division problems with remainders',
        examples: ['17 ÷ 3 = ___ R ___', '23 ÷ 5 = ___ R ___', '29 ÷ 4 = ___ R ___', '31 ÷ 7 = ___ R ___']
      },
      {
        name: 'Long division (two-digit divisor)',
        description: 'Long division with two-digit divisors',
        examples: ['456 ÷ 12 = ___', '789 ÷ 23 = ___', '1,234 ÷ 45 = ___', '567 ÷ 18 = ___']
      },
      {
        name: 'Long division (three-digit divisor)',
        description: 'Long division with three-digit divisors',
        examples: ['12,456 ÷ 123 = ___', '45,678 ÷ 234 = ___', '78,912 ÷ 345 = ___', '23,456 ÷ 167 = ___']
      }
    ]
  },
  {
    name: 'Pre-Algebra',
    subcategories: [
      {
        name: 'Order of operations',
        description: 'Problems using PEMDAS/BODMAS',
        examples: ['2 + 3 × 4 = ___', '(5 + 3) × 2 = ___', '12 ÷ 3 + 4 × 2 = ___', '6 + 2 × (8 - 3) = ___']
      },
      {
        name: 'Integers (positive and negative numbers)',
        description: 'Operations with positive and negative integers',
        examples: ['-5 + 8 = ___', '3 - (-4) = ___', '-6 × 2 = ___', '-12 ÷ (-3) = ___']
      },
      {
        name: 'Exponents and powers',
        description: 'Working with exponents and powers',
        examples: ['2³ = ___', '5² = ___', '10⁴ = ___', '3⁵ = ___']
      },
      {
        name: 'Square roots',
        description: 'Finding square roots',
        examples: ['√16 = ___', '√25 = ___', '√49 = ___', '√81 = ___']
      },
      {
        name: 'Ratios and proportions',
        description: 'Working with ratios and proportions',
        examples: ['3:4 = 9:___', 'If 2:5 = x:15, then x = ___', '6/8 = 3/___', '4:7 = 12:___']
      },
      {
        name: 'Percents',
        description: 'Percentage calculations',
        examples: ['25% of 80 = ___', 'What is 15% of 60?', '30 is what % of 120?', 'Find 45% of 200']
      }
    ]
  },
  {
    name: 'Algebra',
    subcategories: [
      {
        name: 'One-step equations',
        description: 'Solving simple one-step equations',
        examples: ['x + 5 = 12', '3x = 15', 'x - 7 = 8', 'x ÷ 4 = 6']
      },
      {
        name: 'Two-step equations',
        description: 'Solving two-step equations',
        examples: ['2x + 3 = 11', '5x - 7 = 18', '3x + 4 = 19', 'x/2 + 5 = 9']
      },
      {
        name: 'Multi-step equations',
        description: 'Solving complex multi-step equations',
        examples: ['3(x + 4) = 21', '2x + 5 = 3x - 7', '4(2x - 1) = 20', '5x - 3(x + 2) = 8']
      },
      {
        name: 'Equations with variables on both sides',
        description: 'Solving equations with variables on both sides',
        examples: ['2x + 5 = x + 8', '3x - 4 = 2x + 7', '5x + 2 = 3x + 12', '4x - 6 = 2x + 8']
      }
    ]
  }
];

const AiGenerationModal: React.FC<AiGenerationModalProps> = ({
  isOpen,
  onClose,
  onProblemsGenerated,
}) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for browse suggestions
  const [showBrowseSuggestions, setShowBrowseSuggestions] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [numberOfProblems, setNumberOfProblems] = useState(10);
  const [isAutoGenerated, setIsAutoGenerated] = useState(false);
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

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
      onProblemsGenerated(result.problems);
      handleClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate problems');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTopicExpansion = (topicName: string) => {
    // If clicking the same topic, collapse it; otherwise expand the new topic
    setExpandedTopic(expandedTopic === topicName ? null : topicName);
  };

  const handleClose = () => {
    setDescription('');
    setError(null);
    setIsGenerating(false);
    setShowBrowseSuggestions(false);
    setSelectedTopic(null);
    setSelectedSubcategory(null);
    setNumberOfProblems(10);
    setIsAutoGenerated(false);
    setManuallyEdited(false);
    setExpandedTopic(null);
    onClose();
  };


  const generateDetailedPrompt = (topic: string, subcategory: string, count: number): string => {
    const key = `${topic}-${subcategory}`;
    
    const promptTemplates: { [key: string]: string } = {
      // Addition
      'Addition-Single-digit numbers': `Generate ${count} single-digit addition problems (0-9) for students to solve, like 3 + 5 = ___.`,
      'Addition-Two-digit numbers': `Generate ${count} two-digit addition problems with and without regrouping, such as 23 + 45 and 27 + 48.`,
      'Addition-Three-digit numbers': `Generate ${count} three-digit addition problems including regrouping across multiple place values, like 287 + 394.`,
      'Addition-Multi-digit numbers': `Generate ${count} multi-digit addition problems with 4+ digits, including problems with different numbers of digits like 1,234 + 56,789.`,
      
      // Subtraction
      'Subtraction-Single-digit numbers': `Generate ${count} single-digit subtraction problems (0-9) for students to solve, like 8 - 3 = ___.`,
      'Subtraction-Two-digit numbers': `Generate ${count} two-digit subtraction problems with and without regrouping, such as 52 - 28 and 75 - 23.`,
      'Subtraction-Three-digit numbers': `Generate ${count} three-digit subtraction problems including borrowing across multiple place values, like 625 - 378.`,
      'Subtraction-Multi-digit numbers': `Generate ${count} multi-digit subtraction problems with 4+ digits, including problems with different numbers of digits.`,
      
      // Multiplication
      'Multiplication-Single-digit × single-digit': `Generate ${count} single-digit multiplication problems covering basic multiplication facts from 1×1 to 9×9.`,
      'Multiplication-Single-digit × two-digit': `Generate ${count} multiplication problems with a single-digit number times a two-digit number, like 7 × 23.`,
      'Multiplication-Two-digit × two-digit': `Generate ${count} two-digit by two-digit multiplication problems requiring the standard algorithm, like 23 × 45.`,
      'Multiplication-Multi-digit numbers': `Generate ${count} multiplication problems with larger numbers, including three-digit by two-digit and three-digit by three-digit problems.`,
      
      // Division
      'Division-Basic division facts': `Generate ${count} basic division problems using division facts that correspond to multiplication tables, like 24 ÷ 6 = ___.`,
      'Division-Division with remainders': `Generate ${count} division problems that result in remainders, clearly showing the format as quotient R remainder.`,
      'Division-Long division (two-digit divisor)': `Generate ${count} long division problems with two-digit divisors, requiring multiple steps like 456 ÷ 12.`,
      'Division-Long division (three-digit divisor)': `Generate ${count} complex long division problems with three-digit divisors, like 12,456 ÷ 123.`,
      
      // Pre-Algebra
      'Pre-Algebra-Order of operations': `Generate ${count} order of operations problems using PEMDAS/BODMAS, including parentheses, exponents, multiplication, division, addition, and subtraction.`,
      'Pre-Algebra-Integers (positive and negative numbers)': `Generate ${count} integer problems involving addition, subtraction, multiplication, and division of positive and negative numbers.`,
      'Pre-Algebra-Exponents and powers': `Generate ${count} problems involving exponents and powers, including evaluating expressions like 2³, 5², and 10⁴.`,
      'Pre-Algebra-Square roots': `Generate ${count} square root problems asking students to find the square root of perfect squares like √16, √25, √49.`,
      'Pre-Algebra-Ratios and proportions': `Generate ${count} ratio and proportion problems, including equivalent ratios and solving for missing values in proportions.`,
      'Pre-Algebra-Percents': `Generate ${count} percentage problems including finding percentages of numbers, finding what percent one number is of another, and percentage increase/decrease.`,
      
      // Algebra
      'Algebra-One-step equations': `Generate ${count} one-step equation problems for students to solve, including addition equations (x + 5 = 12), subtraction equations (x - 7 = 8), multiplication equations (3x = 15), and division equations (x ÷ 4 = 6).`,
      'Algebra-Two-step equations': `Generate ${count} two-step equation problems requiring students to perform two operations to solve, like 2x + 3 = 11 or 5x - 7 = 18.`,
      'Algebra-Multi-step equations': `Generate ${count} multi-step equation problems involving distribution, combining like terms, and multiple operations, such as 3(x + 4) = 21 or 2x + 5 = 3x - 7.`,
      'Algebra-Equations with variables on both sides': `Generate ${count} equation problems with variables on both sides that require students to collect like terms, such as 2x + 5 = x + 8 or 3x - 4 = 2x + 7.`
    };
    
    return promptTemplates[key] || `Generate ${count} ${subcategory.toLowerCase()} problems for students to practice.`;
  };

  const handleSubcategorySelect = (topic: string, subcategory: string) => {
    setSelectedTopic(topic);
    setSelectedSubcategory(subcategory);
    
    const generatedDescription = generateDetailedPrompt(topic, subcategory, numberOfProblems);
    setDescription(generatedDescription);
    setIsAutoGenerated(true);
    setManuallyEdited(false);
  };

  const handleNumberOfProblemsChange = (newNumber: number) => {
    setNumberOfProblems(newNumber);
    
    // Update description if we have a selection
    if (selectedTopic && selectedSubcategory && !manuallyEdited) {
      const generatedDescription = generateDetailedPrompt(selectedTopic, selectedSubcategory, newNumber);
      setDescription(generatedDescription);
      setIsAutoGenerated(true);
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    
    // If user manually edits, mark as manually edited and hide auto-generated message
    if (isAutoGenerated && newDescription !== description) {
      setManuallyEdited(true);
      setIsAutoGenerated(false);
    }
  };

  const getSelectedSubcategoryData = () => {
    if (!selectedTopic || !selectedSubcategory) return null;
    
    const topicData = topics.find(t => t.name === selectedTopic);
    return topicData?.subcategories.find(s => s.name === selectedSubcategory) || null;
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: showBrowseSuggestions ? '900px' : '600px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: 'max-width 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#1f2937',
            margin: 0 
          }}>
            Generate Problems with AI
          </h2>
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
            onChange={(e) => handleDescriptionChange(e.target.value)}
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
          
          {/* Helper text for auto-generated content */}
          {isAutoGenerated && !manuallyEdited && (
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '8px 0 0 0',
              fontStyle: 'italic'
            }}>
              ✓ Auto-generated from your selection. You can edit this freely.
            </p>
          )}
        </div>

        {/* Browse Suggestions */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowBrowseSuggestions(!showBrowseSuggestions)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 0',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '15px',
              fontWeight: '500',
              color: '#3b82f6',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: showBrowseSuggestions ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
            {showBrowseSuggestions ? 'Hide suggestions' : 'Browse suggestions'}
          </button>
          
          {showBrowseSuggestions && (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              padding: '16px',
              marginTop: '8px'
            }}>
              <div style={{
                display: 'flex',
                gap: '24px',
                minHeight: '280px'
              }}>
                {/* Topics Panel */}
                <div style={{
                  flex: '1.2',
                  borderRight: '1px solid #e5e7eb',
                  paddingRight: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 16px 0'
                  }}>
                    Topics
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {topics.map((topic) => {
                      const isExpanded = expandedTopic === topic.name;
                      return (
                        <div key={topic.name}>
                          {/* Topic Header - Clickable */}
                          <button
                            onClick={() => toggleTopicExpansion(topic.name)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#4b5563',
                              padding: '10px 0',
                              borderBottom: '1px solid #e5e7eb',
                              marginBottom: '6px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#4b5563';
                            }}
                          >
                            <span>
                              {topic.name} 
                              {!isExpanded && (
                                <span style={{
                                  fontSize: '12px',
                                  color: '#9ca3af',
                                  fontWeight: '400',
                                  marginLeft: '8px'
                                }}>
                                  ({topic.subcategories.length})
                                </span>
                              )}
                            </span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            >
                              <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                          </button>
                          
                          {/* Subcategories - Collapsible */}
                          {isExpanded && (
                            <div style={{
                              marginBottom: '12px',
                              animation: 'fadeIn 0.2s ease-in-out'
                            }}>
                              {topic.subcategories.map((subcategory) => (
                                <button
                                  key={`${topic.name}-${subcategory.name}`}
                                  onClick={() => handleSubcategorySelect(topic.name, subcategory.name)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 14px',
                                    backgroundColor: selectedTopic === topic.name && selectedSubcategory === subcategory.name 
                                      ? '#3b82f6' : 'transparent',
                                    color: selectedTopic === topic.name && selectedSubcategory === subcategory.name 
                                      ? 'white' : '#4b5563',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '13px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    marginLeft: '10px',
                                    marginBottom: '3px'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!(selectedTopic === topic.name && selectedSubcategory === subcategory.name)) {
                                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!(selectedTopic === topic.name && selectedSubcategory === subcategory.name)) {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                >
                                  {subcategory.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Preview Panel */}
                <div style={{ flex: '1.5' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 16px 0'
                  }}>
                    Preview
                  </h4>
                  
                  {selectedTopic && selectedSubcategory ? (
                    <div>
                      {/* Selected Category Info */}
                      <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px'
                      }}>
                        <h5 style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 6px 0'
                        }}>
                          {selectedSubcategory}
                        </h5>
                        <p style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          margin: '0 0 12px 0'
                        }}>
                          {getSelectedSubcategoryData()?.description}
                        </p>
                        
                        <div>
                          <p style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            margin: '0 0 6px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Example problems:
                          </p>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px'
                          }}>
                            {getSelectedSubcategoryData()?.examples.slice(0, 4).map((example, index) => (
                              <div key={index} style={{
                                fontSize: '12px',
                                color: '#4b5563',
                                padding: '6px 8px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                border: '1px solid #e2e8f0'
                              }}>
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Number of Problems Slider */}
                      <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '12px'
                        }}>
                          Number of problems
                        </label>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={numberOfProblems}
                            onChange={(e) => handleNumberOfProblemsChange(parseInt(e.target.value))}
                            style={{
                              flex: '1',
                              height: '4px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '2px',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                          
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={numberOfProblems}
                            onChange={(e) => handleNumberOfProblemsChange(parseInt(e.target.value) || 1)}
                            style={{
                              width: '60px',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#9ca3af',
                      fontSize: '14px',
                      fontStyle: 'italic',
                      padding: '60px 20px'
                    }}>
                      Select a topic to see examples and options
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
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
            {isGenerating ? 'Generating...' : 'Generate problems'}
          </button>
        </div>

        {/* CSS Animation for spinner and range slider styling */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(-4px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            
            /* Custom range slider styling */
            input[type="range"] {
              -webkit-appearance: none;
              appearance: none;
              background: transparent;
              cursor: pointer;
            }
            
            input[type="range"]::-webkit-slider-track {
              background: #e5e7eb;
              height: 4px;
              border-radius: 2px;
            }
            
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              background: #3b82f6;
              height: 16px;
              width: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            input[type="range"]::-webkit-slider-thumb:hover {
              background: #2563eb;
            }
            
            input[type="range"]::-moz-range-track {
              background: #e5e7eb;
              height: 4px;
              border-radius: 2px;
              border: none;
            }
            
            input[type="range"]::-moz-range-thumb {
              background: #3b82f6;
              height: 16px;
              width: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              cursor: pointer;
            }
          `
        }} />
      </div>
    </div>
  );
};

export default AiGenerationModal;