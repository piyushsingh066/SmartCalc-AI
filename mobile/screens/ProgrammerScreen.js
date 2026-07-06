import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { evaluateProgrammer } from '../../src/utils/mathParser';

const BASES = ['HEX', 'DEC', 'OCT', 'BIN'];

export default function ProgrammerScreen({ themeStyle, onToast }) {
  const [expression, setExpression] = useState('');
  const [activeBase, setActiveBase] = useState('DEC');
  const [results, setResults] = useState({ HEX: '0', DEC: '0', OCT: '0', BIN: '0' });
  const [error, setError] = useState(null);

  const handleInput = (char) => {
    // Validate input according to base
    if (activeBase === 'BIN' && !/[0-1]/.test(char) && !isOperator(char)) {
      onToast('Only 0 and 1 allowed in Binary');
      return;
    }
    if (activeBase === 'OCT' && !/[0-7]/.test(char) && !isOperator(char)) {
      onToast('Only 0-7 allowed in Octal');
      return;
    }
    if (activeBase === 'DEC' && !/[0-9]/.test(char) && !isOperator(char)) {
      onToast('Only 0-9 allowed in Decimal');
      return;
    }
    if (activeBase === 'HEX' && !/[0-9A-Fa-f]/.test(char) && !isOperator(char)) {
      onToast('Only HEX digits allowed');
      return;
    }

    setExpression((prev) => prev + char);
  };

  const isOperator = (char) => {
    return ['+', '-', '*', '/', ' AND ', ' OR ', ' XOR ', ' << ', ' >> '].includes(char);
  };

  const handleClear = () => {
    setExpression('');
    setResults({ HEX: '0', DEC: '0', OCT: '0', BIN: '0' });
    setError(null);
  };

  const handleDelete = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    if (!expression.trim()) return;
    const res = evaluateProgrammer(expression, activeBase);
    if (res.error) {
      setError(res.error);
      onToast(res.error);
    } else {
      setError(null);
      setResults({
        HEX: res.HEX,
        DEC: res.DEC,
        OCT: res.OCT,
        BIN: res.BIN
      });
    }
  };

  const digits = activeBase === 'BIN'
    ? ['0', '1']
    : activeBase === 'OCT'
    ? ['0', '1', '2', '3', '4', '5', '6', '7']
    : activeBase === 'DEC'
    ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

  const operators = ['+', '-', '*', '/', ' AND ', ' OR ', ' XOR ', ' << ', ' >> '];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
        
        {/* Expression Display */}
        <View style={[styles.display, { borderBottomColor: themeStyle.cardBorder }]}>
          <Text style={[styles.expressionText, { color: themeStyle.textSecondary }]} numberOfLines={2}>
            {expression || ' '}
          </Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={[styles.resultText, { color: themeStyle.textPrimary }]}>
              = {results[activeBase]}
            </Text>
          )}
        </View>

        {/* Bases list representation */}
        <View style={styles.basesContainer}>
          {BASES.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => setActiveBase(b)}
              style={[
                styles.baseRow,
                activeBase === b && { backgroundColor: themeStyle.accent + '25' }
              ]}
            >
              <Text style={[styles.baseLabel, { color: activeBase === b ? themeStyle.accent : themeStyle.textSecondary }]}>
                {b}
              </Text>
              <Text
                style={[
                  styles.baseValue,
                  { color: activeBase === b ? themeStyle.textPrimary : themeStyle.textSecondary }
                ]}
                numberOfLines={1}
              >
                {results[b]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.separator} />

        {/* Programmer Keyboard */}
        <ScrollView style={styles.keyboardScroll}>
          <View style={styles.keyboardGrid}>
            
            {/* Operator Buttons */}
            <View style={styles.operatorRow}>
              {operators.slice(4).map((op) => (
                <TouchableOpacity
                  key={op}
                  onPress={() => handleInput(op)}
                  style={[styles.keyButton, { backgroundColor: themeStyle.keyFnBg }]}
                >
                  <Text style={[styles.keyText, { color: themeStyle.keyFnColor }]}>{op.trim()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Arithmetic and Number Keys */}
            <View style={styles.mainKeysGrid}>
              <View style={styles.numKeys}>
                {digits.map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    onPress={() => handleInput(digit)}
                    style={[styles.keyButton, { backgroundColor: themeStyle.keyNumBg, width: '22%' }]}
                  >
                    <Text style={[styles.keyText, { color: themeStyle.keyNumColor }]}>{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.opKeys}>
                {operators.slice(0, 4).map((op) => (
                  <TouchableOpacity
                    key={op}
                    onPress={() => handleInput(op)}
                    style={[styles.keyButton, { backgroundColor: themeStyle.keyOpBg }]}
                  >
                    <Text style={[styles.keyText, { color: themeStyle.keyOpColor }]}>{op}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={handleDelete} style={[styles.keyButton, { backgroundColor: themeStyle.keyDelBg }]}>
                  <Text style={[styles.keyText, { color: themeStyle.keyDelColor }]}>DEL</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleClear} style={[styles.keyButton, { backgroundColor: themeStyle.keyClearBg }]}>
                  <Text style={[styles.keyText, { color: themeStyle.keyClearColor }]}>AC</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleEvaluate} style={[styles.keyButton, { backgroundColor: themeStyle.keyEqBg }]}>
                  <Text style={[styles.keyText, { color: themeStyle.keyEqColor }]}>=</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>

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
  display: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  expressionText: {
    fontSize: 18,
    textAlign: 'right',
  },
  resultText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  basesContainer: {
    marginVertical: 4,
  },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  baseLabel: {
    width: 48,
    fontWeight: 'bold',
    fontSize: 12,
  },
  baseValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  keyboardScroll: {
    flex: 1,
  },
  keyboardGrid: {
    flexDirection: 'column',
  },
  operatorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mainKeysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numKeys: {
    width: '74%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  opKeys: {
    width: '24%',
    flexDirection: 'column',
  },
  keyButton: {
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: '1%',
  },
  keyText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});
