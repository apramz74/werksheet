import React, { useState } from 'react';
import './App.css';
import { WorksheetSettings, MathProblem } from './types';
import WorksheetPreview from './components/WorksheetPreview';
import ProblemList from './components/ProblemList';
import CreateProblemModal from './components/CreateProblemModal';
import AiGenerationModal from './components/AiGenerationModal';
import AdvancedSettingsModal from './components/AdvancedSettingsModal';
import { generateProgrammaticPDF } from './utils/pdfExport';
import { MathFormatter } from './utils/mathFormatter';

function App() {
  const [settings, setSettings] = useState<WorksheetSettings>({
    title: 'Math Worksheet',
    numberOfProblems: 5,
    showAnswers: false,
    footnote: '',
    layout: 'single-column'
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

  // AI generation modal state
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Advanced settings modal state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(settings.title);

  const createNewProblem = (type: 'basic-equation' | 'multiple-choice' | 'word-problem' | 'fill-blanks' = 'basic-equation'): MathProblem => MathFormatter.createBlankProblem(type);

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

  const handleAddProblem = (afterIndex: number, type: 'basic-equation' | 'multiple-choice' | 'word-problem' | 'fill-blanks' = 'basic-equation') => {
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
    if (problemType === 'basic-equation' || problemType === 'multiple-choice' || problemType === 'word-problem' || problemType === 'fill-blanks') {
      handleAddProblem(pendingAfterIndex, problemType as 'basic-equation' | 'multiple-choice' | 'word-problem' | 'fill-blanks');
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

  const handleAdvancedSettingsSave = (newSettings: WorksheetSettings) => {
    setSettings(newSettings);
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
            {!isEditingTitle ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 
                  style={{ 
                    color: '#333', 
                    fontSize: '24px', 
                    margin: '0', 
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => {
                    setIsEditingTitle(true);
                    setTitleValue(settings.title);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {settings.title}
                </h1>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'stroke 0.2s ease',
                    flexShrink: 0
                  }}
                  onClick={() => {
                    setIsEditingTitle(true);
                    setTitleValue(settings.title);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.stroke = '#6b7280';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.stroke = '#9ca3af';
                  }}
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            ) : (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => {
                  setSettings({ ...settings, title: titleValue });
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSettings({ ...settings, title: titleValue });
                    setIsEditingTitle(false);
                  }
                  if (e.key === 'Escape') {
                    setTitleValue(settings.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                style={{
                  color: '#333',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: '2px solid #007bff',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'white',
                  fontFamily: 'inherit',
                  outline: 'none',
                  minWidth: '200px'
                }}
              />
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ 
                cursor: 'pointer',
                transition: 'stroke 0.2s ease',
                flexShrink: 0
              }}
              onClick={() => setShowAdvancedSettings(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.stroke = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.stroke = '#9ca3af';
              }}
            >
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
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
          </div>
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

      {/* Advanced Settings Modal */}
      <AdvancedSettingsModal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        settings={settings}
        onSave={handleAdvancedSettingsSave}
      />
    </div>
  );
}

export default App;
