import React from 'react';
import { Camera, Brain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Header = ({ 
  activeMode, 
  onOcrClick, 
  onAiExplainClick, 
  isOcrOpen,
  isAiExplainOpen 
}) => {
  const { playClickSound } = useTheme();

  const getTitle = () => {
    switch (activeMode) {
      case 'Standard': return 'Standard Calculator';
      case 'Scientific': return 'Scientific Engine';
      case 'Programmer': return 'Programmer Base System';
      case 'GraphPlotter': return 'Interactive Graph Plotter';
      case 'Currency': return 'Currency Exchange Center';
      case 'Unit': return 'Unit Conversion Manager';
      case 'History': return 'Saved Calculation History';
      case 'Favorites': return 'Favorites Clipboard';
      case 'Settings': return 'Settings & API Credentials';
      case 'DatabaseViewer': return 'IndexedDB Table Viewer';
      default: return 'SmartCalc AI';
    }
  };

  const showSmartControls = ['Standard', 'Scientific'].includes(activeMode);

  return (
    <header className="header">
      <div className="flex items-center gap-3">
        <h1 className="header-title">{getTitle()}</h1>
      </div>

      <div className="header-actions">
        {showSmartControls && (
          <>
            <button 
              className="header-btn" 
              onClick={onOcrClick}
              title="OCR Calculator (Solve from image)"
            >
              <Camera size={16} />
              <span>Scan Math</span>
            </button>

            <button 
              className="header-btn"
              onClick={onAiExplainClick}
              title="AI Explainer (Get step-by-step breakdown)"
              style={{ background: 'var(--key-fn-bg)', borderColor: 'var(--key-fn-color)' }}
            >
              <Brain size={16} className="text-purple-300" />
              <span className="text-purple-200">Explain Mode</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
