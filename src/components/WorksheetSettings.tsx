import React from 'react';
import { WorksheetSettings } from '../types';

interface WorksheetSettingsProps {
  settings: WorksheetSettings;
  onSettingsChange: (settings: WorksheetSettings) => void;
  currentProblemCount: number;
}

const WorksheetSettingsComponent: React.FC<WorksheetSettingsProps> = ({ 
  settings, 
  onSettingsChange,
  currentProblemCount
}) => {
  const handleProblemCountChange = (count: number) => {
    if (count >= 1 && count <= 50) {
      onSettingsChange({ ...settings, numberOfProblems: count });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Worksheet Settings</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Worksheet Title:
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onSettingsChange({ ...settings, title: e.target.value })}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
          placeholder="Enter worksheet title"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Number of Problems:
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handleProblemCountChange(settings.numberOfProblems - 1)}
            disabled={settings.numberOfProblems <= 1}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: settings.numberOfProblems <= 1 ? '#f5f5f5' : '#fff',
              cursor: settings.numberOfProblems <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.numberOfProblems}
            onChange={(e) => handleProblemCountChange(parseInt(e.target.value) || 1)}
            style={{ 
              width: '80px', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              textAlign: 'center',
              fontSize: '16px'
            }}
          />
          <button
            onClick={() => handleProblemCountChange(settings.numberOfProblems + 1)}
            disabled={settings.numberOfProblems >= 50}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: settings.numberOfProblems >= 50 ? '#f5f5f5' : '#fff',
              cursor: settings.numberOfProblems >= 50 ? 'not-allowed' : 'pointer'
            }}
          >
            +
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Current: {currentProblemCount} problem{currentProblemCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={settings.showAnswers}
            onChange={(e) => onSettingsChange({ 
              ...settings, 
              showAnswers: e.target.checked 
            })}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Include Answer Key</span>
        </label>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '6px',
        border: '1px solid #bbdefb'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 Tips:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
          <li>Click any problem to edit it inline</li>
          <li>Use * or x for multiplication (×)</li>
          <li>Use / for division (÷)</li>
          <li>Press Tab to save and add new problem</li>
          <li>Use ____ for blank answers</li>
        </ul>
      </div>
    </div>
  );
};

export default WorksheetSettingsComponent;