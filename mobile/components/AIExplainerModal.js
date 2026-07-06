import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Brain, X, Sparkles } from 'lucide-react-native';
import { parseAndSolve } from '../../src/utils/mathParser';

export default function AIExplainerModal({ isOpen, onClose, expression, result, apiKey, themeStyle, onToast }) {
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [error, setError] = useState(null);

  const localSolve = parseAndSolve(expression);

  useEffect(() => {
    if (isOpen && expression && apiKey) {
      fetchGeminiExplanation();
    } else {
      setAiExplanation('');
      setError(null);
    }
  }, [isOpen, expression, apiKey]);

  const fetchGeminiExplanation = async () => {
    setLoading(true);
    setError(null);
    setAiExplanation('');

    try {
      const prompt = `You are SmartCalc AI, a premium educational math solver.
Explain the mathematical expression "${expression}" step-by-step. 
Provide:
1. Step-by-step calculation steps.
2. The formulas and concepts applied.
3. Beginner-friendly intuition of why it works.
4. Let the user know the calculated result is "${result}".
Output in clear text format. Keep it concise, professional and easy to read.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiExplanation(text);
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI explanation. Please check your Gemini API key in Settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
          
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Brain color={themeStyle.accent} size={24} />
              <Text style={[styles.title, { color: themeStyle.textPrimary }]}>AI Solver Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={themeStyle.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            <Text style={[styles.sectionTitle, { color: themeStyle.textSecondary }]}>Expression</Text>
            <Text style={[styles.expressionBox, { color: themeStyle.textPrimary, backgroundColor: themeStyle.keyNumBg }]}>
              {expression}
            </Text>

            <Text style={[styles.sectionTitle, { color: themeStyle.textSecondary }]}>Local Logical Steps</Text>
            <View style={[styles.stepsContainer, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
              {localSolve.steps.map((step, idx) => (
                <Text key={idx} style={[styles.stepText, { color: themeStyle.textPrimary }]}>
                  {idx + 1}. {step.replace(/`/g, '')}
                </Text>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: themeStyle.textSecondary }]}>Gemini AI Premium Analysis</Text>
            {loading ? (
              <ActivityIndicator color={themeStyle.accent} size="large" style={{ marginVertical: 20 }} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : aiExplanation ? (
              <View style={[styles.aiBox, { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: themeStyle.accent + '33' }]}>
                <Text style={[styles.aiText, { color: themeStyle.textPrimary }]}>{aiExplanation}</Text>
              </View>
            ) : (
              <View style={styles.promptKeyContainer}>
                <Sparkles color={themeStyle.textSecondary} size={24} style={{ marginBottom: 10 }} />
                <Text style={[styles.promptKeyText, { color: themeStyle.textSecondary }]}>
                  Provide your Gemini API key in the settings to unlock premium, intelligent step-by-step explanations.
                </Text>
              </View>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    height: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  expressionBox: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  stepsContainer: {
    padding: 12,
    borderRadius: 10,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  aiBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    lineHeight: 18,
    padding: 10,
  },
  promptKeyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  promptKeyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  }
});
