import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Copy, Star, Sparkles, Delete, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { dbAdapter } from '../../src/context/dbAdapter';
import { parseAndSolve } from '../../src/utils/mathParser';

export default function CalculatorScreen({
  expression,
  setExpression,
  themeStyle,
  soundEnabled,
  voiceEnabled,
  onToast,
  onOpenAIExplain
}) {
  const [result, setResult] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [scientificMode, setScientificMode] = useState(false);

  // Check if expression is currently in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!expression) {
        setIsStarred(false);
        return;
      }
      try {
        const item = await dbAdapter.favorites.findByExpression(expression);
        setIsStarred(!!item);
      } catch (e) {
        setIsStarred(false);
      }
    };
    checkFavorite();
  }, [expression]);

  const handleInput = (char) => {
    setExpression((prev) => prev + char);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setIsStarred(false);
  };

  const handleDelete = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = async () => {
    if (!expression.trim()) return;

    const res = parseAndSolve(expression);

    if (res.error) {
      setResult(res.error);
      onToast(res.error);
      if (voiceEnabled) Speech.speak('Error');
    } else {
      const output = res.result.toString();
      setResult(output);

      // Speak output
      if (voiceEnabled) {
        Speech.speak(output);
      }

      // Add to database history
      try {
        await dbAdapter.history.add({
          expression,
          result: output,
          timestamp: new Date().toISOString(),
          mode: scientificMode ? 'Scientific' : 'Standard'
        });
      } catch (e) {
        console.error('Failed to save to history', e);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!expression || !result) {
      onToast('Evaluate expression first to star it');
      return;
    }

    try {
      if (isStarred) {
        await dbAdapter.favorites.deleteByExpression(expression);
        setIsStarred(false);
        onToast('Removed from starred');
      } else {
        await dbAdapter.favorites.add({
          expression,
          result,
          timestamp: new Date().toISOString(),
          mode: scientificMode ? 'Scientific' : 'Standard'
        });
        setIsStarred(true);
        onToast('Starred calculation!');
      }
    } catch (e) {
      console.error(e);
      onToast('Failed to edit favorites');
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result);
    onToast('Result copied to clipboard');
  };

  const scientificKeys = [
    'sin(', 'cos(', 'tan(', 'log(',
    'ln(', 'sqrt(', '^', '!',
    '(', ')', 'pi', 'e'
  ];

  const standardKeys = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['C', '0', '.', '+']
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
        
        {/* Header Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.modeToggle, { backgroundColor: themeStyle.keyNumBg }]}
            onPress={() => setScientificMode(!scientificMode)}
          >
            <Text style={{ color: themeStyle.textPrimary, fontSize: 12, fontWeight: 'bold' }}>
              {scientificMode ? 'Scientific Mode' : 'Standard Mode'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            {result && (
              <TouchableOpacity onPress={handleCopy} style={styles.iconButton}>
                <Copy color={themeStyle.textSecondary} size={18} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
              <Star color={isStarred ? '#facc15' : themeStyle.textSecondary} fill={isStarred ? '#facc15' : 'transparent'} size={18} />
            </TouchableOpacity>
            {result && !result.includes('Error') && (
              <TouchableOpacity onPress={() => onOpenAIExplain(expression, result)} style={styles.iconButton}>
                <Sparkles color={themeStyle.accent} size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Display screen */}
        <View style={[styles.display, { borderBottomColor: themeStyle.cardBorder }]}>
          <ScrollView horizontal contentContainerStyle={{ alignSelf: 'flex-end', justifyContent: 'flex-end', minWidth: '100%' }} style={styles.exprScroll}>
            <Text style={[styles.exprText, { color: themeStyle.textSecondary }]} numberOfLines={1}>
              {expression || ' '}
            </Text>
          </ScrollView>
          <Text style={[styles.resultText, { color: themeStyle.textPrimary }]} numberOfLines={1}>
            = {result || '0'}
          </Text>
        </View>

        {/* Scientific Panel (if enabled) */}
        {scientificMode && (
          <View style={styles.sciGrid}>
            {scientificKeys.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleInput(key === 'pi' ? 'π' : key === 'e' ? 'e' : key)}
                style={[styles.sciKey, { backgroundColor: themeStyle.keyFnBg }]}
              >
                <Text style={[styles.sciKeyText, { color: themeStyle.keyFnColor }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Standard Keyboard */}
        <View style={styles.standardGrid}>
          {standardKeys.map((row, rIdx) => (
            <View key={rIdx} style={styles.row}>
              {row.map((val) => {
                let bg = themeStyle.keyNumBg;
                let color = themeStyle.textPrimary;
                let action = () => handleInput(val);

                if (['+', '-', '×', '÷'].includes(val)) {
                  bg = themeStyle.keyOpBg;
                  color = themeStyle.keyOpColor;
                } else if (val === 'C') {
                  bg = themeStyle.keyClearBg;
                  color = themeStyle.keyClearColor;
                  action = handleClear;
                }

                return (
                  <TouchableOpacity
                    key={val}
                    onPress={action}
                    style={[styles.keyButton, { backgroundColor: bg }]}
                  >
                    <Text style={[styles.keyText, { color }]}>{val}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          {/* Bottom equal row */}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.keyButton, { backgroundColor: themeStyle.keyDelBg, flex: 2 }]}
            >
              <Delete color={themeStyle.keyDelColor} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEvaluate}
              style={[styles.keyButton, { backgroundColor: themeStyle.keyEqBg, flex: 2 }]}
            >
              <Text style={[styles.keyText, { color: themeStyle.keyEqColor }]}>=</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  display: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  exprScroll: {
    maxHeight: 28,
  },
  exprText: {
    fontSize: 18,
    textAlign: 'right',
  },
  resultText: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },
  sciGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sciKey: {
    width: '23%',
    aspectRatio: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 6,
  },
  sciKeyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  standardGrid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '2%',
  },
  keyButton: {
    flex: 1,
    aspectRatio: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: '1%',
  },
  keyText: {
    fontSize: 22,
    fontWeight: 'bold',
  }
});
