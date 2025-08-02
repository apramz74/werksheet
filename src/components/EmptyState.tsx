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
      padding: '60px 40px',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '2px dashed #cbd5e0',
      minHeight: '300px'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '20px',
        opacity: 0.6
      }}>
        📝
      </div>
      
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 8px 0'
      }}>
        Create your first problems
      </h3>
      
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
        maxWidth: '300px'
      }}>
        {/* AI Generation Button - Primary */}
        <button
          onClick={onStartAiGeneration}
          style={{
            padding: '14px 24px',
            backgroundColor: '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(30, 64, 175, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1e40af';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(30, 64, 175, 0.2)';
          }}
        >
          🤖 Generate with AI
        </button>

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