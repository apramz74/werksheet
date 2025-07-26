import React from 'react';

interface EmptyStateProps {
  onCreateProblem: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateProblem }) => {
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
        Create your first problem
      </h3>
      
      <p style={{
        fontSize: '16px',
        color: '#666',
        margin: '0 0 30px 0',
        maxWidth: '300px',
        lineHeight: '1.5'
      }}>
        Start building your math worksheet by adding your first equation problem.
      </p>
      
      <button
        onClick={onCreateProblem}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0056b3';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#007bff';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
        }}
      >
        Create problem
      </button>
    </div>
  );
};

export default EmptyState;