import React, { useState } from 'react';
import './App.css';
import { WorksheetSettings, MathProblem } from './types';
import WorksheetPreview from './components/WorksheetPreview';
import ProblemList from './components/ProblemList';
import CreateProblemModal from './components/CreateProblemModal';
import { exportToPDF } from './utils/pdfExport';
import { MathFormatter } from './utils/mathFormatter';

function App() {
  const [settings, setSettings] = useState<WorksheetSettings>({
    title: 'Math Worksheet',
    numberOfProblems: 5,
    showAnswers: false
  });

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingAfterIndex, setPendingAfterIndex] = useState<number>(-1);

  const createNewProblem = (): MathProblem => MathFormatter.createBlankProblem();


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

  const handleAddProblem = (afterIndex: number) => {
    setProblems(prev => {
      const newProblems = [...prev];
      const newProblem = createNewProblem();
      newProblems.splice(afterIndex + 1, 0, newProblem);
      return newProblems;
    });
  };

  const handleShowCreateModal = (afterIndex: number) => {
    setPendingAfterIndex(afterIndex);
    setShowCreateModal(true);
  };

  const handleCreateProblem = (problemType: string) => {
    // For now, only handle basic-equation type
    if (problemType === 'basic-equation') {
      handleAddProblem(pendingAfterIndex);
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
      await exportToPDF('worksheet-preview', `${settings.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Worksheet title"
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '16px',
                minWidth: '200px'
              }}
            />
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
            {/* Problems Section */}
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
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
              />
            </div>

            {/* Integrated Preview Section */}
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#333',
                margin: '0 0 20px 0'
              }}>
                Live preview
              </h3>
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
                  <WorksheetPreview problems={problems} settings={settings} />
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
    </div>
  );
}

export default App;
