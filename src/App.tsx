import React, { useState } from 'react';
import './App.css';
import { WorksheetSettings, MathProblem } from './types';
import WorksheetPreview from './components/WorksheetPreview';
import ProblemList from './components/ProblemList';
import CreateProblemModal from './components/CreateProblemModal';
import AiGenerationModal from './components/AiGenerationModal';
import { generateProgrammaticPDF } from './utils/pdfExport';
import { MathFormatter } from './utils/mathFormatter';

function App() {
  const [settings, setSettings] = useState<WorksheetSettings>({
    title: 'Math Worksheet',
    numberOfProblems: 5,
    showAnswers: false,
    footnote: ''
  });

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingAfterIndex, setPendingAfterIndex] = useState<number>(-1);
  
  // Navigation state for preview
  const [navigationState, setNavigationState] = useState<{
    currentPage: number;
    totalPages: number;
    handlers: { handlePrevPage: () => void, handleNextPage: () => void };
  } | null>(null);

  // Worksheet details section state
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  // AI generation modal state
  const [showAiModal, setShowAiModal] = useState(false);

  const createNewProblem = (type: 'basic-equation' | 'multiple-choice' | 'word-problem' = 'basic-equation'): MathProblem => MathFormatter.createBlankProblem(type);

  const handleNavigationChange = (currentPage: number, totalPages: number, handlers: { handlePrevPage: () => void, handleNextPage: () => void }) => {
    setNavigationState({ currentPage, totalPages, handlers });
  };

  const handleUpdateProblem = (index: number, updatedProblem: MathProblem) => {
    setProblems(prev => {
      const newProblems = [...prev];
      if (index < newProblems.length) {
        newProblems[index] = updatedProblem;
      } else {
        newProblems.push(updatedProblem);
      }
      return newProblems;
    });
  };

  const handleDeleteProblem = (index: number) => {
    setProblems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProblem = (afterIndex: number, type: 'basic-equation' | 'multiple-choice' | 'word-problem' = 'basic-equation') => {
    setProblems(prev => {
      const newProblems = [...prev];
      const newProblem = createNewProblem(type);
      newProblems.splice(afterIndex + 1, 0, newProblem);
      return newProblems;
    });
  };

  const handleShowCreateModal = (afterIndex: number) => {
    setPendingAfterIndex(afterIndex);
    setShowCreateModal(true);
  };

  const handleCreateProblem = (problemType: string) => {
    if (problemType === 'basic-equation' || problemType === 'multiple-choice' || problemType === 'word-problem') {
      handleAddProblem(pendingAfterIndex, problemType as 'basic-equation' | 'multiple-choice' | 'word-problem');
    }
    setShowCreateModal(false);
    setPendingAfterIndex(-1);
  };

  const handleExportPDF = async () => {
    const validProblems = problems.filter(p => MathFormatter.validateProblem(p));

    if (validProblems.length === 0) {
      alert('Please add some problems before exporting');
      return;
    }

    setIsExporting(true);
    try {
      generateProgrammaticPDF({
        problems: validProblems,
        settings,
        filename: `${settings.title.replace(/\s+/g, '_')}.pdf`
      });
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleStartAiGeneration = () => {
    setShowAiModal(true);
  };

  const handleAiProblemsGenerated = (generatedProblems: MathProblem[]) => {
    setProblems(prev => [...prev, ...generatedProblems]);
  };

  const validProblems = problems.filter(p => MathFormatter.validateProblem(p));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Toolbar */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px 30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 style={{ color: '#333', fontSize: '24px', margin: '0' }}>
              Create worksheet
            </h1>
          </div>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting || validProblems.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: validProblems.length === 0 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (isExporting || validProblems.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (isExporting || validProblems.length === 0) ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </header>

        {/* Main Workspace Container */}
        <div style={{
          backgroundColor: '#e8f4fd',
          borderRadius: '16px',
          padding: '30px',
          minHeight: '500px',
          border: '2px solid #b8daff'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            height: 'fit-content',
            alignItems: 'start',
            overflow: 'hidden'
          }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              {/* Worksheet Details Section */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  margin: '0 0 20px 0',
                  cursor: 'pointer',
                  gap: '8px'
                }}
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                >
                  <span style={{
                    fontSize: '14px',
                    color: '#666',
                    transition: 'transform 0.2s ease',
                    transform: isDetailsExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}>
                    ▶
                  </span>
                  <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#333',
                    margin: '0'
                  }}>
                    Worksheet details
                  </h2>
                </div>
                
                {isDetailsExpanded && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Worksheet title
                      </label>
                      <input
                        type="text"
                        value={settings.title}
                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                        placeholder="Enter worksheet title"
                        style={{
                          width: '100%',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Footnote
                      </label>
                      <input
                        type="text"
                        value={settings.footnote}
                        onChange={(e) => setSettings({ ...settings, footnote: e.target.value })}
                        placeholder="Optional footnote text (appears at bottom of worksheet)"
                        style={{
                          width: '100%',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Problems Section */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '0 0 20px 0'
              }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#333',
                  margin: '0'
                }}>
                  Problems
                </h2>
                {problems.length > 0 && (
                  <button
                    onClick={() => handleShowCreateModal(problems.length - 1)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    + Add Problem
                  </button>
                )}
              </div>
              
              <ProblemList
                problems={problems}
                onUpdateProblem={handleUpdateProblem}
                onDeleteProblem={handleDeleteProblem}
                onAddProblem={handleShowCreateModal}
                onStartAiGeneration={handleStartAiGeneration}
              />
            </div>

            {/* Integrated Preview Section */}
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '0 0 20px 0'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#333',
                  margin: '0'
                }}>
                  Live preview
                </h3>
                
                {/* Navigation controls */}
                {navigationState && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4a5568'
                    }}>
                      Page {navigationState.currentPage + 1}/{navigationState.totalPages}
                    </span>
                    
                    <button
                      onClick={navigationState.handlers.handlePrevPage}
                      disabled={navigationState.currentPage === 0}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: navigationState.currentPage === 0 ? '#f3f4f6' : 'white',
                        color: navigationState.currentPage === 0 ? '#9ca3af' : '#374151',
                        cursor: navigationState.currentPage === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      title="Previous page"
                    >
                      &lt;
                    </button>
                    
                    <button
                      onClick={navigationState.handlers.handleNextPage}
                      disabled={navigationState.currentPage >= navigationState.totalPages - 1}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: navigationState.currentPage >= navigationState.totalPages - 1 ? '#f3f4f6' : 'white',
                        color: navigationState.currentPage >= navigationState.totalPages - 1 ? '#9ca3af' : '#374151',
                        cursor: navigationState.currentPage >= navigationState.totalPages - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      title="Next page"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
              <div style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '400px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{ 
                  fontSize: '12px',
                  lineHeight: '1.2',
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}>
                  <WorksheetPreview 
                    problems={problems} 
                    settings={settings} 
                    onNavigationChange={handleNavigationChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Problem Modal */}
      <CreateProblemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProblem}
      />

      {/* AI Generation Modal */}
      <AiGenerationModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onProblemsGenerated={handleAiProblemsGenerated}
      />
    </div>
  );
}

export default App;
