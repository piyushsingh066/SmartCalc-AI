import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Scale } from 'lucide-react';
import { db } from '../context/dbAdapter';
import { useTheme } from '../context/ThemeContext';

export const UnitConverter = () => {
  const { playClickSound } = useTheme();

  // Live query unit definitions from Dexie DB
  const dbUnits = useLiveQuery(() => db.unit_definitions.toArray());

  // Local state
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Length');
  const [categoryUnits, setCategoryUnits] = useState([]);
  const [fromUnit, setFromUnit] = useState(null);
  const [toUnit, setToUnit] = useState(null);
  const [inputValue, setInputValue] = useState('1');
  const [outputValue, setOutputValue] = useState('1');

  // Compute unique categories from DB
  useEffect(() => {
    if (dbUnits) {
      const uniqueCats = [...new Set(dbUnits.map((u) => u.category))];
      setCategories(uniqueCats);
      if (!uniqueCats.includes(activeCategory) && uniqueCats.length > 0) {
        setActiveCategory(uniqueCats[0]);
      }
    }
  }, [dbUnits]);

  // Update units list when active category changes
  useEffect(() => {
    if (dbUnits) {
      const filtered = dbUnits.filter((u) => u.category === activeCategory);
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

  // Run conversion logic
  useEffect(() => {
    if (!fromUnit || !toUnit) return;
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setOutputValue('');
      return;
    }

    // Conversion formulas taking account of scale factors and scale offsets (for temperature)
    // 1. Convert to base: baseVal = (val - offset) * factor -> wait, let's see.
    // In our DB seed, for Celsius base:
    // Celsius (Base: C): factor: 1, offset: 0 -> baseVal = val * 1 + 0 = val
    // Fahrenheit: factor: 5/9 = 0.5555555, offset: 32 -> baseVal = (val - 32) * 5/9
    // Kelvin: factor: 1, offset: 273.15 -> baseVal = val - 273.15
    // Let's write the formula:
    // To Base: base = (val - offset) * factor  -- wait, let's look at Fahrenheit: (F - 32) * 5/9. Yes! (val - offset) * factor.
    // Let's look at Kelvin: (K - 273.15) * 1. Yes! (val - offset) * factor.
    // Let's look at normal units (e.g. km to m): factor: 1000, offset: 0. To Base: (val - 0) * 1000 = val * 1000. Yes, wait!
    // Wait, let's check: factor for km in DB is 1000. So to convert km to base (m), baseVal = val * factor.
    // Let's verify: for Fahrenheit, if we want to convert to Celsius, the baseVal = (val - 32) * (5/9). So if we set offset = 32 and factor = 5/9, the formula `(val - offset) * factor` works perfectly!
    // But for normal units like km, baseVal = val * 1000. If offset = 0 and factor = 1000, `(val - offset) * factor` = `val * 1000`.
    // Let's verify From Base:
    // From base: result = (baseVal / factor) + offset
    // Let's check Fahrenheit: baseVal (Celsius) to Fahrenheit: (baseVal / (5/9)) + 32 = baseVal * 1.8 + 32. That's exactly correct!
    // Let's check Kelvin: baseVal (Celsius) to Kelvin: (baseVal / 1) + 273.15 = baseVal + 273.15. Correct!
    // Let's check km: baseVal (m) to km: (baseVal / 1000) + 0 = baseVal / 1000. Correct!
    // This is a universal formula!
    // Universal Formula:
    // To Base: baseValue = (inputValue - fromUnit.offset) * fromUnit.factor
    // From Base: outputValue = (baseValue / toUnit.factor) + toUnit.offset

    const baseValue = (value - fromUnit.offset) * fromUnit.factor;
    const finalVal = (baseValue / toUnit.factor) + toUnit.offset;

    // Limit decimal precision dynamically to avoid precision floating points
    if (finalVal % 1 === 0) {
      setOutputValue(finalVal.toString());
    } else {
      // Find fractional parts or standard 6 decimal places
      setOutputValue(finalVal.toFixed(6).replace(/\.?0+$/, ''));
    }

  }, [inputValue, fromUnit, toUnit]);

  const handleSwap = () => {
    playClickSound();
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="glass-card card-medium converter-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Scale className="text-blue-400" size={24} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>Data-Driven Unit Converter</h2>
      </div>

      {/* Category Tabs Scrollbar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--card-border)'
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { playClickSound(); setActiveCategory(cat); }}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              background: activeCategory === cat ? 'var(--accent)' : 'var(--key-num-bg)',
              color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--card-border)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* From Section */}
        <div className="converter-group">
          <label className="converter-label">From Value</label>
          <div className="converter-input-row">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="converter-input"
              placeholder="Enter value"
            />
            <select
              value={fromUnit?.id || ''}
              onChange={(e) => {
                playClickSound();
                const unit = categoryUnits.find((u) => u.id === parseInt(e.target.value));
                setFromUnit(unit);
              }}
              className="converter-select"
            >
              {categoryUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSwap}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            className="hover:scale-110 active:scale-95"
            title="Swap Units"
          >
            ⇅
          </button>
        </div>

        {/* To Section */}
        <div className="converter-group">
          <label className="converter-label">Converted Value</label>
          <div className="converter-input-row">
            <input
              type="text"
              value={outputValue}
              readOnly
              className="converter-input"
              style={{ background: 'rgba(0,0,0,0.1)', cursor: 'default' }}
            />
            <select
              value={toUnit?.id || ''}
              onChange={(e) => {
                playClickSound();
                const unit = categoryUnits.find((u) => u.id === parseInt(e.target.value));
                setToUnit(unit);
              }}
              className="converter-select"
            >
              {categoryUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
