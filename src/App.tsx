import React, { useState } from 'react';
import './App.css';
import { WorksheetSettings, MathProblem } from './types';
import WorksheetPreview from './components/WorksheetPreview';
import ProblemList from './components/ProblemList';
import CreateProblemModal from './components/CreateProblemModal';
import AiGenerationModal from './components/AiGenerationModal';
import AdvancedSettingsModal from './components/AdvancedSettingsModal';
import Navigation from './components/Navigation';
import PageHeader from './components/PageHeader';
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Navigation Sidebar */}
      <Navigation />
      
      {/* Main Content Area */}
      <div style={{ 
        marginLeft: '180px', 
        flex: 1, 
        padding: '24px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 180px)',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
        {/* Page Header */}
        <PageHeader title="Worksheet Creator" />

        {/* Worksheet Title Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#6b7280'
              }}>
                Title
              </label>
              {!isEditingTitle ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span 
                    style={{ 
                      color: '#1f2937', 
                      fontSize: '20px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onClick={() => {
                      setIsEditingTitle(true);
                      setTitleValue(settings.title);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {settings.title}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
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
                    color: '#1f2937',
                    fontSize: '20px',
                    fontWeight: '600',
                    border: '2px solid #2563eb',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    fontFamily: 'inherit',
                    outline: 'none',
                    minWidth: '300px'
                  }}
                />
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleExportPDF}
                disabled={isExporting || validProblems.length === 0}
                style={{
                  padding: '12px 24px',
                  backgroundColor: validProblems.length === 0 ? '#6b7280' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: (isExporting || validProblems.length === 0) ? 'not-allowed' : 'pointer',
                  opacity: (isExporting || validProblems.length === 0) ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isExporting && validProblems.length > 0) {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExporting && validProblems.length > 0) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
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
                  e.currentTarget.style.stroke = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.stroke = '#6b7280';
                }}
              >
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Workspace Container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          minHeight: '600px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '32px',
            height: 'fit-content',
            alignItems: 'start'
          }}>
            <div>
              {/* Problems Section */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: '0'
                }}>
                  Problems
                </h2>
                {problems.length > 0 && (
                  <button
                    onClick={() => handleShowCreateModal(problems.length - 1)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Problem
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

            {/* Preview Section */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: '0'
                }}>
                  Live Preview
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
                      color: '#6b7280'
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div style={{ 
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  fontSize: '12px',
                  lineHeight: '1.2',
                  width: '100%',
                  maxWidth: '420px',
                  aspectRatio: '8.5 / 11',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    padding: '8px'
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
        </div>
      </div>

      {/* Create Problem Modal */}
      <CreateProblemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProblem}
        onAiProblemsGenerated={handleAiProblemsGenerated}
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
