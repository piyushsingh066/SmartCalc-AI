import React, { useState, useEffect } from 'react';
import { Copy, Star, RotateCcw, RotateCw, Sparkles, Delete } from 'lucide-react';
import { db } from '../context/db';
import { useTheme } from '../context/ThemeContext';
import { parseAndSolve } from '../utils/mathParser';

export const Calculator = ({ mode, globalExpression, globalResult, setGlobalExpression, setGlobalResult, onToast }) => {
  const { playClickSound } = useTheme();

  // Aliases for global states passed down from App
  const expression = globalExpression || '';
  const result = globalResult || '';
  const setExpression = setGlobalExpression;
  const setResult = setGlobalResult;

  const [isStarred, setIsStarred] = useState(false);

  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Push expression to undo stack
  const pushToUndo = (currentExpr) => {
    setUndoStack((prev) => [...prev, currentExpr]);
    setRedoStack([]); // Clear redo
  };

  const handleUndo = () => {
    playClickSound();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, expression]);
    setExpression(previous);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    playClickSound();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, expression]);
    setExpression(next);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  // Check if current expression is already starred
  useEffect(() => {
    const checkStarred = async () => {
      if (!expression) {
        setIsStarred(false);
        return;
      }
      try {
        const item = await db.favorites.where('expression').equals(expression).first();
        setIsStarred(!!item);
      } catch (e) {
        setIsStarred(false);
      }
    };
    checkStarred();
  }, [expression]);



  // Evaluate Expression
  const handleEvaluate = async () => {
    if (!expression.trim()) return;

    playClickSound();
    const solve = parseAndSolve(expression);

    if (solve.error) {
      setResult(solve.error);
      return;
    }

    const finalResult = solve.result.toString();
    setResult(finalResult);


    // Save to Database History
    try {
      await db.history.add({
        expression: expression.trim(),
        result: finalResult,
        timestamp: new Date().getTime(),
        mode: mode
      });
    } catch (err) {
      console.warn('Could not save history to IndexedDB', err);
    }
  };

  // Clear Screen
  const handleClear = () => {
    playClickSound();
    pushToUndo(expression);
    setExpression('');
    setResult('');
  };

  // Delete last character
  const handleDelete = () => {
    playClickSound();
    pushToUndo(expression);
    setExpression((prev) => prev.slice(0, -1));
  };

  // Append character
  const handleInput = (val) => {
    playClickSound();
    pushToUndo(expression);
    setExpression((prev) => prev + val);
  };

  // Toggle favorite / Star
  const handleToggleStar = async () => {
    playClickSound();
    if (!expression.trim() || !result.trim()) return;

    try {
      if (isStarred) {
        await db.favorites.where('expression').equals(expression).delete();
        setIsStarred(false);
        onToast('Removed from Starred Calculations');
      } else {
        await db.favorites.add({
          expression: expression.trim(),
          result: result.trim(),
          timestamp: new Date().getTime(),
          mode: mode
        });
        setIsStarred(true);
        onToast('Added to Starred Calculations!');
      }
    } catch (err) {
      console.warn('Favorites write error', err);
    }
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    playClickSound();
    if (!result) return;
    navigator.clipboard.writeText(result);
    onToast('Result copied to clipboard!');
  };

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid intercepting inputs inside settings fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Check shortcuts
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Standard Keys mapping
      const key = e.key;
      if (/[0-9]/.test(key)) handleInput(key);
      else if (key === '.') handleInput('.');
      else if (key === '+') handleInput('+');
      else if (key === '-') handleInput('-');
      else if (key === '*') handleInput('×');
      else if (key === '/') handleInput('÷');
      else if (key === '%') handleInput('%');
      else if (key === '(') handleInput('(');
      else if (key === ')') handleInput(')');
      else if (key === '^') handleInput('^');
      else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, result, undoStack, redoStack]);

  // standard key click ripple effect
  const handleButtonClick = (e, callback, arg = null) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
    
    if (arg !== null) {
      callback(arg);
    } else {
      callback();
    }
  };

  return (
    <div className="glass-card card-calc">
      {/* 1. Calculator Screen Display */}
      <div className="calculator-screen">
        
        {/* Expression Box */}
        <div className="screen-expression">
          {expression || ' '}
        </div>
        
        {/* Result Box */}
        <div className="screen-result">
          {result || '0'}
        </div>

        {/* Floating Quick Action Row inside display */}
        {result && (
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '12px',
            display: 'flex',
            gap: '8px',
            opacity: 0.85
          }}>
            <button 
              onClick={handleCopyResult}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              title="Copy Result"
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>

            <button 
              onClick={handleToggleStar}
              style={{ background: 'none', border: 'none', color: isStarred ? '#facc15' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              title="Star/Bookmark"
            >
              <Star size={13} fill={isStarred ? '#facc15' : 'none'} />
              <span>{isStarred ? 'Starred' : 'Star'}</span>
            </button>
          </div>
        )}


      </div>

      {/* 2. Keypads grid */}
      {mode === 'Standard' ? (
        <div className="calculator-grid">
          {/* Row 1 */}
          <button className="calc-btn btn-clear" onClick={(e) => handleButtonClick(e, handleClear)}>C</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, '(')}>(</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, ')')}>)</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '÷')}>÷</button>

          {/* Row 2 */}
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '7')}>7</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '8')}>8</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '9')}>9</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '×')}>×</button>

          {/* Row 3 */}
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '4')}>4</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '5')}>5</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '6')}>6</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '-')}>-</button>

          {/* Row 4 */}
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '1')}>1</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '2')}>2</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '3')}>3</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '+')}>+</button>

          {/* Row 5 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, '%')}>%</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '0')}>0</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '.')}>.</button>
          <button className="calc-btn btn-eq" onClick={(e) => handleButtonClick(e, handleEvaluate)}>=</button>
        </div>
      ) : (
        <div className="calculator-grid scientific-grid" style={{ fontSize: '1rem' }}>
          {/* Row 1 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'sin(')}>sin</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'cos(')}>cos</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'tan(')}>tan</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'pi')}>π</button>
          <button className="calc-btn btn-clear" onClick={(e) => handleButtonClick(e, handleClear)}>C</button>

          {/* Row 2 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'asin(')}>sin⁻¹</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'acos(')}>cos⁻¹</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'atan(')}>tan⁻¹</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'e')}>e</button>
          <button className="calc-btn btn-del" onClick={(e) => handleButtonClick(e, handleDelete)}>
            <Delete size={16} />
          </button>

          {/* Row 3 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'sinh(')}>sinh</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'cosh(')}>cosh</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'tanh(')}>tanh</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, '^')}>^</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '÷')}>÷</button>

          {/* Row 4 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'sqrt(')}>√</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '7')}>7</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '8')}>8</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '9')}>9</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '×')}>×</button>

          {/* Row 5 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'log(')}>log</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '4')}>4</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '5')}>5</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '6')}>6</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '-')}>-</button>

          {/* Row 6 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'ln(')}>ln</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '1')}>1</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '2')}>2</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '3')}>3</button>
          <button className="calc-btn btn-op" onClick={(e) => handleButtonClick(e, handleInput, '+')}>+</button>

          {/* Row 7 */}
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, 'abs(')}>|x|</button>
          <button className="calc-btn btn-fn" onClick={(e) => handleButtonClick(e, handleInput, '!')}>!</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '0')}>0</button>
          <button className="calc-btn btn-num" onClick={(e) => handleButtonClick(e, handleInput, '.')}>.</button>
          <button className="calc-btn btn-eq" onClick={(e) => handleButtonClick(e, handleEvaluate)}>=</button>
        </div>
      )}
    </div>
  );
};
