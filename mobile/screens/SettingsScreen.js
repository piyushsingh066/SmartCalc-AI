import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Settings, Volume2, HelpCircle, Check, Trash } from 'lucide-react-native';
import { dbAdapter } from '../../src/context/dbAdapter';

const themeOptions = [
  { id: 'midnight-blue', name: 'Midnight Blue' },
  { id: 'emerald-green', name: 'Emerald Green' },
  { id: 'royal-purple', name: 'Royal Purple' },
  { id: 'sunset-orange', name: 'Sunset Orange' },
  { id: 'cyber-neon', name: 'Cyber Neon' },
  { id: 'amoled-black', name: 'AMOLED Black' }
];

export default function SettingsScreen({ settings, updateSetting, theme, themeStyle, onToast }) {
  const currentThemeId = theme;

  const handleResetDatabase = async () => {
    try {
      await dbAdapter.history.clear();
      await dbAdapter.favorites.clear();
      await dbAdapter.graphs.clear();
      onToast('Database cleared successfully');
    } catch (e) {
      console.error(e);
      onToast('Failed to clear database');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
        <View style={styles.header}>
          <Settings color={themeStyle.textPrimary} size={24} />
          <Text style={[styles.headerTitle, { color: themeStyle.textPrimary }]}>Configuration</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: themeStyle.textSecondary }]}>Choose Theme</Text>
        <View style={styles.themeGrid}>
          {themeOptions.map((t) => {
            const isSelected = t.id === currentThemeId;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: isSelected ? themeStyle.accent : themeStyle.keyNumBg,
                    borderColor: themeStyle.cardBorder,
                  }
                ]}
                onPress={() => updateSetting('theme', t.id)}
              >
                <Text style={[styles.themeText, { color: isSelected ? '#fff' : themeStyle.textPrimary }]}>
                  {t.name}
                </Text>
                {isSelected && <Check color="#fff" size={16} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Volume2 color={themeStyle.textPrimary} size={20} />
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: themeStyle.textPrimary }]}>Sound Effects</Text>
              <Text style={[styles.settingDesc, { color: themeStyle.textSecondary }]}>Play sound on key presses</Text>
            </View>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(val) => updateSetting('soundEnabled', val)}
            trackColor={{ false: '#767577', true: themeStyle.accent }}
            thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <HelpCircle color={themeStyle.textPrimary} size={20} />
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: themeStyle.textPrimary }]}>Voice Assistant</Text>
              <Text style={[styles.settingDesc, { color: themeStyle.textSecondary }]}>Enable speech feedback</Text>
            </View>
          </View>
          <Switch
            value={settings.voiceOutputEnabled}
            onValueChange={(val) => updateSetting('voiceOutputEnabled', val)}
            trackColor={{ false: '#767577', true: themeStyle.accent }}
            thumbColor={settings.voiceOutputEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.separator} />

        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
          onPress={handleResetDatabase}
        >
          <Trash color="#ef4444" size={20} />
          <Text style={styles.dangerButtonText}>Reset Application Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  themeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  }
});
