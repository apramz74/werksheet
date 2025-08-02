import React from 'react';

interface AiBannerProps {
  onStartGeneration: () => void;
}

const AiBanner: React.FC<AiBannerProps> = ({ onStartGeneration }) => {
  return (
    <div style={{
      backgroundColor: '#f0f9ff',
      border: '2px solid #bfdbfe',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    }}>
      {/* Icon and Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1
      }}>
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
        <div>
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
            lineHeight: '1.5'
          }}>
            Just describe what you want in plain English and we will draft the problems for you to review
          </p>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStartGeneration}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1e40af',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)'
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
        Start
      </button>
    </div>
  );
};

export default AiBanner;