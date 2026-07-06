import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple pub/sub event emitter to react to database changes in React Native
const listeners = new Map();

export const subscribeToTable = (table, callback) => {
  if (!listeners.has(table)) {
    listeners.set(table, new Set());
  }
  listeners.get(table).add(callback);
  return () => {
    listeners.get(table).delete(callback);
  };
};

const notifyListeners = (table) => {
  if (listeners.has(table)) {
    listeners.get(table).forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }
};

// Generic Helper for AsyncStorage
const getTableData = async (table) => {
  try {
    const data = await AsyncStorage.getItem(`smartcalc_${table}`);
    if (data === null) {
      // Seed if the table is empty and has initial seed data
      if (table === 'settings' || table === 'unit_definitions' || table === 'currency_rates') {
        await seedTable(table);
        const seeded = await AsyncStorage.getItem(`smartcalc_${table}`);
        return seeded ? JSON.parse(seeded) : [];
      }
      return [];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading table ${table}`, e);
    return [];
  }
};

const saveTableData = async (table, data) => {
  try {
    await AsyncStorage.setItem(`smartcalc_${table}`, JSON.stringify(data));
    notifyListeners(table);
  } catch (e) {
    console.error(`Error saving table ${table}`, e);
  }
};

// Seed database on creation
const seedTable = async (table) => {
  const now = new Date().toISOString();
  if (table === 'settings') {
    const initialSettings = [
      { key: 'theme', value: 'midnight-blue' },
      { key: 'soundEnabled', value: true },
      { key: 'geminiApiKey', value: '' },
      { key: 'voiceOutputEnabled', value: true },
      { key: 'ocrEngineLanguage', value: 'eng' },
      { key: 'activeMode', value: 'Standard' }
    ];
    await AsyncStorage.setItem('smartcalc_settings', JSON.stringify(initialSettings));
  } else if (table === 'unit_definitions') {
    const initialUnits = [
      // Length
      { id: 1, category: 'Length', name: 'Meter', symbol: 'm', factor: 1, offset: 0, baseUnit: 'm' },
      { id: 2, category: 'Length', name: 'Kilometer', symbol: 'km', factor: 1000, offset: 0, baseUnit: 'm' },
      { id: 3, category: 'Length', name: 'Centimeter', symbol: 'cm', factor: 0.01, offset: 0, baseUnit: 'm' },
      { id: 4, category: 'Length', name: 'Millimeter', symbol: 'mm', factor: 0.001, offset: 0, baseUnit: 'm' },
      { id: 5, category: 'Length', name: 'Mile', symbol: 'mi', factor: 1609.344, offset: 0, baseUnit: 'm' },
      { id: 6, category: 'Length', name: 'Yard', symbol: 'yd', factor: 0.9144, offset: 0, baseUnit: 'm' },
      { id: 7, category: 'Length', name: 'Foot', symbol: 'ft', factor: 0.3048, offset: 0, baseUnit: 'm' },
      { id: 8, category: 'Length', name: 'Inch', symbol: 'in', factor: 0.0254, offset: 0, baseUnit: 'm' },
      // Weight
      { id: 9, category: 'Weight', name: 'Kilogram', symbol: 'kg', factor: 1, offset: 0, baseUnit: 'kg' },
      { id: 10, category: 'Weight', name: 'Gram', symbol: 'g', factor: 0.001, offset: 0, baseUnit: 'kg' },
      { id: 11, category: 'Weight', name: 'Milligram', symbol: 'mg', factor: 0.000001, offset: 0, baseUnit: 'kg' },
      { id: 12, category: 'Weight', name: 'Pound', symbol: 'lb', factor: 0.45359237, offset: 0, baseUnit: 'kg' },
      { id: 13, category: 'Weight', name: 'Ounce', symbol: 'oz', factor: 0.0283495231, offset: 0, baseUnit: 'kg' },
      { id: 14, category: 'Weight', name: 'Metric Ton', symbol: 't', factor: 1000, offset: 0, baseUnit: 'kg' },
      // Temperature
      { id: 15, category: 'Temperature', name: 'Celsius', symbol: '°C', factor: 1, offset: 0, baseUnit: '°C' },
      { id: 16, category: 'Temperature', name: 'Fahrenheit', symbol: '°F', factor: 0.5555555556, offset: 32, baseUnit: '°C' },
      { id: 17, category: 'Temperature', name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15, baseUnit: '°C' },
      // Area
      { id: 18, category: 'Area', name: 'Square Meter', symbol: 'm²', factor: 1, offset: 0, baseUnit: 'm²' },
      { id: 19, category: 'Area', name: 'Square Kilometer', symbol: 'km²', factor: 1000000, offset: 0, baseUnit: 'm²' },
      { id: 20, category: 'Area', name: 'Square Foot', symbol: 'ft²', factor: 0.09290304, offset: 0, baseUnit: 'm²' },
      { id: 21, category: 'Area', name: 'Acre', symbol: 'ac', factor: 4046.85642, offset: 0, baseUnit: 'm²' },
      { id: 22, category: 'Area', name: 'Hectare', symbol: 'ha', factor: 10000, offset: 0, baseUnit: 'm²' },
      // Volume
      { id: 23, category: 'Volume', name: 'Liter', symbol: 'L', factor: 1, offset: 0, baseUnit: 'L' },
      { id: 24, category: 'Volume', name: 'Milliliter', symbol: 'mL', factor: 0.001, offset: 0, baseUnit: 'L' },
      { id: 25, category: 'Volume', name: 'Cubic Meter', symbol: 'm³', factor: 1000, offset: 0, baseUnit: 'L' },
      { id: 26, category: 'Volume', name: 'US Gallon', symbol: 'gal', factor: 3.78541178, offset: 0, baseUnit: 'L' },
      { id: 27, category: 'Volume', name: 'US Quart', symbol: 'qt', factor: 0.946352946, offset: 0, baseUnit: 'L' },
      { id: 28, category: 'Volume', name: 'US Cup', symbol: 'cup', factor: 0.236588236, offset: 0, baseUnit: 'L' },
      // Time
      { id: 29, category: 'Time', name: 'Second', symbol: 's', factor: 1, offset: 0, baseUnit: 's' },
      { id: 30, category: 'Time', name: 'Minute', symbol: 'min', factor: 60, offset: 0, baseUnit: 's' },
      { id: 31, category: 'Time', name: 'Hour', symbol: 'h', factor: 3600, offset: 0, baseUnit: 's' },
      { id: 32, category: 'Time', name: 'Day', symbol: 'd', factor: 86400, offset: 0, baseUnit: 's' },
      { id: 33, category: 'Time', name: 'Week', symbol: 'wk', factor: 604800, offset: 0, baseUnit: 's' },
      { id: 34, category: 'Time', name: 'Year', symbol: 'yr', factor: 31536000, offset: 0, baseUnit: 's' },
      // Speed
      { id: 35, category: 'Speed', name: 'Meter/Second', symbol: 'm/s', factor: 1, offset: 0, baseUnit: 'm/s' },
      { id: 36, category: 'Speed', name: 'Kilometer/Hour', symbol: 'km/h', factor: 0.2777777778, offset: 0, baseUnit: 'm/s' },
      { id: 37, category: 'Speed', name: 'Mile/Hour', symbol: 'mph', factor: 0.44704, offset: 0, baseUnit: 'm/s' },
      { id: 38, category: 'Speed', name: 'Knot', symbol: 'kt', factor: 0.514444, offset: 0, baseUnit: 'm/s' },
      // Pressure
      { id: 39, category: 'Pressure', name: 'Pascal', symbol: 'Pa', factor: 1, offset: 0, baseUnit: 'Pa' },
      { id: 40, category: 'Pressure', name: 'Bar', symbol: 'bar', factor: 100000, offset: 0, baseUnit: 'Pa' },
      { id: 41, category: 'Pressure', name: 'Atmosphere', symbol: 'atm', factor: 101325, offset: 0, baseUnit: 'Pa' },
      { id: 42, category: 'Pressure', name: 'PSI', symbol: 'psi', factor: 6894.75729, offset: 0, baseUnit: 'Pa' },
      // Energy
      { id: 43, category: 'Energy', name: 'Joule', symbol: 'J', factor: 1, offset: 0, baseUnit: 'J' },
      { id: 44, category: 'Energy', name: 'Kilojoule', symbol: 'kJ', factor: 1000, offset: 0, baseUnit: 'J' },
      { id: 45, category: 'Energy', name: 'Calorie', symbol: 'cal', factor: 4.184, offset: 0, baseUnit: 'J' },
      { id: 46, category: 'Energy', name: 'Kilocalorie', symbol: 'kcal', factor: 4184, offset: 0, baseUnit: 'J' },
      { id: 47, category: 'Energy', name: 'Watt-Hour', symbol: 'Wh', factor: 3600, offset: 0, baseUnit: 'J' },
      { id: 48, category: 'Energy', name: 'Kilowatt-Hour', symbol: 'kWh', factor: 3600000, offset: 0, baseUnit: 'J' },
      // Data Storage
      { id: 49, category: 'Data Storage', name: 'Byte', symbol: 'B', factor: 1, offset: 0, baseUnit: 'B' },
      { id: 50, category: 'Data Storage', name: 'Kilobyte', symbol: 'KB', factor: 1024, offset: 0, baseUnit: 'B' },
      { id: 51, category: 'Data Storage', name: 'Megabyte', symbol: 'MB', factor: 1048576, offset: 0, baseUnit: 'B' },
      { id: 52, category: 'Data Storage', name: 'Gigabyte', symbol: 'GB', factor: 1073741824, offset: 0, baseUnit: 'B' },
      { id: 53, category: 'Data Storage', name: 'Terabyte', symbol: 'TB', factor: 1099511627776, offset: 0, baseUnit: 'B' }
    ];
    await AsyncStorage.setItem('smartcalc_unit_definitions', JSON.stringify(initialUnits));
  } else if (table === 'currency_rates') {
    const initialRates = [
      { code: 'USD', rate: 1.0, flag: '🇺🇸', name: 'US Dollar', lastUpdated: now },
      { code: 'EUR', rate: 0.92, flag: '🇪🇺', name: 'Euro', lastUpdated: now },
      { code: 'GBP', rate: 0.78, flag: '🇬🇧', name: 'British Pound', lastUpdated: now },
      { code: 'INR', rate: 83.50, flag: '🇮🇳', name: 'Indian Rupee', lastUpdated: now },
      { code: 'JPY', rate: 160.20, flag: '🇯🇵', name: 'Japanese Yen', lastUpdated: now },
      { code: 'CAD', rate: 1.36, flag: '🇨🇦', name: 'Canadian Dollar', lastUpdated: now },
      { code: 'AUD', rate: 1.50, flag: '🇦🇺', name: 'Australian Dollar', lastUpdated: now },
      { code: 'CNY', rate: 7.27, flag: '🇨🇳', name: 'Chinese Yuan', lastUpdated: now },
      { code: 'CHF', rate: 0.90, flag: '🇨🇭', name: 'Swiss Franc', lastUpdated: now },
      { code: 'NZD', rate: 1.63, flag: '🇳🇿', name: 'New Zealand Dollar', lastUpdated: now }
    ];
    await AsyncStorage.setItem('smartcalc_currency_rates', JSON.stringify(initialRates));
  }
};

export const dbAdapter = {
  history: {
    getAll: () => getTableData('history'),
    add: async (item) => {
      const data = await getTableData('history');
      const newItem = { id: Date.now(), ...item };
      data.push(newItem);
      await saveTableData('history', data);
      return newItem.id;
    },
    delete: async (id) => {
      const data = await getTableData('history');
      const filtered = data.filter(i => i.id !== id);
      await saveTableData('history', filtered);
    },
    clear: () => saveTableData('history', []),
    put: async (item) => {
      const data = await getTableData('history');
      const index = data.findIndex(i => i.id === item.id);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      await saveTableData('history', data);
      return item.id;
    },
  },
  favorites: {
    getAll: () => getTableData('favorites'),
    add: async (item) => {
      const data = await getTableData('favorites');
      const newItem = { id: Date.now(), ...item };
      data.push(newItem);
      await saveTableData('favorites', data);
      return newItem.id;
    },
    delete: async (id) => {
      const data = await getTableData('favorites');
      const filtered = data.filter(i => i.id !== id);
      await saveTableData('favorites', filtered);
    },
    clear: () => saveTableData('favorites', []),
    put: async (item) => {
      const data = await getTableData('favorites');
      const index = data.findIndex(i => i.id === item.id);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      await saveTableData('favorites', data);
      return item.id;
    },
    findByExpression: async (expression) => {
      const data = await getTableData('favorites');
      return data.find(i => i.expression === expression) || null;
    },
    deleteByExpression: async (expression) => {
      const data = await getTableData('favorites');
      const filtered = data.filter(i => i.expression !== expression);
      await saveTableData('favorites', filtered);
    },
  },
  currency_rates: {
    getAll: () => getTableData('currency_rates'),
    get: async (code) => {
      const data = await getTableData('currency_rates');
      return data.find(i => i.code === code) || null;
    },
    update: async (code, updates) => {
      const data = await getTableData('currency_rates');
      const index = data.findIndex(i => i.code === code);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        await saveTableData('currency_rates', data);
      }
    },
    clear: () => saveTableData('currency_rates', []),
    bulkAdd: async (items) => {
      const data = await getTableData('currency_rates');
      const updated = [...data];
      items.forEach(item => {
        const idx = updated.findIndex(i => i.code === item.code);
        if (idx !== -1) updated[idx] = item;
        else updated.push(item);
      });
      await saveTableData('currency_rates', updated);
    },
    put: async (item) => {
      const data = await getTableData('currency_rates');
      const index = data.findIndex(i => i.code === item.code);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      await saveTableData('currency_rates', data);
      return item.code;
    },
    transaction: async (mode, tables, callback) => {
      // Mock SQLite style transaction for AsyncStorage - executes code directly
      return callback();
    }
  },
  unit_definitions: {
    getAll: () => getTableData('unit_definitions'),
    clear: () => saveTableData('unit_definitions', []),
    bulkAdd: async (items) => {
      const data = await getTableData('unit_definitions');
      const updated = [...data];
      items.forEach(item => {
        const idx = updated.findIndex(i => i.id === item.id);
        if (idx !== -1) updated[idx] = item;
        else updated.push(item);
      });
      await saveTableData('unit_definitions', updated);
    },
    put: async (item) => {
      const data = await getTableData('unit_definitions');
      const index = data.findIndex(i => i.id === item.id);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      await saveTableData('unit_definitions', data);
      return item.id;
    },
  },
  settings: {
    getAll: () => getTableData('settings'),
    get: async (key) => {
      const data = await getTableData('settings');
      const setting = data.find(i => i.key === key);
      return setting ? setting.value : undefined;
    },
    put: async (item) => {
      const data = await getTableData('settings');
      const index = data.findIndex(i => i.key === item.key);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      await saveTableData('settings', data);
      return item.key;
    },
    clear: () => saveTableData('settings', []),
    bulkAdd: async (items) => {
      const data = await getTableData('settings');
      const updated = [...data];
      items.forEach(item => {
        const idx = updated.findIndex(i => i.key === item.key);
        if (idx !== -1) updated[idx] = item;
        else updated.push(item);
      });
      await saveTableData('settings', updated);
    },
  },
  graphs: {
    getAll: () => getTableData('graphs'),
    delete: async (id) => {
      const data = await getTableData('graphs');
      const filtered = data.filter(i => i.id !== id);
      await saveTableData('graphs', filtered);
    },
    clear: () => saveTableData('graphs', []),
    bulkAdd: async (items) => {
      const data = await getTableData('graphs');
      const updated = [...data];
      items.forEach(item => {
        const idx = updated.findIndex(i => i.id === item.id);
        if (idx !== -1) updated[idx] = item;
        else updated.push(item);
      });
      await saveTableData('graphs', updated);
    },
    put: async (item) => {
      const data = await getTableData('graphs');
      const index = data.findIndex(i => i.id === item.id);
      if (index !== -1) {
        data[index] = item;
      } else {
        data.push(item);
      }
      await saveTableData('graphs', data);
      return item.id;
    },
  }
};
