import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash, Star, CornerDownLeft } from 'lucide-react';
import { db } from '../context/dbAdapter';
import { useTheme } from '../context/ThemeContext';

export const FavoritesList = ({ onReuse }) => {
  const { playClickSound } = useTheme();

  // Query favorites table
  const favoriteItems = useLiveQuery(async () => {
    const items = await db.favorites.toArray();
    return items.reverse(); // Newest first
  });

  const handleRemoveFavorite = async (e, id) => {
    e.stopPropagation();
    playClickSound();
    await db.favorites.delete(id);
  };

  const handleClearAll = async () => {
    playClickSound();
    if (confirm('Delete all favorites from database?')) {
      await db.favorites.clear();
    }
  };

  return (
    <div className="glass-card card-medium" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star className="text-yellow-400 fill-yellow-400" size={20} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>Starred Calculations</h2>
        </div>
        {favoriteItems && favoriteItems.length > 0 && (
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

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Save calculations you frequently need to reference. Click any card to load it directly back into the calculator.
      </p>

      {/* Favorites list items */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!favoriteItems || favoriteItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Star size={32} className="text-gray-600" />
            <p style={{ fontSize: '0.9rem' }}>No starred calculations found.</p>
          </div>
        ) : (
          favoriteItems.map((item) => (
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
              className="hover:border-yellow-400 hover:bg-white hover:bg-opacity-5 group"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.mode || 'Standard'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
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
                  onClick={(e) => handleRemoveFavorite(e, item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239,68,68,0.7)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  className="hover:scale-110 text-yellow-400"
                  title="Remove from favorites"
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
