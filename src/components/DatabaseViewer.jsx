import React, { useState, useEffect } from 'react';
import { Database, Trash, RefreshCw, AlertCircle, Edit, Check } from 'lucide-react';
import { db } from '../context/db';
import { useTheme } from '../context/ThemeContext';

export const DatabaseViewer = () => {
  const { playClickSound } = useTheme();
  
  const tables = ['history', 'favorites', 'currency_rates', 'unit_definitions', 'settings', 'graphs'];
  const [activeTable, setActiveTable] = useState('unit_definitions');
  const [records, setRecords] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchRecords = async () => {
    try {
      let data = [];
      if (activeTable === 'history') data = await db.history.toArray();
      else if (activeTable === 'favorites') data = await db.favorites.toArray();
      else if (activeTable === 'currency_rates') data = await db.currency_rates.toArray();
      else if (activeTable === 'unit_definitions') data = await db.unit_definitions.toArray();
      else if (activeTable === 'settings') data = await db.settings.toArray();
      else if (activeTable === 'graphs') data = await db.graphs.toArray();
      
      setRecords(data);
    } catch (err) {
      console.error('Failed to load table records', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTable]);

  const handleDelete = async (primaryKey) => {
    playClickSound();
    if (!confirm('Are you sure you want to delete this row from the database?')) return;
    
    try {
      if (activeTable === 'history') await db.history.delete(primaryKey);
      else if (activeTable === 'favorites') await db.favorites.delete(primaryKey);
      else if (activeTable === 'currency_rates') await db.currency_rates.delete(primaryKey);
      else if (activeTable === 'unit_definitions') await db.unit_definitions.delete(primaryKey);
      else if (activeTable === 'settings') await db.settings.delete(primaryKey);
      else if (activeTable === 'graphs') await db.graphs.delete(primaryKey);
      
      fetchRecords();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  const handleReseed = async () => {
    playClickSound();
    if (!confirm('WARNING: This will clear history, favorites, settings, and reload default database unit tables. Proceed?')) return;

    try {
      // Clear all tables
      await Promise.all([
        db.history.clear(),
        db.favorites.clear(),
        db.currency_rates.clear(),
        db.unit_definitions.clear(),
        db.settings.clear(),
        db.graphs.clear()
      ]);

      // Trigger seed seeding
      // Re-populate settings
      await db.settings.bulkAdd([
        { key: 'theme', value: 'midnight-blue' },
        { key: 'soundEnabled', value: true },
        { key: 'geminiApiKey', value: '' },
        { key: 'voiceOutputEnabled', value: true },
        { key: 'ocrEngineLanguage', value: 'eng' },
        { key: 'activeMode', value: 'Standard' }
      ]);

      // Re-populate units
      await db.unit_definitions.bulkAdd([
        { category: 'Length', name: 'Meter', symbol: 'm', factor: 1, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Kilometer', symbol: 'km', factor: 1000, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Centimeter', symbol: 'cm', factor: 0.01, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Millimeter', symbol: 'mm', factor: 0.001, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Mile', symbol: 'mi', factor: 1609.344, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Yard', symbol: 'yd', factor: 0.9144, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Foot', symbol: 'ft', factor: 0.3048, offset: 0, baseUnit: 'm' },
        { category: 'Length', name: 'Inch', symbol: 'in', factor: 0.0254, offset: 0, baseUnit: 'm' },
        { category: 'Weight', name: 'Kilogram', symbol: 'kg', factor: 1, offset: 0, baseUnit: 'kg' },
        { category: 'Weight', name: 'Gram', symbol: 'g', factor: 0.001, offset: 0, baseUnit: 'kg' },
        { category: 'Weight', name: 'Milligram', symbol: 'mg', factor: 0.000001, offset: 0, baseUnit: 'kg' },
        { category: 'Weight', name: 'Pound', symbol: 'lb', factor: 0.45359237, offset: 0, baseUnit: 'kg' },
        { category: 'Weight', name: 'Ounce', symbol: 'oz', factor: 0.0283495231, offset: 0, baseUnit: 'kg' },
        { category: 'Weight', name: 'Metric Ton', symbol: 't', factor: 1000, offset: 0, baseUnit: 'kg' },
        { category: 'Temperature', name: 'Celsius', symbol: '°C', factor: 1, offset: 0, baseUnit: '°C' },
        { category: 'Temperature', name: 'Fahrenheit', symbol: '°F', factor: 0.5555555556, offset: 32, baseUnit: '°C' },
        { category: 'Temperature', name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15, baseUnit: '°C' }
      ]);

      // Re-populate currency
      const now = new Date().toISOString();
      await db.currency_rates.bulkAdd([
        { code: 'USD', rate: 1.0, flag: '🇺🇸', name: 'US Dollar', lastUpdated: now },
        { code: 'EUR', rate: 0.92, flag: '🇪🇺', name: 'Euro', lastUpdated: now },
        { code: 'GBP', rate: 0.78, flag: '🇬🇧', name: 'British Pound', lastUpdated: now },
        { code: 'INR', rate: 83.50, flag: '🇮🇳', name: 'Indian Rupee', lastUpdated: now },
        { code: 'JPY', rate: 160.20, flag: '🇯🇵', name: 'Japanese Yen', lastUpdated: now },
        { code: 'CAD', rate: 1.36, flag: '🇨🇦', name: 'Canadian Dollar', lastUpdated: now },
        { code: 'AUD', rate: 1.50, flag: '🇦🇺', name: 'Australian Dollar', lastUpdated: now },
        { code: 'CNY', rate: 7.27, flag: '🇨🇳', name: 'Chinese Yuan', lastUpdated: now }
      ]);

      alert('Database reset completed successfully.');
      fetchRecords();
    } catch (err) {
      alert(`Database reseed failed: ${err.message}`);
    }
  };

  const handleEditClick = (record) => {
    playClickSound();
    // Use dynamic primary key mapping: most use id, currency_rates uses code, settings uses key
    let pk = record.id;
    if (activeTable === 'currency_rates') pk = record.code;
    else if (activeTable === 'settings') pk = record.key;

    setEditingRowId(pk);
    setEditData({ ...record });
  };

  const handleSaveEdit = async () => {
    playClickSound();
    try {
      if (activeTable === 'history') await db.history.put(editData);
      else if (activeTable === 'favorites') await db.favorites.put(editData);
      else if (activeTable === 'currency_rates') await db.currency_rates.put(editData);
      else if (activeTable === 'unit_definitions') await db.unit_definitions.put(editData);
      else if (activeTable === 'settings') await db.settings.put(editData);
      else if (activeTable === 'graphs') await db.graphs.put(editData);

      setEditingRowId(null);
      fetchRecords();
    } catch (e) {
      alert(`Save edit failed: ${e.message}`);
    }
  };

  const handleFieldChange = (field, val) => {
    // Try to convert string numbers back to floats if appropriate
    let parsedVal = val;
    if (field === 'factor' || field === 'offset' || field === 'rate') {
      parsedVal = parseFloat(val);
      if (isNaN(parsedVal)) parsedVal = val; // Fallback
    }
    setEditData(prev => ({ ...prev, [field]: parsedVal }));
  };

  // Get table header keys based on active table records
  const getHeaderKeys = () => {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  };

  const getPK = (record) => {
    if (activeTable === 'currency_rates') return record.code;
    if (activeTable === 'settings') return record.key;
    return record.id;
  };

  return (
    <div className="glass-card card-large" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database className="text-blue-400" size={24} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>IndexedDB Database Explorer</h2>
        </div>

        <button
          onClick={handleReseed}
          style={{
            background: 'var(--key-clear-bg)',
            border: '1px solid var(--key-clear-color)',
            color: 'var(--key-clear-color)',
            padding: '6px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem'
          }}
        >
          <RefreshCw size={14} />
          <span>Reseed DB Tables</span>
        </button>
      </div>

      {/* Warning Tip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(249, 115, 22, 0.05)',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid rgba(249, 115, 22, 0.15)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '1rem'
      }}>
        <AlertCircle size={16} className="text-orange-400 flex-shrink-0" />
        <span><strong>Live Database View</strong>: Editing fields (like conversion factors or rates) updates the active application logic instantly without hardcode recompilation.</span>
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--card-border)',
        paddingBottom: '8px'
      }}>
        {tables.map(tab => (
          <button
            key={tab}
            onClick={() => { playClickSound(); setActiveTable(tab); setEditingRowId(null); }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTable === tab ? 'var(--key-op-bg)' : 'transparent',
              color: activeTable === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeTable === tab ? '1px solid var(--card-border)' : '1px solid transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Table View */}
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', fontSize: '0.9rem' }}>
            No records found in table <strong>{activeTable}</strong>.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                {getHeaderKeys().map(key => (
                  <th key={key} style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{key}</th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => {
                const pk = getPK(record);
                const isEditing = editingRowId === pk;
                const columns = getHeaderKeys();

                return (
                  <tr key={pk || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="hover:bg-white hover:bg-opacity-5">
                    {columns.map((col, colIndex) => (
                      <td key={`${col}-${colIndex}`} style={{ padding: '8px 12px' }}>
                        {isEditing ? (
                          // Prevent editing primary keys like 'id', 'key' or 'code'
                          col === 'id' || col === 'key' || col === 'code' ? (
                            <span style={{ opacity: 0.6 }}>{editData[col]?.toString()}</span>
                          ) : (
                            <input
                              type="text"
                              value={editData[col] !== undefined ? editData[col] : ''}
                              onChange={(e) => handleFieldChange(col, e.target.value)}
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid var(--accent)',
                                color: '#fff',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.8rem',
                                width: '100%'
                              }}
                            />
                          )
                        ) : (
                          <span style={{
                            fontFamily: col === 'factor' || col === 'offset' || col === 'rate' || col === 'result' ? 'monospace' : 'inherit'
                          }}>
                            {record[col]?.toString()}
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {isEditing ? (
                          <button
                            onClick={handleSaveEdit}
                            style={{ background: 'rgba(16, 185, 129, 0.2)', border: 'none', color: '#10b981', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Save Changes"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(record)}
                            style={{ background: 'rgba(255,255,255,0.04)', border: 'none', color: 'var(--text-secondary)', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit Row"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(pk)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Delete Row"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
