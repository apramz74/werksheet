import React from 'react';
import { MathProblem, WorksheetSettings } from '../types';
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
      padding: '24px', 
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      margin: '0 auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      borderRadius: '12px',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2.2em', 
          margin: '0 0 16px 0',
          color: '#2d3748',
          fontWeight: '600',
          letterSpacing: '-0.5px'
        }}>
          {settings.title}
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          margin: '0 0 16px 0',
          fontSize: '0.9em',
          color: '#4a5568',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontWeight: '500' }}>Name: ____________________</span>
          <span style={{ fontWeight: '500' }}>Date: ____________________</span>
        </div>
        <hr style={{ margin: '16px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {validProblems.map((problem, index) => (
          <div key={problem.id} style={{ 
            padding: '20px 24px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white',
            minHeight: '60px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* Question Number */}
              <span style={{ 
                fontSize: '1.1em',
                color: '#2d3748',
                fontWeight: '600',
                minWidth: '24px',
                marginTop: '2px'
              }}>
                {index + 1}.
              </span>
              
              {/* Question Content */}
              <div style={{ flex: 1 }}>
                {problem.type === 'multiple-choice' ? (
                  <div>
                    <div style={{
                      fontSize: '1.4em',
                      fontFamily: 'Arial, sans-serif',
                      color: '#2d3748',
                      fontWeight: '500',
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      {problem.question}
                    </div>
                    <div style={{ paddingLeft: '8px' }}>
                      {problem.options?.map((option, optIndex) => (
                        <div key={optIndex} style={{
                          fontSize: '1.2em',
                          fontFamily: 'Arial, sans-serif',
                          color: '#4a5568',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            border: '2px solid #a0aec0',
                            borderRadius: '50%',
                            backgroundColor: 'white'
                          }}></span>
                          <span style={{ fontWeight: '500' }}>
                            {String.fromCharCode(65 + optIndex)})
                          </span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '1.4em',
                    fontFamily: 'Arial, sans-serif',
                    color: '#2d3748',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span>{problem.leftOperand}</span>
                    <span style={{ color: '#2d3748', fontWeight: '600' }}>{problem.operator}</span>
                    <span>{problem.rightOperand}</span>
                    <span style={{ color: '#2d3748', fontWeight: '600' }}>=</span>
                    <span style={{
                      borderBottom: '3px solid #2d3748',
                      minWidth: '80px',
                      height: '24px',
                      display: 'inline-block'
                    }}></span>
                  </div>
                )}
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