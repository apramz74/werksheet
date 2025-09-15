import React from 'react';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  return (
    <nav className={className} style={{
      width: '180px',
      height: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      borderRight: '1px solid #e5e7eb'
    }}>
      <div style={{
        padding: '20px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#1e3a8a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Times, serif'
            }}>
              W
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '16px 8px', flex: 1 }}>
        <div style={{
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          padding: '12px 12px',
          marginBottom: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span style={{
              color: '#2563eb',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Create
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;