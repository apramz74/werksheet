import React from 'react';
import { MathProblem, WorksheetSettings, formatMathProblem } from '../types';
import { MathFormatter } from '../utils/mathFormatter';

interface WorksheetPreviewProps {
  problems: MathProblem[];
  settings: WorksheetSettings;
}

const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ problems, settings }) => {
  // Filter out problems that are invalid
  const validProblems = problems.filter(problem => MathFormatter.validateProblem(problem));


  if (validProblems.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #ddd',
        color: '#666'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Worksheet Preview</h3>
        <p style={{ margin: '0' }}>Add some problems to see the preview</p>
      </div>
    );
  }

  return (
    <div id="worksheet-preview" style={{ 
      width: '100%', 
      maxWidth: '100%',
      minHeight: '500px', 
      padding: '12px', 
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      margin: '0 auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ 
          fontSize: '1.8em', 
          margin: '0 0 10px 0',
          color: '#333',
          fontWeight: 'bold'
        }}>
          {settings.title}
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          margin: '0 0 8px 0',
          fontSize: '0.8em',
          color: '#666',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span>Name: _______</span>
          <span>Date: _______</span>
        </div>
        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #ddd' }} />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        {validProblems.map((problem, index) => (
          <div key={problem.id} style={{ 
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: '#fafafa',
            minHeight: '40px'
          }}>
            <div style={{ width: '100%' }}>
              {/* Question */}
              <div style={{ 
                fontSize: '1.1em', 
                fontFamily: 'monospace',
                color: '#333',
                lineHeight: '1.4',
                marginBottom: '0px'
              }}>
                <span style={{ 
                  fontSize: '1em',
                  color: '#666',
                  marginRight: '8px',
                  fontWeight: 'bold'
                }}>
                  {index + 1}.
                </span>
                {formatMathProblem(problem)}
              </div>

            </div>
          </div>
        ))}
      </div>
      

      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.7em',
        color: '#999',
        borderTop: '1px solid #eee',
        paddingTop: '8px'
      }}>
        Created with Math Worksheet Generator
      </div>
    </div>
  );
};

export default WorksheetPreview;