import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Coins, RefreshCw, ArrowLeftRight, Search } from 'lucide-react';
import { db } from '../context/db';
import { useTheme } from '../context/ThemeContext';

export const CurrencyConverter = () => {
  const { playClickSound } = useTheme();

  // Query currency rates table from IndexedDB
  const currencyRates = useLiveQuery(() => db.currency_rates.toArray());

  // Local state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Handle rates calculations
  useEffect(() => {
    if (!currencyRates || currencyRates.length === 0) return;

    const fromObj = currencyRates.find((c) => c.code === fromCurrency);
    const toObj = currencyRates.find((c) => c.code === toCurrency);
    const amt = parseFloat(amount);

    if (!fromObj || !toObj || isNaN(amt)) {
      setResult('0');
      return;
    }

    // Convert amount from `fromCurrency` to Base (USD), then to `toCurrency`
    // rate is relative to USD (1 USD = rate units)
    // E.g. USD to INR: baseVal = amt / 1; result = baseVal * 83.50 = 83.50
    // E.g. EUR to INR: baseVal = amt / 0.92; result = baseVal * 83.50
    const baseVal = amt / fromObj.rate;
    const finalVal = baseVal * toObj.rate;

    setResult(finalVal.toFixed(2));
    
    // Set timestamp from active objects
    if (fromObj.lastUpdated) {
      const date = new Date(fromObj.lastUpdated);
      setLastUpdated(date.toLocaleTimeString() + ' ' + date.toLocaleDateString());
    }
  }, [amount, fromCurrency, toCurrency, currencyRates]);

  const handleSwap = () => {
    playClickSound();
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleSyncRates = async () => {
    playClickSound();
    setSyncing(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      const rates = data.rates;
      const now = new Date().toISOString();

      // Update rates in database
      await db.transaction('rw', db.currency_rates, async () => {
        for (let code of Object.keys(rates)) {
          const rateVal = rates[code];
          // If we already have the currency seeded (with name and flag), update its rate.
          // Otherwise, we can add it to the DB if we want, but let's stick to updating the seeded ones.
          const exists = await db.currency_rates.get(code);
          if (exists) {
            await db.currency_rates.update(code, {
              rate: rateVal,
              lastUpdated: now
            });
          }
        }
      });
      
      console.log('Currency rates database updated successfully.');
    } catch (err) {
      console.error('Failed to sync currency rates:', err);
      alert('Could not update live rates. Using cached database rates instead.');
    } finally {
      setSyncing(false);
    }
  };

  // Filter list for search queries
  const filteredCurrencies = currencyRates
    ? currencyRates.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activeFrom = currencyRates?.find((c) => c.code === fromCurrency);
  const activeTo = currencyRates?.find((c) => c.code === toCurrency);

  return (
    <div className="glass-card card-medium converter-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins className="text-blue-400" size={24} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>Live Currency Exchange</h2>
        </div>
        
        <button
          onClick={handleSyncRates}
          disabled={syncing}
          style={{
            background: 'var(--key-fn-bg)',
            border: '1px solid var(--key-fn-color)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '10px',
            cursor: syncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem'
          }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Update Rates'}</span>
        </button>
      </div>

      {/* Conversion Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Amount Input */}
        <div className="converter-group">
          <label className="converter-label">Convert Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="converter-input"
            placeholder="1.00"
          />
        </div>

        {/* Currency Row Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Source Currency */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="converter-label">Source Base</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '6px 12px' }}>
              <span style={{ fontSize: '1.5rem' }}>{activeFrom?.flag || '🇺🇸'}</span>
              <select
                value={fromCurrency}
                onChange={(e) => { playClickSound(); setFromCurrency(e.target.value); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {currencyRates?.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: '#0f172a' }}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            style={{
              marginTop: '1.2rem',
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
              flexShrink: 0
            }}
            className="hover:scale-110 active:scale-95"
          >
            <ArrowLeftRight size={16} />
          </button>

          {/* Target Currency */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="converter-label">Target Exchange</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '6px 12px' }}>
              <span style={{ fontSize: '1.5rem' }}>{activeTo?.flag || '🇮🇳'}</span>
              <select
                value={toCurrency}
                onChange={(e) => { playClickSound(); setToCurrency(e.target.value); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {currencyRates?.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: '#0f172a' }}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Display Output */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--card-border)',
          textAlign: 'center',
          marginTop: '0.5rem'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {amount} {activeFrom?.code} =
          </p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '6px 0', color: 'var(--text-primary)' }}>
            {result} {activeTo?.code}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Rates DB sync last updated: {lastUpdated || 'Initial Seeds'}
          </p>
        </div>

        {/* Search Helper Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '6px 10px' }}>
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search exchange rates in DB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--card-border)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '6px 12px' }}>Code</th>
                  <th style={{ padding: '6px 12px' }}>Name</th>
                  <th style={{ padding: '6px 12px' }}>Rate (1 USD)</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.map((c) => (
                  <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 600 }}>{c.flag} {c.code}</td>
                    <td style={{ padding: '6px 12px', color: 'var(--text-secondary)' }}>{c.name}</td>
                    <td style={{ padding: '6px 12px', fontFamily: 'monospace' }}>{c.rate.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
