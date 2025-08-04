import React from 'react';

interface EmptyStateProps {
  onCreateProblem: () => void;
  onStartAiGeneration: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateProblem, onStartAiGeneration }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '2px dashed #cbd5e0',
      minHeight: '200px'
    }}>
      {/* Header with Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '48px',
          opacity: 0.6
        }}>
          📝
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#333',
          margin: '0'
        }}>
          Create your first problems
        </h3>
      </div>
      
      <p style={{
        fontSize: '16px',
        color: '#666',
        margin: '0 0 30px 0',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        Start building your math worksheet by generating problems with AI or creating them manually.
      </p>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '500px'
      }}>
        {/* AI Generation Button - Enhanced Banner Style */}
        <div
          onClick={onStartAiGeneration}
          style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #bfdbfe',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0f0ff';
            e.currentTarget.style.borderColor = '#93c5fd';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f9ff';
            e.currentTarget.style.borderColor = '#bfdbfe';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* AI Icon */}
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#dbeafe',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0
          }}>
            🤖
          </div>
          
          {/* Text Content */}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e40af',
              margin: '0 0 4px 0'
            }}>
              Generate problems quickly with AI
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.4'
            }}>
              Just describe what you want in plain English and we will draft the problems for you to review
            </p>
          </div>
        </div>

        {/* Manual Creation Button - Secondary */}
        <button
          onClick={onCreateProblem}
          style={{
            padding: '12px 24px',
            backgroundColor: 'white',
            color: '#374151',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Create manually
        </button>
      </div>
    </div>
  );
};

export default EmptyState;