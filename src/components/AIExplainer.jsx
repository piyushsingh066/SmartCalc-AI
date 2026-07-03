import React, { useState, useEffect } from 'react';
import { Brain, X, Sparkles, Loader } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { parseAndSolve } from '../utils/mathParser';

// Simple helper to format basic markdown to HTML elements safely
function renderSimpleMarkdown(markdown) {
  if (!markdown) return '';
  
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h4 class="text-md font-semibold mt-4 mb-2 text-blue-300">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold mt-5 mb-3 text-purple-300">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="text-xl font-extrabold mt-6 mb-4 text-white">$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    // Code blocks
    .replace(/`(.*?)`/g, '<code class="bg-black bg-opacity-40 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-sm">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export const AIExplainer = ({ isOpen, onClose, expression, result }) => {
  const { geminiApiKey, playClickSound } = useTheme();
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [error, setError] = useState(null);

  const localSolve = parseAndSolve(expression);

  const fetchGeminiExplanation = async () => {
    if (!geminiApiKey) return;
    setLoading(true);
    setError(null);
    setAiExplanation('');

    try {
      const prompt = `You are SmartCalc AI, a premium educational math solver.
Explain the mathematical expression "${expression}" step-by-step. 
Provide:
1. Step-by-step calculation steps.
2. The formulas and concepts applied.
3. Beginner-friendly intuition of why it works.
4. Let the user know the calculated result is "${result}".
Output in clear Markdown format. Keep it concise, professional and easy to read.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiExplanation(text);
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch AI explanation: ${err.message}. Showing local solution instead.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && expression) {
      if (geminiApiKey) {
        fetchGeminiExplanation();
      } else {
        setAiExplanation('');
        setError(null);
      }
    }
  }, [isOpen, expression, geminiApiKey]);

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain className="text-purple-400" size={20} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem' }}>AI Explain Mode</h2>
        </div>
        <button 
          onClick={() => { playClickSound(); onClose(); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="drawer-body">
        {expression ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--card-border)'
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Equation</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, margin: '4px 0' }}>{expression}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Result = {result || '?'}</p>
            </div>

            {geminiApiKey ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Sparkles size={14} className="text-purple-400" />
                  <span>Gemini LLM Teacher Active</span>
                </div>
                
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
                    <Loader className="animate-spin text-purple-400" size={32} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Analyzing math steps...</p>
                  </div>
                ) : error ? (
                  <div style={{ color: '#f87171', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    {error}
                  </div>
                ) : (
                  <div className="markdown-content text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {renderSimpleMarkdown(aiExplanation)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4'
                }}>
                  💡 <strong>Tip</strong>: Go to the <strong>Settings</strong> page and enter your <strong>Gemini API Key</strong> to unlock rich, custom AI explanations. Showing standard calculation steps below.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Local Equation Breakdown</h3>
                  
                  {localSolve.error ? (
                    <div style={{ color: '#f87171', fontSize: '0.85rem' }}>
                      Unable to parse: {localSolve.error}
                    </div>
                  ) : (
                    <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {localSolve.steps.map((step, idx) => (
                        <li key={idx} style={{ lineHeight: '1.5' }}>
                          {renderSimpleMarkdown(step)}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            Perform a calculation on the screen and click Explain to view step-by-step educational analysis.
          </p>
        )}
      </div>
    </div>
  );
};
