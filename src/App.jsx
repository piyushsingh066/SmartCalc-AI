import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { ProgrammerCalculator } from './components/ProgrammerCalculator';
import { GraphPlotter } from './components/GraphPlotter';
import { CurrencyConverter } from './components/CurrencyConverter';
import { UnitConverter } from './components/UnitConverter';
import { HistoryList } from './components/HistoryList';
import { FavoritesList } from './components/FavoritesList';
import { SettingsPanel } from './components/SettingsPanel';
import { DatabaseViewer } from './components/DatabaseViewer';
import { AIExplainer } from './components/AIExplainer';
import { OCRScanner } from './components/OCRScanner';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  // Navigation states
  const [activeMode, setActiveMode] = useState('Standard');

  // Sync expression/result with smart drawer actions
  const [currentExpression, setCurrentExpression] = useState('');
  const [currentResult, setCurrentResult] = useState('');

  // Drawer/Modal toggle states
  const [isAiExplainOpen, setIsAiExplainOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);

  // Dynamic Toast Alert state
  const [toasts, setToasts] = useState([]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleReuseExpression = (expr) => {
    // Switch to Calculator if not already there
    if (activeMode !== 'Standard' && activeMode !== 'Scientific') {
      setActiveMode('Standard');
    }
    // Set expression
    setCurrentExpression(expr);
    setCurrentResult(''); // Reset result to force recalculation
    addToast('Expression loaded into calculator');
  };

  // Render components according to active menu
  const renderMainPanel = () => {
    switch (activeMode) {
      case 'Standard':
        return (
          <Calculator
            mode="Standard"
            globalExpression={currentExpression}
            globalResult={currentResult}
            setGlobalExpression={setCurrentExpression}
            setGlobalResult={setCurrentResult}
            onToast={addToast}
          />
        );
      case 'Scientific':
        return (
          <Calculator
            mode="Scientific"
            globalExpression={currentExpression}
            globalResult={currentResult}
            setGlobalExpression={setCurrentExpression}
            setGlobalResult={setCurrentResult}
            onToast={addToast}
          />
        );
      case 'Programmer':
        return <ProgrammerCalculator onToast={addToast} />;
      case 'GraphPlotter':
        return <GraphPlotter />;
      case 'Currency':
        return <CurrencyConverter />;
      case 'Unit':
        return <UnitConverter />;
      case 'History':
        return <HistoryList onReuse={handleReuseExpression} />;
      case 'Favorites':
        return <FavoritesList onReuse={handleReuseExpression} />;
      case 'Settings':
        return <SettingsPanel />;
      case 'DatabaseViewer':
        return <DatabaseViewer />;
      default:
        return <Calculator mode="Standard" onToast={addToast} />;
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* 1. Animated background particles */}
      <div className="bg-glow-container">
        <div className="glow-bubble glow-bubble-1"></div>
        <div className="glow-bubble glow-bubble-2"></div>
        <div className="glow-bubble glow-bubble-3"></div>
      </div>

      {/* 2. Navigation Sidebar */}
      <Sidebar activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* 3. Main content canvas */}
      <main className="main-content">
        <Header
          activeMode={activeMode}
          onOcrClick={() => setIsOcrOpen(true)}
          onAiExplainClick={() => setIsAiExplainOpen(true)}
          isOcrOpen={isOcrOpen}
          isAiExplainOpen={isAiExplainOpen}
        />

        <div className="panel-container">
          {renderMainPanel()}
        </div>
      </main>

      {/* 4. Side drawers & modals */}
      <AIExplainer
        isOpen={isAiExplainOpen}
        onClose={() => setIsAiExplainOpen(false)}
        expression={currentExpression}
        result={currentResult}
      />

      <OCRScanner
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onResultExtracted={handleReuseExpression}
      />

      {/* 5. Floating Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>✨</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
