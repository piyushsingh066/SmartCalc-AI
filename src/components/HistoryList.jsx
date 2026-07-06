import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash, Search, ArrowRight, CornerDownLeft } from 'lucide-react';
import { db } from '../context/dbAdapter';
import { useTheme } from '../context/ThemeContext';

export const HistoryList = ({ onReuse }) => {
  const { playClickSound } = useTheme();
  const [search, setSearch] = useState('');

  // Live query history ordered by ID descending (newest first)
  const historyItems = useLiveQuery(async () => {
    const items = await db.history.toArray();
    return items.reverse(); // Newest first
  });

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation(); // Avoid triggering reuse
    playClickSound();
    await db.history.delete(id);
  };

  const handleClearAll = async () => {
    playClickSound();
    if (confirm('Clear all calculation history from database?')) {
      await db.history.clear();
    }
  };

  const filteredHistory = historyItems
    ? historyItems.filter(
        (item) =>
          item.expression.toLowerCase().includes(search.toLowerCase()) ||
          item.result.toString().toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="glass-card card-medium" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>Calculation History Log</h2>
        {historyItems && historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '8px 12px', marginBottom: '1rem' }}>
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search expressions or results in DB..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            width: '100%'
          }}
        />
      </div>

      {/* History Items list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredHistory.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem', fontSize: '0.9rem' }}>
            {search ? 'No history matching search query.' : 'Calculation log is currently empty.'}
          </p>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onReuse(item.expression)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="hover:border-blue-500 hover:bg-white hover:bg-opacity-5 group"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.mode || 'Standard'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', wordBreak: 'break-all' }}>
                  {item.expression}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>=</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.result}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  opacity: 0
                }} className="group-hover:opacity-100 transition-opacity">
                  <CornerDownLeft size={10} />
                  <span>Reuse</span>
                </div>

                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239,68,68,0.7)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  className="hover:scale-110"
                  title="Remove from history"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
