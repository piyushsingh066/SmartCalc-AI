import React, { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';
import { evaluateProgrammer } from '../utils/mathParser';
import { useTheme } from '../context/ThemeContext';

export const ProgrammerCalculator = ({ onToast }) => {
  const { playClickSound } = useTheme();

  // Active typing base
  const [activeBase, setActiveBase] = useState('DEC'); // 'BIN', 'OCT', 'DEC', 'HEX'
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState({ BIN: '0', OCT: '0', DEC: '0', HEX: '0' });
  const [error, setError] = useState('');

  // Re-run evaluation when expression or activeBase changes
  useEffect(() => {
    if (!expression.trim()) {
      setResult({ BIN: '0', OCT: '0', DEC: '0', HEX: '0' });
      setError('');
      return;
    }

    const evalResult = evaluateProgrammer(expression, activeBase);
    if (evalResult.error) {
      setError(evalResult.error);
    } else {
      setError('');
      setResult({
        BIN: evalResult.BIN,
        OCT: evalResult.OCT,
        DEC: evalResult.DEC,
        HEX: evalResult.HEX
      });
    }
  }, [expression, activeBase]);

  const handleClear = () => {
    playClickSound();
    setExpression('');
    setError('');
    setResult({ BIN: '0', OCT: '0', DEC: '0', HEX: '0' });
  };

  const handleDelete = () => {
    playClickSound();
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleInput = (val) => {
    playClickSound();
    setExpression((prev) => prev + val);
  };

  const handleBaseChange = (base) => {
    playClickSound();
    // Try to pre-convert expression if it is a single number
    if (/^[0-9A-Fa-f]+$/.test(expression)) {
      const decVal = parseInt(expression, activeBase === 'BIN' ? 2 : activeBase === 'OCT' ? 8 : activeBase === 'DEC' ? 10 : 16);
      if (!isNaN(decVal)) {
        const nextRadix = base === 'BIN' ? 2 : base === 'OCT' ? 8 : base === 'DEC' ? 10 : 16;
        setExpression(decVal.toString(nextRadix).toUpperCase());
      }
    } else {
      // Clear expression to avoid base mixing errors on operators
      setExpression('');
    }
    setActiveBase(base);
  };

  // Check if a key is disabled based on the active base
  const isKeyDisabled = (val) => {
    const isHexDigit = /^[A-F]$/i.test(val);
    const isDigit = /^[0-9]$/.test(val);
    
    if (activeBase === 'BIN') {
      // BIN allows only 0, 1
      return isHexDigit || (isDigit && val !== '0' && val !== '1');
    }
    if (activeBase === 'OCT') {
      // OCT allows 0-7
      return isHexDigit || (isDigit && (val === '8' || val === '9'));
    }
    if (activeBase === 'DEC') {
      // DEC allows 0-9
      return isHexDigit;
    }
    // HEX allows A-F and 0-9
    return false;
  };

  const handleCopyBase = (label, value) => {
    playClickSound();
    navigator.clipboard.writeText(value);
    onToast(`Copied ${label} value to clipboard!`);
  };

  return (
    <div className="glass-card card-calc" style={{ maxWidth: '500px' }}>
      
      {/* 1. Base translation panels */}
      <div style={{
        padding: '1.25rem',
        background: 'rgba(0, 0, 0, 0.25)',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {[
          { label: 'HEX', key: 'HEX', desc: 'Hexadecimal' },
          { label: 'DEC', key: 'DEC', desc: 'Decimal' },
          { label: 'OCT', key: 'OCT', desc: 'Octal' },
          { label: 'BIN', key: 'BIN', desc: 'Binary' }
        ].map((item) => {
          const isActive = activeBase === item.label;
          const displayVal = result[item.key];
          return (
            <div
              key={item.label}
              onClick={() => handleBaseChange(item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                borderRadius: '8px',
                background: isActive ? 'var(--key-op-bg)' : 'transparent',
                border: isActive ? '1px solid var(--card-border)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? 'var(--key-op-color)' : 'var(--text-primary)' }}>{item.label}</span>
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); handleCopyBase(item.label, displayVal); }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  wordBreak: 'break-all',
                  textAlign: 'right',
                  maxWidth: '300px',
                  userSelect: 'all'
                }}
                className="hover:text-blue-400"
                title="Click to copy"
              >
                {displayVal}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Expression input display */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(0,0,0,0.1)',
        borderBottom: '1px solid var(--card-border)',
        minHeight: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end'
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', wordBreak: 'break-all' }}>
          {expression || '0'}
        </div>
        {error && (
          <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '2px' }}>
            {error}
          </div>
        )}
      </div>

      {/* 3. Programmer key grid */}
      <div className="calculator-grid programmer-grid" style={{ padding: '0.75rem', gap: '0.4rem' }}>
        {/* Row 1 */}
        <button className="calc-btn btn-fn" onClick={() => handleBaseChange('HEX')}>HEX</button>
        <button className="calc-btn btn-fn" onClick={() => handleBaseChange('DEC')}>DEC</button>
        <button className="calc-btn btn-fn" onClick={() => handleBaseChange('OCT')}>OCT</button>
        <button className="calc-btn btn-fn" onClick={() => handleBaseChange('BIN')}>BIN</button>
        <button className="calc-btn btn-clear" onClick={handleClear} style={{ gridColumn: 'span 2' }}>CLEAR</button>

        {/* Row 2 */}
        <button className="calc-btn btn-num" disabled={isKeyDisabled('A')} onClick={() => handleInput('A')}>A</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('B')} onClick={() => handleInput('B')}>B</button>
        <button className="calc-btn btn-op" onClick={() => handleInput(' AND ')}>AND</button>
        <button className="calc-btn btn-op" onClick={() => handleInput(' OR ')}>OR</button>
        <button className="calc-btn btn-op" onClick={() => handleInput(' XOR ')}>XOR</button>
        <button className="calc-btn btn-del" onClick={handleDelete}>
          <Delete size={16} />
        </button>

        {/* Row 3 */}
        <button className="calc-btn btn-num" disabled={isKeyDisabled('C')} onClick={() => handleInput('C')}>C</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('D')} onClick={() => handleInput('D')}>D</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('7')} onClick={() => handleInput('7')}>7</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('8')} onClick={() => handleInput('8')}>8</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('9')} onClick={() => handleInput('9')}>9</button>
        <button className="calc-btn btn-op" onClick={() => handleInput(' << ')}>Lsh</button>

        {/* Row 4 */}
        <button className="calc-btn btn-num" disabled={isKeyDisabled('E')} onClick={() => handleInput('E')}>E</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('F')} onClick={() => handleInput('F')}>F</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('4')} onClick={() => handleInput('4')}>4</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('5')} onClick={() => handleInput('5')}>5</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('6')} onClick={() => handleInput('6')}>6</button>
        <button className="calc-btn btn-op" onClick={() => handleInput(' >> ')}>Rsh</button>

        {/* Row 5 */}
        <button className="calc-btn btn-op" onClick={() => handleInput('~')}>NOT</button>
        <button className="calc-btn btn-fn" onClick={() => handleInput('(')}>(</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('1')} onClick={() => handleInput('1')}>1</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('2')} onClick={() => handleInput('2')}>2</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('3')} onClick={() => handleInput('3')}>3</button>
        <button className="calc-btn btn-op" onClick={() => handleInput('+')}>+</button>

        {/* Row 6 */}
        <button className="calc-btn btn-fn" onClick={() => handleInput(')')}>)</button>
        <button className="calc-btn btn-fn" onClick={() => handleInput(' mod ')}>mod</button>
        <button className="calc-btn btn-num" disabled={isKeyDisabled('0')} onClick={() => handleInput('0')} style={{ gridColumn: 'span 2' }}>0</button>
        <button className="calc-btn btn-op" onClick={() => handleInput('-')}>-</button>
        <button className="calc-btn btn-op" onClick={() => handleInput('*')}>*</button>
      </div>

    </div>
  );
};
