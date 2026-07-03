import React, { useState } from 'react';
import { Settings, Volume2, Key, HelpCircle, Sparkles, Languages, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsPanel = () => {
  const { 
    currentTheme, 
    updateTheme, 
    soundEnabled, 
    updateSound, 
    geminiApiKey, 
    updateApiKey, 

    ocrLanguage,
    updateOcrLanguage,
    playClickSound,
    themes 
  } = useTheme();

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveApiKey = () => {
    playClickSound();
    updateApiKey(apiKeyInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLanguageChange = (e) => {
    playClickSound();
    updateOcrLanguage(e.target.value);
  };

  return (
    <div className="glass-card card-medium" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', overflowY: 'auto' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
        <Settings className="text-blue-400" size={24} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>Preferences & AI Setup</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Theme Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Active Theme</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {themes.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => { playClickSound(); updateTheme(theme.id); }}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--card-border)',
                    background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  className="hover:scale-102"
                >
                  <span>{theme.name}</span>
                  {isActive && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)' }} />

        {/* Gemini API Key setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={16} className="text-purple-400" />
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Gemini AI Credentials</label>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Unlock step-by-step educational analysis of your mathematical formulas. Enter your Gemini API key (saved locally in your browser's IndexedDB database).
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--card-border)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSaveApiKey}
              style={{
                background: 'var(--accent)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                padding: '0 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {saveSuccess ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)' }} />

        {/* Sound and Speech Synthesis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Preferences</label>
          
          {/* Sound FX Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} className="text-blue-400" />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Keypad Sound Effects</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Synthesize retro beep sounds on key clicks</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => { playClickSound(); updateSound(e.target.checked); }}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>


          {/* OCR Engine Language */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Languages size={16} className="text-blue-400" />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>OCR Recognition Language</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target language package for optical scan</p>
              </div>
            </div>
            <select
              value={ocrLanguage}
              onChange={handleLanguageChange}
              style={{
                background: 'var(--key-num-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                color: '#fff',
                padding: '4px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="eng">English (eng)</option>
              <option value="fra">French (fra)</option>
              <option value="spa">Spanish (spa)</option>
              <option value="deu">German (deu)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
