import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { Scale, Coins, RefreshCw, ArrowLeftRight, ChevronDown } from 'lucide-react-native';
import { dbAdapter } from '../../src/context/dbAdapter';
import { useDbTable } from '../useDbTable';

export default function ConverterScreen({ themeStyle, onToast }) {
  const [activeSubTab, setActiveSubTab] = useState('units');

  // DB States
  const [dbUnits] = useDbTable('unit_definitions');
  const [currencyRates] = useDbTable('currency_rates');

  // Unit Converter State
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Length');
  const [categoryUnits, setCategoryUnits] = useState([]);
  const [fromUnit, setFromUnit] = useState(null);
  const [toUnit, setToUnit] = useState(null);
  const [unitInput, setUnitInput] = useState('1');
  const [unitOutput, setUnitOutput] = useState('1');

  // Currency Converter State
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [currencyInput, setCurrencyInput] = useState('1');
  const [currencyOutput, setCurrencyOutput] = useState('0');
  const [syncingCurrency, setSyncingCurrency] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Dropdown selector state
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);
  const [selectorType, setSelectorType] = useState(null); // 'fromUnit' | 'toUnit' | 'fromCurrency' | 'toCurrency'

  // Compute categories
  useEffect(() => {
    if (dbUnits && dbUnits.length > 0) {
      const uniqueCats = [...new Set(dbUnits.map(u => u.category))];
      setCategories(uniqueCats);
      if (!uniqueCats.includes(activeCategory)) {
        setActiveCategory(uniqueCats[0]);
      }
    }
  }, [dbUnits]);

  // Compute units for active category
  useEffect(() => {
    if (dbUnits && dbUnits.length > 0) {
      const filtered = dbUnits.filter(u => u.category === activeCategory);
      setCategoryUnits(filtered);
      if (filtered.length > 1) {
        setFromUnit(filtered[0]);
        setToUnit(filtered[1]);
      } else if (filtered.length > 0) {
        setFromUnit(filtered[0]);
        setToUnit(filtered[0]);
      }
    }
  }, [activeCategory, dbUnits]);

  // Run unit conversion logic
  useEffect(() => {
    if (!fromUnit || !toUnit) return;
    const value = parseFloat(unitInput);
    if (isNaN(value)) {
      setUnitOutput('');
      return;
    }
    const baseValue = (value - fromUnit.offset) * fromUnit.factor;
    const finalVal = (baseValue / toUnit.factor) + toUnit.offset;
    if (finalVal % 1 === 0) {
      setUnitOutput(finalVal.toString());
    } else {
      setUnitOutput(finalVal.toFixed(6).replace(/\.?0+$/, ''));
    }
  }, [unitInput, fromUnit, toUnit]);

  // Run currency conversion logic
  useEffect(() => {
    if (!currencyRates || currencyRates.length === 0) return;
    const fromObj = currencyRates.find(c => c.code === fromCurrency);
    const toObj = currencyRates.find(c => c.code === toCurrency);
    const amt = parseFloat(currencyInput);

    if (!fromObj || !toObj || isNaN(amt)) {
      setCurrencyOutput('0');
      return;
    }
    const baseVal = amt / fromObj.rate;
    const finalVal = baseVal * toObj.rate;
    setCurrencyOutput(finalVal.toFixed(2));

    if (fromObj.lastUpdated) {
      const date = new Date(fromObj.lastUpdated);
      setLastUpdated(date.toLocaleTimeString() + ' ' + date.toLocaleDateString());
    }
  }, [currencyInput, fromCurrency, toCurrency, currencyRates]);

  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleSyncRates = async () => {
    setSyncingCurrency(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const rates = data.rates;
      const now = new Date().toISOString();

      await dbAdapter.currency_rates.transaction('rw', ['currency_rates'], async () => {
        const updates = [];
        for (let code of Object.keys(rates)) {
          const rateVal = rates[code];
          const exists = await dbAdapter.currency_rates.get(code);
          if (exists) {
            updates.push(dbAdapter.currency_rates.update(code, {
              rate: rateVal,
              lastUpdated: now
            }));
          }
        }
        await Promise.all(updates);
      });
      onToast('Rates updated successfully');
    } catch (err) {
      console.error(err);
      onToast('Using offline rates');
    } finally {
      setSyncingCurrency(false);
    }
  };

  const openSelector = (type) => {
    setSelectorType(type);
    setSelectorModalVisible(true);
  };

  const selectItem = (item) => {
    if (selectorType === 'fromUnit') setFromUnit(item);
    else if (selectorType === 'toUnit') setToUnit(item);
    else if (selectorType === 'fromCurrency') setFromCurrency(item.code);
    else if (selectorType === 'toCurrency') setToCurrency(item.code);
    setSelectorModalVisible(false);
  };

  const getSelectorData = () => {
    if (selectorType === 'fromUnit' || selectorType === 'toUnit') {
      return categoryUnits;
    }
    return currencyRates;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
        <View style={styles.tabsHeader}>
          <TouchableOpacity
            style={[styles.tabButton, activeSubTab === 'units' && { borderBottomColor: themeStyle.accent }]}
            onPress={() => setActiveSubTab('units')}
          >
            <Scale color={activeSubTab === 'units' ? themeStyle.accent : themeStyle.textSecondary} size={20} />
            <Text style={[styles.tabText, { color: activeSubTab === 'units' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Units</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeSubTab === 'currency' && { borderBottomColor: themeStyle.accent }]}
            onPress={() => setActiveSubTab('currency')}
          >
            <Coins color={activeSubTab === 'currency' ? themeStyle.accent : themeStyle.textSecondary} size={20} />
            <Text style={[styles.tabText, { color: activeSubTab === 'currency' ? themeStyle.textPrimary : themeStyle.textSecondary }]}>Currency</Text>
          </TouchableOpacity>
        </View>

        {activeSubTab === 'units' ? (
          <ScrollView>
            <Text style={[styles.label, { color: themeStyle.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryBtn, activeCategory === cat && { backgroundColor: themeStyle.accent }]}
                >
                  <Text style={{ color: activeCategory === cat ? '#fff' : themeStyle.textPrimary, fontWeight: '600', fontSize: 13 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.converterBox}>
              <View style={styles.col}>
                <Text style={[styles.inputLabel, { color: themeStyle.textSecondary }]}>From</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
                  onPress={() => openSelector('fromUnit')}
                >
                  <Text style={{ color: themeStyle.textPrimary }}>{fromUnit ? `${fromUnit.name} (${fromUnit.symbol})` : 'Select'}</Text>
                  <ChevronDown color={themeStyle.textSecondary} size={16} />
                </TouchableOpacity>
                <TextInput
                  value={unitInput}
                  onChangeText={setUnitInput}
                  keyboardType="numeric"
                  placeholderTextColor={themeStyle.textSecondary}
                  style={[styles.input, { color: themeStyle.textPrimary, borderColor: themeStyle.cardBorder, backgroundColor: 'rgba(0,0,0,0.1)' }]}
                />
              </View>

              <TouchableOpacity style={[styles.swapBtn, { backgroundColor: themeStyle.keyOpBg }]} onPress={handleSwapUnits}>
                <ArrowLeftRight color={themeStyle.keyOpColor} size={20} />
              </TouchableOpacity>

              <View style={styles.col}>
                <Text style={[styles.inputLabel, { color: themeStyle.textSecondary }]}>To</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
                  onPress={() => openSelector('toUnit')}
                >
                  <Text style={{ color: themeStyle.textPrimary }}>{toUnit ? `${toUnit.name} (${toUnit.symbol})` : 'Select'}</Text>
                  <ChevronDown color={themeStyle.textSecondary} size={16} />
                </TouchableOpacity>
                <Text style={[styles.outputField, { color: themeStyle.textPrimary, borderColor: themeStyle.cardBorder, backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                  {unitOutput || '0'}
                </Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView>
            <View style={styles.currencyHeader}>
              <View>
                <Text style={[styles.label, { color: themeStyle.textSecondary }]}>FX Converter</Text>
                <Text style={{ fontSize: 11, color: themeStyle.textSecondary }}>Updated: {lastUpdated || 'Offline'}</Text>
              </View>
              <TouchableOpacity
                onPress={handleSyncRates}
                disabled={syncingCurrency}
                style={[styles.syncBtn, { backgroundColor: themeStyle.keyOpBg }]}
              >
                <RefreshCw color={themeStyle.keyOpColor} size={16} />
                <Text style={{ color: themeStyle.keyOpColor, fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>Sync</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.converterBox}>
              <View style={styles.col}>
                <Text style={[styles.inputLabel, { color: themeStyle.textSecondary }]}>From</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
                  onPress={() => openSelector('fromCurrency')}
                >
                  <Text style={{ color: themeStyle.textPrimary }}>{fromCurrency}</Text>
                  <ChevronDown color={themeStyle.textSecondary} size={16} />
                </TouchableOpacity>
                <TextInput
                  value={currencyInput}
                  onChangeText={setCurrencyInput}
                  keyboardType="numeric"
                  placeholderTextColor={themeStyle.textSecondary}
                  style={[styles.input, { color: themeStyle.textPrimary, borderColor: themeStyle.cardBorder, backgroundColor: 'rgba(0,0,0,0.1)' }]}
                />
              </View>

              <TouchableOpacity style={[styles.swapBtn, { backgroundColor: themeStyle.keyOpBg }]} onPress={handleSwapCurrencies}>
                <ArrowLeftRight color={themeStyle.keyOpColor} size={20} />
              </TouchableOpacity>

              <View style={styles.col}>
                <Text style={[styles.inputLabel, { color: themeStyle.textSecondary }]}>To</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { backgroundColor: themeStyle.keyNumBg, borderColor: themeStyle.cardBorder }]}
                  onPress={() => openSelector('toCurrency')}
                >
                  <Text style={{ color: themeStyle.textPrimary }}>{toCurrency}</Text>
                  <ChevronDown color={themeStyle.textSecondary} size={16} />
                </TouchableOpacity>
                <Text style={[styles.outputField, { color: themeStyle.textPrimary, borderColor: themeStyle.cardBorder, backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                  {currencyOutput || '0'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Custom Picker Modal */}
      <Modal visible={selectorModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeStyle.cardBg, borderColor: themeStyle.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: themeStyle.textPrimary }]}>
              {selectorType?.startsWith('from') ? 'Select Input Source' : 'Select Target'}
            </Text>
            <FlatList
              data={getSelectorData()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const label = selectorType?.includes('Unit')
                  ? `${item.name} (${item.symbol})`
                  : `${item.flag} ${item.code} - ${item.name}`;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, { borderBottomColor: themeStyle.cardBorder }]}
                    onPress={() => selectItem(item)}
                  >
                    <Text style={{ color: themeStyle.textPrimary, fontSize: 16 }}>{label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: themeStyle.keyClearBg }]}
              onPress={() => setSelectorModalVisible(false)}
            >
              <Text style={{ color: themeStyle.keyClearColor, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tabsHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 20,
    maxHeight: 38,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  converterBox: {
    paddingVertical: 10,
  },
  col: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  outputField: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    fontWeight: 'bold',
  },
  swapBtn: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 30,
    marginVertical: 4,
  },
  currencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  }
});
