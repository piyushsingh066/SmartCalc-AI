import Dexie from 'dexie';

export const db = new Dexie('SmartCalcDB');

// Define database schema
db.version(2).stores({
  history: '++id, expression, result, timestamp, mode',
  favorites: '++id, expression, result, timestamp, mode',
  currency_rates: 'code, rate, flag, name, lastUpdated',
  unit_definitions: '++id, category, name, symbol, factor, offset, baseUnit',
  settings: 'key, value',
  graphs: '++id, expression, color, isVisible'
});

// Seed data on database creation
db.on('populate', () => {
  // 1. Initial settings
  db.settings.bulkAdd([
    { key: 'theme', value: 'midnight-blue' },
    { key: 'soundEnabled', value: true },
    { key: 'geminiApiKey', value: '' },
    { key: 'voiceOutputEnabled', value: true },
    { key: 'ocrEngineLanguage', value: 'eng' },
    { key: 'activeMode', value: 'Standard' }
  ]);

  // 2. Unit definitions (Length, Weight, Temperature, Area, Volume, Time, Speed, Pressure, Energy, Data Storage)
  db.unit_definitions.bulkAdd([
    // Length (Base: Meter - m)
    { category: 'Length', name: 'Meter', symbol: 'm', factor: 1, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Kilometer', symbol: 'km', factor: 1000, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Centimeter', symbol: 'cm', factor: 0.01, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Millimeter', symbol: 'mm', factor: 0.001, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Mile', symbol: 'mi', factor: 1609.344, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Yard', symbol: 'yd', factor: 0.9144, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Foot', symbol: 'ft', factor: 0.3048, offset: 0, baseUnit: 'm' },
    { category: 'Length', name: 'Inch', symbol: 'in', factor: 0.0254, offset: 0, baseUnit: 'm' },

    // Weight (Base: Kilogram - kg)
    { category: 'Weight', name: 'Kilogram', symbol: 'kg', factor: 1, offset: 0, baseUnit: 'kg' },
    { category: 'Weight', name: 'Gram', symbol: 'g', factor: 0.001, offset: 0, baseUnit: 'kg' },
    { category: 'Weight', name: 'Milligram', symbol: 'mg', factor: 0.000001, offset: 0, baseUnit: 'kg' },
    { category: 'Weight', name: 'Pound', symbol: 'lb', factor: 0.45359237, offset: 0, baseUnit: 'kg' },
    { category: 'Weight', name: 'Ounce', symbol: 'oz', factor: 0.0283495231, offset: 0, baseUnit: 'kg' },
    { category: 'Weight', name: 'Metric Ton', symbol: 't', factor: 1000, offset: 0, baseUnit: 'kg' },

    // Temperature (Base: Celsius - °C)
    // Formula to base: val * factor + offset
    // Formula from base: (val - offset) / factor
    { category: 'Temperature', name: 'Celsius', symbol: '°C', factor: 1, offset: 0, baseUnit: '°C' },
    { category: 'Temperature', name: 'Fahrenheit', symbol: '°F', factor: 0.5555555556, offset: 32, baseUnit: '°C' }, // (F - 32) * 5/9
    { category: 'Temperature', name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15, baseUnit: '°C' }, // K - 273.15

    // Area (Base: Square Meter - m²)
    { category: 'Area', name: 'Square Meter', symbol: 'm²', factor: 1, offset: 0, baseUnit: 'm²' },
    { category: 'Area', name: 'Square Kilometer', symbol: 'km²', factor: 1000000, offset: 0, baseUnit: 'm²' },
    { category: 'Area', name: 'Square Foot', symbol: 'ft²', factor: 0.09290304, offset: 0, baseUnit: 'm²' },
    { category: 'Area', name: 'Acre', symbol: 'ac', factor: 4046.85642, offset: 0, baseUnit: 'm²' },
    { category: 'Area', name: 'Hectare', symbol: 'ha', factor: 10000, offset: 0, baseUnit: 'm²' },

    // Volume (Base: Liter - L)
    { category: 'Volume', name: 'Liter', symbol: 'L', factor: 1, offset: 0, baseUnit: 'L' },
    { category: 'Volume', name: 'Milliliter', symbol: 'mL', factor: 0.001, offset: 0, baseUnit: 'L' },
    { category: 'Volume', name: 'Cubic Meter', symbol: 'm³', factor: 1000, offset: 0, baseUnit: 'L' },
    { category: 'Volume', name: 'US Gallon', symbol: 'gal', factor: 3.78541178, offset: 0, baseUnit: 'L' },
    { category: 'Volume', name: 'US Quart', symbol: 'qt', factor: 0.946352946, offset: 0, baseUnit: 'L' },
    { category: 'Volume', name: 'US Cup', symbol: 'cup', factor: 0.236588236, offset: 0, baseUnit: 'L' },

    // Time (Base: Second - s)
    { category: 'Time', name: 'Second', symbol: 's', factor: 1, offset: 0, baseUnit: 's' },
    { category: 'Time', name: 'Minute', symbol: 'min', factor: 60, offset: 0, baseUnit: 's' },
    { category: 'Time', name: 'Hour', symbol: 'h', factor: 3600, offset: 0, baseUnit: 's' },
    { category: 'Time', name: 'Day', symbol: 'd', factor: 86400, offset: 0, baseUnit: 's' },
    { category: 'Time', name: 'Week', symbol: 'wk', factor: 604800, offset: 0, baseUnit: 's' },
    { category: 'Time', name: 'Year', symbol: 'yr', factor: 31536000, offset: 0, baseUnit: 's' },

    // Speed (Base: Meter per Second - m/s)
    { category: 'Speed', name: 'Meter/Second', symbol: 'm/s', factor: 1, offset: 0, baseUnit: 'm/s' },
    { category: 'Speed', name: 'Kilometer/Hour', symbol: 'km/h', factor: 0.2777777778, offset: 0, baseUnit: 'm/s' }, // 1 / 3.6
    { category: 'Speed', name: 'Mile/Hour', symbol: 'mph', factor: 0.44704, offset: 0, baseUnit: 'm/s' },
    { category: 'Speed', name: 'Knot', symbol: 'kt', factor: 0.514444, offset: 0, baseUnit: 'm/s' },

    // Pressure (Base: Pascal - Pa)
    { category: 'Pressure', name: 'Pascal', symbol: 'Pa', factor: 1, offset: 0, baseUnit: 'Pa' },
    { category: 'Pressure', name: 'Bar', symbol: 'bar', factor: 100000, offset: 0, baseUnit: 'Pa' },
    { category: 'Pressure', name: 'Atmosphere', symbol: 'atm', factor: 101325, offset: 0, baseUnit: 'Pa' },
    { category: 'Pressure', name: 'PSI', symbol: 'psi', factor: 6894.75729, offset: 0, baseUnit: 'Pa' },

    // Energy (Base: Joule - J)
    { category: 'Energy', name: 'Joule', symbol: 'J', factor: 1, offset: 0, baseUnit: 'J' },
    { category: 'Energy', name: 'Kilojoule', symbol: 'kJ', factor: 1000, offset: 0, baseUnit: 'J' },
    { category: 'Energy', name: 'Calorie', symbol: 'cal', factor: 4.184, offset: 0, baseUnit: 'J' },
    { category: 'Energy', name: 'Kilocalorie', symbol: 'kcal', factor: 4184, offset: 0, baseUnit: 'J' },
    { category: 'Energy', name: 'Watt-Hour', symbol: 'Wh', factor: 3600, offset: 0, baseUnit: 'J' },
    { category: 'Energy', name: 'Kilowatt-Hour', symbol: 'kWh', factor: 3600000, offset: 0, baseUnit: 'J' },

    // Data Storage (Base: Byte - B)
    { category: 'Data Storage', name: 'Byte', symbol: 'B', factor: 1, offset: 0, baseUnit: 'B' },
    { category: 'Data Storage', name: 'Kilobyte', symbol: 'KB', factor: 1024, offset: 0, baseUnit: 'B' },
    { category: 'Data Storage', name: 'Megabyte', symbol: 'MB', factor: 1048576, offset: 0, baseUnit: 'B' },
    { category: 'Data Storage', name: 'Gigabyte', symbol: 'GB', factor: 1073741824, offset: 0, baseUnit: 'B' },
    { category: 'Data Storage', name: 'Terabyte', symbol: 'TB', factor: 1099511627776, offset: 0, baseUnit: 'B' }
  ]);

  // 3. Initial Currency Rates (Base USD = 1.0)
  const now = new Date().toISOString();
  db.currency_rates.bulkAdd([
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
  ]);
});
