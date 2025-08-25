import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorksheetSettings, WorksheetLayout } from '../types';

// Layout preview graphics components
const SingleColumnPreview = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '40px', height: '24px' }}>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
  </div>
);

const TwoColumnPreview = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '40px', height: '24px' }}>
    <div style={{ display: 'flex', gap: '4px' }}>
      <div style={{ width: '18px', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
      <div style={{ width: '18px', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    </div>
    <div style={{ display: 'flex', gap: '4px' }}>
      <div style={{ width: '18px', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
      <div style={{ width: '18px', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    </div>
    <div style={{ display: 'flex', gap: '4px' }}>
      <div style={{ width: '18px', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
      <div style={{ width: '18px', height: '3px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    </div>
  </div>
);

const CompactGridPreview = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', width: '40px', height: '24px' }}>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} style={{ width: '6px', height: '6px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
    ))}
  </div>
);

const layoutOptions = [
  {
    value: 'single-column' as WorksheetLayout,
    label: 'Single Column',
    description: 'One problem per row (best for complex problems)',
    preview: <SingleColumnPreview />
  },
  {
    value: 'two-column' as WorksheetLayout,
    label: 'Two Column', 
    description: 'Two problems side by side (good for basic equations)',
    preview: <TwoColumnPreview />
  },
  {
    value: 'compact-grid' as WorksheetLayout,
    label: 'Compact Grid',
    description: 'Grid layout with vertical format (for simple math only)',
    preview: <CompactGridPreview />
  }
];

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WorksheetSettings;
  onSave: (settings: WorksheetSettings) => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [footnote, setFootnote] = useState(settings.footnote);
  const [layout, setLayout] = useState<WorksheetLayout>(settings.layout);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFootnote(settings.footnote);
      setLayout(settings.layout);
    }
  }, [isOpen, settings.footnote, settings.layout]);

  const handleCancel = useCallback(() => {
    setFootnote(settings.footnote);
    setLayout(settings.layout);
    setIsDropdownOpen(false);
    onClose();
  }, [settings.footnote, settings.layout, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCancel();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleCancel]);

  const handleSave = () => {
    onSave({ ...settings, footnote, layout });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a202c'
          }}>
            Advanced Settings
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#a0aec0',
              padding: '0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f7fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Footnote Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Worksheet Footnote
          </label>
          <textarea
            value={footnote}
            onChange={(e) => setFootnote(e.target.value)}
            placeholder="e.g., Name: _____ Date: _____"
            rows={3}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3182ce';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            The footnote will appear centered at the bottom of each worksheet page.
          </div>
        </div>

        {/* Layout Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Worksheet Layout
          </label>
          
          {/* Custom Visual Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3182ce';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {layoutOptions.find(option => option.value === layout)?.preview}
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {layoutOptions.find(option => option.value === layout)?.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {layoutOptions.find(option => option.value === layout)?.description}
                  </div>
                </div>
              </div>
              <div style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
                ▼
              </div>
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                {layoutOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setLayout(option.value);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      backgroundColor: layout === option.value ? '#f0f9ff' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      borderTop: index > 0 ? '1px solid #f3f4f6' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (layout !== option.value) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (layout !== option.value) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {option.preview}
                    <div>
                      <div style={{ fontWeight: '500', color: '#374151' }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#4a5568',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f7fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2c5aa0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3182ce';
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal;