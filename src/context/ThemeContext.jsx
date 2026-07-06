import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './dbAdapter';

const ThemeContext = createContext();

export const themes = [
  { id: 'midnight-blue', name: 'Midnight Blue', class: 'theme-midnight-blue' },
  { id: 'emerald-green', name: 'Emerald Green', class: 'theme-emerald-green' },
  { id: 'royal-purple', name: 'Royal Purple', class: 'theme-royal-purple' },
  { id: 'sunset-orange', name: 'Sunset Orange', class: 'theme-sunset-orange' },
  { id: 'cyber-neon', name: 'Cyber Neon', class: 'theme-cyber-neon' },
  { id: 'amoled-black', name: 'AMOLED Black', class: 'theme-amoled-black' }
];

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('midnight-blue');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [ocrLanguage, setOcrLanguage] = useState('eng');

  // Load configuration from IndexedDB
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const themeSetting = await db.settings.get('theme');
        const soundSetting = await db.settings.get('soundEnabled');
        const apiKeySetting = await db.settings.get('geminiApiKey');
        const voiceSetting = await db.settings.get('voiceOutputEnabled');
        const ocrLangSetting = await db.settings.get('ocrEngineLanguage');

        if (themeSetting) setCurrentTheme(themeSetting.value);
        if (soundSetting) setSoundEnabled(soundSetting.value);
        if (apiKeySetting) setGeminiApiKey(apiKeySetting.value);
        if (voiceSetting) setVoiceOutputEnabled(voiceSetting.value);
        if (ocrLangSetting) setOcrLanguage(ocrLangSetting.value);
      } catch (err) {
        console.error('Failed to load settings from DB', err);
      }
    };
    loadSettings();
  }, []);

  // Sync theme with HTML body classes
  useEffect(() => {
    // Remove all previous theme classes
    themes.forEach(t => document.body.classList.remove(t.class));
    // Find active theme and apply it
    const active = themes.find(t => t.id === currentTheme) || themes[0];
    document.body.classList.add(active.class);
  }, [currentTheme]);

  const updateTheme = async (themeId) => {
    setCurrentTheme(themeId);
    await db.settings.put({ key: 'theme', value: themeId });
  };

  const updateSound = async (enabled) => {
    setSoundEnabled(enabled);
    await db.settings.put({ key: 'soundEnabled', value: enabled });
  };

  const updateApiKey = async (key) => {
    setGeminiApiKey(key);
    await db.settings.put({ key: 'geminiApiKey', value: key });
  };

  const updateVoiceOutput = async (enabled) => {
    setVoiceOutputEnabled(enabled);
    await db.settings.put({ key: 'voiceOutputEnabled', value: enabled });
  };

  const updateOcrLanguage = async (lang) => {
    setOcrLanguage(lang);
    await db.settings.put({ key: 'ocrEngineLanguage', value: lang });
  };

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, context.currentTime); // Quick beep
      gainNode.gain.setValueAtTime(0.02, context.currentTime); // Low volume
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.08); // Quick fade
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio click failed', e);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      updateTheme,
      soundEnabled,
      updateSound,
      geminiApiKey,
      updateApiKey,
      voiceOutputEnabled,
      updateVoiceOutput,
      ocrLanguage,
      updateOcrLanguage,
      playClickSound,
      themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
