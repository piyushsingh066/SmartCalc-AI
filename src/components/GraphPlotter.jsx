import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Eye, EyeOff, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { db } from '../context/db';
import { parseAndSolve } from '../utils/mathParser';

export const GraphPlotter = () => {
  const { playClickSound } = useTheme();
  const canvasRef = useRef(null);

  // States
  const [functions, setFunctions] = useState([
    { id: 1, expr: 'sin(x)', color: '#3b82f6', visible: true },
    { id: 2, expr: 'x^2 - 2', color: '#8b5cf6', visible: true }
  ]);
  const [newExpr, setNewExpr] = useState('');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(40); // Pixels per unit
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCrosshair, setShowCrosshair] = useState(false);

  // Colors list for new functions
  const colorsList = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#ef4444', '#ec4899'];

  // Save/Load saved graphs in IndexedDB (optional but premium)
  useEffect(() => {
    const loadSavedGraphs = async () => {
      try {
        const saved = await db.graphs.toArray();
        if (saved.length > 0) {
          setFunctions(saved);
        }
      } catch (err) {
        console.warn('Failed to load graphs from IndexedDB', err);
      }
    };
    loadSavedGraphs();
  }, []);

  const saveGraphsToDB = async (updatedList) => {
    try {
      await db.graphs.clear();
      await db.graphs.bulkAdd(updatedList);
    } catch (e) {
      console.warn('Graph DB sync error', e);
    }
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Handle resizing
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Origin (center of the canvas + pan offset)
    const originX = width / 2 + pan.x;
    const originY = height / 2 + pan.y;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    // Grid spacing: calculate dynamically based on zoom
    let gridSpacing = 1;
    if (zoom < 10) gridSpacing = 10;
    else if (zoom < 25) gridSpacing = 5;
    else if (zoom > 100) gridSpacing = 0.5;
    else if (zoom > 300) gridSpacing = 0.1;

    const spacingPixels = gridSpacing * zoom;

    // Vertical grid lines (left and right from origin)
    const startX = originX % spacingPixels;
    for (let x = startX; x < width; x += spacingPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Labels on X axis
      const coordX = (x - originX) / zoom;
      if (Math.abs(coordX) > 0.0001) {
        ctx.fillText(coordX.toFixed(coordX % 1 === 0 ? 0 : 1), x + 4, originY - 6);
      }
    }

    // Horizontal grid lines (up and down from origin)
    const startY = originY % spacingPixels;
    for (let y = startY; y < height; y += spacingPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Labels on Y axis
      const coordY = (originY - y) / zoom;
      if (Math.abs(coordY) > 0.0001) {
        ctx.fillText(coordY.toFixed(coordY % 1 === 0 ? 0 : 1), originX + 6, y - 4);
      }
    }

    // 2. Draw Main Axes (X & Y Axis)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // 3. Draw Functions
    functions.forEach((fn) => {
      if (!fn.visible || !fn.expr) return;

      ctx.beginPath();
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2.5;

      let first = true;

      // Iterate across every pixel column on screen
      for (let screenX = 0; screenX < width; screenX++) {
        // Convert screen X to mathematical x
        const x = (screenX - originX) / zoom;

        // Safely evaluate function at x
        // Use our safe parser, substituting 'x' with value
        // Note: replace 'x' with the number, taking care of trigonometric boundaries and edge cases.
        // We will construct expression replace logic: e.g. "sin(x)" becomes "sin(1.2)"
        // Let's protect word characters. We can do variable replacements:
        // We can replace variable 'x' safely.
        
        // Match only variable 'x' not parts of 'sin', 'cosh' etc.
        // regex matches x when not part of another word
        const mathExpr = fn.expr.replace(/\bx\b/g, `(${x})`);
        const solveResult = parseAndSolve(mathExpr);

        if (solveResult.error || solveResult.result === null) {
          first = true; // Break line segment if error
          continue;
        }

        const y = solveResult.result;
        // Convert mathematical y to screen Y
        const screenY = originY - (y * zoom);

        // Clip drawing values to prevent canvas overflow artifacts
        if (screenY >= -100 && screenY <= height + 100) {
          if (first) {
            ctx.moveTo(screenX, screenY);
            first = false;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    });

    // 4. Draw Mouse Coordinate Crosshairs
    if (showCrosshair && mousePos.x >= 0 && mousePos.x <= width && mousePos.y >= 0 && mousePos.y <= height) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(width, mousePos.y);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash style

      // Draw active coordinate tag
      const hoverMathX = (mousePos.x - originX) / zoom;
      const hoverMathY = (originY - mousePos.y) / zoom;

      const label = `(${hoverMathX.toFixed(2)}, ${hoverMathY.toFixed(2)})`;
      ctx.fillStyle = 'var(--accent)';
      ctx.beginPath();
      ctx.roundRect(mousePos.x + 8, mousePos.y - 25, label.length * 7 + 10, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText(label, mousePos.x + 12, mousePos.y - 12);
    }

  }, [functions, pan, zoom, showCrosshair, mousePos]);

  // Event Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
    setShowCrosshair(true);

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setShowCrosshair(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomAmount = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.max(5, Math.min(2000, zoom * zoomAmount));
    
    // Zoom centered on cursor position (premium math charting logic)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Shift pan offset to lock zoom center at the mouse cursor
    setPan(prev => ({
      x: cursorX - (cursorX - prev.x) * (newZoom / zoom),
      y: cursorY - (cursorY - prev.y) * (newZoom / zoom)
    }));

    setZoom(newZoom);
  };

  const addFunction = () => {
    playClickSound();
    if (!newExpr.trim()) return;

    // Double check formula validity
    const mathTest = newExpr.replace(/\bx\b/g, '(1)');
    const testResult = parseAndSolve(mathTest);

    if (testResult.error) {
      alert(`Invalid mathematical function: ${testResult.error}`);
      return;
    }

    const newFn = {
      id: Date.now(),
      expr: newExpr.trim(),
      color: colorsList[functions.length % colorsList.length],
      visible: true
    };
    
    const updated = [...functions, newFn];
    setFunctions(updated);
    setNewExpr('');
    saveGraphsToDB(updated);
  };

  const deleteFunction = (id) => {
    playClickSound();
    const updated = functions.filter(fn => fn.id !== id);
    setFunctions(updated);
    saveGraphsToDB(updated);
  };

  const toggleVisibility = (id) => {
    playClickSound();
    const updated = functions.map(fn => fn.id === id ? { ...fn, visible: !fn.visible } : fn);
    setFunctions(updated);
    saveGraphsToDB(updated);
  };

  const resetView = () => {
    playClickSound();
    setPan({ x: 0, y: 0 });
    setZoom(40);
  };

  return (
    <div className="glass-card card-large" style={{ display: 'flex', flexDirection: 'row' }}>
      {/* Chart Canvas Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="graph-canvas"
        />

        {/* Floating Toolbar Controls */}
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '8px',
          borderRadius: '12px',
          border: '1px solid var(--card-border)',
          backdropFilter: 'blur(10px)'
        }}>
          <button className="header-btn" onClick={() => setZoom(prev => Math.min(2000, prev * 1.2))} title="Zoom In" style={{ padding: '6px' }}>
            <ZoomIn size={16} />
          </button>
          <button className="header-btn" onClick={() => setZoom(prev => Math.max(5, prev * 0.8))} title="Zoom Out" style={{ padding: '6px' }}>
            <ZoomOut size={16} />
          </button>
          <button className="header-btn" onClick={resetView} title="Center Axes" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
            Center
          </button>
        </div>
      </div>

      {/* Right Side Equation List */}
      <div style={{
        width: '320px',
        borderLeft: '1px solid var(--card-border)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600 }}>Plot Mathematical Curves</h3>

        {/* Function Creator Input */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={newExpr}
            onChange={(e) => setNewExpr(e.target.value)}
            placeholder="y = x^2 - sin(x)"
            onKeyDown={(e) => e.key === 'Enter' && addFunction()}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={addFunction}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '10px',
              padding: '0 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Functions List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {functions.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
              No equations defined yet.
            </p>
          ) : (
            functions.map((fn) => (
              <div
                key={fn.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--card-border)'
                }}
              >
                {/* Color Dot indicator */}
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: fn.color, flexShrink: 0 }}></div>

                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {fn.expr}
                </div>

                <button
                  onClick={() => toggleVisibility(fn.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {fn.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-gray-600" />}
                </button>

                <button
                  onClick={() => deleteFunction(fn.id)}
                  style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer' }}
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Small tips section */}
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255,255,255,0.01)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid var(--card-border)'
        }}>
          💡 <strong>Usage</strong>:
          <ul style={{ paddingLeft: '1rem', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <li>Write variables as standard <code>x</code>.</li>
            <li>Drag canvas to pan.</li>
            <li>Scroll to zoom in/out.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
