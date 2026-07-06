import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Calculator as CalcIcon, Binary, RefreshCw, History, Settings, Database } from 'lucide-react-native';

// Themes & Hooks
import { themes } from './theme';
import { dbAdapter } from '../src/context/dbAdapter';

// Screen Components
import CalculatorScreen from './screens/CalculatorScreen';
import ProgrammerScreen from './screens/ProgrammerScreen';
import ConverterScreen from './screens/ConverterScreen';
import HistoryFavoritesScreen from './screens/HistoryFavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';
import DatabaseViewerScreen from './screens/DatabaseViewerScreen';

// Modals
import AIExplainerModal from './components/AIExplainerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('calc'); // 'calc' | 'prog' | 'convert' | 'history' | 'settings' | 'db'
  const [historySubTab, setHistorySubTab] = useState('history'); // 'history' | 'favorites'

  // Settings State
  const [settings, setSettings] = useState({
    theme: 'midnight-blue',
    soundEnabled: true,
    voiceOutputEnabled: true,
    geminiApiKey: '',
    ocrEngineLanguage: 'eng',
  });

  // Share calculation state for AI explainer and reuse
  const [expression, setExpression] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiExpr, setAiExpr] = useState('');
  const [aiRes, setAiRes] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Load configuration settings from database
  const loadSettings = async () => {
    try {
      const keys = ['theme', 'soundEnabled', 'voiceOutputEnabled', 'geminiApiKey', 'ocrEngineLanguage'];
      const loaded = {};
      for (let k of keys) {
        const val = await dbAdapter.settings.get(k);
        if (val !== undefined) {
          loaded[k] = val;
        }
      }
      setSettings((prev) => ({ ...prev, ...loaded }));
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await dbAdapter.settings.put({ key, value });
    } catch (e) {
      console.error(`Failed to save setting ${key}`, e);
    }
  };

  const activeTheme = settings.theme || 'midnight-blue';
  const themeStyle = themes[activeTheme] || themes['midnight-blue'];

  const handleReuseExpression = (expr) => {
    setActiveTab('calc');
    setExpression(expr);
    showToast('Expression loaded');
  };

  const handleOpenAIExplain = (expr, res) => {
    setAiExpr(expr);
    setAiRes(res);
    setAiModalOpen(true);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'calc':
        return (
          <CalculatorScreen
            expression={expression}
            setExpression={setExpression}
            themeStyle={themeStyle}
            soundEnabled={settings.soundEnabled}
            voiceEnabled={settings.voiceOutputEnabled}
            onToast={showToast}
            onOpenAIExplain={handleOpenAIExplain}
          />
        );
      case 'prog':
        return (
          <ProgrammerScreen
            themeStyle={themeStyle}
            onToast={showToast}
          />
        );
      case 'convert':
        return (
          <ConverterScreen
            themeStyle={themeStyle}
            onToast={showToast}
          />
        );
      case 'history':
        return (
          <HistoryFavoritesScreen
            activeTab={historySubTab}
            setActiveTab={setHistorySubTab}
            onReuse={handleReuseExpression}
            themeStyle={themeStyle}
            onToast={showToast}
          />
        );
      case 'settings':
        return (
          <ScrollView style={styles.scrollScreen}>
            <SettingsScreen
              settings={settings}
              updateSetting={updateSetting}
              theme={activeTheme}
              themeStyle={themeStyle}
              onToast={showToast}
            />
            {/* Database inspector shortcut */}
            <TouchableOpacity
              onPress={() => setActiveTab('db')}
              style={[styles.dbLink, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
            >
              <Database color={themeStyle.textPrimary} size={18} />
              <Text style={[styles.dbLinkText, { color: themeStyle.textPrimary }]}>Open DB Inspector</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'db':
        return (
          <DatabaseViewerScreen
            themeStyle={themeStyle}
            onToast={showToast}
          />
        );
      default:
        return <View />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyle.bg[0] }]}>
      <StatusBar style={themeStyle.statusBar} />

      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: themeStyle.cardBorder }]}>
        <Text style={[styles.headerLogo, { color: themeStyle.textPrimary }]}>SmartCalc AI</Text>
        <Text style={[styles.headerSub, { color: themeStyle.accent }]}>PRO</Text>
      </View>

      {/* Main Screen canvas */}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Floating Toast Notification */}
      {toast && (
        <View style={[styles.toast, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
          <Text style={[styles.toastText, { color: themeStyle.textPrimary }]}>✨ {toast}</Text>
        </View>
      )}

      {/* Bottom Navigation tab bar */}
      <View style={[styles.tabBar, { backgroundColor: themeStyle.cardBg, borderTopColor: themeStyle.cardBorder }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('calc')}
          style={[styles.tabItem, activeTab === 'calc' && styles.activeTabItem]}
        >
          <CalcIcon color={activeTab === 'calc' ? themeStyle.accent : themeStyle.textSecondary} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === 'calc' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Calc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('prog')}
          style={[styles.tabItem, activeTab === 'prog' && styles.activeTabItem]}
        >
          <Binary color={activeTab === 'prog' ? themeStyle.accent : themeStyle.textSecondary} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === 'prog' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Prog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('convert')}
          style={[styles.tabItem, activeTab === 'convert' && styles.activeTabItem]}
        >
          <RefreshCw color={activeTab === 'convert' ? themeStyle.accent : themeStyle.textSecondary} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === 'convert' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Convert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tabItem, activeTab === 'history' && styles.activeTabItem]}
        >
          <History color={activeTab === 'history' ? themeStyle.accent : themeStyle.textSecondary} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === 'history' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('settings')}
          style={[styles.tabItem, (activeTab === 'settings' || activeTab === 'db') && styles.activeTabItem]}
        >
          <Settings color={(activeTab === 'settings' || activeTab === 'db') ? themeStyle.accent : themeStyle.textSecondary} size={22} />
          <Text style={[styles.tabLabel, { color: (activeTab === 'settings' || activeTab === 'db') ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Config</Text>
        </TouchableOpacity>
      </View>

      {/* AI Explainer Modal overlay */}
      <AIExplainerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        expression={aiExpr}
        result={aiRes}
        apiKey={settings.geminiApiKey}
        themeStyle={themeStyle}
        onToast={showToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  screenContainer: {
    flex: 1,
  },
  scrollScreen: {
    flex: 1,
  },
  dbLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dbLinkText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: 'transparent', // Custom accent top border if desired
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  }
});
