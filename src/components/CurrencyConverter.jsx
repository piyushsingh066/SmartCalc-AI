import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Coins, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { db } from '../context/dbAdapter';
import { useTheme } from '../context/ThemeContext';

const CURRENCY_DETAILS = {
  USD: { name: 'US Dollar', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  GBP: { name: 'British Pound', flag: '🇬🇧' },
  INR: { name: 'Indian Rupee', flag: '🇮🇳' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺' },
  CNY: { name: 'Chinese Yuan', flag: '🇨🇳' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
  NZD: { name: 'New Zealand Dollar', flag: '🇳🇿' },
  AED: { name: 'UAE Dirham', flag: '🇦🇪' },
  AFN: { name: 'Afghan Afghani', flag: '🇦🇫' },
  ALL: { name: 'Albanian Lek', flag: '🇦🇱' },
  AMD: { name: 'Armenian Dram', flag: '🇦🇲' },
  ANG: { name: 'Neth. Antillean Guilder', flag: '🇨🇼' },
  AOA: { name: 'Angolan Kwanza', flag: '🇦🇴' },
  ARS: { name: 'Argentine Peso', flag: '🇦🇷' },
  AWG: { name: 'Aruban Florin', flag: '🇦🇼' },
  AZN: { name: 'Azerbaijani Manat', flag: '🇦🇿' },
  BAM: { name: 'Bosnia-Herzegovina Mark', flag: '🇧🇦' },
  BBD: { name: 'Barbadian Dollar', flag: '🇧🇧' },
  BDT: { name: 'Bangladeshi Taka', flag: '🇧🇩' },
  BGN: { name: 'Bulgarian Lev', flag: '🇧🇬' },
  BHD: { name: 'Bahraini Dinar', flag: '🇧🇭' },
  BIF: { name: 'Burundian Franc', flag: '🇧🇮' },
  BMD: { name: 'Bermudian Dollar', flag: '🇧🇲' },
  BND: { name: 'Brunei Dollar', flag: '🇧🇳' },
  BOB: { name: 'Bolivian Boliviano', flag: '🇧🇴' },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷' },
  BSD: { name: 'Bahamian Dollar', flag: '🇧🇸' },
  BTN: { name: 'Bhutanese Ngultrum', flag: '🇧🇹' },
  BWP: { name: 'Botswanan Pula', flag: '🇧🇼' },
  BYN: { name: 'Belarusian Ruble', flag: '🇧🇾' },
  BZD: { name: 'Belize Dollar', flag: '🇧🇿' },
  CDF: { name: 'Congolese Franc', flag: '🇨🇩' },
  CLP: { name: 'Chilean Peso', flag: '🇨🇱' },
  COP: { name: 'Colombian Peso', flag: '🇨🇴' },
  CRC: { name: 'Costa Rican Colón', flag: '🇨🇷' },
  CUP: { name: 'Cuban Peso', flag: '🇨🇺' },
  CVE: { name: 'Cape Verdean Escudo', flag: '🇨🇻' },
  CZK: { name: 'Czech Koruna', flag: '🇨🇿' },
  DJF: { name: 'Djiboutian Franc', flag: '🇩🇯' },
  DKK: { name: 'Danish Krone', flag: '🇩🇰' },
  DOP: { name: 'Dominican Peso', flag: '🇩🇴' },
  DZD: { name: 'Algerian Dinar', flag: '🇩🇿' },
  EGP: { name: 'Egyptian Pound', flag: '🇪🇬' },
  ERN: { name: 'Eritrean Nakfa', flag: '🇪🇷' },
  ETB: { name: 'Ethiopian Birr', flag: '🇪🇹' },
  FJD: { name: 'Fijian Dollar', flag: '🇫🇯' },
  FKP: { name: 'Falkland Islands Pound', flag: '🇫🇰' },
  GEL: { name: 'Georgian Lari', flag: '🇬🇪' },
  GHS: { name: 'Ghanaian Cedi', flag: '🇬🇭' },
  GIP: { name: 'Gibraltar Pound', flag: '🇬🇮' },
  GMD: { name: 'Gambian Dalasi', flag: '🇬🇲' },
  GNF: { name: 'Guinean Franc', flag: '🇬🇳' },
  GTQ: { name: 'Guatemalan Quetzal', flag: '🇬🇹' },
  GYD: { name: 'Guyanese Dollar', flag: '🇬🇾' },
  HKD: { name: 'Hong Kong Dollar', flag: '🇭🇰' },
  HNL: { name: 'Honduran Lempira', flag: '🇭🇳' },
  HRK: { name: 'Croatian Kuna', flag: '🇭🇷' },
  HTG: { name: 'Haitian Gourde', flag: '🇭🇹' },
  HUF: { name: 'Hungarian Forint', flag: '🇭🇺' },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  ILS: { name: 'Israeli New Shekel', flag: '🇮🇱' },
  IQD: { name: 'Iraqi Dinar', flag: '🇮🇶' },
  IRR: { name: 'Iranian Rial', flag: '🇮🇷' },
  ISK: { name: 'Icelandic Króna', flag: '🇮🇸' },
  JMD: { name: 'Jamaican Dollar', flag: '🇯🇲' },
  JOD: { name: 'Jordanian Dinar', flag: '🇯🇴' },
  KES: { name: 'Kenyan Shilling', flag: '🇰🇪' },
  KGS: { name: 'Kyrgystani Som', flag: '🇰🇬' },
  KHR: { name: 'Cambodian Riel', flag: '🇰🇭' },
  KMF: { name: 'Comorian Franc', flag: '🇰🇲' },
  KPW: { name: 'North Korean Won', flag: '🇰🇵' },
  KRW: { name: 'South Korean Won', flag: '🇰🇷' },
  KWD: { name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  KYD: { name: 'Cayman Islands Dollar', flag: '🇰🇾' },
  KZT: { name: 'Kazakhstani Tenge', flag: '🇰🇿' },
  LAK: { name: 'Laotian Kip', flag: '🇱🇦' },
  LBP: { name: 'Lebanese Pound', flag: '🇱🇧' },
  LKR: { name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  LRD: { name: 'Liberian Dollar', flag: '🇱🇷' },
  LSL: { name: 'Lesotho Loti', flag: '🇱🇸' },
  LYD: { name: 'Libyan Dinar', flag: '🇱🇾' },
  MAD: { name: 'Moroccan Dirham', flag: '🇲🇦' },
  MDL: { name: 'Moldovan Leu', flag: '🇲🇩' },
  MGA: { name: 'Malagasy Ariary', flag: '🇲🇬' },
  MKD: { name: 'Macedonian Denar', flag: '🇲🇰' },
  MMK: { name: 'Myanmar Kyat', flag: '🇲🇲' },
  MNT: { name: 'Mongolian Tughrik', flag: '🇲🇳' },
  MOP: { name: 'Macanese Pataca', flag: '🇲🇴' },
  MRU: { name: 'Mauritanian Ouguiya', flag: '🇲🇷' },
  MUR: { name: 'Mauritian Rupee', flag: '🇲🇺' },
  MVR: { name: 'Maldivian Rufiyaa', flag: '🇲🇻' },
  MWK: { name: 'Malawian Kwacha', flag: '🇲🇼' },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽' },
  MYR: { name: 'Malaysian Ringgit', flag: '🇲🇾' },
  MZN: { name: 'Mozambican Metical', flag: '🇲🇿' },
  NAD: { name: 'Namibian Dollar', flag: '🇳🇦' },
  NGN: { name: 'Nigerian Naira', flag: '🇳🇬' },
  NIO: { name: 'Nicaraguan Córdoba', flag: '🇳🇮' },
  NOK: { name: 'Norwegian Krone', flag: '🇳🇴' },
  NPR: { name: 'Nepalese Rupee', flag: '🇳🇵' },
  OMR: { name: 'Omani Rial', flag: '🇴🇲' },
  PAB: { name: 'Panamanian Balboa', flag: '🇵🇦' },
  PEN: { name: 'Peruvian Sol', flag: '🇵🇪' },
  PGK: { name: 'Papua New Guinean Kina', flag: '🇵🇬' },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭' },
  PKR: { name: 'Pakistani Rupee', flag: '🇵🇰' },
  PLN: { name: 'Polish Złoty', flag: '🇵🇱' },
  PYG: { name: 'Paraguayan Guaraní', flag: '🇵🇾' },
  QAR: { name: 'Qatari Riyal', flag: '🇶🇦' },
  RON: { name: 'Romanian Leu', flag: '🇷🇴' },
  RSD: { name: 'Serbian Dinar', flag: '🇷🇸' },
  RUB: { name: 'Russian Ruble', flag: '🇷🇺' },
  RWF: { name: 'Rwandan Franc', flag: '🇷🇼' },
  SAR: { name: 'Saudi Riyal', flag: '🇸🇦' },
  SBD: { name: 'Solomon Islands Dollar', flag: '🇸🇧' },
  SCR: { name: 'Seychellois Rupee', flag: '🇸🇨' },
  SDG: { name: 'Sudanese Pound', flag: '🇸🇩' },
  SEK: { name: 'Swedish Krone', flag: '🇸🇪' },
  SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
  SHP: { name: 'St. Helena Pound', flag: '🇸🇭' },
  SLL: { name: 'Sierra Leonean Leone', flag: '🇸🇱' },
  SOS: { name: 'Somali Shilling', flag: '🇸🇴' },
  SRD: { name: 'Surinamese Dollar', flag: '🇸🇷' },
  SSP: { name: 'South Sudanese Pound', flag: '🇸🇸' },
  STN: { name: 'São Tomé Dobra', flag: '🇸🇹' },
  SYP: { name: 'Syrian Pound', flag: '🇸🇾' },
  SZL: { name: 'Swazi Lilangeni', flag: '🇸🇿' },
  THB: { name: 'Thai Baht', flag: '🇹🇭' },
  TJS: { name: 'Tajikistani Somoni', flag: '🇹🇯' },
  TMT: { name: 'Turkmenistani Manat', flag: '🇹🇲' },
  TND: { name: 'Tunisian Dinar', flag: '🇹🇳' },
  TOP: { name: 'Tongan Paʻanga', flag: '🇹🇴' },
  TRY: { name: 'Turkish Lira', flag: '🇹🇷' },
  TTD: { name: 'Trinidad & Tobago Dollar', flag: '🇹🇹' },
  TWD: { name: 'New Taiwan Dollar', flag: '🇹🇼' },
  TZS: { name: 'Tanzanian Shilling', flag: '🇹🇿' },
  UAH: { name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  UGX: { name: 'Ugandan Shilling', flag: '🇺🇬' },
  UYU: { name: 'Uruguayan Peso', flag: '🇺🇾' },
  UZS: { name: 'Uzbekistani Som', flag: '🇺🇿' },
  VES: { name: 'Venezuelan Bolívar', flag: '🇻🇪' },
  VND: { name: 'Vietnamese Đồng', flag: '🇻🇳' },
  VUV: { name: 'Vanuatu Vatu', flag: '🇻🇺' },
  WST: { name: 'Samoan Tālā', flag: '🇼🇸' },
  XAF: { name: 'Central African CFA Franc', flag: '🇨🇫' },
  XCD: { name: 'East Caribbean Dollar', flag: '🇦🇬' },
  XOF: { name: 'West African CFA Franc', flag: '🇸🇳' },
  XPF: { name: 'CFP Franc', flag: '🇵🇫' },
  YER: { name: 'Yemeni Rial', flag: '🇾🇪' },
  ZAR: { name: 'South African Rand', flag: '🇿🇦' },
  ZMW: { name: 'Zambian Kwacha', flag: '🇿🇲' },
  ZWL: { name: 'Zimbabwean Dollar', flag: '🇿🇼' }
};

export const CurrencyConverter = () => {
  const { playClickSound } = useTheme();

  // Query currency rates table from IndexedDB
  const currencyRates = useLiveQuery(() => db.currency_rates.toArray());

  // Local state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState('0');
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
          const info = CURRENCY_DETAILS[code];
          if (info) {
            // Write/update the currency rate
            await db.currency_rates.put({
              code,
              rate: rateVal,
              flag: info.flag,
              name: info.name,
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

      </div>
    </div>
  );
};
