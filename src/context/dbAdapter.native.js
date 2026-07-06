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
    const CURRENCIES_LIST = [
      { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1.0 },
      { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.92 },
      { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.78 },
      { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.50 },
      { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 160.20 },
      { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.36 },
      { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.50 },
      { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rate: 7.27 },
      { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 0.90 },
      { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', rate: 1.63 },
      { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 3.67 },
      { code: 'AFN', name: 'Afghan Afghani', flag: '🇦🇫', rate: 70.50 },
      { code: 'ALL', name: 'Albanian Lek', flag: '🇦🇱', rate: 93.40 },
      { code: 'AMD', name: 'Armenian Dram', flag: '🇦🇲', rate: 388.00 },
      { code: 'ANG', name: 'Neth. Antillean Guilder', flag: '🇨🇼', rate: 1.79 },
      { code: 'AOA', name: 'Angolan Kwanza', flag: '🇦🇴', rate: 843.00 },
      { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', rate: 915.00 },
      { code: 'AWG', name: 'Aruban Florin', flag: '🇦🇼', rate: 1.79 },
      { code: 'AZN', name: 'Azerbaijani Manat', flag: '🇦🇿', rate: 1.70 },
      { code: 'BAM', name: 'Bosnia-Herzegovina Mark', flag: '🇧🇦', rate: 1.80 },
      { code: 'BBD', name: 'Barbadian Dollar', flag: '🇧🇧', rate: 2.00 },
      { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', rate: 117.50 },
      { code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬', rate: 1.80 },
      { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', rate: 0.376 },
      { code: 'BIF', name: 'Burundian Franc', flag: '🇧🇮', rate: 2870.00 },
      { code: 'BMD', name: 'Bermudian Dollar', flag: '🇧🇲', rate: 1.00 },
      { code: 'BND', name: 'Brunei Dollar', flag: '🇧🇳', rate: 1.35 },
      { code: 'BOB', name: 'Bolivian Boliviano', flag: '🇧🇴', rate: 6.91 },
      { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', rate: 5.50 },
      { code: 'BSD', name: 'Bahamian Dollar', flag: '🇧🇸', rate: 1.00 },
      { code: 'BTN', name: 'Bhutanese Ngultrum', flag: '🇧🇹', rate: 83.50 },
      { code: 'BWP', name: 'Botswanan Pula', flag: '🇧🇼', rate: 13.70 },
      { code: 'BYN', name: 'Belarusian Ruble', flag: '🇧🇾', rate: 3.27 },
      { code: 'BZD', name: 'Belize Dollar', flag: '🇧🇿', rate: 2.00 },
      { code: 'CDF', name: 'Congolese Franc', flag: '🇨🇩', rate: 2800.00 },
      { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', rate: 940.00 },
      { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', rate: 4150.00 },
      { code: 'CRC', name: 'Costa Rican Colón', flag: '🇨🇷', rate: 525.00 },
      { code: 'CUP', name: 'Cuban Peso', flag: '🇨🇺', rate: 24.00 },
      { code: 'CVE', name: 'Cape Verdean Escudo', flag: '🇨🇻', rate: 101.40 },
      { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', rate: 23.30 },
      { code: 'DJF', name: 'Djiboutian Franc', flag: '🇩🇯', rate: 177.70 },
      { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', rate: 6.87 },
      { code: 'DOP', name: 'Dominican Peso', flag: '🇩🇴', rate: 59.00 },
      { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿', rate: 134.50 },
      { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', rate: 48.00 },
      { code: 'ERN', name: 'Eritrean Nakfa', flag: '🇪🇷', rate: 15.00 },
      { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', rate: 57.30 },
      { code: 'FJD', name: 'Fijian Dollar', flag: '🇫🇯', rate: 2.24 },
      { code: 'FKP', name: 'Falkland Islands Pound', flag: '🇫🇰', rate: 0.78 },
      { code: 'GEL', name: 'Georgian Lari', flag: '🇬🇪', rate: 2.72 },
      { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: 15.00 },
      { code: 'GIP', name: 'Gibraltar Pound', flag: '🇬🇮', rate: 0.78 },
      { code: 'GMD', name: 'Gambian Dalasi', flag: '🇬🇲', rate: 68.50 },
      { code: 'GNF', name: 'Guinean Franc', flag: '🇬🇳', rate: 8600.00 },
      { code: 'GTQ', name: 'Guatemalan Quetzal', flag: '🇬🇹', rate: 7.76 },
      { code: 'GYD', name: 'Guyanese Dollar', flag: '🇬🇾', rate: 209.00 },
      { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', rate: 7.80 },
      { code: 'HNL', name: 'Honduran Lempira', flag: '🇭🇳', rate: 24.70 },
      { code: 'HRK', name: 'Croatian Kuna', flag: '🇭🇷', rate: 7.00 },
      { code: 'HTG', name: 'Haitian Gourde', flag: '🇭🇹', rate: 132.00 },
      { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', rate: 367.00 },
      { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', rate: 16400.00 },
      { code: 'ILS', name: 'Israeli New Shekel', flag: '🇮🇱', rate: 3.72 },
      { code: 'IQD', name: 'Iraqi Dinar', flag: '🇮🇶', rate: 1310.00 },
      { code: 'IRR', name: 'Iranian Rial', flag: '🇮🇷', rate: 42000.00 },
      { code: 'ISK', name: 'Icelandic Króna', flag: '🇮🇸', rate: 139.00 },
      { code: 'JMD', name: 'Jamaican Dollar', flag: '🇯🇲', rate: 156.00 },
      { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴', rate: 0.709 },
      { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 129.00 },
      { code: 'KGS', name: 'Kyrgystani Som', flag: '🇰🇬', rate: 87.50 },
      { code: 'KHR', name: 'Cambodian Riel', flag: '🇰🇭', rate: 4100.00 },
      { code: 'KMF', name: 'Comorian Franc', flag: '🇰🇲', rate: 452.00 },
      { code: 'KPW', name: 'North Korean Won', flag: '🇰🇵', rate: 900.00 },
      { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', rate: 1380.00 },
      { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', rate: 0.306 },
      { code: 'KYD', name: 'Cayman Islands Dollar', flag: '🇰🇾', rate: 0.83 },
      { code: 'KZT', name: 'Kazakhstani Tenge', flag: '🇰🇿', rate: 465.00 },
      { code: 'LAK', name: 'Laotian Kip', flag: '🇱🇦', rate: 21800.00 },
      { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧', rate: 89500.00 },
      { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', rate: 303.00 },
      { code: 'LRD', name: 'Liberian Dollar', flag: '🇱🇷', rate: 194.00 },
      { code: 'LSL', name: 'Lesotho Loti', flag: '🇱🇸', rate: 18.20 },
      { code: 'LYD', name: 'Libyan Dinar', flag: '🇱🇾', rate: 4.85 },
      { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', rate: 9.95 },
      { code: 'MDL', name: 'Moldovan Leu', flag: '🇲🇩', rate: 17.85 },
      { code: 'MGA', name: 'Malagasy Ariary', flag: '🇲🇬', rate: 4500.00 },
      { code: 'MKD', name: 'Macedonian Denar', flag: '🇲🇰', rate: 56.70 },
      { code: 'MMK', name: 'Myanmar Kyat', flag: '🇲🇲', rate: 2100.00 },
      { code: 'MNT', name: 'Mongolian Tughrik', flag: '🇲🇳', rate: 3450.00 },
      { code: 'MOP', name: 'Macanese Pataca', flag: '🇲🇴', rate: 8.03 },
      { code: 'MRU', name: 'Mauritanian Ouguiya', flag: '🇲🇷', rate: 39.70 },
      { code: 'MUR', name: 'Mauritian Rupee', flag: '🇲🇺', rate: 46.80 },
      { code: 'MVR', name: 'Maldivian Rufiyaa', flag: '🇲🇻', rate: 15.40 },
      { code: 'MWK', name: 'Malawian Kwacha', flag: '🇲🇼', rate: 1735.00 },
      { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', rate: 18.40 },
      { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', rate: 4.71 },
      { code: 'MZN', name: 'Mozambican Metical', flag: '🇲🇿', rate: 63.90 },
      { code: 'NAD', name: 'Namibian Dollar', flag: '🇳🇦', rate: 18.20 },
      { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1485.00 },
      { code: 'NIO', name: 'Nicaraguan Córdoba', flag: '🇳🇮', rate: 36.80 },
      { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', rate: 10.60 },
      { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', rate: 133.60 },
      { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', rate: 0.385 },
      { code: 'PAB', name: 'Panamanian Balboa', flag: '🇵🇦', rate: 1.00 },
      { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪', rate: 3.80 },
      { code: 'PGK', name: 'Papua New Guinean Kina', flag: '🇵🇬', rate: 3.90 },
      { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', rate: 58.60 },
      { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', rate: 278.50 },
      { code: 'PLN', name: 'Polish Złoty', flag: '🇵🇱', rate: 4.05 },
      { code: 'PYG', name: 'Paraguayan Guaraní', flag: '🇵🇾', rate: 7530.00 },
      { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', rate: 3.64 },
      { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', rate: 4.60 },
      { code: 'RSD', name: 'Serbian Dinar', flag: '🇷🇸', rate: 108.00 },
      { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', rate: 88.00 },
      { code: 'RWF', name: 'Rwandan Franc', flag: '🇷🇼', rate: 1310.00 },
      { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rate: 3.75 },
      { code: 'SBD', name: 'Solomon Islands Dollar', flag: '🇸🇧', rate: 8.50 },
      { code: 'SCR', name: 'Seychellois Rupee', flag: '🇸🇨', rate: 14.10 },
      { code: 'SDG', name: 'Sudanese Pound', flag: '🇸🇩', rate: 601.00 },
      { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', rate: 10.50 },
      { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', rate: 1.35 },
      { code: 'SHP', name: 'St. Helena Pound', flag: '🇸🇭', rate: 0.78 },
      { code: 'SLL', name: 'Sierra Leonean Leone', flag: '🇸🇱', rate: 22400.00 },
      { code: 'SOS', name: 'Somali Shilling', flag: '🇸🇴', rate: 571.00 },
      { code: 'SRD', name: 'Surinamese Dollar', flag: '🇸🇷', rate: 31.20 },
      { code: 'SSP', name: 'South Sudanese Pound', flag: '🇸🇸', rate: 130.00 },
      { code: 'STN', name: 'São Tomé Dobra', flag: '🇸🇹', rate: 22.50 },
      { code: 'SYP', name: 'Syrian Pound', flag: '🇸🇾', rate: 13000.00 },
      { code: 'SZL', name: 'Swazi Lilangeni', flag: '🇸🇿', rate: 18.20 },
      { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', rate: 36.70 },
      { code: 'TJS', name: 'Tajikistani Somoni', flag: '🇹🇯', rate: 10.70 },
      { code: 'TMT', name: 'Turkmenistani Manat', flag: '🇹🇲', rate: 3.50 },
      { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', rate: 3.12 },
      { code: 'TOP', name: 'Tongan Paʻanga', flag: '🇹🇴', rate: 2.35 },
      { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', rate: 32.80 },
      { code: 'TTD', name: 'Trinidad & Tobago Dollar', flag: '🇹🇹', rate: 6.78 },
      { code: 'TWD', name: 'New Taiwan Dollar', flag: '🇹🇼', rate: 32.40 },
      { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', rate: 2620.00 },
      { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦', rate: 40.50 },
      { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', rate: 3730.00 },
      { code: 'UYU', name: 'Uruguayan Peso', flag: '🇺🇾', rate: 39.30 },
      { code: 'UZS', name: 'Uzbekistani Som', flag: '🇺🇿', rate: 12600.00 },
      { code: 'VES', name: 'Venezuelan Bolívar', flag: '🇻🇪', rate: 36.40 },
      { code: 'VND', name: 'Vietnamese Đồng', flag: '🇻🇳', rate: 25400.00 },
      { code: 'VUV', name: 'Vanuatu Vatu', flag: '🇻🇺', rate: 120.00 },
      { code: 'WST', name: 'Samoan Tālā', flag: '🇼🇸', rate: 2.74 },
      { code: 'XAF', name: 'Central African CFA Franc', flag: '🇨🇫', rate: 605.00 },
      { code: 'XCD', name: 'East Caribbean Dollar', flag: '🇦🇬', rate: 2.70 },
      { code: 'XOF', name: 'West African CFA Franc', flag: '🇸🇳', rate: 605.00 },
      { code: 'XPF', name: 'CFP Franc', flag: '🇵🇫', rate: 110.00 },
      { code: 'YER', name: 'Yemeni Rial', flag: '🇾🇪', rate: 250.00 },
      { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.20 },
      { code: 'ZMW', name: 'Zambian Kwacha', flag: '🇿🇲', rate: 25.50 },
      { code: 'ZWL', name: 'Zimbabwean Dollar', flag: '🇿🇼', rate: 322.00 }
    ];

    const initialRates = CURRENCIES_LIST.map(c => ({
      code: c.code,
      rate: c.rate,
      flag: c.flag,
      name: c.name,
      lastUpdated: now
    }));
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
